import { createHmac, timingSafeEqual, randomBytes, randomUUID } from 'node:crypto';
import express from 'express';
import { installMemberOperations } from './server/membershipOps.js';
import { installJobsAdmin } from './server/jobsOps.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  karaokeSlots,
  BookingValidationError,
  getAllReservations,
  getReservationById,
  attachKaraokePaymentSession,
  getReservationByPaymentSession,
  changeKaraokePaymentState,
  failKaraokeCheckout,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getDatabaseMetadata,
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  isDateBlocked,
  getVenueSettings,
  updateVenueSettingsBatch,
  db
} from './server/db.js';
import { serviceInstant } from './src/lib/serviceTime.js';
import {
  sendReservationEmail,
  generateConfirmationEmailHtml,
  generateConfirmationEmailText,
  checkEmailServiceStatus
} from './server/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
async function configureServer() {

  app.use(express.json({ limit: '32kb', verify: (req, _res, buffer) => {
    if (req.url?.startsWith('/api/stripe/webhook')) (req as any).rawBody = Buffer.from(buffer);
  }}));
  app.post('/api/admin/logout', (req, res) => { res.clearCookie('amica_admin', {path:'/api'}); res.json({success:true}); });

  // Admin authorization is enforced on the server, independent of the preview lock.
  const adminPasswords = [process.env.ADMIN_PASSWORD, process.env.ADMIN_PASSWORD_EXTRA]
    .filter((password): password is string => typeof password === 'string' && password.length > 0);
  const sessionKey = process.env.ADMIN_SESSION_SECRET || randomBytes(32).toString('hex');
  const sign = (value: string) => createHmac('sha256', sessionKey).update(value).digest('hex');
  const equal = (a: string, b: string) => {
    const aa = Buffer.from(a), bb = Buffer.from(b);
    return aa.length === bb.length && timingSafeEqual(aa, bb);
  };
  app.post('/api/admin/login', async (req, res) => {
    if (adminPasswords.length === 0) return res.status(503).json({ success: false, error: 'Admin access needs to be configured.' });
    const submittedPassword = String(req.body.password || '');
    if (!adminPasswords.some((candidate) => equal(submittedPassword, candidate))) {
      return res.status(401).json({ success: false, error: 'Incorrect admin password.' });
    }
    const expires = String(Date.now() + 8 * 60 * 60 * 1000);
    res.cookie('amica_admin', `${expires}.${sign(expires)}`, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/api'
    });
    res.json({ success: true });
  });
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const publicRead = req.method === 'GET' && ['/health', '/system/settings', '/system/blocked-dates', '/bookings/payment-status','/karaoke/availability'].includes(req.path);
    const publicWrite = req.method === 'POST' && ['/bookings', '/bookings/karaoke/checkout', '/bookings/karaoke/cancel-checkout', '/stripe/webhook'].includes(req.path);
    if (publicRead || publicWrite) return next();
    const cookie = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('amica_admin='))?.slice(12) || '';
    const [expires, signature] = cookie.split('.');
    if (adminPasswords.length === 0 || !expires || !signature || Number(expires) < Date.now() || !equal(signature, sign(expires))) {
      return res.status(401).json({ success: false, error: 'Admin sign-in is required.' });
    }
    if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin) {
      let origin: URL;
      try { origin = new URL(req.headers.origin); } catch { return res.status(403).json({success:false,error:'Invalid origin.'}); }
      if (origin.host !== req.headers.host) return res.status(403).json({ success: false, error: 'Invalid request origin.' });
    }
    next();
  });

  // CORS / headers for local safety
  app.use((req, res, next) => {
    res.setHeader('X-Amica-Database', 'Supabase-PostgreSQL');
    next();
  });


  // All membership operations inherit the server-side admin auth above.
  installMemberOperations(app);
  installJobsAdmin(app);

  // Membership review is intentionally separate from booking records.
  // This route is behind the existing signed, httpOnly admin session middleware above.
  const initMemberApplications = async () => {
    await db.query(
    "CREATE TABLE IF NOT EXISTS membership_applications (" +
    "id uuid PRIMARY KEY, full_name varchar(120) NOT NULL, contact_method varchar(12) NOT NULL," +
    " contact_value varchar(160) NOT NULL, rules_accepted_at timestamptz NOT NULL," +
    " is_adult boolean NOT NULL, status varchar(24) NOT NULL DEFAULT 'pending'," +
    " created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()," +
    " reviewed_at timestamptz, review_note varchar(600))"
    );
    await db.query('ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS hospitality_role varchar(160)');
    await db.query('ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY');
    await db.query('REVOKE ALL ON TABLE public.membership_applications FROM anon, authenticated');
  };
  // Licence 19/00938/LIPDPS condition 37(a): all members must work in hospitality on application.
  app.post('/api/membership/applications/:id/hospitality', async (req,res) => {
    const id=String(req.params.id||''),role=typeof req.body?.hospitalityRole==='string'?req.body.hospitalityRole.trim().slice(0,160):'';
    if(!/^[a-f0-9-]{36}$/i.test(id)||role.length<3)
      return res.status(400).json({success:false,error:'Provide the applicant hospitality role or employer.'});
    try{
      await db.query('ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS hospitality_role varchar(160)');
      const out=await db.query("UPDATE membership_applications SET hospitality_role=$1,updated_at=now() WHERE id=$2 AND status IN ('pending','reviewed') RETURNING id,hospitality_role",[role,id]);
      return out.rows.length?res.json({success:true,application:out.rows[0]}):res.status(409).json({success:false,error:'Application already finalised or not found.'});
    }catch(e){console.error('Hospitality verification update failed:',e instanceof Error?e.message:'Unknown');return res.status(503).json({success:false,error:'Unable to update application.'});}
  });
  app.get('/api/membership/applications', async (_req, res) => {
    try {
      await initMemberApplications();
      const rows = await db.query(
        "SELECT id,full_name,contact_method,contact_value,hospitality_role,is_adult,rules_accepted_at,status,created_at,reviewed_at,review_note " +
        "FROM membership_applications ORDER BY created_at DESC LIMIT 200"
      );
      return res.json({ success:true, applications:rows.rows });
    } catch (error) {
      console.error('Member application list unavailable:', error instanceof Error ? error.message : 'Unknown');
      return res.status(503).json({success:false,error:'Membership applications unavailable.'});
    }
  });
  app.post('/api/membership/applications/:id/review', async (req, res) => {
    const id=String(req.params.id||'');
    const status=String(req.body?.status||'');
    const reviewNote=typeof req.body?.note==='string'?req.body.note.trim().slice(0,600):'';
    if(!/^[a-f0-9-]{36}$/i.test(id) || !['pending','reviewed','declined'].includes(status))
      return res.status(400).json({success:false,error:'Invalid application or review status.'});
    try {
      const result=await db.query(
        "UPDATE membership_applications SET status=$1,review_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3 AND status IN ('pending','reviewed') RETURNING id,status",
        [status,reviewNote,id]
      );
      if(!result.rows.length)return res.status(409).json({success:false,error:'Application not found or already finalised.'});
      return res.json({success:true,application:result.rows[0],
        notice:'A review status is not a membership pass or admission approval.'});
    } catch(error){
      console.error('Membership review error:',error instanceof Error?error.message:'Unknown');
      return res.status(503).json({success:false,error:'Review could not be saved.'});
    }
  });

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // Health check
  app.get('/api/health', async (req, res) => {
    try { await db.query('SELECT 1 FROM venue_settings LIMIT 1'); } catch (error) { console.error('Supabase health check failed:', error instanceof Error ? error.message : 'Unknown database error'); return res.status(503).json({status:'unavailable',database:'unavailable'}); }
    res.json({
      status: 'ok',
      service: 'Amica Soho Subterranean Booking Engine',
      database: 'Supabase PostgreSQL connected',
      timestamp: new Date().toISOString()
    });
  });

  // Email service status
  app.get('/api/email/status', async (req, res) => {
    res.json(checkEmailServiceStatus());
  });

  // Database metadata & status
  app.get('/api/database/status', async (req, res) => {
    try {
      const stats = await getDatabaseMetadata();
      res.json({ success: true, stats });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Admin-created reservations use the authenticated admin session and can bypass the public lead-time cutoff.
  app.post('/api/admin/bookings', async (req, res) => {
    try {
      const { formData, bookingId } = req.body || {};
      if (!formData || typeof formData.name !== 'string' || !formData.name.trim() ||
          typeof formData.phone !== 'string' || !formData.phone.trim()) {
        return res.status(400).json({ success: false, error: 'Enter a guest name and phone number.' });
      }
      const guests = Number(formData.guests);
      const validSlots = ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30','00:00','00:30','01:00','01:30','02:00'];
      if (!Number.isInteger(guests) || guests < 1 || guests > 20 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(formData.date || '') || !validSlots.includes(formData.timeSlot) ||
          (!!formData.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || formData.email.length > 128)) ||
          formData.name.trim().length > 100 || formData.phone.trim().length > 30 ||
          typeof formData.dietaryNotes !== 'undefined' && (typeof formData.dietaryNotes !== 'string' || formData.dietaryNotes.length > 2000) ||
          typeof formData.specialOccasion !== 'undefined' && (typeof formData.specialOccasion !== 'string' || formData.specialOccasion.length > 150) ||
          typeof formData.seatingArea !== 'undefined' && (typeof formData.seatingArea !== 'string' || formData.seatingArea.length > 100)) {
        return res.status(400).json({ success: false, error: 'Please check the reservation date, time, party size and contact details.' });
      }
      const date = new Date(formData.date + 'T12:00:00Z');
      const todayLondon = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== formData.date ||
          formData.date < todayLondon || ![3,4,5,6].includes(date.getUTCDay())) {
        return res.status(400).json({ success: false, error: 'Choose a Wednesday to Saturday service date from today onwards.' });
      }
      const karaoke=formData.seatingArea==='Karaoke Room';
      const hours=Number(formData.durationHours??2);
      if(karaoke && (guests<8 || guests>15 || !Number.isInteger(hours) || hours<2 || hours>10 ||
        serviceInstant(formData.date,formData.timeSlot)<Date.now() ||
        serviceInstant(formData.date,formData.timeSlot)+hours*3600000>serviceInstant(formData.date,'03:00')))
        return res.status(400).json({success:false,error:'Select 8–15 guests and a future session of at least two whole hours ending by 03:00.'});
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const created = await createReservation({
        booking_id: typeof bookingId === 'string' && /^[A-Za-z0-9-]{6,80}$/.test(bookingId) ? bookingId : undefined,
        guest_name: formData.name,
        email: formData.email?.trim() || '',
        phone: formData.phone,
        guests,
        reservation_date: formData.date,
        time_slot: formData.timeSlot,
        seating_area: formData.seatingArea || 'Vault Dining',
        special_occasion: formData.specialOccasion || 'Casual Dining & Drinks',
        dietary_notes: formData.dietaryNotes || '',
        ip_address: clientIp,
        ...(karaoke ? {duration_minutes:hours*60,total_price_pence:guests*1500+(hours-2)*9000,statusOverride:'Confirmed'} : {}),
        actor: 'ADMIN_PORTAL',
        bypassCutoff: true
      });
      const booking = {
        bookingId: created.booking_id,
        createdAt: created.created_at,
        status: created.status,
        qrCodeValue: created.qr_code_value,
        formData: {
          name: created.guest_name,
          email: created.email,
          phone: created.phone,
          guests: created.guests,
          date: created.reservation_date,
          timeSlot: created.time_slot,
          durationHours:(created.duration_minutes||120)/60,totalPricePence:created.total_price_pence,
          seatingArea: created.seating_area,
          dietaryNotes: created.dietary_notes || '',
          specialOccasion: created.special_occasion || 'Casual Dining & Drinks'
        }
      };
      return res.status(201).json({ success: true, booking });
    } catch (error: any) {
      return res.status(error instanceof BookingValidationError ? 400 : 500).json({
        success: false,
        error: error instanceof BookingValidationError ? error.message : 'The reservation could not be saved. Please try again.'
      });
    }
  });

  // Get all reservations with optional query params
  app.get('/api/bookings', async (req, res) => {
    try {
      const { search, date, status, guests } = req.query;
      const rows = await getAllReservations({
        search: typeof search === 'string' ? search : undefined,
        date: typeof date === 'string' ? date : undefined,
        status: typeof status === 'string' ? status : undefined,
        guests: guests ? Number(guests) : undefined
      });

      // Format to match BookingConfirmation interface
      const formatted = rows.map((r) => ({
        bookingId: r.booking_id,
        createdAt: r.created_at,
        status: r.status,
        qrCodeValue: r.qr_code_value,
        tableNumber: r.table_number,
        formData: {
          name: r.guest_name,
          email: r.email,
          phone: r.phone,
          guests: r.guests,
          date: r.reservation_date,
          timeSlot: r.time_slot,
          durationHours: (r.duration_minutes || 120) / 60,
          totalPricePence: r.total_price_pence,
          seatingArea: r.seating_area,
          dietaryNotes: r.dietary_notes || '',
          specialOccasion: r.special_occasion || 'None / Casual Aperitivo'
        }
      }));

      res.json({ success: true, count: formatted.length, data: formatted });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Get single booking with audit trail
  app.get(['/api/karaoke/availability','/api/admin/karaoke/availability'],async(req,res)=>{
    res.set('Cache-Control','no-store');
    const date=String(req.query.date||''),hours=Number(req.query.hours??2);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||!Number.isInteger(hours)||hours<2||hours>10)return res.status(400).json({error:'Invalid date or session length.'});
    try{return res.json({room:'amica-frith-karaoke',date,hours,checkoutEnabled:Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),slots:await karaokeSlots(date,hours,req.path==='/api/admin/karaoke/availability')});}catch{return res.status(503).json({error:'Room availability unavailable.'});}
  });
  app.get('/api/bookings/payment-status', async (req,res) => {
    const sessionId=typeof req.query.session_id==='string'?req.query.session_id:'';
    if(!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId))return res.status(400).json({success:false,error:'Invalid checkout reference.'});
    try {
      const booking=await getReservationByPaymentSession(sessionId);
      if(!booking||booking.seating_area!=='Karaoke Room')return res.status(404).json({success:false,error:'Checkout booking not found.'});
      const state=booking.payment_status==='paid'?'paid':booking.payment_status==='expired'||booking.payment_status==='failed'?'expired':'pending';
      return res.json({success:true,state,booking:{bookingId:booking.booking_id,createdAt:booking.created_at,status:booking.status,qrCodeValue:booking.qr_code_value,
        formData:{name:booking.guest_name,email:booking.email,phone:booking.phone,guests:booking.guests,date:booking.reservation_date,timeSlot:booking.time_slot,
          seatingArea:booking.seating_area,durationHours:(booking.duration_minutes||120)/60,totalPricePence:booking.total_price_pence,dietaryNotes:booking.dietary_notes||'',specialOccasion:booking.special_occasion||'Private Karaoke Room'}}});
    } catch { return res.status(503).json({success:false,error:'Payment status is temporarily unavailable.'}); }
  });

  app.get('/api/bookings/:id', async (req, res) => {
    try {
      const { reservation, auditLogs } = await getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      res.json({
        success: true,
        booking: {
          bookingId: reservation.booking_id,
          createdAt: reservation.created_at,
          status: reservation.status,
          tableNumber: reservation.table_number,
          qrCodeValue: reservation.qr_code_value,
          formData: {
            name: reservation.guest_name,
            email: reservation.email,
            phone: reservation.phone,
            guests: reservation.guests,
            date: reservation.reservation_date,
            timeSlot: reservation.time_slot,
            durationHours: (reservation.duration_minutes || 120) / 60,
            totalPricePence: reservation.total_price_pence,
            seatingArea: reservation.seating_area,
            dietaryNotes: reservation.dietary_notes || '',
            specialOccasion: reservation.special_occasion || 'None'
          }
        },
        auditLogs
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Karaoke checkout is paid in full before the single room is confirmed.
  app.post('/api/bookings/karaoke/checkout', async (req, res) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !webhookSecret) return res.status(503).json({ success:false, error:'Secure online payment is not configured yet. Please contact AMICA SOHO to book.' });
    let bookingId = '';
    try {
      const formData = req.body?.formData;
      if (!formData || typeof formData.name !== 'string' || !formData.name.trim() || typeof formData.phone !== 'string' || !formData.phone.trim())
        return res.status(400).json({success:false,error:'Enter the lead guest name and mobile number.'});
      const guests=Number(formData.guests),durationHours=Number(formData.durationHours ?? 2);
      if(!Number.isInteger(guests)||guests<8||guests>15) return res.status(400).json({success:false,error:'The karaoke room has an 8-guest minimum and a 15-guest maximum.'});
      if(!Number.isInteger(durationHours)||durationHours<2||durationHours>10) return res.status(400).json({success:false,error:'Choose a session of at least two whole hours.'});
      const validSlots=['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30','00:00','00:30','01:00'];
      if(!/^\d{4}-\d{2}-\d{2}$/.test(formData.date||'')||!validSlots.includes(formData.timeSlot)||
        (formData.email && (typeof formData.email!=='string'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)||formData.email.length>128))||
        formData.name.trim().length>100||formData.phone.trim().length>30||
        (formData.dietaryNotes && (typeof formData.dietaryNotes!=='string'||formData.dietaryNotes.length>2000)))
        return res.status(400).json({success:false,error:'Check the date, time and contact details.'});
      const date=new Date(formData.date+'T12:00:00Z');
      const todayLondon=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'});
      if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==formData.date||formData.date<todayLondon||![3,4,5,6].includes(date.getUTCDay()))
        return res.status(400).json({success:false,error:'Choose a Wednesday to Saturday service date from today onwards.'});
      if(serviceInstant(formData.date,formData.timeSlot)+durationHours*3600000>serviceInstant(formData.date,'03:00'))
        return res.status(400).json({success:false,error:'This session would run past 3:00 AM. Choose an earlier time or shorter session.'});
      const blocked=await isDateBlocked(formData.date,formData.timeSlot);
      if(blocked.blocked) return res.status(400).json({success:false,error:'This date or time is unavailable. Please choose another slot.'});

      bookingId='AMICA-'+randomUUID();
      const totalPricePence=guests*1500+(durationHours-2)*9000;
      const created=await createReservation({booking_id:bookingId,guest_name:formData.name,email:formData.email||'',phone:formData.phone,guests,
        reservation_date:formData.date,time_slot:formData.timeSlot,duration_minutes:durationHours*60,total_price_pence:totalPricePence,
        seating_area:'Karaoke Room',special_occasion:'Private Karaoke Room',dietary_notes:formData.dietaryNotes||'',
        ip_address:(req.headers['x-forwarded-for'] as string)||req.socket.remoteAddress||'127.0.0.1',actor:'GUEST_KARAOKE_CHECKOUT',
        statusOverride:'Pending Payment',paymentStatus:'pending'});

      const baseUrl='https://www.amicasoho.com';
      const params=new URLSearchParams();
      params.set('mode','payment'); params.set('client_reference_id',created.booking_id);
      params.set('success_url',baseUrl+'/karaoke-booking?payment=success&session_id={CHECKOUT_SESSION_ID}');
      params.set('cancel_url',baseUrl+'/karaoke-booking?payment=cancelled&booking_id='+encodeURIComponent(created.booking_id));
      params.set('expires_at',String(Math.floor(Date.now()/1000)+35*60));
      params.set('metadata[booking_id]',created.booking_id); params.set('metadata[booking_type]','karaoke');
      params.set('line_items[0][price_data][currency]','gbp'); params.set('line_items[0][price_data][unit_amount]',String(totalPricePence));
      params.set('line_items[0][price_data][product_data][name]','AMICA SOHO Private Karaoke Room');
      params.set('line_items[0][price_data][product_data][description]',guests+' guests · '+durationHours+' hours · £15 per guest for the first 2 hours, then £90 per extra hour');
      params.set('line_items[0][quantity]','1'); if(formData.email)params.set('customer_email',formData.email);
      const stripeResponse=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+secret,'Content-Type':'application/x-www-form-urlencoded'},body:params.toString()});
      const session=await stripeResponse.json().catch(()=>null);
      if(!stripeResponse.ok||!session?.id||!session?.url) throw new Error('Stripe checkout could not be created.');
      try { await attachKaraokePaymentSession(created.booking_id,session.id); }
      catch (error) {
        await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(session.id)+'/expire',{method:'POST',headers:{Authorization:'Bearer '+secret}}).catch(()=>{});
        throw error;
      }
      return res.status(201).json({success:true,bookingId:created.booking_id,checkoutUrl:session.url,totalPricePence});
    } catch(error:any) {
      if(bookingId) await failKaraokeCheckout(bookingId).catch(()=>{});
      return res.status(error instanceof BookingValidationError?400:503).json({success:false,error:error instanceof BookingValidationError?error.message:'Secure checkout is temporarily unavailable. Please try again or contact AMICA SOHO.'});
    }
  });

  app.post('/api/bookings/karaoke/cancel-checkout', async (req,res) => {
    const bookingId=String(req.body?.bookingId||'');
    if(!/^AMICA-[A-Za-z0-9-]{6,80}$/.test(bookingId))return res.status(400).json({success:false,error:'Invalid booking reference.'});
    try {
      const {reservation}=await getReservationById(bookingId);
      if(!reservation||reservation.seating_area!=='Karaoke Room')return res.json({success:true});
      if(reservation.status!=='Pending Payment'||reservation.payment_status!=='pending'||!reservation.payment_session_id)return res.json({success:true});
      const secret=process.env.STRIPE_SECRET_KEY;
      if(!secret)return res.status(503).json({success:false,error:'Checkout cancellation is unavailable.'});
      const expired=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(reservation.payment_session_id)+'/expire',{method:'POST',headers:{Authorization:'Bearer '+secret}});
      if(expired.ok)await changeKaraokePaymentState(reservation.payment_session_id,'expired');
      return res.json({success:true});
    } catch { return res.status(503).json({success:false,error:'Unable to close the checkout session.'}); }
  });



  app.post('/api/stripe/webhook', async (req,res) => {
    const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
    const rawBody=(req as any).rawBody as Buffer|undefined;
    const signature=req.headers['stripe-signature'];
    if(!webhookSecret||!rawBody||typeof signature!=='string')return res.status(400).json({success:false,error:'Invalid webhook request.'});
    try {
      const parts=Object.fromEntries(signature.split(',').map((part)=>{const i=part.indexOf('=');return [part.slice(0,i),part.slice(i+1)]}));
      const timestamp=parts.t;
      if(!timestamp||Math.abs(Date.now()/1000-Number(timestamp))>300)return res.status(400).json({success:false,error:'Expired webhook signature.'});
      const expected=createHmac('sha256',webhookSecret).update(timestamp+'.').update(rawBody).digest();
      const signatures=signature.split(',').filter(p=>p.startsWith('v1=')).map(p=>p.slice(3));
      const valid=signatures.some(value=>{try{const candidate=Buffer.from(value,'hex');return candidate.length===expected.length&&timingSafeEqual(candidate,expected)}catch{return false}});
      if(!valid)return res.status(400).json({success:false,error:'Invalid webhook signature.'});
      const event=req.body;
      if(event?.type==='checkout.session.completed') {
        const session=event.data?.object; const sessionId=String(session?.id||'');
        if(session?.metadata?.booking_type!=='karaoke')return res.json({received:true});
        const booking=await getReservationByPaymentSession(sessionId);
        if(!booking||booking.booking_id!==session.metadata.booking_id||booking.total_price_pence!==session.amount_total||session.currency!=='gbp'||session.payment_status!=='paid')
          return res.status(400).json({success:false,error:'Checkout details do not match the pending reservation.'});
        const changed=await changeKaraokePaymentState(sessionId,'paid');
        if(changed.changed&&changed.reservation?.email) {
          const result=await sendReservationEmail(changed.reservation);
          if(!result.success)console.error('Paid karaoke confirmation email was not delivered.');
        }
      } else if(event?.type==='checkout.session.expired') {
        const session=event.data?.object;
        if(session?.metadata?.booking_type==='karaoke')await changeKaraokePaymentState(String(session.id),'expired');
      }
      return res.json({received:true});
    } catch(error) {
      console.error('Stripe webhook processing failed:',error instanceof Error?error.message:'Unknown error');
      return res.status(500).json({success:false,error:'Webhook processing failed.'});
    }
  });

  // Create new reservation (auto-confirm 1 to 20 pax)
  app.post('/api/bookings', async (req, res) => {
    try {
      const { formData, bookingType = 'table', bookingId } = req.body;
      if (!['table', 'karaoke'].includes(bookingType)) return res.status(400).json({ success: false, error: 'Choose a valid booking type.' });
      const isKaraokeBooking = bookingType === 'karaoke';
      if (isKaraokeBooking) return res.status(400).json({success:false,error:'Karaoke bookings must be completed through secure Stripe checkout.'});
      if (!formData || !formData.name || !formData.phone) {
        return res.status(400).json({ success: false, error: 'Missing required guest contact information' });
      }

      const guests = Number(formData.guests);
      if (!Number.isInteger(guests) || guests < 1 || guests > (isKaraokeBooking ? 15 : 20)) {
        return res.status(400).json({ success: false, error: isKaraokeBooking ? 'The karaoke room accepts 1 to 15 guests.' : 'Online reservations accept between 1 and 20 guests' });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date || '') || !/^\d{2}:\d{2}$/.test(formData.timeSlot || '') ||
          (!!formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ||
          typeof formData.name !== 'string' || formData.name.trim().length === 0 || formData.name.length > 100 ||
          typeof formData.dietaryNotes !== 'undefined' && (typeof formData.dietaryNotes !== 'string' || formData.dietaryNotes.length > 2000) ||
          typeof formData.specialOccasion !== 'undefined' && (typeof formData.specialOccasion !== 'string' || formData.specialOccasion.length > 150) ||
          typeof formData.seatingArea !== 'undefined' && (typeof formData.seatingArea !== 'string' || formData.seatingArea.length > 100) ||
          typeof formData.phone !== 'string' || formData.phone.length > 30 || (formData.email || '').length > 128) {
        return res.status(400).json({ success: false, error: 'Please enter valid reservation details.' });
      }
      const date = new Date(formData.date + 'T12:00:00Z');
      const todayLondon = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== formData.date || formData.date < todayLondon || ![3,4,5,6].includes(date.getUTCDay()) || !['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30','00:00','00:30','01:00'].includes(formData.timeSlot)) {
        return res.status(400).json({ success: false, error: 'Please select an available Wednesday to Saturday service date and time.' });
      }

      const durationHours = isKaraokeBooking ? Number(formData.durationHours ?? 2) : 2;
      if (!Number.isInteger(durationHours) || durationHours < 2 || durationHours > 10) {
        return res.status(400).json({ success: false, error: 'Choose a karaoke session of at least two whole hours.' });
      }
      const closeTime = serviceInstant(formData.date, '03:00');
      if (serviceInstant(formData.date, formData.timeSlot) + durationHours * 3600000 > closeTime) {
        return res.status(400).json({ success: false, error: 'This session length would extend beyond the 3:00 AM closing time. Choose an earlier time or a shorter session.' });
      }

      // Check if date or slot is blocked by admin / buyout
      const blockCheck = await isDateBlocked(formData.date, formData.timeSlot);
      if (blockCheck.blocked) {
        return res.status(400).json({
          success: false,
          error: 'This time is unavailable. Please choose another available time or date.'
        });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const created = await createReservation({
        booking_id: typeof bookingId === 'string' && /^[A-Za-z0-9-]{6,80}$/.test(bookingId) ? bookingId : undefined,
        guest_name: formData.name,
        email: formData.email || '',
        phone: formData.phone,
        guests: guests,
        reservation_date: formData.date,
        time_slot: formData.timeSlot,
        duration_minutes: durationHours * 60,
        total_price_pence: isKaraokeBooking ? guests * 1500 + (durationHours - 2) * 9000 : undefined,
        seating_area: isKaraokeBooking ? 'Karaoke Room' : (formData.seatingArea || 'Vault Dining'),
        special_occasion: isKaraokeBooking ? 'Private Karaoke Room' : (formData.specialOccasion || 'Casual Dining & Drinks'),
        dietary_notes: formData.dietaryNotes || '',
        ip_address: clientIp,
        actor: isKaraokeBooking ? 'GUEST_KARAOKE_BOOKING' : 'GUEST_WEB_BOOKING'
      });

      // Prepare confirmation object (clean without room/table allocation)
      const confirmation = {
        bookingId: created.booking_id,
        createdAt: created.created_at,
        status: created.status,
        qrCodeValue: created.qr_code_value,
        formData: {
          name: created.guest_name,
          email: created.email,
          phone: created.phone,
          guests: created.guests,
          date: created.reservation_date,
          timeSlot: created.time_slot,
          durationHours: (created.duration_minutes || 120) / 60,
          totalPricePence: created.total_price_pence,
          seatingArea: created.seating_area,
          dietaryNotes: created.dietary_notes || '',
          specialOccasion: created.special_occasion || 'Casual Dining & Drinks'
        }
      };

      // Trigger email dispatch asynchronously
      const email = created.status==='Confirmed' && created.email ? await sendReservationEmail(created) : {success:false};
      res.setHeader('X-Amica-Email-Delivery', email.success ? 'sent' : 'unavailable');

      res.status(201).json({ success: true, booking: confirmation, emailSent: email.success });
    } catch (e: any) {
      res.status(e instanceof BookingValidationError ? 400 : 500).json({ success: false, error: e instanceof BookingValidationError ? e.message : 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Send confirmation email endpoint (for manual resend or client trigger)
  app.post('/api/bookings/:id/send-email', async (req, res) => {
    try {
      const { reservation } = await getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      const result = await sendReservationEmail(reservation);
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Get confirmation email preview
  app.get('/api/bookings/:id/email-preview', async (req, res) => {
    try {
      const { reservation } = await getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      const html = generateConfirmationEmailHtml(reservation);
      const text = generateConfirmationEmailText(reservation);
      res.json({ success: true, html, text, bookingId: reservation.booking_id, email: reservation.email });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Update status (e.g. 'Auto-Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-Show')
  app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
      const { status, actor, notes } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const updated = await updateReservationStatus(req.params.id, status, actor || 'STAFF_PORTAL', notes || '');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      res.json({
        success: true,
        booking: {
          bookingId: updated.booking_id,
          status: updated.status,
          updatedAt: updated.updated_at
        }
      });
    } catch (e: any) {
      res.status(e instanceof BookingValidationError ? 400 : 500).json({ success: false, error: e instanceof BookingValidationError ? e.message : 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Delete / cancel reservation
  app.delete('/api/bookings/:id', async (req, res) => {
    try {
      const { actor, reason } = req.body || {};
      const success = await deleteReservation(req.params.id, actor || 'STAFF_PORTAL', reason || 'Deleted by admin');
      if (!success) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }
      res.json({ success: true, message: `Reservation #${req.params.id} cancelled and archived` });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Export CSV
  app.get('/api/export/csv', async (req, res) => {
    try {
      const rows = await getAllReservations();
      const headers = [
        'Booking ID',
        'Date',
        'Time Slot',
        'Pax',
        'Guest Name',
        'Email',
        'Phone',
        'Status',
        'Occasion',
        'Dietary Requirements',
        'Created At'
      ];

      const csvRows = [headers.join(',')];
      for (const r of rows) {
        const line = [r.booking_id,r.reservation_date,r.time_slot,r.guests,r.guest_name,r.email,r.phone,r.status,r.special_occasion||'',r.dietary_notes||'',r.created_at].map(value => {
          let text=String(value); if(/^[=+@\-\t\r]/.test(text))text="'"+text;
          return '"'+text.replace(/"/g,'""')+'"';
        });
        csvRows.push(line.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="amica_reservations_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvRows.join('\n'));
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // =========================================================================
  // SYSTEM MANAGEMENT & BLOCKED DATES API
  // =========================================================================

  // Get all blocked dates / blackout windows
  app.get('/api/system/blocked-dates', async (req, res) => {
    try {
      const dates = await getBlockedDates();
      const cookie = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('amica_admin='))?.slice(12) || '';
      const [expires, signature] = cookie.split('.');
      const isStaff = adminPasswords.length > 0 && Number.isFinite(Number(expires)) && Number(expires) > Date.now() && Boolean(signature) && equal(signature, sign(expires));
      // Guests only need availability windows; keep internal reasons and notes in the authenticated staff view.
      const data = isStaff ? dates : dates.map(({ reason, notes, ...window }) => ({ ...window, reason: 'Unavailable', notes: null }));
      res.json({ success: true, count: data.length, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Add a new blocked date / blackout window
  app.post('/api/system/blocked-dates', async (req, res) => {
    try {
      const { blocked_date, is_full_day, start_time, end_time, reason, notes, actor } = req.body;
      const date = typeof blocked_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(blocked_date) ? new Date(blocked_date+'T12:00:00Z') : null;
      if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10)!==blocked_date || typeof reason!=='string' || !reason.trim() || typeof is_full_day!=='boolean') {
        return res.status(400).json({ success: false, error: 'Valid date, coverage and reason are required.' });
      }

      const created = await addBlockedDate({
        blocked_date,
        is_full_day: is_full_day !== false,
        start_time,
        end_time,
        reason,
        notes,
        actor: actor || 'MAÎTRE_D_ADMIN'
      });

      res.status(201).json({ success: true, data: created });
    } catch (e: any) {
      res.status(e instanceof BookingValidationError ? 400 : 500).json({ success: false, error: e instanceof BookingValidationError ? e.message : 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Remove / unblock a date
  app.delete('/api/system/blocked-dates/:id', async (req, res) => {
    try {
      const idParam = req.params.id;
      const { actor } = req.body || {};
      const success = await removeBlockedDate(idParam, actor || 'MAÎTRE_D_ADMIN');
      if (!success) {
        return res.status(404).json({ success: false, error: 'Blocked date record not found' });
      }
      res.json({ success: true, message: 'Date unblocked successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Get venue / system settings
  app.get('/api/system/settings', async (req, res) => {
    try {
      const settings = await getVenueSettings();
      res.json({ success: true, settings });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Update venue / system settings
  app.post('/api/system/settings', async (req, res) => {
    try {
      const { settings, actor } = req.body;
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ success: false, error: 'Settings object is required' });
      }
      const updated = await updateVenueSettingsBatch(settings, actor || 'MAÎTRE_D_ADMIN');
      res.json({ success: true, settings: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Reset database back to default seed data
  app.post('/api/database/reset', async (req, res) => {
    try {
      return res.status(405).json({ success: false, error: 'Bulk database reset is disabled. Cancel reservations individually.' });
      // re-seed
      res.json({ success: true, message: 'Database reset and cleared' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // =========================================================================
  // VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
  // =========================================================================
  if (process.env.VERCEL) return;
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}
await configureServer();
export default app;

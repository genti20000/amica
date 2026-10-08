import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllReservations,
  getReservationById,
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

  app.use(express.json({ limit: '32kb' }));
  app.post('/api/admin/logout', (req, res) => { res.clearCookie('amica_admin', {path:'/api'}); res.json({success:true}); });

  // Admin authorization is enforced on the server, independent of the preview lock.
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionKey = process.env.ADMIN_SESSION_SECRET || randomBytes(32).toString('hex');
  const sign = (value: string) => createHmac('sha256', sessionKey).update(value).digest('hex');
  const equal = (a: string, b: string) => {
    const aa = Buffer.from(a), bb = Buffer.from(b);
    return aa.length === bb.length && timingSafeEqual(aa, bb);
  };
  app.post('/api/admin/login', async (req, res) => {
    if (!adminPassword) return res.status(503).json({ success: false, error: 'Admin access needs to be configured.' });
    if (!equal(String(req.body.password || ''), adminPassword)) return res.status(401).json({ success: false, error: 'Incorrect admin password.' });
    const expires = String(Date.now() + 8 * 60 * 60 * 1000);
    res.cookie('amica_admin', `${expires}.${sign(expires)}`, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/api'
    });
    res.json({ success: true });
  });
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const publicRead = req.method === 'GET' && ['/health', '/system/settings', '/system/blocked-dates'].includes(req.path);
    if (publicRead || (req.method === 'POST' && req.path === '/bookings')) return next();
    const cookie = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('amica_admin='))?.slice(12) || '';
    const [expires, signature] = cookie.split('.');
    if (!adminPassword || !expires || !signature || Number(expires) < Date.now() || !equal(signature, sign(expires))) {
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

  // Create new reservation (auto-confirm 1 to 20 pax)
  app.post('/api/bookings', async (req, res) => {
    try {
      const { formData, actor, bookingId } = req.body;
      if (!formData || !formData.name || !formData.email || !formData.phone) {
        return res.status(400).json({ success: false, error: 'Missing required guest contact information' });
      }

      const guests = Number(formData.guests);
      if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
        return res.status(400).json({ success: false, error: 'Online reservations accept between 1 and 20 guests' });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date || '') || !/^\d{2}:\d{2}$/.test(formData.timeSlot || '') ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
          typeof formData.name !== 'string' || formData.name.trim().length === 0 || formData.name.length > 100 ||
          typeof formData.dietaryNotes !== 'undefined' && (typeof formData.dietaryNotes !== 'string' || formData.dietaryNotes.length > 2000) ||
          typeof formData.specialOccasion !== 'undefined' && (typeof formData.specialOccasion !== 'string' || formData.specialOccasion.length > 150) ||
          typeof formData.seatingArea !== 'undefined' && (typeof formData.seatingArea !== 'string' || formData.seatingArea.length > 100) ||
          typeof formData.phone !== 'string' || formData.phone.length > 30 || formData.email.length > 128) {
        return res.status(400).json({ success: false, error: 'Please enter valid reservation details.' });
      }
      const date = new Date(formData.date + 'T12:00:00Z');
      const todayLondon = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== formData.date || formData.date < todayLondon || ![3,4,5,6].includes(date.getUTCDay()) || !['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30','00:00','00:30','01:00','01:30','02:00'].includes(formData.timeSlot)) {
        return res.status(400).json({ success: false, error: 'Please select an available Wednesday to Saturday service date and time.' });
      }

      // Check if date or slot is blocked by admin / buyout
      const blockCheck = await isDateBlocked(formData.date, formData.timeSlot);
      if (blockCheck.blocked) {
        return res.status(400).json({
          success: false,
          error: `Selected date is unavailable: ${blockCheck.reason || 'Private Buyout / Closed'}. Please select another date.`
        });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const created = await createReservation({
        booking_id: typeof bookingId === 'string' && /^[A-Za-z0-9-]{6,80}$/.test(bookingId) ? bookingId : undefined,
        guest_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: guests,
        reservation_date: formData.date,
        time_slot: formData.timeSlot,
        seating_area: formData.seatingArea || 'Vault Dining',
        special_occasion: formData.specialOccasion || 'Casual Dining & Drinks',
        dietary_notes: formData.dietaryNotes || '',
        ip_address: clientIp,
        actor: 'GUEST_WEB_BOOKING'
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
          seatingArea: created.seating_area,
          dietaryNotes: created.dietary_notes || '',
          specialOccasion: created.special_occasion || 'Casual Dining & Drinks'
        }
      };

      // Trigger email dispatch asynchronously
      const email = await sendReservationEmail(created);
      res.setHeader('X-Amica-Email-Delivery', email.success ? 'sent' : 'unavailable');

      res.status(201).json({ success: true, booking: confirmation, emailSent: email.success });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
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
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
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
      res.json({ success: true, count: dates.length, data: dates });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
    }
  });

  // Add a new blocked date / blackout window
  app.post('/api/system/blocked-dates', async (req, res) => {
    try {
      const { blocked_date, is_full_day, start_time, end_time, reason, notes, actor } = req.body;
      if (!blocked_date || !reason) {
        return res.status(400).json({ success: false, error: 'Date and reason are required' });
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
      res.status(500).json({ success: false, error: 'The request could not be saved. Please try again or contact the venue.' });
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

import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../server/db.js';

const EMAIL = 'info@amicasoho.com';
const clean = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const escapeHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

async function ensureTable() {
  await db.query(
    "CREATE TABLE IF NOT EXISTS membership_applications (" +
    "id uuid PRIMARY KEY, full_name varchar(120) NOT NULL, contact_method varchar(12) NOT NULL, " +
    "contact_value varchar(160) NOT NULL, rules_accepted_at timestamptz NOT NULL, " +
    "is_adult boolean NOT NULL, status varchar(24) NOT NULL DEFAULT 'pending', " +
    "created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), " +
    "reviewed_at timestamptz, review_note varchar(600))"
  );
  // Database-backed web submissions use the restricted server connection.
  // Never expose application records to Supabase public API roles.
  await db.query('ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY');
  await db.query('REVOKE ALL ON TABLE public.membership_applications FROM anon, authenticated');
  await db.query('ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS hospitality_role varchar(160)');
}

export default async function membership(req: Request, res: Response) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method !== 'POST') return res.status(405).json({success:false,error:'Method not allowed'});
  try {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    if(b.website) return res.json({success:true,message:'Your application has been received for review.'});
    const name=clean(b.fullName,120), method=clean(b.contactMethod,12);
    const contact=clean(b.contactValue,160), rules=b.acceptRules === true, adult=b.confirmAdult === true;
    const privacy=b.acceptPrivacy === true;
    const hospitalityRole=clean(b.hospitalityRole,160);
    const validContact=method==='email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) :
      method==='phone' && /^\+?[0-9\s()-]{8,25}$/.test(contact);
    if(name.length<2 || name.length>120 || !['email','phone'].includes(method) ||
       !validContact || hospitalityRole.length < 3 || !rules || !adult || !privacy) {
      return res.status(400).json({success:false,error:'Please complete the required details and confirm the declarations.'});
    }
    if(req.headers.origin) {
      let origin: URL;
      try { origin=new URL(req.headers.origin); } catch { return res.status(403).json({success:false,error:'Invalid request origin.'}); }
      if(origin.host !== req.headers.host) return res.status(403).json({success:false,error:'Invalid request origin.'});
    }
    await ensureTable();
    const id=randomUUID(), now=new Date();
    const existing=await db.query(
      "SELECT id FROM membership_applications WHERE contact_method=$1 AND lower(contact_value)=lower($2) AND created_at > now() - interval '12 hours' LIMIT 1",
      [method,contact]
    );
    if(existing.rows.length) return res.json({success:true,message:'Your application has been received for review.'});
    await db.query(
      "INSERT INTO membership_applications (id,full_name,contact_method,contact_value,hospitality_role,rules_accepted_at,is_adult,status,created_at,updated_at) " +
      "VALUES ($1,$2,$3,$4,$6,$5,true,'pending',$5,$5)",
      [id,name,method,contact,now,hospitalityRole]
    );
    // Notification failure must not lose an already-saved application.
    if(process.env.RESEND_API_KEY) {
      const from=process.env.FROM_EMAIL || 'AMICA SOHO <noreply@amicasoho.london>';
      const subject='AMICA SOHO · New membership application · '+name;
      const text='Membership application received\n\nApplicant: '+name+'\nContact: '+contact+' ('+method+')' +
        '\nReference: '+id+'\nReceived: '+now.toISOString() +
        '\nClub Rules acknowledged: Yes\n18+ confirmed: Yes\nPrivacy notice acknowledged: Yes\nStatus: PENDING REVIEW' +
        '\n\nThis application does not confer membership or permission to enter.';
      try {
        const mail=await fetch('https://api.resend.com/emails',{
          method:'POST',
          headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
          signal:AbortSignal.timeout(12000),
          body:JSON.stringify({
            from,to:[EMAIL],cc:['genti28@gmail.com'],
            ...(method==='email'?{reply_to:contact}:{}),
            subject,text,
            html:'<div style="font-family:Arial,sans-serif"><h2>New AMICA SOHO membership application</h2><pre style="white-space:pre-wrap">'+escapeHtml(text)+'</pre></div>'
          })
        });
        if(!mail.ok) console.error('Membership email notification failed',mail.status);
      } catch(e) {console.error('Membership notification error',e instanceof Error?e.message:'Unknown error');}
    }
    return res.status(201).json({success:true,message:'Your membership application has been received for review.',reference:id.slice(0,8).toUpperCase()});
  } catch(e) {
    console.error('Membership application error:',e instanceof Error?e.message:'Unknown error');
    return res.status(503).json({success:false,error:'Unable to submit your membership application. Please contact info@amicasoho.com.'});
  }
}
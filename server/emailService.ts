import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { db, ReservationRow } from './db.js';

export interface EmailDispatchResult {
  success: boolean;
  mode: 'resend' | 'sendgrid' | 'smtp' | 'simulated';
  provider: string;
  bookingId: string;
  recipient: string;
  sender: string;
  subject: string;
  previewHtml: string;
  textBody: string;
  mailtoUrl: string;
  message: string;
  dispatchedAt: string;
  externalId?: string;
}

// Generate opulent HTML email matching AMICA SOHO brand aesthetic
export function generateConfirmationEmailHtml(reservation: ReservationRow): string {
  const formattedDate = new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AMICA SOHO · Table Reservation Confirmation</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0B0B0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FDFBF7; }
    .email-container { max-width: 600px; margin: 30px auto; background: linear-gradient(180deg, #1C0409 0%, #120205 50%, #0A0103 100%); border: 1.5px solid #DFBE7B; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
    .header { padding: 40px 30px 25px; text-align: center; border-bottom: 1px solid rgba(223, 190, 123, 0.25); background: radial-gradient(circle at 50% 0%, #3B0A12 0%, #180307 100%); }
    .brand-eyebrow { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #DFBE7B; margin-bottom: 8px; font-weight: 600; }
    .brand-title { font-family: Georgia, serif; font-size: 32px; letter-spacing: 0.15em; color: #FDFBF7; margin: 0; font-weight: 300; }
    .brand-gold { color: #FFEAA7; }
    .badge { display: inline-block; padding: 6px 16px; background-color: #200A0E; border: 1px solid #DFBE7B; border-radius: 20px; color: #DFBE7B; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 18px; }
    .content { padding: 35px 30px; }
    .salutation { font-family: Georgia, serif; font-size: 22px; color: #FFEAA7; margin-bottom: 12px; }
    .lead-text { font-size: 14px; line-height: 1.6; color: rgba(253, 251, 247, 0.85); margin-bottom: 25px; }
    .details-box { background-color: #120205; border: 1px solid rgba(223, 190, 123, 0.3); border-radius: 12px; padding: 22px; margin-bottom: 28px; }
    .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(223, 190, 123, 0.15); font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #DFBE7B; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; }
    .detail-value { color: #FDFBF7; font-weight: 500; text-align: right; }
    .reference-box { text-align: center; padding: 18px; background: rgba(223, 190, 123, 0.06); border: 1px dashed #DFBE7B; border-radius: 10px; margin-bottom: 25px; }
    .reference-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #DFBE7B; margin-bottom: 4px; }
    .reference-code { font-family: monospace; font-size: 20px; font-weight: bold; color: #FFEAA7; letter-spacing: 0.1em; }
    .policy-box { font-size: 12px; line-height: 1.6; color: rgba(223, 190, 123, 0.8); background-color: #160307; border-left: 3px solid #DFBE7B; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 25px; }
    .policy-box strong { color: #FFEAA7; }
    .footer { padding: 25px 30px; text-align: center; border-top: 1px solid rgba(223, 190, 123, 0.2); font-size: 11px; color: rgba(223, 190, 123, 0.6); line-height: 1.6; background-color: #0A0103; }
    .footer a { color: #DFBE7B; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-eyebrow">Subterranean Speakeasy & Dining</div>
      <h1 class="brand-title">AMICA <span class="brand-gold">SOHO</span></h1>
      <div class="badge">Table Reservation Confirmed</div>
    </div>

    <div class="content">
      <div class="salutation">Dear ${escapeHtml(reservation.guest_name)},</div>
      <p class="lead-text">
        We are delighted to confirm your table reservation at <strong>AMICA SOHO</strong>. Your reservation request has been registered in our guestbook.
      </p>

      <div class="reference-box">
        <div class="reference-label">Reservation Reference</div>
        <div class="reference-code">${reservation.booking_id}</div>
      </div>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${reservation.time_slot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Party Size</span>
          <span class="detail-value">${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Occasion</span>
          <span class="detail-value">${escapeHtml(reservation.special_occasion || 'Casual Dining & Drinks')}</span>
        </div>
        ${reservation.dietary_notes ? `
        <div class="detail-row">
          <span class="detail-label">Dietary / Notes</span>
          <span class="detail-value">${escapeHtml(reservation.dietary_notes)}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Location</span>
          <span class="detail-value">23 Frith Street, Soho, London W1D 4RR</span>
        </div>
      </div>

      <div class="policy-box">
        <strong>Important Information For Your Visit:</strong><br>
        • <strong>Arrival Window:</strong> Tables are held for 15 minutes past your booked time.<br>
        • <strong>Opening Hours:</strong> Wednesday to Saturday from 5:00 PM to 3:00 AM (17:00 – 03:00).<br>
        • <strong>No Deposit Required:</strong> Enjoy full complimentary booking. If your plans change, cancellations are free up to 2 hours prior.
      </div>
    </div>

    <div class="footer">
      <strong>AMICA SOHO</strong> · 23 Frith Street, Soho, London W1D 4RR<br>
      Reservations: <a href="mailto:reservations@amicasoho.com">reservations@amicasoho.com</a><br>
      Open Wednesday through Saturday (5:00 PM – 3:00 AM)
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateConfirmationEmailText(reservation: ReservationRow): string {
  const formattedDate = new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
AMICA SOHO · TABLE RESERVATION CONFIRMATION
==================================================

Dear ${reservation.guest_name},

Thank you for reserving a table at AMICA SOHO. Your reservation is confirmed:

Reference:    ${reservation.booking_id}
Date:         ${formattedDate}
Time:         ${reservation.time_slot}
Party Size:   ${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}
Occasion:     ${reservation.special_occasion || 'Casual Dining & Drinks'}
${reservation.dietary_notes ? `Notes:        ${reservation.dietary_notes}\n` : ''}Venue:        AMICA SOHO, 23 Frith Street, Soho, London W1D 4RR
Hours:        Wednesday to Saturday, 5:00 PM – 3:00 AM

IMPORTANT INFORMATION:
- Your table is held for 15 minutes past your booked time.
- No deposit required. Free cancellations up to 2 hours prior.
- Contact: reservations@amicasoho.com

We look forward to welcoming you to Soho.

Warm regards,
The AMICA SOHO Hospitality Team
23 Frith Street, Soho, London W1D 4RR
  `.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Dispatches confirmation email using Resend, SendGrid, or SMTP, with simulated fallback
export async function sendReservationEmail(reservation: ReservationRow): Promise<EmailDispatchResult> {
  const subject = `AMICA SOHO · Table Reservation Confirmed (${reservation.booking_id})`;
  const previewHtml = generateConfirmationEmailHtml(reservation);
  const textBody = generateConfirmationEmailText(reservation);
  const dispatchedAt = new Date().toISOString();

  // Explicit sender address requested: reservations@amicasoho.com
  const fromEmail = process.env.FROM_EMAIL || 'AMICA SOHO <reservations@amicasoho.com>';

  // Create mailto fallback URL
  const mailtoSubject = encodeURIComponent(subject);
  const mailtoBody = encodeURIComponent(textBody);
  const mailtoUrl = `mailto:${encodeURIComponent(reservation.email)}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  let mode: 'resend' | 'sendgrid' | 'smtp' | 'simulated' = 'simulated';
  let provider = 'Simulated Dispatch Engine';
  let message = '';
  let externalId: string | undefined;

  // 1. External Service Priority: RESEND
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: reservation.email,
        subject,
        html: previewHtml,
        text: textBody
      });

      if (error) {
        throw new Error(error.message);
      }

      mode = 'resend';
      provider = 'Resend (api.resend.com)';
      externalId = data?.id;
      message = `Confirmation email sent via Resend from reservations@amicasoho.com to ${reservation.email} (ID: ${data?.id})`;
    } catch (err: any) {
      console.warn('Resend dispatch failed, falling back to simulated dispatch:', err.message);
      mode = 'simulated';
      provider = 'Resend (Simulated Fallback)';
      message = `Resend encountered an issue (${err.message}). Confirmation logged for ${reservation.email}.`;
    }
  }
  // 2. External Service Priority: SENDGRID
  else if (sendgridApiKey) {
    try {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: reservation.email }] }],
          from: { email: 'reservations@amicasoho.com', name: 'AMICA SOHO' },
          subject,
          content: [
            { type: 'text/plain', value: textBody },
            { type: 'text/html', value: previewHtml }
          ]
        })
      });

      if (!sgRes.ok) {
        const errorText = await sgRes.text();
        throw new Error(`SendGrid API error ${sgRes.status}: ${errorText}`);
      }

      mode = 'sendgrid';
      provider = 'SendGrid (api.sendgrid.com)';
      message = `Confirmation email sent via SendGrid from reservations@amicasoho.com to ${reservation.email}`;
    } catch (err: any) {
      console.warn('SendGrid dispatch failed, falling back to simulated dispatch:', err.message);
      mode = 'simulated';
      provider = 'SendGrid (Simulated Fallback)';
      message = `SendGrid encountered an issue (${err.message}). Confirmation logged for ${reservation.email}.`;
    }
  }
  // 3. Fallback: SMTP / Nodemailer
  else if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: reservation.email,
        subject,
        text: textBody,
        html: previewHtml
      });

      mode = 'smtp';
      provider = 'SMTP Service';
      externalId = info.messageId;
      message = `Confirmation email sent via SMTP from reservations@amicasoho.com to ${reservation.email}`;
    } catch (err: any) {
      console.warn('SMTP dispatch failed, falling back to simulated dispatch:', err.message);
      mode = 'simulated';
      provider = 'SMTP (Simulated Fallback)';
      message = `SMTP encountered an issue (${err.message}). Confirmation logged for ${reservation.email}.`;
    }
  }
  // 4. Default in development: Instant Simulated Dispatch with Database Audit & Mailto
  else {
    mode = 'simulated';
    provider = 'Internal Email Dispatch Engine';
    message = `Confirmation email prepared from reservations@amicasoho.com to ${reservation.email}. Branded HTML preview and mailto link ready. Configure RESEND_API_KEY or SENDGRID_API_KEY in .env for live cloud delivery.`;
  }

  // Record dispatch log in database
  try {
    db.prepare(`
      INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      reservation.booking_id,
      'EMAIL_CONFIRMATION_DISPATCHED',
      mode.toUpperCase() + '_SERVICE',
      JSON.stringify({
        sender: 'reservations@amicasoho.com',
        recipient: reservation.email,
        mode,
        provider,
        externalId: externalId || null,
        subject,
        dispatchedAt
      }),
      dispatchedAt
    );
  } catch (e) {
    console.error('Failed to log email dispatch audit:', e);
  }

  return {
    success: true,
    mode,
    provider,
    bookingId: reservation.booking_id,
    recipient: reservation.email,
    sender: 'reservations@amicasoho.com',
    subject,
    previewHtml,
    textBody,
    mailtoUrl,
    message,
    dispatchedAt,
    externalId
  };
}

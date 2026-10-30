import type { Request, Response } from 'express';

const ROLES = new Set(['Bar Staff', 'Floor Staff', 'Either / Both']);
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';
const esc = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export default async function careers(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  try {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    // Simple bot trap: never acknowledge or deliver spam.
    if (b.website) return res.status(200).json({ success: true });
    if (b.consent !== true) return res.status(400).json({ success: false, error: 'Please confirm the privacy notice.' });
    const first = clean(b.first, 60);
    const last = clean(b.last, 60);
    const email = clean(b.email, 150).toLowerCase();
    const phone = clean(b.phone, 40);
    const role = clean(b.role, 40);
    const experience = clean(b.experience, 50);
    const availability = clean(b.availability, 50);
    const about = clean(b.about, 1600);
    if (!first || !last || !phone || !ROLES.has(role) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        first.length > 60 || last.length > 60 || phone.length < 6) {
      return res.status(400).json({ success: false, error: 'Please check your contact details and selected position.' });
    }
    let attachments: Array<{ filename: string; content: string }> = [];
    if (b.cv) {
      if (typeof b.cv !== 'object' || typeof b.cv.name !== 'string' || typeof b.cv.base64 !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid CV attachment.' });
      }
      const filename = b.cv.name.split(/[\\/]/).pop() || 'cv.pdf';
      const ext = filename.toLowerCase().match(/\.(pdf|doc|docx)$/)?.[1];
      if (!ext || filename.length > 100 || b.cv.base64.length > Math.ceil(MAX_FILE_BYTES * 4 / 3) + 8 ||
          !/^[A-Za-z0-9+/=]+$/.test(b.cv.base64)) {
        return res.status(400).json({ success: false, error: 'Upload a PDF or Word CV under 2 MB.' });
      }
      const file = Buffer.from(b.cv.base64, 'base64');
      const magic = file.subarray(0, 8).toString('hex');
      const valid = ext === 'pdf' ? file.subarray(0, 5).toString() === '%PDF-'
        : ext === 'doc' ? magic.startsWith('d0cf11e0a1b11ae1')
        : magic.startsWith('504b0304');
      if (file.length === 0 || file.length > MAX_FILE_BYTES || !valid) {
        return res.status(400).json({ success: false, error: 'The CV format or size is not supported.' });
      }
      attachments = [{ filename: filename.replace(/[^a-zA-Z0-9._ -]/g, '_'), content: b.cv.base64 }];
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Careers applications: RESEND_API_KEY missing');
      return res.status(503).json({ success: false, error: 'Applications are temporarily unavailable. Please contact info@amocasoho.com.' });
    }
    const from = process.env.FROM_EMAIL || 'AMICA SOHO <noreply@amicasoho.com>';
    const subject = 'AMICA SOHO · ' + role + ' application · ' + first + ' ' + last;
    const entries: [string, string][] = [
      ['Name', first + ' ' + last], ['Email', email], ['Telephone', phone],
      ['Position', role], ['Experience', experience || 'Not specified'],
      ['Availability', availability || 'Not specified'], ['About', about || 'Not supplied']
    ];
    const text = entries.map(([label, val]) => label + ': ' + val).join('\n\n') +
      '\n\nSent from amicasoho.com/careers. Applicant agreed to be contacted regarding recruitment.';
    const html = '<div style="font:14px/1.7 Arial,sans-serif;max-width:660px">' +
      '<h2 style="color:#592b3a">New AMICA SOHO careers application</h2>' +
      entries.map(([label, val]) => '<p><strong>' + esc(label) + ':</strong> ' + esc(val).replace(/\n/g, '<br>') + '</p>').join('') +
      '<hr><small>Submitted via amicasoho.com/careers with recruitment contact consent.</small></div>';
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        from, to: ['info@amocasoho.com'],
        reply_to: email, subject, html, text, ...(attachments.length ? { attachments } : {})
      })
    });
    if (!sent.ok) {
      const issue = await sent.text();
      console.error('Careers email dispatch failed:', sent.status, issue.slice(0, 250));
      return res.status(503).json({ success: false, error: 'We could not send your application. Please try again or email info@amocasoho.com.' });
    }
    return res.status(200).json({ success: true, message: 'Your application has been sent to the Amica Soho team.' });
  } catch (error) {
    console.error('Careers application error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ success: false, error: 'We could not send your application. Please try again shortly.' });
  }
}

import type { Express, Request, Response } from 'express';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { atomic, read, instant, deny, MembershipError } from './membershipFirestore.js';
const EMAIL = 'members@amicasoho.com';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const cookie = (req: Request, name: string) => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1) || '';
const key = () => { const value = process.env.ADMIN_SESSION_SECRET; if (!value || value.length < 32) throw new Error('A persistent admin session secret is required.'); return value; };
const signature = (value: string) => createHmac('sha256', key()).update('superadmin:' + value).digest('hex');
export async function isSuperAdmin(req: Request) {
  const value = cookie(req, 'amica_superadmin');
  const parts = value.split('.');
  const [id, expiry, sig] = parts;
  if (parts.length !== 3 || !/^[a-f0-9]{64}$/.test(id || '') || !/^\d+$/.test(expiry || '') || !id || !expiry || !sig || Number(expiry) <= Date.now()) return false;
  const expected = signature(id + '.' + expiry);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const session = await read('superadmin_sessions', id);
  return session?.email === EMAIL && session?.expires === Number(expiry) && !session?.revoked;
}
export async function revokeSuperAdmin(req: Request) {
  const value = cookie(req, 'amica_superadmin');
  if (!value) return;
  if (!await isSuperAdmin(req)) return;
  const [id] = value.split('.');
  await atomic(async unit => { const session = await unit.get('superadmin_sessions', id); if (session) unit.set('superadmin_sessions', id, {...session, revoked: true}); });
}
export function identityRoutes(app: Express) {
  app.get('/api/membership/identity', async (req, res) => {
    try { res.json({success: true, superAdmin: await isSuperAdmin(req)}); }
    catch { res.status(503).json({success: false, error: 'Identity verification unavailable.'}); }
  });
  // Both endpoints inherit the normal admin session and same-origin middleware.
  app.post('/api/membership/superadmin/challenge', async (_req, res) => {
    if (!process.env.RESEND_API_KEY) return res.status(503).json({success: false, error: 'Super-admin email delivery is not configured.'});
    try {
      key();
      const challenge = randomBytes(32).toString('hex'), code = String(randomInt(100000, 1000000));
      await atomic(async unit => {
        const prior = await unit.get('superadmin_limits', 'email');
        if (prior && prior.next_request > Date.now()) deny('Wait a minute before requesting another code.', 429);
        unit.set('superadmin_limits', 'email', {next_request: Date.now() + 60000});
        unit.set('superadmin_challenges', challenge, {email: EMAIL, hash: hash(challenge + code), expires: Date.now() + 600000, attempts: 0, used: false, created_at: instant()});
      });
      const mail = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: {Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json'},
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({from: process.env.FROM_EMAIL || 'AMICA SOHO <noreply@amicasoho.london>', to: [EMAIL], subject: 'AMICA super-admin sign-in code', text: 'Your AMICA super-admin code is ' + code + '. It expires in 10 minutes. Do not share it. If you did not request this, ignore this email.'})
      });
      if (!mail.ok) throw new Error('Delivery failed');
      res.json({success: true, challenge, message: 'Code sent to ' + EMAIL});
    } catch (error) { respond(res, error); }
  });
  app.post('/api/membership/superadmin/verify', async (req, res) => {
    const challenge = String(req.body?.challenge || ''), code = String(req.body?.code || '');
    if (!/^[a-f0-9]{64}$/.test(challenge) || !/^\d{6}$/.test(code)) return res.status(400).json({success: false, error: 'Enter the six-digit code.'});
    try {
      const id = randomBytes(32).toString('hex'), expires = Date.now() + 30 * 60000;
      const accepted = await atomic(async unit => {
        const record = await unit.get('superadmin_challenges', challenge);
        if (!record || record.email !== EMAIL || record.used || record.expires <= Date.now() || record.attempts >= 5) return false;
        const ok = timingSafeEqual(Buffer.from(record.hash), Buffer.from(hash(challenge + code)));
        unit.set('superadmin_challenges', challenge, {...record, attempts: record.attempts + 1, used: ok});
        if (ok) unit.set('superadmin_sessions', id, {email: EMAIL, expires, revoked: false});
        return ok;
      });
      if (!accepted) return res.status(403).json({success: false, error: 'Code invalid, expired or already used.'});
      res.cookie('amica_superadmin', id + '.' + expires + '.' + signature(id + '.' + expires), {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api', maxAge: 30 * 60000});
      res.json({success: true, superAdmin: true});
    } catch (error) { respond(res, error); }
  });
  app.post('/api/membership/superadmin/logout', async (req, res) => {
    try {
      const [id] = cookie(req, 'amica_superadmin').split('.');
      if (id && /^[a-f0-9]{64}$/.test(id)) await atomic(async unit => { const record = await unit.get('superadmin_sessions', id); if (record) unit.set('superadmin_sessions', id, {...record, revoked: true}); });
      res.clearCookie('amica_superadmin', {path: '/api'}); res.json({success: true});
    } catch (error) { respond(res, error); }
  });
}
function respond(res: Response, error: unknown) { res.status(error instanceof MembershipError ? error.status : 503).json({success: false, error: error instanceof MembershipError ? error.message : 'Super-admin sign-in temporarily unavailable.'}); }

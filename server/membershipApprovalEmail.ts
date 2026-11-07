import {createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID} from 'node:crypto';
import { atomic, instant, type Unit } from './membershipFirestore.js';

type Member = Record<string, any>;
export type ApprovalDelivery = 'sent' | 'failed' | 'pending' | 'manual';
function mailKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Persistent admin session secret required for pass email delivery.');
  return createHash('sha256').update('membership-mail-v1:' + secret).digest();
}
function encrypt(text: string) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', mailKey(), iv);
  return {iv: iv.toString('base64'), ciphertext: Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64'), tag: cipher.getAuthTag().toString('base64')};
}
function decrypt(job: Member) {
  if (!job.encrypted_text) return job.text; // Previously queued confirmation-only messages.
  const e = job.encrypted_text, cipher = createDecipheriv('aes-256-gcm', mailKey(), Buffer.from(e.iv, 'base64'));
  cipher.setAuthTag(Buffer.from(e.tag, 'base64'));
  return Buffer.concat([cipher.update(Buffer.from(e.ciphertext, 'base64')), cipher.final()]).toString('utf8');
}
export function queueApprovalConfirmation(unit: Unit, member: Member) {
  const token = randomBytes(32).toString('base64url'), tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 90 * 86400000).toISOString(), passUrl = 'https://members.amicasoho.com/pass#t=' + token;
  unit.set('pass_credentials', member.id, {id: randomUUID(), member_id: member.id, token_hash: tokenHash, expires_at: expiresAt, issued_at: instant(), revoked_at: null, last_verified_at: null});
  unit.set('pass_tokens', tokenHash, {member_id: member.id});
  if (member.contact_method !== 'email') return {passUrl, expiresAt};
  unit.set('approval_emails', member.id, {
    id: member.id, member_id: member.id, to: member.contact_value,
    from: process.env.FROM_EMAIL || 'AMICA SOHO <noreply@amicasoho.london>',
    subject: 'Your AMICA SOHO membership application is approved',
    pass_token_hash: tokenHash, encrypted_text: encrypt('Hello ' + member.full_name + ',\n\nYour AMICA SOHO membership application has been approved.\n\nMembership number: ' + member.member_number +
      '\n\nPlease bring photo ID when visiting AMICA SOHO at 23 Frith Street, London W1D 4RR. Open your private digital membership pass:\n' + passUrl + '\nPass expires: ' + expiresAt + '. Keep this link private. Membership does not guarantee admission; entry remains subject to venue rules and staff checks.' +
      '\n\nQuestions? Contact info@amicasoho.com.\n\nAMICA SOHO'),
    status: 'pending', attempts: 0, lease_until: 0, created_at: instant(), sent_at: null
  });
  return {passUrl, expiresAt};
}
// The approval and its pending email are committed together. Email failure never undoes approval.
// A short claim and the provider idempotency key prevent concurrent retries sending duplicates.
export async function sendApprovalConfirmation(memberId: string): Promise<ApprovalDelivery> {
  try {
    const claimed = await atomic(async unit => {
      const member = await unit.get('members', memberId);
      if (!member || member.status !== 'active') return {delivery: 'failed' as const};
      if (member.contact_method !== 'email') return {delivery: 'manual' as const};
      const job = await unit.get('approval_emails', memberId);
      if (!job) return {delivery: 'manual' as const};
      if (job.status === 'sent') return {delivery: 'sent' as const};
      if (job.pass_token_hash) {
        const pass = await unit.get('pass_credentials', memberId);
        if (!pass || pass.token_hash !== job.pass_token_hash || pass.revoked_at || Date.parse(pass.expires_at) <= Date.now()) return {delivery: 'failed' as const};
      }
      if (job.lease_until > Date.now()) return {delivery: 'pending' as const};
      const next: Record<string, any> = {...job, status: 'pending', attempts: job.attempts + 1, lease_until: Date.now() + 120000};
      unit.set('approval_emails', memberId, next);
      return {job: next};
    });
    if ('delivery' in claimed) return claimed.delivery;
    let sent = false, providerId: string | null = null;
    try {
      if (process.env.RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST', signal: AbortSignal.timeout(12000),
          headers: {Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': 'membership-approval/' + memberId},
          body: JSON.stringify({from: claimed.job.from, to: [claimed.job.to], subject: claimed.job.subject, text: decrypt(claimed.job)})
        });
        sent = response.ok;
        if (sent) { const result = await response.json().catch(() => ({})) as {id?: string}; providerId = result.id || null; }
      }
    } catch { /* Save a retryable failure without logging applicant details. */ }
    const delivery: ApprovalDelivery = sent ? 'sent' : 'failed';
    await atomic(async unit => {
      const job = await unit.get('approval_emails', memberId);
      if (job) unit.set('approval_emails', memberId, {...job, status: delivery, lease_until: 0, sent_at: sent ? instant() : null, provider_id: providerId});
      await unit.patch('members', memberId, {approval_email_status: delivery});
    });
    return delivery;
  } catch {
    // A committed approval must still be reported as approved if email/status storage is unavailable.
    return 'pending';
  }
}

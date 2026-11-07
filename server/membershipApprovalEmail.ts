import { atomic, instant, type Unit } from './membershipFirestore.js';

type Member = Record<string, any>;
export type ApprovalDelivery = 'sent' | 'failed' | 'pending' | 'manual';
export function queueApprovalConfirmation(unit: Unit, member: Member) {
  if (member.contact_method !== 'email') return;
  unit.set('approval_emails', member.id, {
    id: member.id, member_id: member.id, to: member.contact_value,
    from: process.env.FROM_EMAIL || 'AMICA SOHO <noreply@amicasoho.london>',
    subject: 'Your AMICA SOHO membership application is approved',
    text: 'Hello ' + member.full_name + ',\n\nYour AMICA SOHO membership application has been approved.\n\nMembership number: ' + member.member_number +
      '\n\nPlease bring photo ID when visiting AMICA SOHO at 23 Frith Street, London W1D 4RR. Your personal digital pass will be issued separately by the team. Membership does not guarantee admission; entry remains subject to venue rules and staff checks.' +
      '\n\nQuestions? Contact info@amicasoho.com.\n\nAMICA SOHO',
    status: 'pending', attempts: 0, lease_until: 0, created_at: instant(), sent_at: null
  });
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
          body: JSON.stringify({from: claimed.job.from, to: [claimed.job.to], subject: claimed.job.subject, text: claimed.job.text})
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

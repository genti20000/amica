import type { Express, Request, Response } from 'express';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { atomic, list, read, lookupPass, instant, deny, MembershipError, hashId, type Unit } from './membershipFirestore.js';
import { identityRoutes, isSuperAdmin } from './membershipIdentity.js';
type Row = Record<string, any>;
const clean = (v: unknown, max = 160) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const id = (value: unknown) => { const result = clean(value, 64); if (!hashId.test(result)) deny('Invalid record ID.', 400); return result; };
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const closed = () => { const p = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).formatToParts(new Date()); const minutes = Number(p.find(x => x.type === 'hour')?.value) * 60 + Number(p.find(x => x.type === 'minute')?.value); return minutes >= 90 && minutes < 360; };
const tokenFrom = (value: unknown) => {
  let token = clean(value, 1500);
  if (token.startsWith('https://')) { try { const url = new URL(token); if (!['members.amicasoho.com', 'www.amicasoho.com'].includes(url.host)) deny('Invalid pass.', 400); token = new URLSearchParams(url.hash.slice(1)).get('t') || ''; } catch { deny('Invalid pass.', 400); } }
  if (!/^[a-zA-Z0-9_-]{43}$/.test(token)) deny('Invalid pass.', 400); return token;
};
const pending = (a: Row | null): Row => { if (!a) deny('Application not found.', 404); if (!['pending', 'reviewed'].includes(a.status)) deny('Application already finalised.'); return a; };
async function live(unit: Unit) { return await unit.get('control', 'live') || {visits: {}}; }
const visits = (state: Row): Row[] => Object.values(state.visits || {});
const inside = (state: Row) => visits(state).filter(x => !x.smoking_started_at);
const outside = (state: Row) => visits(state).filter(x => !!x.smoking_started_at);
function capacityAvailable(state: Row) {
  const latest = state.capacity;
  // Include the last reconciled non-membership headcount as well as all member/proprietor visits.
  const external = latest && Date.now() - Date.parse(latest.recorded_at) < 3600000 ? Math.max(0, latest.customers_inside - latest.recorded_inside) : 0;
  if (inside(state).length + external >= 80) deny('80-person capacity reached. Reconcile the full venue headcount.');
}
function visitWrite(unit: Unit, visit: Row) { unit.set(visit.kind === 'proprietor' ? 'proprietor_guests' : 'attendance', visit.id, visit); }
function finishVisit(unit: Unit, state: Row, visit: Row) { const ended = {...visit, checked_out: instant(), smoking_started_at: null}; visitWrite(unit, ended); delete state.visits[visit.id]; }
const route = (app: Express, method: 'get' | 'post', path: string, run: (req: Request, res: Response) => Promise<any>) => app[method]('/api/membership/' + path, async (req, res) => {
  try { return await run(req, res); } catch (error) {
    if (!(error instanceof MembershipError)) console.error('Membership Firebase operation failed:', error instanceof Error ? error.message : 'unknown');
    return res.status(error instanceof MembershipError ? error.status : 503).json({success: false, error: error instanceof MembershipError ? error.message : 'Membership service temporarily unavailable.'});
  }
});
export function installFirebaseMembership(app: Express) {
  identityRoutes(app);
  route(app, 'get', 'overview', async (_req, res) => {
    const [applications, members, state, incidents] = await Promise.all([list('applications', 'created_at', 10000), list('members', 'approved_at', 10000), read('control', 'live'), list('incident_logs', 'recorded_at', 10000)]);
    if (applications.length >= 10000 || members.length >= 10000 || incidents.length >= 10000) deny('Overview needs pagination before further growth.', 503);
    const all = inside(state || {visits: {}}), count = (rows: Row[], status: string) => rows.filter(x => x.status === status).length;
    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London'}).format(new Date());
    res.json({success: true, pending: count(applications, 'pending'), reviewed: count(applications, 'reviewed'), activeMembers: count(members, 'active'), suspendedMembers: count(members, 'suspended'), membersInside: all.filter(x => x.kind === 'member').length, guestsInside: all.filter(x => x.kind !== 'member').length, occupancy: all.length, workingCapacity: 80, incidentsToday: incidents.filter(x => new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London'}).format(new Date(x.occurred_at)) === today).length, notices: ['Reconcile membership and proprietor check-ins with all restaurant customers.']});
  });
  route(app, 'get', 'applications', async (_req, res) => res.json({success: true, applications: await list('applications', 'created_at', 200)}));
  route(app, 'post', 'applications/:id/hospitality', async (req, res) => {
    const applicationId = id(req.params.id), role = clean(req.body?.hospitalityRole); if (role.length < 3) deny('Hospitality role and employer required.', 400);
    const application = await atomic(async unit => { const a = pending(await unit.get('applications', applicationId)); const updated = {...a, hospitality_role: role, updated_at: instant()}; unit.set('applications', applicationId, updated); unit.audit('HOSPITALITY_UPDATED', applicationId); return updated; });
    res.json({success: true, application});
  });
  route(app, 'post', 'applications/:id/review', async (req, res) => {
    const applicationId = id(req.params.id), status = clean(req.body?.status, 24); if (!['pending', 'reviewed', 'declined'].includes(status)) deny('Invalid review status.', 400);
    const application = await atomic(async unit => { const a = pending(await unit.get('applications', applicationId)); const updated = {...a, status, review_note: clean(req.body?.note, 600), reviewed_at: instant(), updated_at: instant()}; unit.set('applications', applicationId, updated); unit.audit('APPLICATION_REVIEWED', applicationId, status); return updated; });
    res.json({success: true, application});
  });
  route(app, 'post', 'applications/:id/verify-original-date', async (req, res) => {
    const applicationId = id(req.params.id), original = new Date(req.body?.originalAppliedAt), evidence = clean(req.body?.evidenceReference, 300), reason = clean(req.body?.reason, 600);
    const secret = process.env.ADMIN_PASSWORD || '', supplied = clean(req.body?.managerPassword, 1000);
    if (!secret || secret.length !== supplied.length || !timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))) deny('Primary manager authorisation required.', 403);
    if (!Number.isFinite(original.getTime()) || original.getTime() > Date.now() - 48 * 3600000 || original.getTime() < Date.now() - 366 * 86400000 || evidence.length < 12 || reason.length < 20 || req.body?.confirmEvidence !== true || req.body?.confirmNoBypass !== true) deny('Document an earlier genuine application at least 48 hours old, with evidence and confirmation.', 400);
    const application = await atomic(async unit => { const a = pending(await unit.get('applications', applicationId)); if (a.verified_original_applied_at || original.getTime() >= Date.parse(a.created_at)) deny('Original application date cannot be changed.'); const updated = {...a, verified_original_applied_at: original.toISOString(), original_evidence_reference: evidence, original_verification_reason: reason, original_verified_at: instant(), updated_at: instant()}; unit.set('applications', applicationId, updated); unit.audit('ORIGINAL_APPLICATION_VERIFIED', applicationId, evidence + '; ' + reason); return updated; });
    res.json({success: true, application});
  });
  route(app, 'get', 'members', async (req, res) => {
    const search = clean(req.query.search, 90).toLowerCase(); let members = await list('members', 'approved_at', 250); if (search) members = members.filter(m => [m.full_name, m.member_number, m.contact_value].some(x => String(x).toLowerCase().includes(search))); res.json({success: true, members});
  });
  route(app, 'post', 'members/approve', async (req, res) => {
    const applicationId = id(req.body?.applicationId);
    if (!['confirmAge', 'confirmEligibility', 'confirmHospitality', 'confirmLicence'].every(key => req.body?.[key] === true)) deny('Confirm identity, age, hospitality, eligibility and licence requirements.', 400);
    const override = req.body?.superAdminOverride === true;
    if (override && !await isSuperAdmin(req)) deny('Verified super-admin sign-in required.', 403);
    const member = await atomic(async unit => {
      const a = pending(await unit.get('applications', applicationId));
      if (!a.is_adult || !a.rules_accepted_at || clean(a.hospitality_role).length < 3) deny('Application declarations and hospitality details are incomplete.');
      if (!override && Date.now() - Date.parse(a.verified_original_applied_at || a.created_at) < 48 * 3600000) deny('At least 48 full hours must elapse before membership approval.');
      // The application itself is the uniqueness lock; simultaneous approvals cannot create duplicates.
      const memberId = randomUUID(), now = instant();
      const m = {id: memberId, application_id: applicationId, member_number: 'AMC-' + randomBytes(5).toString('hex').toUpperCase(), full_name: a.full_name, contact_method: a.contact_method, contact_value: a.contact_value, status: 'active', approved_at: now, created_at: now, updated_at: now};
      unit.set('members', memberId, m); unit.set('applications', applicationId, {...a, status: 'approved', reviewed_at: now, updated_at: now});
      if (!override) unit.audit('MEMBER_APPROVED', memberId, 'Eligibility declarations checked; 48-hour waiting period completed.');
      return m;
    }); res.status(201).json({success: true, member});
  });
  route(app, 'post', 'members/:id/status', async (req, res) => {
    const memberId = id(req.params.id), status = clean(req.body?.status, 20); if (!['active', 'suspended', 'revoked'].includes(status)) deny('Invalid member status.', 400);
    const member = await atomic(async unit => {
      const old = await unit.get('members', memberId); if (!old) deny('Member not found.', 404); if (old.status === 'revoked' && status !== 'revoked') deny('Revoked membership requires a fresh application review.');
      const updated = {...old, status, updated_at: instant()}; unit.set('members', memberId, updated);
      if (status !== 'active') { const pass = await unit.get('pass_credentials', memberId); if (pass) unit.set('pass_credentials', memberId, {...pass, revoked_at: pass.revoked_at || instant()}); const state = await live(unit); for (const v of visits(state).filter(v => v.member_id === memberId)) finishVisit(unit, state, v); unit.set('control', 'live', state); }
      unit.audit('MEMBER_STATUS_CHANGED', memberId, old.status + ' → ' + status); return updated;
    }); res.json({success: true, member});
  });
  route(app, 'post', 'members/:id/pass', async (req, res) => {
    const memberId = id(req.params.id), token = randomBytes(32).toString('base64url'), token_hash = digest(token), expiresAt = new Date(Date.now() + 90 * 86400000).toISOString();
    const member = await atomic(async unit => { const m = await unit.get('members', memberId); if (!m) deny('Member not found.', 404); if (m.status !== 'active') deny('Only active members can receive a pass.'); unit.set('pass_credentials', memberId, {id: randomUUID(), member_id: memberId, token_hash, expires_at: expiresAt, issued_at: instant(), revoked_at: null, last_verified_at: null}); unit.set('pass_tokens', token_hash, {member_id: memberId}); unit.audit('PASS_ISSUED', memberId, 'Prior credential replaced'); return m; });
    const passUrl = 'https://members.amicasoho.com/pass#t=' + token; let delivery = 'manual';
    if (member.contact_method === 'email' && process.env.RESEND_API_KEY) { try { const sent = await fetch('https://api.resend.com/emails', {method: 'POST', headers: {Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json'}, signal: AbortSignal.timeout(12000), body: JSON.stringify({from: process.env.FROM_EMAIL || 'AMICA SOHO <noreply@amicasoho.london>', to: [member.contact_value], subject: 'Your AMICA SOHO digital membership pass', text: 'Open your private digital pass:\n' + passUrl + '\nBring photo ID. This pass does not guarantee admission.'})}); delivery = sent.ok ? 'sent' : 'failed'; } catch { delivery = 'failed'; } }
    res.json({success: true, passUrl, expiresAt, delivery, memberNumber: member.member_number});
  });
  route(app, 'post', 'members/:id/pass/revoke', async (req, res) => { const memberId = id(req.params.id); await atomic(async unit => { const p = await unit.get('pass_credentials', memberId); if (!p || p.revoked_at) deny('No active pass found.', 404); unit.set('pass_credentials', memberId, {...p, revoked_at: instant()}); unit.audit('PASS_REVOKED', memberId); }); res.json({success: true}); });
  route(app, 'post', 'passes/verify', async (req, res) => { const token = tokenFrom(req.body?.token), member = await lookupPass(digest(token)); if (!member) deny('Pass invalid, expired, revoked or membership inactive.', 403); await atomic(async unit => { const pass = await unit.get('pass_credentials', member.id); if (!pass || pass.token_hash !== digest(token) || pass.revoked_at) deny('Pass no longer valid.', 403); unit.set('pass_credentials', member.id, {...pass, last_verified_at: instant()}); }); res.json({success: true, valid: true, member: {id: member.id, memberNumber: member.member_number, fullName: member.full_name, status: member.status}, expiresAt: member.expires_at, notice: 'Verify physical photo ID before check-in.'}); });
  route(app, 'get', 'attendance', async (_req, res) => res.json({success: true, attendance: await list('attendance', 'checked_in', 2000)}));
  route(app, 'post', 'attendance/check-in', async (req, res) => {
    const memberId = id(req.body?.memberId), kind = clean(req.body?.kind, 12), guestName = clean(req.body?.guestName, 120); if (!['member', 'guest'].includes(kind) || (kind === 'guest' && guestName.length < 2)) deny('Choose a member and name the guest.', 400);
    const visit = await atomic(async unit => { if (closed()) deny('No new admission after 01:30.'); const m = await unit.get('members', memberId); if (!m || m.status !== 'active') deny('Member is not active.'); const state = await live(unit); capacityAvailable(state); const active = visits(state).filter(v => v.member_id === memberId); const host = active.find(v => v.kind === 'member'); if (kind === 'member' && host) deny('Member already checked in.'); if (kind === 'guest' && (!host || host.smoking_started_at)) deny('Host member must be inside.'); if (kind === 'guest' && active.filter(v => v.kind === 'guest').length >= 2) deny('Maximum two guests per member.'); if (active.some(v => kind === 'guest' && v.kind === 'guest' && v.guest_name.toLowerCase() === guestName.toLowerCase())) deny('Guest already checked in.'); const v = {id: randomUUID(), member_id: memberId, member_number: m.member_number, member_name: m.full_name, kind, guest_name: kind === 'guest' ? guestName : null, checked_in: instant(), checked_out: null, smoking_started_at: null}; state.visits[v.id] = v; visitWrite(unit, v); unit.set('control', 'live', state); unit.audit(kind === 'guest' ? 'GUEST_CHECK_IN' : 'MEMBER_CHECK_IN', v.id, m.member_number); return v; }); res.status(201).json({success: true, visit});
  });
  for (const target of ['attendance', 'proprietor-guests']) {
    const proprietor = target === 'proprietor-guests';
    route(app, 'post', target + '/:id/check-out', async (req, res) => {
      const visitId = id(req.params.id); const count = await atomic(async unit => { const state = await live(unit), v = state.visits[visitId]; if (!v || (v.kind === 'proprietor') !== proprietor) deny('Active visit not found.', 404); const ended = v.kind === 'member' ? visits(state).filter(x => x.member_id === v.member_id) : [v]; for (const row of ended) finishVisit(unit, state, row); unit.set('control', 'live', state); unit.audit('CHECK_OUT', visitId, 'Exited ' + ended.length + ' visit(s)'); return ended.length; }); res.json({success: true, count});
    });
    route(app, 'post', target + '/:id/smoking', async (req, res) => {
      const visitId = id(req.params.id), action = clean(req.body?.action, 12); if (!['leave', 'return'].includes(action)) deny('Invalid smoking transition.', 400);
      await atomic(async unit => { const state = await live(unit), v = state.visits[visitId]; if (!v || (v.kind === 'proprietor') !== proprietor) deny('Active visit not found.', 404); if (action === 'leave') { if (v.smoking_started_at) deny('Already outside smoking.'); if (outside(state).length >= 10) deny('Maximum ten people outside smoking.'); v.smoking_started_at = instant(); } else { if (!v.smoking_started_at) deny('No recorded smoking exit.'); capacityAvailable(state); v.smoking_started_at = null; } visitWrite(unit, v); unit.set('control', 'live', state); unit.audit(action === 'leave' ? 'SMOKING_EXIT' : 'SMOKING_RETURN', visitId); }); res.json({success: true});
    });
  }
  route(app, 'get', 'proprietor-guests', async (_req, res) => res.json({success: true, guests: await list('proprietor_guests', 'checked_in', 200)}));
  route(app, 'post', 'proprietor-guests', async (req, res) => {
    const name = clean(req.body?.fullName, 120), reason = clean(req.body?.reason, 500), manager = clean(req.body?.authorisedBy, 120); if (name.length < 2 || reason.length < 3 || manager.length < 3 || req.body?.identityChecked !== true) deny('Name, reason, manager and ID check required.', 400);
    const guest = await atomic(async unit => { if (closed()) deny('No new admission after 01:30.'); const state = await live(unit), active = visits(state).filter(v => v.kind === 'proprietor'); if (active.length >= 5) deny('Maximum five proprietor guests.'); if (active.some(v => v.full_name.toLowerCase() === name.toLowerCase())) deny('Guest already inside.'); capacityAvailable(state); const row = {id: randomUUID(), full_name: name, reason, authorised_by: manager, checked_in: instant(), checked_out: null, smoking_started_at: null, kind: 'proprietor'}; state.visits[row.id] = row; visitWrite(unit, row); unit.set('control', 'live', state); unit.audit('PROPRIETOR_GUEST_IN', row.id, manager); return row; }); res.status(201).json({success: true, guest});
  });
  route(app, 'get', 'capacity', async (_req, res) => res.json({success: true, capacity: await list('capacity_log', 'hour_start', 120)}));
  route(app, 'post', 'capacity', async (req, res) => {
    const total = Number(req.body?.customersInside); if (!Number.isInteger(total) || total < 0 || total > 80) deny('Enter a verified headcount from 0 to 80.', 400);
    const snapshot = await atomic(async unit => { const state = await live(unit), current = inside(state), members = current.filter(v => v.kind === 'member').length, guests = current.length - members; if (total < current.length) deny('Headcount cannot be below recorded people inside.'); const hour = new Date(); hour.setUTCMinutes(0, 0, 0); const row = {id: hour.toISOString(), hour_start: hour.toISOString(), recorded_at: instant(), customers_inside: total, member_count: members, guest_count: guests, notes: clean(req.body?.notes, 500)}; unit.set('capacity_log', row.id, row); state.capacity = {...row, recorded_inside: current.length}; unit.set('control', 'live', state); unit.audit('HOURLY_CAPACITY_RECORDED', '', total + '/80'); return row; }); res.json({success: true, snapshot});
  });
  route(app, 'get', 'attendance/export-31-days', async (_req, res) => {
    const rows = await list('attendance', 'checked_in', 20000, new Date(Date.now() - 31 * 86400000).toISOString()); if (rows.length >= 20000) deny('Export exceeds the current limit. Contact management.', 503);
    const quote = (v: unknown) => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="amica-membership-attendance-31days.csv"'); res.send([['Member number', 'Member name', 'Type', 'Guest name', 'Check in UTC', 'Check out UTC', 'Smoking exit UTC'].join(','), ...rows.map(x => [x.member_number, x.member_name, x.kind, x.guest_name, x.checked_in, x.checked_out, x.smoking_started_at].map(quote).join(','))].join('\n'));
  });
  route(app, 'get', 'incidents', async (_req, res) => res.json({success: true, incidents: await list('incident_logs', 'recorded_at', 150)}));
  route(app, 'post', 'incidents', async (req, res) => {
    const category = clean(req.body?.category, 60), description = clean(req.body?.description, 3000); if (!['Crime reported', 'Ejection', 'Crime or disorder complaint', 'Disorder', 'Drug or weapon seizure', 'CCTV/search/scanner fault', 'Alcohol sale refusal', 'Authority/emergency visit', 'Other'].includes(category) || description.length < 10) deny('Select a category and enter incident details.', 400);
    const incident = {id: randomUUID(), category, description, occurred_at: instant(), recorded_at: instant()}; await atomic(async unit => { unit.set('incident_logs', incident.id, incident); unit.audit('INCIDENT_RECORDED', incident.id, category); }); res.status(201).json({success: true, incident});
  });
  route(app, 'get', 'rule-versions', async (_req, res) => res.json({success: true, rules: await list('rule_versions', 'created_at', 60)}));
  route(app, 'post', 'rule-versions', async (req, res) => { const version = clean(req.body?.version, 40), title = clean(req.body?.title), body = clean(req.body?.body, 15000); if (!version || title.length < 3 || body.length < 20) deny('Enter version, title and complete draft rules.', 400); const rule = {id: randomUUID(), version, title, body, council_approved: false, council_reference: null, published_at: null, created_at: instant()}; await atomic(async unit => { unit.set('rule_versions', rule.id, rule); unit.audit('CLUB_RULE_DRAFT', rule.id, version); }); res.status(201).json({success: true, rule, notice: 'Draft only; this does not constitute council approval.'}); });
  route(app, 'get', 'activity', async (_req, res) => res.json({success: true, activity: await list('audit_events', 'occurred_at', 100)}));
}

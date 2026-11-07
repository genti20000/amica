import { atomic, read, instant, hashId } from './membershipFirestore.js';
type Row = Record<string, any>;
const marker = 'legacy_applications_recovery_20261107';
// Recovery is additive: no SQL writes, no overwriting live decisions, no emails or activations.
export async function recoverLegacyApplications(load: () => Promise<Row[]>) {
  const prior = await read('migration_runs', marker);
  if (prior?.status === 'complete') return prior;
  const source = (await load()).map(row => JSON.parse(JSON.stringify(row)) as Row);
  if (source.length > 10000) throw new Error('Legacy recovery requires pagination above 10000 applications.');
  const seen = new Set<string>();
  for (const row of source) {
    if (!hashId.test(row.id || '') || seen.has(row.id) || !Number.isFinite(Date.parse(row.created_at)) ||
      !['pending', 'reviewed', 'declined', 'approved'].includes(row.status) ||
      !['email', 'phone'].includes(row.contact_method) || typeof row.contact_value !== 'string' || typeof row.full_name !== 'string') {
      throw new Error('Legacy application validation failed; recovery stopped.');
    }
    seen.add(row.id);
  }
  let copied = 0, alreadyPresent = 0;
  for (const row of source) {
    const inserted = await atomic(async unit => {
      const current = await unit.get('applications', row.id);
      const backup = await unit.get('legacy_application_backups', row.id);
      if (!backup) unit.set('legacy_application_backups', row.id, {...row, recovery_source: 'legacy_postgres', backed_up_at: instant()});
      if (current) {
        if (current.contact_value !== row.contact_value || current.created_at !== row.created_at) throw new Error('Legacy application conflicts with live record; manual reconciliation required.');
        return false;
      }
      unit.set('applications', row.id, {...row, updated_at: row.updated_at || row.created_at, verified_original_applied_at: row.verified_original_applied_at || null});
      unit.audit('APPLICATION_IMPORTED', row.id, 'Recovered from previous application database; original dates and status retained; no membership activated.');
      return true;
    });
    if (inserted) copied++; else alreadyPresent++;
  }
  // Verify every source ID and original application timestamp before marking the migration complete.
  for (const row of source) {
    const restored = await read('applications', row.id);
    if (!restored || restored.created_at !== row.created_at || restored.contact_value !== row.contact_value) throw new Error('Legacy recovery verification failed.');
  }
  const result = {id: marker, status: 'complete', source_count: source.length, copied, already_present: alreadyPresent, verified: source.length, completed_at: instant()};
  await atomic(async unit => unit.set('migration_runs', marker, result));
  return result;
}

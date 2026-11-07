// Trusted production release migration. Preview builds never read or modify operational records.
if (process.env.VERCEL_ENV === 'production') {
  const {db} = await import('../server/db.js');
  const {membershipStore} = await import('../server/membershipFirestore.js');
  const {recoverLegacyApplications} = await import('../server/membershipLegacyRecovery.js');
  try {
    const result = await recoverLegacyApplications(async () => {
      const client = await db.connect();
      try {
        await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
        await client.query("SET LOCAL statement_timeout = '15000'");
        const rows = (await client.query('SELECT * FROM public.membership_applications ORDER BY created_at, id LIMIT 10001')).rows;
        await client.query('COMMIT');
        return rows;
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
    });
    console.log('Membership legacy application recovery:', JSON.stringify(result));
  } finally { await Promise.allSettled([db.end(), membershipStore().terminate()]); }
}
export {};

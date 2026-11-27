# Main AMICA timed table-booking closures — release checklist

This change must be deployed separately from SEO and karaoke changes. Do not apply the database change to the LKC project.

## Database prerequisite (AMICA only)

Confirm the live Vercel project's POSTGRES_URL points to the AMICA database (tables reservations, blocked_dates, venue_settings and booking_audit_logs). Verify blocked_dates allows multiple records for one service date; if there is a unique constraint on blocked_date, stop and review it before allowing multiple windows.

In staging, using the existing privileged database migration process, apply this additive, backward-compatible SQL after checking the table and its existing access policy:

```sql
ALTER TABLE public.blocked_dates
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'all'
  CHECK (scope IN ('all', 'main'));
```

Existing rows default to all; new timed rows use main. Existing full-day closures remain venue-wide. Older deployments can continue to read existing rows, but do not roll back to the older booking application while main-only closures exist without first reviewing their scope; the older app treats timed rows as venue-wide. No migration is run automatically. Preserve existing RLS and grants; no public permissions are added.

## Tests before deployment

- Run npm ci, npm run lint, npm run build, and node --test tests/table-blocks.test.mjs.
- On an isolated staging database, create 18:00–21:00 timed closure. Confirm 21:00 is bookable; 18:00–20:30 and earlier two-hour sessions which overlap are rejected in UI and by direct API. The whole date remains selectable.
- Add two distinct windows and remove one by its ID; verify other windows remain.
- Check 23:00–01:00 and midnight boundary. Confirm staff-only writes, existing reservations unchanged, full-day closure still works, karaoke availability and checkout ignore the new main-only closure.
- Verify main-only closures are present in the admin day/week/month views, without hiding existing reservations.
- Verify Vercel production alias, correct branch, and the live database before release. No production test booking or closure should be created without staff approval.

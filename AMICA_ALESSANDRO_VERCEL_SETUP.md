# AMICA membership — Alessandro's Vercel workspace only

## Workspace ownership (confirmed 31 October 2026)
- Vercel Team: `alessandromalandra5-8077's projects`, slug `ale17`, ID `team_Ff3jcWYFbW2M7UctjL5b9HWo`.
- AMICA project: `amica-soho`, ID `prj_wabw56vBR1SsxJuStozufc2iJWPu`.
- Public and staff domain: `members.amicasoho.com`.
- Git source: existing `genti20000/amica` repository, development branch `feature/amica-membership-supabase`. **No deployment of this branch to production is authorised until the new DB is connected and validated.**
- DO NOT create the new membership database in the connected Supabase organisation named **gent's projects** or reuse its existing databases.
- The earlier `mem` Firebase app remains a restricted archive, not a production source of member data.

## Database provisioning under Alessandro's Vercel, not gent's Supabase organisation
1. Sign in to the Vercel workspace at `https://vercel.com/ale17/amica-soho`.
2. Use the Vercel Marketplace/Storage Supabase integration **in the ale17 team**. Create a NEW dedicated project called `amica-membership`, preferably in a UK/EU region, using the correct billing owner. Do not attach or reuse a database from another organisation.
3. Link that new Supabase project to the **amica-soho** Vercel project. Record its Supabase project reference and database host; verify they correspond to the newly created project, not existing reservations or previous projects.
4. Configure a server-only environment variable **`MEMBERSHIP_POSTGRES_URL`** in Vercel for Preview and Production using the new project's server-side PostgreSQL transaction-pooler connection string. The existing `POSTGRES_URL` is for restaurant bookings and must not be replaced.
5. Open the new Supabase project's SQL Editor. Run `db/amica_membership_supabase_schema.sql` only in the NEW project. This enables RLS and revokes `anon`/`authenticated` access to membership PII.
6. Set or confirm `ADMIN_PASSWORD` for the primary manager (separate from `ADMIN_PASSWORD_EXTRA` if used for ordinary staff), `ADMIN_SESSION_SECRET` and existing approved email sender setup in Alessandro's Vercel environment. Do not commit secrets.
7. Deploy branch `feature/amica-membership-supabase` to **Preview** under team `ale17`; authenticate and test. Do NOT switch production unless the full release tests pass.

## Licence 19/00938/LIPDPS: 48-hour waiting period
**There is no legal early-activation bypass.** The manager-only `verify-original-date` endpoint exists solely for a real, documented earlier paper/offline application. It requires:
- Primary manager password reauthentication;
- Original application date and source evidence reference (retained separately);
- Reason why the online record was entered later;
- Confirmation that a full 48 hours have already elapsed from the genuine earlier application;
- A server-side audit event.
The original online created_at remains immutable; only a verified earlier date affects the 48-hour clock.

## Usability changes
- Four mobile-friendly action shortcuts at the top of the admin.
- Sticky horizontal tab navigation, optimised for mobile.
- New application's priority list and remaining waiting time.
- Searchable applicant list and disabled approval action before 48 hours.
- Guided manager-only earlier-document verification dialog with date, evidence and password.
- Existing management sections for door scan, member/pass actions, attendance, proprietor guests, incidents, draft club rules and audit.

## Release verification
- Ensure no Vercel 402 quota error.
- Verify `/membership`, `/membership/admin`, `/membership/pass` and aliases.
- Test API returns 401 without admin session.
- In new test database, verify application > early approval blocked, valid approval after 48h, original-date evidence correction, wrong manager password 403, missing evidence 400 and audit log inserted.
- Verify QR issuance, rotation, invalid-token rejection and revocation with a test member only.
- Verify guest limit, smoking transitions, hourly 80-person ceiling, 01:30 cutoff, incident log, 31-day export.
- Check current council-approved club rules and all licence conditions before allowing admissions.
- Do not import mock Firebase member records or historical PII without authorised data transfer and reconciliation.

## Known blockers
- The connected Supabase organisation accessible to this ChatGPT session is `gent's projects`, not verified as Alessandro's. It must **not** be used for this request.
- Vercel Marketplace Supabase provisioning/installation is not exposed as a write action in this session. Alessandro's account owner must perform or authorise that resource connection.
- Vercel's free-team deployment quota has previously returned HTTP 402.

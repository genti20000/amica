# AMICA membership Firebase release

Prepared 1 November 2026 on feature/amica-membership-supabase.

## Isolation and deployment

Membership uses Alessandro's Firebase project `amica-membership`, Enterprise Native database `default`, in `europe-west2`. The database's client rules deny every read and write. All membership operations run in the server through the Admin SDK. Restaurant bookings retain their existing PostgreSQL connection and `POSTGRES_URL`.

Set the downloaded JSON service account as the Secret environment variable `MEMBERSHIP_FIREBASE_SERVICE_ACCOUNT` on only the `ale17/amica-soho` project. Never use a `VITE_` or `NEXT_PUBLIC_` prefix and never commit the credential. `MEMBERSHIP_FIRESTORE_DATABASE_ID` defaults to `default`. The existing `ADMIN_SESSION_SECRET` must be persistent and at least 32 characters. Email-based super-admin verification also needs the existing `RESEND_API_KEY` and `FROM_EMAIL` in each tested deployment environment.

The old PostgreSQL membership schema and handlers remain historical source, but are no longer mounted by this release. No old membership records are automatically imported. Review and reconcile existing registers separately before changing the operational source of truth.

## Super-admin identity and override

Staff continue signing in with the existing staff password. Elevated access requires a separate one-time email code sent only to `members@amicasoho.com`. A successful verification creates a server-signed, HTTP-only, SameSite=Strict session lasting 30 minutes. Codes expire after 10 minutes, allow at most five attempts and can be consumed once. Elevated sessions are checked against server records on each protected operation. Logout revokes the elevated session.

Only that elevated session can request `superAdminOverride: true` on membership approval. Ordinary staff requests remain subject to 48 elapsed hours. As explicitly requested by the owner, the exceptional approval does not create a membership audit event; the original application timestamp and resulting member's approval timestamp remain stored. Existing audit records and ordinary operational audit logging remain intact. Anyone with access to the designated mailbox can obtain this role, so a shared mailbox is not proof of Joni's individual identity.

**This waiting-period override conflicts with the stated 48-hour premises licence condition. A super-admin role does not make early admission compliant.** The interface displays this warning before an override. Age, hospitality and eligibility declarations, capacity, guests, smoking and late-admission limits remain enforced.

## Validation

`npm run lint` and `npm run build` must pass. `npm run test:membership` requires the server credential in the local process environment and tests authenticated HTTP routes against randomly named `e2e_amica_*` Firestore collections. It does not write synthetic records to operational collections and deletes only its own namespace afterward. The mail transport is stubbed in integration tests so no test email reaches real people. Verify actual email delivery separately before production.

Read/list queries use Enterprise pipelines. Operational mutations use document transactions, including a small live-visit coordination document to serialize headcount and guest/smoking decisions. No client-side collections or public service credentials are used.

Before promoting the preview, verify real staff sign-in, email-code delivery and the super-admin session in the deployed environment; verify anonymous APIs are denied, the public registration/pass pages work, and restaurant health and both existing domains remain functional. Do not submit fake member records into the live register. Keep the previous production deployment available for rollback.

## Approval confirmation emails

New approvals queue an email in the same Firestore transaction as membership creation, then send it through Resend to the application's registered email address. The message includes the membership number; issuing a digital pass remains a separate staff action. Phone-only applicants require manual contact. Existing approved members are not emailed retroactively.

The admin displays delivery status and offers an authenticated retry for pending or failed messages. Provider failure never reverses a committed approval. A delivery claim and stable provider idempotency key limit duplicate sends; sent means accepted by the provider, not confirmed mailbox delivery. Tests mock the provider and cover successful sending, duplicate approval, unauthorized retry, provider failure, recovery and phone-only applications.

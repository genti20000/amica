# AMICA SOHO Membership Integration – Release & Security Checklist

## Current release state
- The public registration and basic member operations dashboard were previously deployed.
- The **latest changes are committed but NOT deployed** due to Vercel `api-deployments-free-per-day` HTTP 402.
- Do not treat the original Firebase membership system as a secure production member register until its Firestore security rules have been applied remotely and verified.

## Scope of the pending production release
- Public registration: required hospitality role/employer field, 18+ and privacy/rules confirmations, server-side validation.
- Secure membership administration: application review, hospitality qualification verification, 48-hour minimum approval delay, member records/status.
- Server-generated 256-bit member bearer tokens (stored only as SHA-256 hashes). Issue, rotate and revoke credentials.
- Member digital pass page at `https://members.amicasoho.com/pass#t=...` with locally bundled MIT QR generator.
- Server-side pass verification through signed admin session; photo ID confirmation required before check-in.
- Named guest check-ins (max two per member, conservatively all hours); smoking exit/return with maximum ten temporarily outside.
- No new check-ins after 01:30 London time; only return from an already logged smoking break is permitted.
- 31-day attendance CSV and manual hourly 0–80 customer headcount log.
- Incident categories aligned with licence condition 9 and audit trail.

## Licence checked
Source: Westminster premises licence `19/00938/LIPDPS`, dated **11 September 2026**, for 23 Frith Street:
- Condition 14: 80 persons excluding staff.
- Condition 22: hourly basement capacity log.
- Condition 31: max 10 persons temporarily outside smoking.
- Condition 37(a): members must work in hospitality at initial application.
- Condition 37(b): after 1am on the nights specified, members and up to two bona fide guests/member; up to five proprietor guests (this system does **not** manage proprietor guests).
- Condition 37(c): 48-hour minimum before admission to membership.
- Condition 37(d): after 01:30 no new entry/re-entry except temporary smoking returns on specified days.
- Condition 37(e): 31-day legible attendance register.
- Condition 37(f): council-approved club rules are required. Their current approved version has **not been independently verified**.
- Condition 9: incident log must be completed within 24 hours, covering enumerated event types.

## Blockers to full production sign-off
1. Vercel quota: Production deploy latest Git commit, wait for READY, confirm aliases `members.amicasoho.com`, `www.amicasoho.com`.
2. Run `npm ci && npm run lint && npm run build`. Stop release if TypeScript errors.
3. Authenticate to `/admin` with an authorized staff account and verify all API endpoints against the REAL production database. Never use a fake member record in the live register.
4. In Firebase Console for old `mem` project, deploy `firestore.rules` from `genti20000/mem` **after preserving an authenticated backup/export**. Source-only changes do not secure live Firestore.
5. Reconcile and review original Firebase data for duplicates, demonstration records, consent, and eligibility before migration. No historical members have been imported automatically.
6. Obtain/check the current Westminster-approved AMICA club rules. Do not activate members based on a placeholder summary alone.
7. Confirm appropriate DPS/premises licensing and operational requirements; the 11 September file lists DPS TBC.
8. The hourly count must include restaurant customers; current automatically calculated membership counts alone do not equal venue headcount.
9. Test member approval 47h vs 49h (early blocked), pass issuance/revocation, expired token failure, fake/old QR rejection, room full refusal, 01:30 hard stop, smoking return and 31-day export.
10. Confirm staff devices support BarcodeDetector or use the manual QR-link fallback. Do not rely on a pass without ID checking.

## Security guarantees / limits
- No member names, contacts or token hashes are exposed via unauthenticated member-management endpoints.
- QR tokens are opaque and individually revocable; stolen links still require staff to check ID.
- Browser-side verification alone is explicitly **not** accepted.
- A Vercel deployment access wall is not a substitute for restrictive Firebase rules.
- No automatic unverified historical record activation.

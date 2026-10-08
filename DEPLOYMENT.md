# AMICA Soho deployment

Vercel project: amica-soho (Malandra / ale17). Supabase project: fnaehebranoyhugkskes, London, Free plan.

The Vite frontend is served from dist. Requests to /api go to the Express function in api/index.ts. PostgreSQL writes use Supabase transaction pooling and transactions; anonymous/authenticated database roles have no direct access to booking data. Schema is in supabase/migrations.

Required server environment: POSTGRES_URL (Marketplace manages this), ADMIN_PASSWORD, ADMIN_SESSION_SECRET. Until ADMIN_PASSWORD is configured, admin sign-in fails closed. Email delivery additionally needs a verified sender and RESEND_API_KEY or SMTP credentials. A saved reservation does not guarantee email delivery. The newsletter invites contact by email until a mailing service is configured.

Validation: npm ci, npm run lint, npm run build. Vercel runtime health checks must return a connected Supabase database before accepting the deployment.

Existing automatic confirmation behavior remains; table inventory, seating duration, capacity controls, and spam prevention should be established before opening public bookings at scale. Original amica project and amicasoho.com have not been changed.

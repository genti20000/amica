# AMICA Soho deployment

Vercel project: amica-soho (Malandra / ale17). Supabase project: fnaehebranoyhugkskes, London, Free plan.

The Vite frontend is served from dist. Requests to /api go to the Express function in api/index.ts. PostgreSQL writes use Supabase transaction pooling and transactions; anonymous/authenticated database roles have no direct access to booking data. Schema is in supabase/migrations.

Required server environment: POSTGRES_URL (Marketplace manages this), ADMIN_PASSWORD, ADMIN_SESSION_SECRET. A strong initial admin password and session secret are stored in Vercel environment variables. Retrieve ADMIN_PASSWORD in the Vercel dashboard and rotate it to your preferred strong password; keep it out of code. Missing credentials cause admin sign-in to fail closed. Email delivery additionally needs a verified sender and RESEND_API_KEY or SMTP credentials. A saved reservation does not guarantee email delivery. The newsletter invites contact by email until a mailing service is configured.

Validation: npm ci, npm run lint, npm run build. Vercel runtime health checks must return a connected Supabase database before accepting the deployment.

Reservations hold capacity for two hours, with hard limits of 80 guests and 18 tables. Until the exact 4/6-seat table mix is supplied, each party reserves ceil(guests/4) tables conservatively. Pending, Confirmed, Auto-Confirmed and Seated reservations hold capacity; Cancelled, No-Show and Completed release it. Atomic advisory locking serializes new bookings and status changes. Last online arrival is 01:00 so two hours fit before 03:00 closing. Configure physical table assignment and abuse prevention before opening public bookings at scale. Original amica project and amicasoho.com have not been changed.

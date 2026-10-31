-- AMICA SOHO — dedicated Supabase/Postgres schema.
-- Run ONLY in the NEW membership project, never the restaurant reservations DB.
-- This backend uses a server-side PostgreSQL connection and explicitly revokes
-- public REST API access to member PII. No client-side Firebase or service-role key.
BEGIN;
CREATE TABLE IF NOT EXISTS public.membership_applications (
 id uuid PRIMARY KEY, full_name varchar(120) NOT NULL,
 contact_method varchar(12) NOT NULL CHECK(contact_method IN ('email','phone')),
 contact_value varchar(160) NOT NULL,
 hospitality_role varchar(160),
 rules_accepted_at timestamptz NOT NULL,
 is_adult boolean NOT NULL,
 status varchar(24) NOT NULL DEFAULT 'pending'
   CHECK(status IN ('pending','reviewed','declined','approved')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 reviewed_at timestamptz,
 review_note varchar(600)
);
CREATE TABLE IF NOT EXISTS public.membership_members (
 id uuid PRIMARY KEY,
 application_id uuid UNIQUE REFERENCES public.membership_applications(id),
 member_number varchar(32) NOT NULL UNIQUE,
 full_name varchar(120) NOT NULL,
 contact_method varchar(12) NOT NULL,
 contact_value varchar(160) NOT NULL,
 status varchar(24) NOT NULL DEFAULT 'active'
   CHECK(status IN ('active','suspended','revoked')),
 approved_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.membership_attendance (
 id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES public.membership_members(id),
 kind varchar(12) NOT NULL CHECK(kind IN ('member','guest')),
 guest_name varchar(120),
 checked_in timestamptz NOT NULL DEFAULT now(),
 checked_out timestamptz,
 smoking_started_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT member_guest_name_check CHECK ((kind='member' AND guest_name IS NULL) OR (kind='guest' AND guest_name IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS membership_unique_active_member_visit
 ON public.membership_attendance(member_id) WHERE kind='member' AND checked_out IS NULL;
CREATE INDEX IF NOT EXISTS membership_attendance_active_idx ON public.membership_attendance(checked_out,member_id);
CREATE INDEX IF NOT EXISTS membership_attendance_recent_idx ON public.membership_attendance(checked_in DESC);
CREATE TABLE IF NOT EXISTS public.membership_incident_logs (
 id uuid PRIMARY KEY, category varchar(60) NOT NULL,
 description varchar(3000) NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now(),
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.membership_audit_events (
 id uuid PRIMARY KEY,
 action varchar(60) NOT NULL,
 subject_id varchar(64),
 details varchar(500) NOT NULL DEFAULT '',
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.membership_pass_credentials (
 id uuid PRIMARY KEY,
 member_id uuid NOT NULL UNIQUE REFERENCES public.membership_members(id),
 token_hash varchar(64) NOT NULL UNIQUE,
 issued_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz,
 last_verified_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.membership_capacity_log(
 id uuid PRIMARY KEY,
 hour_start timestamptz NOT NULL UNIQUE,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 customers_inside integer NOT NULL CHECK (customers_inside BETWEEN 0 AND 80),
 member_count integer NOT NULL,
 guest_count integer NOT NULL,
 notes varchar(500) NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS public.membership_proprietor_guests(
 id uuid PRIMARY KEY,
 full_name varchar(120) NOT NULL,
 reason varchar(500) NOT NULL,
 authorised_by varchar(120) NOT NULL,
 checked_in timestamptz NOT NULL DEFAULT now(),
 checked_out timestamptz,
 smoking_started_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS membership_proprietor_guest_status_idx
 ON public.membership_proprietor_guests(checked_out,smoking_started_at);
CREATE TABLE IF NOT EXISTS public.membership_rule_versions(
 id uuid PRIMARY KEY, version varchar(40) UNIQUE NOT NULL,
 title varchar(160) NOT NULL, body text NOT NULL,
 council_approved boolean NOT NULL DEFAULT false,
 council_reference varchar(120),
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT council_publication_check CHECK (published_at IS NULL OR (council_approved AND council_reference IS NOT NULL))
);
-- Every membership table is inaccessible to public/anon/authenticated REST clients.
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY[
 'membership_applications','membership_members','membership_attendance',
 'membership_incident_logs','membership_audit_events','membership_pass_credentials',
 'membership_capacity_log','membership_proprietor_guests','membership_rule_versions']
 LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated',t);
 END LOOP;
END $$;
COMMIT;

BEGIN;
  CREATE TABLE IF NOT EXISTS venue_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blocked_dates (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blocked_date TEXT NOT NULL,
    is_full_day INTEGER NOT NULL DEFAULT 1,
    start_time TEXT,
    end_time TEXT,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id TEXT UNIQUE NOT NULL,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    guests INTEGER NOT NULL CHECK(guests >= 1 AND guests <= 20),
    reservation_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    seating_area TEXT NOT NULL,
    special_occasion TEXT,
    dietary_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Auto-Confirmed',
    table_number TEXT,
    qr_code_value TEXT NOT NULL,
    ip_address TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS booking_audit_logs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
  CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
  CREATE INDEX IF NOT EXISTS idx_reservations_booking_id ON reservations(booking_id);
  CREATE INDEX IF NOT EXISTS idx_audit_booking_id ON booking_audit_logs(booking_id);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reservations FROM anon, authenticated;
ALTER TABLE public.booking_audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_audit_logs FROM anon, authenticated;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blocked_dates FROM anon, authenticated;
ALTER TABLE public.venue_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.venue_settings FROM anon, authenticated;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('venue_name','AMICA SOHO', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('address','23 Frith Street, Soho, London W1D 4RR', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('auto_confirm','true', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('min_pax','1', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('max_pax','20', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('cutoff_hours','1', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('opening_time','17:00', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('closing_time','03:00', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('days_open','Wednesday – Saturday (4 Days a Week)', now()::text) ON CONFLICT (key) DO NOTHING;
INSERT INTO venue_settings (key,value,updated_at) VALUES ('announcement','Table reservations open Wednesday to Saturday', now()::text) ON CONFLICT (key) DO NOTHING;
COMMIT;

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'amica.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for performance & concurrent reads
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS venue_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blocked_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocked_date TEXT NOT NULL,
    is_full_day INTEGER NOT NULL DEFAULT 1,
    start_time TEXT,
    end_time TEXT,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
`);

// Insert default venue settings
const setSettingStmt = db.prepare(`
  INSERT OR REPLACE INTO venue_settings (key, value, updated_at)
  VALUES (?, ?, ?)
`);

const nowIso = new Date().toISOString();
setSettingStmt.run('venue_name', 'AMICA SOHO', nowIso);
setSettingStmt.run('address', '23 Frith Street, Soho, London W1D 4RR', nowIso);
setSettingStmt.run('opening_hours', '17:00 - 03:00 (5:00 PM - 3:00 AM) 7 Days a Week', nowIso);
setSettingStmt.run('min_pax', '1', nowIso);
setSettingStmt.run('max_pax', '20', nowIso);
setSettingStmt.run('auto_confirm_rule', 'Auto-confirmed instantly up to 1 hour before opening / service time', nowIso);

// Venue settings initialization complete. Table starts empty without demo data.
db.exec('DELETE FROM blocked_dates;');

export interface ReservationRow {
  id: number;
  booking_id: string;
  guest_name: string;
  email: string;
  phone: string;
  guests: number;
  reservation_date: string;
  time_slot: string;
  seating_area: string;
  special_occasion: string | null;
  dietary_notes: string | null;
  status: string;
  table_number: string | null;
  qr_code_value: string;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingAuditRow {
  id: number;
  booking_id: string;
  action: string;
  actor: string;
  details: string | null;
  created_at: string;
}

export function getAllReservations(filters?: {
  search?: string;
  date?: string;
  status?: string;
  guests?: number;
}): ReservationRow[] {
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params: any[] = [];

  if (filters?.search) {
    query += ' AND (guest_name LIKE ? OR email LIKE ? OR phone LIKE ? OR booking_id LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  if (filters?.date) {
    query += ' AND reservation_date = ?';
    params.push(filters.date);
  }

  if (filters?.status && filters.status !== 'all') {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.guests) {
    query += ' AND guests = ?';
    params.push(filters.guests);
  }

  query += ' ORDER BY reservation_date ASC, time_slot ASC, id DESC';
  const stmt = db.prepare(query);
  return stmt.all(...params) as unknown as ReservationRow[];
}

export function getReservationById(bookingId: string): {
  reservation: ReservationRow | null;
  auditLogs: BookingAuditRow[];
} {
  const stmt = db.prepare('SELECT * FROM reservations WHERE booking_id = ?');
  const reservation = (stmt.get(bookingId) as unknown as ReservationRow) || null;

  const auditStmt = db.prepare('SELECT * FROM booking_audit_logs WHERE booking_id = ? ORDER BY id DESC');
  const auditLogs = auditStmt.all(bookingId) as unknown as BookingAuditRow[];

  return { reservation, auditLogs };
}

export function createReservation(data: {
  booking_id?: string;
  guest_name: string;
  email: string;
  phone: string;
  guests: number;
  reservation_date: string;
  time_slot: string;
  seating_area: string;
  special_occasion?: string;
  dietary_notes?: string;
  ip_address?: string;
  actor?: string;
}): ReservationRow {
  const guests = Math.max(1, Math.min(20, Number(data.guests) || 1));
  const booking_id = data.booking_id || ('AMICA-' + Math.floor(100000 + Math.random() * 900000));
  const now = new Date().toISOString();
  const qr_code = `AMICA-SOHO-${booking_id}-${data.reservation_date}-${guests}PAX`;

  // No specific room or table allocation
  const table_number = null;

  const stmt = db.prepare(`
    INSERT INTO reservations (
      booking_id, guest_name, email, phone, guests,
      reservation_date, time_slot, seating_area, special_occasion,
      dietary_notes, status, table_number, qr_code_value,
      ip_address, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run(
    booking_id,
    data.guest_name.trim(),
    data.email.trim(),
    data.phone.trim(),
    guests,
    data.reservation_date,
    data.time_slot,
    data.seating_area || 'Vault Dining',
    data.special_occasion || 'Casual Dining & Drinks',
    data.dietary_notes || '',
    'Confirmed',
    table_number,
    qr_code,
    data.ip_address || null,
    now,
    now
  );

  const auditStmt = db.prepare(`
    INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const actor = data.actor || 'RESERVATION_ENGINE';
  auditStmt.run(
    booking_id,
    'RESERVATION_CONFIRMED',
    actor,
    `Confirmed table reservation for ${guests} guests on ${data.reservation_date} at ${data.time_slot}.`,
    now
  );

  return (db.prepare('SELECT * FROM reservations WHERE booking_id = ?').get(booking_id) as unknown as ReservationRow);
}

export function updateReservationStatus(bookingId: string, status: string, actor = 'ADMIN_PORTAL', notes = ''): ReservationRow | null {
  const now = new Date().toISOString();
  const current = db.prepare('SELECT * FROM reservations WHERE booking_id = ?').get(bookingId) as unknown as ReservationRow | undefined;
  if (!current) return null;

  db.prepare('UPDATE reservations SET status = ?, updated_at = ? WHERE booking_id = ?').run(status, now, bookingId);

  db.prepare(`
    INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    bookingId,
    `STATUS_CHANGED_${status.toUpperCase().replace(/\s+/g, '_')}`,
    actor,
    `Status updated from '${current.status}' to '${status}'. ${notes ? 'Notes: ' + notes : ''}`,
    now
  );

  return (db.prepare('SELECT * FROM reservations WHERE booking_id = ?').get(bookingId) as unknown as ReservationRow);
}

export function deleteReservation(bookingId: string, actor = 'ADMIN_PORTAL', reason = 'Admin cancellation'): boolean {
  const current = db.prepare('SELECT * FROM reservations WHERE booking_id = ?').get(bookingId) as unknown as ReservationRow | undefined;
  if (!current) return false;

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    bookingId,
    'CANCELLED_AND_ARCHIVED',
    actor,
    `Reservation cancelled by ${actor}. Reason: ${reason}. Original guest: ${current.guest_name} (${current.guests} pax).`,
    now
  );

  db.prepare('DELETE FROM reservations WHERE booking_id = ?').run(bookingId);
  return true;
}

export function getDatabaseMetadata() {
  const totalBookings = (db.prepare('SELECT COUNT(*) as c FROM reservations').get() as any)?.c || 0;
  const totalAuditLogs = (db.prepare('SELECT COUNT(*) as c FROM booking_audit_logs').get() as any)?.c || 0;
  const autoConfirmed = (db.prepare("SELECT COUNT(*) as c FROM reservations WHERE status = 'Auto-Confirmed'").get() as any)?.c || 0;
  const seated = (db.prepare("SELECT COUNT(*) as c FROM reservations WHERE status = 'Seated'").get() as any)?.c || 0;
  const totalGuests = (db.prepare('SELECT SUM(guests) as c FROM reservations').get() as any)?.c || 0;
  const totalBlockedDates = (db.prepare('SELECT COUNT(*) as c FROM blocked_dates').get() as any)?.c || 0;

  let dbSize = 0;
  try {
    const stats = fs.statSync(DB_PATH);
    dbSize = stats.size;
  } catch {
    // ignore
  }

  return {
    database: 'SQLite 3 (WAL mode)',
    filePath: DB_PATH,
    sizeBytes: dbSize,
    totalBookings,
    totalAuditLogs,
    autoConfirmed,
    seated,
    totalGuests: totalGuests || 0,
    totalBlockedDates,
    openingHours: '17:00 – 03:00 (7 Days a Week)',
    autoConfirmPolicy: '1 to 20 pax auto confirmed up to 1 hour before service'
  };
}

export interface BlockedDateRow {
  id: number;
  blocked_date: string;
  is_full_day: number;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  notes: string | null;
  created_at: string;
}

export function getBlockedDates(): BlockedDateRow[] {
  const stmt = db.prepare('SELECT * FROM blocked_dates ORDER BY blocked_date ASC, id DESC');
  return stmt.all() as unknown as BlockedDateRow[];
}

export function isDateBlocked(date: string, timeSlot?: string): { blocked: boolean; reason?: string; isFullDay?: boolean } {
  const rows = db.prepare('SELECT * FROM blocked_dates WHERE blocked_date = ?').all(date) as unknown as BlockedDateRow[];
  if (!rows || rows.length === 0) return { blocked: false };

  for (const r of rows) {
    if (r.is_full_day === 1) {
      return { blocked: true, reason: r.reason, isFullDay: true };
    }
    if (timeSlot && r.start_time && r.end_time) {
      const match = timeSlot.match(/(\d{2}):(\d{2})/);
      if (match) {
        const slotTime = `${match[1]}:${match[2]}`;
        if (slotTime >= r.start_time && slotTime <= r.end_time) {
          return { blocked: true, reason: r.reason, isFullDay: false };
        }
      }
    }
  }

  return { blocked: false };
}

export function addBlockedDate(data: {
  blocked_date: string;
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
  reason: string;
  notes?: string;
  actor?: string;
}): BlockedDateRow {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO blocked_dates (
      blocked_date, is_full_day, start_time, end_time, reason, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.blocked_date,
    data.is_full_day ? 1 : 0,
    data.start_time || null,
    data.end_time || null,
    data.reason.trim(),
    data.notes?.trim() || null,
    now
  );

  const actor = data.actor || 'MAÎTRE_D_ADMIN';
  db.prepare(`
    INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'SYSTEM_SETTINGS',
    'BLOCKED_DATE_ADDED',
    actor,
    `Blocked date ${data.blocked_date} (${data.is_full_day ? 'Full Day' : `${data.start_time} - ${data.end_time}`}). Reason: ${data.reason}.`,
    now
  );

  return db.prepare('SELECT * FROM blocked_dates WHERE blocked_date = ? ORDER BY id DESC LIMIT 1').get(data.blocked_date) as unknown as BlockedDateRow;
}

export function removeBlockedDate(id: number, actor = 'MAÎTRE_D_ADMIN'): boolean {
  const current = db.prepare('SELECT * FROM blocked_dates WHERE id = ?').get(id) as unknown as BlockedDateRow | undefined;
  if (!current) return false;

  const now = new Date().toISOString();
  db.prepare('DELETE FROM blocked_dates WHERE id = ?').run(id);

  db.prepare(`
    INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'SYSTEM_SETTINGS',
    'BLOCKED_DATE_REMOVED',
    actor,
    `Unblocked date ${current.blocked_date} (Reason was: ${current.reason}). Date is now open for bookings.`,
    now
  );

  return true;
}

export function getVenueSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM venue_settings').all() as unknown as { key: string; value: string }[];
  const settings: Record<string, string> = {
    auto_confirm: 'true',
    min_pax: '1',
    max_pax: '20',
    cutoff_hours: '1',
    opening_time: '17:00',
    closing_time: '03:00',
    days_open: 'Monday – Sunday (7 Days a Week)',
    announcement: 'Subterranean table reservations auto-confirmed instantly up to 1 hour before opening'
  };

  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return settings;
}

export function updateVenueSettingsBatch(newSettings: Record<string, string>, actor = 'MAÎTRE_D_ADMIN'): Record<string, string> {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO venue_settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `);

  for (const [k, v] of Object.entries(newSettings)) {
    stmt.run(k, String(v), now);
  }

  db.prepare(`
    INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'SYSTEM_SETTINGS',
    'SETTINGS_UPDATED',
    actor,
    `System settings updated: ${Object.keys(newSettings).join(', ')}.`,
    now
  );

  return getVenueSettings();
}

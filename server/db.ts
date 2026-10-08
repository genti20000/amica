import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { supabaseCa } from './supabaseCa.js';
import { serviceInstant } from '../src/lib/serviceTime.js';
export class BookingValidationError extends Error { name = 'BookingValidationError'; }

// Vercel Marketplace provides the Supabase transaction-pooler URL server-side.
const connectionString = process.env.POSTGRES_URL;
const dbUrl = connectionString ? new URL(connectionString) : null;
if (dbUrl) { dbUrl.searchParams.delete('sslmode'); dbUrl.searchParams.delete('pgbouncer'); }
export const db = new pg.Pool({ connectionString: dbUrl?.toString(), ssl: { ca: supabaseCa, rejectUnauthorized: true }, max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
export async function transaction<T>(run: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  if (!connectionString) throw new Error('Supabase database is not configured.');
  const client = await db.connect();
  try { await client.query('BEGIN'); const result = await run(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function logAudit(bookingId: string, action: string, actor: string, details: string, client: pg.Pool | pg.PoolClient = db) {
  await client.query('INSERT INTO booking_audit_logs (booking_id, action, actor, details, created_at) VALUES ($1,$2,$3,$4,$5)', [bookingId,action,actor,details,new Date().toISOString()]);
}
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


export async function getAllReservations(filters?: { search?: string; date?: string; status?: string; guests?: number }): Promise<ReservationRow[]> {
  const where: string[] = []; const values: unknown[] = [];
  const param = (v: unknown) => { values.push(v); return '$' + values.length; };
  if (filters?.search) { const n=param('%'+filters.search+'%'); where.push(`(guest_name ILIKE ${n} OR email ILIKE ${n} OR phone ILIKE ${n} OR booking_id ILIKE ${n})`); }
  if (filters?.date) where.push('reservation_date = '+param(filters.date));
  if (filters?.status && filters.status !== 'all') where.push('status = '+param(filters.status));
  if (filters?.guests) where.push('guests = '+param(filters.guests));
  return (await db.query('SELECT * FROM reservations'+(where.length?' WHERE '+where.join(' AND '):'')+' ORDER BY reservation_date, time_slot, id DESC',values)).rows;
}
export async function getReservationById(bookingId: string): Promise<{ reservation: ReservationRow | null; auditLogs: BookingAuditRow[] }> {
  const [booking, audit] = await Promise.all([db.query('SELECT * FROM reservations WHERE booking_id=$1',[bookingId]), db.query('SELECT * FROM booking_audit_logs WHERE booking_id=$1 ORDER BY id DESC',[bookingId])]);
  return {reservation: booking.rows[0] || null, auditLogs: audit.rows};
}
export async function createReservation(data: { booking_id?: string; guest_name: string; email: string; phone: string; guests: number; reservation_date: string; time_slot: string; seating_area: string; special_occasion?: string; dietary_notes?: string; ip_address?: string; actor?: string }): Promise<ReservationRow> {
  return transaction(async client => {
    // Serialize booking creation with blackout changes to avoid a check/write race.
    await client.query('SELECT pg_advisory_xact_lock(230017)');
    const blocked = await isDateBlocked(data.reservation_date,data.time_slot,client);
    if (blocked.blocked) throw new BookingValidationError('This service date or time is unavailable.');
    const settings=Object.fromEntries((await client.query('SELECT key,value FROM venue_settings')).rows.map(r=>[r.key,r.value]));
    const cutoff=Number(settings.cutoff_hours ?? 1);
    if (serviceInstant(data.reservation_date,data.time_slot)<Date.now()+(Number.isFinite(cutoff)&&cutoff>=0?cutoff:1)*3600000) throw new BookingValidationError('Please choose a later reservation time. The booking cutoff has passed.');
    if(data.guests < Number(settings.min_pax||1) || data.guests > Number(settings.max_pax||20)) throw new BookingValidationError('Please choose a supported party size.');
    const status=settings.auto_confirm==='false'?'Pending':'Confirmed';
    const id = data.booking_id || 'AMICA-'+randomUUID(); const now=new Date().toISOString();
    const result = await client.query(`INSERT INTO reservations (booking_id, guest_name, email, phone, guests, reservation_date, time_slot, seating_area, special_occasion, dietary_notes, status, qr_code_value, ip_address, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$14,$11,$12,$13,$13) RETURNING *`,[id,data.guest_name.trim(),data.email.trim(),data.phone.trim(),data.guests,data.reservation_date,data.time_slot,data.seating_area,data.special_occasion||'',data.dietary_notes||'',`AMICA-SOHO-${id}`,data.ip_address||null,now,status]);
    await logAudit(id,status==='Pending'?'RESERVATION_PENDING':'RESERVATION_CONFIRMED','GUEST_WEB_BOOKING',`Reservation saved for ${data.guests} guests.`,client);
    return result.rows[0];
  });
}
export async function updateReservationStatus(id: string, status: string, actor='ADMIN_PORTAL', notes=''): Promise<ReservationRow | null> {
  if (!['Confirmed','Auto-Confirmed','Pending','Seated','Completed','Cancelled','No-Show'].includes(status)) throw new Error('Invalid reservation status.');
  return transaction(async client => { const result=await client.query('UPDATE reservations SET status=$1, updated_at=$2 WHERE booking_id=$3 RETURNING *',[status,new Date().toISOString(),id]); if(!result.rows[0]) return null; await logAudit(id,'STATUS_CHANGED',actor,`${status}. ${notes}`,client); return result.rows[0]; });
}
export async function deleteReservation(id: string, actor='ADMIN_PORTAL', reason='Admin cancellation') {
  return transaction(async client => { const result=await client.query("UPDATE reservations SET status='Cancelled', updated_at=$2 WHERE booking_id=$1 RETURNING *",[id,new Date().toISOString()]); if(!result.rows.length)return false; await logAudit(id,'CANCELLED_AND_ARCHIVED',actor,reason,client); return true; });
}
export async function getDatabaseMetadata() {
  const r=await db.query(`SELECT count(*)::int AS "totalBookings", count(*) FILTER (WHERE status IN ('Confirmed','Auto-Confirmed'))::int AS "autoConfirmed", count(*) FILTER (WHERE status='Seated')::int AS seated, coalesce(sum(guests),0)::int AS "totalGuests" FROM reservations`);
  const a=await db.query('SELECT count(*)::int AS count FROM booking_audit_logs'); const b=await db.query('SELECT count(*)::int AS count FROM blocked_dates');
  return {database:'Supabase PostgreSQL',filePath:'Managed Supabase database',sizeBytes:0,...r.rows[0],totalAuditLogs:a.rows[0].count,totalBlockedDates:b.rows[0].count,openingHours:'17:00 – 03:00 (Wednesday to Saturday)'};
}
export async function getBlockedDates(): Promise<BlockedDateRow[]> { return (await db.query('SELECT * FROM blocked_dates ORDER BY blocked_date, id DESC')).rows; }
const serviceMinutes=(v:string)=>{const [h,m]=v.split(':').map(Number);return (h<5?h+24:h)*60+m;};
export async function isDateBlocked(date: string, slot?: string, client: pg.Pool | pg.PoolClient = db): Promise<{blocked:boolean; reason?:string}> {
  const rows=(await client.query('SELECT * FROM blocked_dates WHERE blocked_date=$1',[date])).rows;
  for(const r of rows) if(r.is_full_day===1 || (slot && r.start_time && r.end_time && serviceMinutes(slot)>=serviceMinutes(r.start_time) && serviceMinutes(slot)<=serviceMinutes(r.end_time)))return {blocked:true,reason:r.reason};
  return {blocked:false};
}
export async function addBlockedDate(data:{blocked_date:string;is_full_day:boolean;start_time?:string;end_time?:string;reason:string;notes?:string;actor?:string}): Promise<BlockedDateRow> {
  return transaction(async client=>{await client.query('SELECT pg_advisory_xact_lock(230017)');const r=await client.query('INSERT INTO blocked_dates (blocked_date,is_full_day,start_time,end_time,reason,notes,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',[data.blocked_date,data.is_full_day?1:0,data.start_time||null,data.end_time||null,data.reason,data.notes||null,new Date().toISOString()]);await logAudit('SYSTEM_SETTINGS','BLOCKED_DATE_ADDED',data.actor||'ADMIN_PORTAL',data.blocked_date,client);return r.rows[0];});
}
export async function removeBlockedDate(value:number|string, actor='ADMIN_PORTAL') {
  return transaction(async client=>{await client.query('SELECT pg_advisory_xact_lock(230017)');const key=/^\d+$/.test(String(value))?'id':'blocked_date';const r=await client.query(`DELETE FROM blocked_dates WHERE ${key}=$1 RETURNING id`,[value]);if(!r.rows.length)return false;await logAudit('SYSTEM_SETTINGS','BLOCKED_DATE_REMOVED',actor,String(value),client);return true;});
}
export async function getVenueSettings(): Promise<Record<string,string>> { return Object.fromEntries((await db.query('SELECT key,value FROM venue_settings')).rows.map(r=>[r.key,r.value])); }
export async function updateVenueSettingsBatch(settings: Record<string,string>, actor='ADMIN_PORTAL') {
  await transaction(async client=>{for(const [key,value] of Object.entries(settings))await client.query('INSERT INTO venue_settings (key,value,updated_at) VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at',[key,String(value),new Date().toISOString()]);await logAudit('SYSTEM_SETTINGS','SETTINGS_UPDATED',actor,Object.keys(settings).join(', '),client);});return getVenueSettings();
}

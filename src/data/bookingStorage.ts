import { BookingConfirmation } from '../types';

const STORAGE_KEY = 'amica_reservations';
const ADMIN_PASSWORD_KEY = 'amica_admin_password';

// Calls an admin-only API route with the staff password from this tab's session.
// Prompts for the password when none is stored or the server rejects it.
export const adminFetch = async (url: string, init: RequestInit = {}): Promise<Response> => {
  for (let attempt = 0; attempt < 2; attempt++) {
    let password = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
    if (!password || attempt > 0) {
      password = window.prompt(attempt > 0 ? 'Incorrect admin password. Try again:' : 'Admin password:');
      if (!password) break;
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
    }
    const res = await fetch(url, {
      ...init,
      headers: { ...(init.headers as Record<string, string>), 'x-admin-password': password }
    });
    if (res.status !== 401) return res;
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
  }
  throw new Error('Admin password required');
};

const ensureOk = async (res: Response): Promise<any> => {
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json;
};

// Initial reservations - starts empty with zero demo bookings
export const INITIAL_BOOKINGS: BookingConfirmation[] = [];

export const getStoredBookings = (): BookingConfirmation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
};

export const fetchBookingsFromDb = async (): Promise<BookingConfirmation[]> => {
  try {
    const res = await adminFetch('/api/bookings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch {
    // Fallback to local storage if API is offline or during SSR
  }
  return getStoredBookings();
};

// Throws when the server did not create the reservation, so callers never
// show a confirmation for a booking that does not exist.
export const saveBooking = async (booking: BookingConfirmation): Promise<BookingConfirmation> => {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: booking.bookingId,
      formData: booking.formData,
      actor: 'GUEST_WEB_BOOKING'
    })
  });
  const json = await ensureOk(res);
  const current = getStoredBookings();
  const synced = [json.booking, ...current.filter((b) => b.bookingId !== json.booking.bookingId)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
  return json.booking;
};

export const sendBookingConfirmationEmail = async (bookingId: string) => {
  try {
    const res = await adminFetch(`/api/bookings/${bookingId}/send-email`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to send booking confirmation email', e);
  }
  return { success: false, error: 'Network error communicating with email service' };
};

export const fetchBookingEmailPreview = async (bookingId: string) => {
  try {
    const res = await adminFetch(`/api/bookings/${bookingId}/email-preview`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch booking email preview', e);
  }
  return null;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  actor = 'ADMIN_PORTAL',
  notes = ''
): Promise<BookingConfirmation[]> => {
  const res = await adminFetch(`/api/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, actor, notes })
  });
  await ensureOk(res);

  const updated = getStoredBookings().map((b) => (b.bookingId === bookingId ? { ...b, status } : b));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteBooking = async (
  bookingId: string,
  actor = 'ADMIN_PORTAL',
  reason = 'Admin portal deletion'
): Promise<BookingConfirmation[]> => {
  const res = await adminFetch(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor, reason })
  });
  await ensureOk(res);

  const updated = getStoredBookings().filter((b) => b.bookingId !== bookingId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const fetchBookingAuditLogs = async (bookingId: string) => {
  try {
    const res = await adminFetch(`/api/bookings/${bookingId}`);
    if (res.ok) {
      const data = await res.json();
      return data.auditLogs || [];
    }
  } catch (e) {
    console.error('Failed to fetch audit logs', e);
  }
  return [];
};

export const fetchDatabaseStatus = async () => {
  try {
    const res = await adminFetch('/api/database/status');
    if (res.ok) {
      const data = await res.json();
      return data.stats;
    }
  } catch {
    // fallback
  }
  return {
    database: 'SQLite 3 (Persistent)',
    filePath: 'data/amica.sqlite',
    totalBookings: getStoredBookings().length,
    autoConfirmed: getStoredBookings().filter(b => b.status === 'Auto-Confirmed').length
  };
};

export const resetBookings = async (): Promise<BookingConfirmation[]> => {
  await ensureOk(await adminFetch('/api/database/reset', { method: 'POST' }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
};

export const downloadBookingsCsv = async (): Promise<void> => {
  const res = await adminFetch('/api/export/csv');
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `amica_reservations_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// =========================================================================
// SYSTEM SETTINGS & BLOCKED DATES API
// =========================================================================

export interface BlockedDateItem {
  id: number;
  blocked_date: string;
  is_full_day: number | boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  notes: string | null;
  created_at: string;
}

export interface SystemSettings {
  auto_confirm: string;
  min_pax: string;
  max_pax: string;
  cutoff_hours: string;
  opening_time: string;
  closing_time: string;
  days_open: string;
  announcement: string;
}

const BLOCKED_DATES_KEY = 'amica_blocked_dates';
const SETTINGS_KEY = 'amica_system_settings';

export const DEFAULT_SETTINGS: SystemSettings = {
  auto_confirm: 'true',
  min_pax: '1',
  max_pax: '20',
  cutoff_hours: '1',
  opening_time: '17:00',
  closing_time: '03:00',
  days_open: 'Wednesday – Saturday (4 Days a Week)',
  announcement: 'Subterranean table reservations auto-confirmed instantly up to 1 hour before opening'
};

export const fetchBlockedDates = async (): Promise<BlockedDateItem[]> => {
  try {
    const res = await fetch('/api/system/blocked-dates');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch {
    // fallback to cache if offline
  }

  try {
    const cached = localStorage.getItem(BLOCKED_DATES_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify([]));
  return [];
};

export const addBlockedDate = async (data: {
  blocked_date: string;
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
  reason: string;
  notes?: string;
}): Promise<BlockedDateItem[]> => {
  const res = await adminFetch('/api/system/blocked-dates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  await ensureOk(res);
  return await fetchBlockedDates();
};

export const removeBlockedDate = async (idOrDate: number | string): Promise<BlockedDateItem[]> => {
  await ensureOk(await adminFetch(`/api/system/blocked-dates/${idOrDate}`, { method: 'DELETE' }));
  return await fetchBlockedDates();
};

export const fetchSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const res = await fetch('/api/system/settings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(json.settings));
        return { ...DEFAULT_SETTINGS, ...json.settings };
      }
    }
  } catch {
    // fallback
  }

  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  } catch {
    // ignore
  }

  return DEFAULT_SETTINGS;
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const res = await adminFetch('/api/system/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings })
  });
  const json = await ensureOk(res);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(json.settings));
  return { ...DEFAULT_SETTINGS, ...json.settings };
};

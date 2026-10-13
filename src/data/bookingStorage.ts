import { BookingConfirmation } from '../types';

const STORAGE_KEY = 'amica_reservations';

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
    const res = await fetch('/api/bookings');
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

export const saveBooking = async (booking: BookingConfirmation): Promise<BookingConfirmation> => {
  try {
    const current = getStoredBookings();
    const updated = [booking, ...current.filter((b) => b.bookingId !== booking.bookingId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist to proper SQLite database
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.bookingId,
        formData: booking.formData,
        actor: 'GUEST_WEB_BOOKING'
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.booking) {
        const synced = [json.booking, ...current.filter((b) => b.bookingId !== booking.bookingId)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        return json.booking;
      }
    }
  } catch (e) {
    console.error('Failed to save booking to database', e);
  }
  return booking;
};

export const sendBookingConfirmationEmail = async (bookingId: string) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}/send-email`, {
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
    const res = await fetch(`/api/bookings/${bookingId}/email-preview`);
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
  try {
    const current = getStoredBookings();
    const updated = current.map((b) => (b.bookingId === bookingId ? { ...b, status } : b));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist status change to SQLite database
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actor, notes })
    });

    return updated;
  } catch {
    return getStoredBookings();
  }
};

export const deleteBooking = async (
  bookingId: string,
  actor = 'ADMIN_PORTAL',
  reason = 'Admin portal deletion'
): Promise<BookingConfirmation[]> => {
  try {
    const current = getStoredBookings();
    const updated = current.filter((b) => b.bookingId !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Archive and delete in SQLite database
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor, reason })
    });

    return updated;
  } catch {
    return getStoredBookings();
  }
};

export const fetchBookingAuditLogs = async (bookingId: string) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}`);
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
    const res = await fetch('/api/database/status');
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
  try {
    await fetch('/api/database/reset', { method: 'POST' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  }
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
  try {
    const res = await fetch('/api/system/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      return await fetchBlockedDates();
    }
  } catch (e) {
    console.error('Failed to add blocked date via API', e);
  }

  // Fallback to local storage
  const current = await fetchBlockedDates();
  const newItem: BlockedDateItem = {
    id: Date.now(),
    blocked_date: data.blocked_date,
    is_full_day: data.is_full_day ? 1 : 0,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    reason: data.reason,
    notes: data.notes || null,
    created_at: new Date().toISOString()
  };
  const updated = [...current, newItem];
  localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(updated));
  return updated;
};

export const removeBlockedDate = async (idOrDate: number | string): Promise<BlockedDateItem[]> => {
  try {
    const res = await fetch(`/api/system/blocked-dates/${idOrDate}`, { method: 'DELETE' });
    if (res.ok) {
      return await fetchBlockedDates();
    }
  } catch (e) {
    console.error('Failed to remove blocked date via API', e);
  }

  const current = await fetchBlockedDates();
  const updated = current.filter((item) => item.id !== Number(idOrDate) && item.blocked_date !== String(idOrDate));
  localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(updated));
  return updated;
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
  try {
    const res = await fetch('/api/system/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(json.settings));
        return { ...DEFAULT_SETTINGS, ...json.settings };
      }
    }
  } catch (e) {
    console.error('Failed to update settings via API', e);
  }

  const current = await fetchSystemSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

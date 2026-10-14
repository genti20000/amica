import { BookingConfirmation } from '../types';

async function api(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) throw new Error(json?.error || 'The request failed. Please try again.');
  return json;
}
const writeOptions = (method: string, body?: unknown): RequestInit => ({method, headers: {'Content-Type':'application/json'}, ...(body ? {body:JSON.stringify(body)} : {})});

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
  const json = await api('/api/bookings');
  return Array.isArray(json.data) ? json.data : [];
};

export const saveBooking = async (booking: BookingConfirmation): Promise<BookingConfirmation> => {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: booking.bookingId, formData: booking.formData })
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success || !json.booking) {
    throw new Error(json?.error || 'Your reservation could not be saved. Please try again or contact reservations@amicasoho.com.');
  }
  return json.booking;
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

export const updateBookingStatus = async (bookingId: string, status: string, actor = 'ADMIN_PORTAL', notes = ''): Promise<BookingConfirmation[]> => {
  await api(`/api/bookings/${encodeURIComponent(bookingId)}/status`, writeOptions('PATCH', {status,actor,notes}));
  return fetchBookingsFromDb();
};

export const deleteBooking = async (bookingId: string, actor = 'ADMIN_PORTAL', reason = 'Admin cancellation'): Promise<BookingConfirmation[]> => {
  await api(`/api/bookings/${encodeURIComponent(bookingId)}`, writeOptions('DELETE', {actor,reason}));
  return fetchBookingsFromDb();
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

export const fetchDatabaseStatus = async () => (await api('/api/database/status')).stats;

export const resetBookings = async (): Promise<BookingConfirmation[]> => {
  await api('/api/database/reset',writeOptions('POST'));
  return fetchBookingsFromDb();
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

export const fetchBlockedDates = async (): Promise<BlockedDateItem[]> => (await api('/api/system/blocked-dates')).data;

export const addBlockedDate = async (data: {blocked_date:string;is_full_day:boolean;start_time?:string;end_time?:string;reason:string;notes?:string}): Promise<BlockedDateItem[]> => {
  await api('/api/system/blocked-dates',writeOptions('POST',data)); return fetchBlockedDates();
};

export const removeBlockedDate = async (idOrDate: number | string): Promise<BlockedDateItem[]> => {
  await api(`/api/system/blocked-dates/${encodeURIComponent(idOrDate)}`,writeOptions('DELETE')); return fetchBlockedDates();
};

export const fetchSystemSettings = async (): Promise<SystemSettings> => ({...DEFAULT_SETTINGS,...(await api('/api/system/settings')).settings});

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const json=await api('/api/system/settings',writeOptions('POST',{settings})); return {...DEFAULT_SETTINGS,...json.settings};
};

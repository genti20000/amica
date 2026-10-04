import { BookingConfirmation } from '../types';

const STORAGE_KEY = 'amica_reservations';

// Realistic initial reservations demonstrating 1 to 20 pax auto-confirm
export const INITIAL_BOOKINGS: BookingConfirmation[] = [
  {
    bookingId: 'AMICA-841920',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-841920-2026-10-04-18PAX',
    formData: {
      date: new Date().toISOString().split('T')[0],
      timeSlot: '20:00 – Prime Dinner & Cocktails',
      guests: 18,
      seatingArea: 'Exclusive Vault Lounge Section',
      name: 'Julian Montgomery',
      email: 'j.montgomery@mayfairarts.com',
      phone: '+44 7700 900124',
      dietaryNotes: '3 Gluten-Free, 2 Pescatarian. Need vintage champagne on arrival.',
      specialOccasion: 'Group Celebration (Feasting)'
    }
  },
  {
    bookingId: 'AMICA-719302',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-719302-2026-10-04-12PAX',
    formData: {
      date: new Date().toISOString().split('T')[0],
      timeSlot: '19:00 – Prime Vault Dining & Drinks',
      guests: 12,
      seatingArea: 'Semi-Private Feasting Vault',
      name: 'Camilla Valenti',
      email: 'camilla.valenti@designstudio.co.uk',
      phone: '+44 7911 123456',
      dietaryNotes: '1 Nut allergy, 1 Vegan cicchetti request.',
      specialOccasion: 'Birthday Celebration'
    }
  },
  {
    bookingId: 'AMICA-632190',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-632190-2026-10-04-4PAX',
    formData: {
      date: new Date().toISOString().split('T')[0],
      timeSlot: '17:30 – Spritz & Early Aperitivo',
      guests: 4,
      seatingArea: 'Arched Wine Vault Booth',
      name: 'Marcus Sterling',
      email: 'marcus@sterlingpartners.com',
      phone: '+44 7890 234567',
      dietaryNotes: 'No seafood.',
      specialOccasion: 'Corporate / Client Entertaining'
    }
  },
  {
    bookingId: 'AMICA-512849',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-512849-2026-10-04-2PAX',
    formData: {
      date: new Date().toISOString().split('T')[0],
      timeSlot: '21:30 – Late Evening Banquette',
      guests: 2,
      seatingArea: 'Plush Velvet Banquette',
      name: 'Elena Rostova',
      email: 'elena.rostova@recordlabel.com',
      phone: '+44 7722 345678',
      dietaryNotes: 'Vegetarian.',
      specialOccasion: 'Anniversary / Date Night'
    }
  },
  {
    bookingId: 'AMICA-491023',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-491023-2026-10-04-1PAX',
    formData: {
      date: new Date().toISOString().split('T')[0],
      timeSlot: '23:30 – Vault Beats & Cocktails',
      guests: 1,
      seatingArea: 'Brass Cocktail Counter & High Bar',
      name: 'David Kincaid',
      email: 'dkincaid@soundarchive.org',
      phone: '+44 7833 456789',
      dietaryNotes: 'None.',
      specialOccasion: 'None / Casual Aperitivo'
    }
  },
  {
    bookingId: 'AMICA-382910',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-382910-2026-10-04-20PAX',
    formData: {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '20:30 – Vinyl Jazz & Dining',
      guests: 20,
      seatingArea: 'Exclusive Vault Lounge Section',
      name: 'Siddharth Patel',
      email: 'siddharth@techinnovations.io',
      phone: '+44 7944 567890',
      dietaryNotes: 'Halal options required, 3 Vegetarian guests.',
      specialOccasion: 'Group Celebration (Feasting)'
    }
  },
  {
    bookingId: 'AMICA-291834',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-291834-2026-10-04-6PAX',
    formData: {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '18:00 – Aperitivo & Cicchetti',
      guests: 6,
      seatingArea: 'Arched Wine Vault Booth',
      name: 'Genevieve Dubois',
      email: 'g.dubois@parisfashion.fr',
      phone: '+44 7555 678901',
      dietaryNotes: 'Truffle lovers.',
      specialOccasion: 'Birthday Celebration'
    }
  },
  {
    bookingId: 'AMICA-194820',
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    status: 'Auto-Confirmed',
    qrCodeValue: 'AMICA-SOHO-AMICA-194820-2026-10-04-8PAX',
    formData: {
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: '00:30 – Late Night Selectors',
      guests: 8,
      seatingArea: 'Semi-Private Feasting Vault',
      name: 'Alexandre Rossi',
      email: 'alex.rossi@milanoculture.it',
      phone: '+44 7666 789012',
      dietaryNotes: 'Negroni connoisseurs.',
      specialOccasion: 'None / Casual Aperitivo'
    }
  }
];

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
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch {
    // Fallback to local storage if API is offline or during SSR
  }
  return getStoredBookings();
};

export const saveBooking = async (booking: BookingConfirmation): Promise<void> => {
  try {
    const current = getStoredBookings();
    const updated = [booking, ...current.filter((b) => b.bookingId !== booking.bookingId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist to proper SQLite database
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formData: booking.formData,
        actor: 'GUEST_WEB_BOOKING'
      })
    });
  } catch (e) {
    console.error('Failed to save booking to database', e);
  }
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
  days_open: 'Monday – Sunday (7 Days a Week)',
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
    // fallback to cache
  }

  try {
    const cached = localStorage.getItem(BLOCKED_DATES_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  const sampleDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
  const initial = [
    {
      id: 1,
      blocked_date: sampleDate,
      is_full_day: 1,
      start_time: null,
      end_time: null,
      reason: 'Private Buyout — Exclusive Subterranean Club Hire',
      notes: 'Private corporate record label celebration & tasting. Closed to general reservations.',
      created_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(initial));
  return initial;
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

export const removeBlockedDate = async (id: number): Promise<BlockedDateItem[]> => {
  try {
    await fetch(`/api/system/blocked-dates/${id}`, { method: 'DELETE' });
    return await fetchBlockedDates();
  } catch (e) {
    console.error('Failed to remove blocked date via API', e);
  }

  const current = await fetchBlockedDates();
  const updated = current.filter((item) => item.id !== id);
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

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

export const saveBooking = (booking: BookingConfirmation): void => {
  try {
    const current = getStoredBookings();
    // Prepend new booking
    const updated = [booking, ...current.filter((b) => b.bookingId !== booking.bookingId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save booking', e);
  }
};

export const updateBookingStatus = (bookingId: string, status: string): BookingConfirmation[] => {
  try {
    const current = getStoredBookings();
    const updated = current.map((b) => (b.bookingId === bookingId ? { ...b, status } : b));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredBookings();
  }
};

export const deleteBooking = (bookingId: string): BookingConfirmation[] => {
  try {
    const current = getStoredBookings();
    const updated = current.filter((b) => b.bookingId !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredBookings();
  }
};

export const resetBookings = (): BookingConfirmation[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
};

export type PageId = 'coming-soon' | 'home' | 'drinks-food' | 'venue' | 'private-hire' | 'whats-on' | 'visit' | 'book' | 'admin-bookings';

export interface MenuItem {
  id: string;
  name: string;
  italianName?: string;
  category: 'cocktails' | 'spritz' | 'zero' | 'aperitivi' | 'vermouth' | 'wines' | 'small-plates' | 'charcuterie' | 'digestivi';
  price: string;
  description: string;
  tastingNotes?: string;
  tags?: string[]; // e.g. ['Signature', 'Vegan Option', 'Gluten Free', 'Sommelier Pick']
  pairingRecommendation?: string;
  image?: string;
}

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Vinyl & Beats' | 'Aperitivo Hours' | 'Masterclass' | 'Tasting' | 'Live Music & Cabaret';
  date: string;
  time: string;
  description: string;
  highlight: string;
  priceInfo: string;
  image?: string;
}

export interface BookingFormData {
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea: string;
  name: string;
  email: string;
  phone: string;
  dietaryNotes: string;
  specialOccasion: string;
}

export interface MockEmailNotification {
  id?: number;
  bookingId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  referenceNumber: string;
  sentAt: string;
  status: string;
  contentHtml?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  formData: BookingFormData;
  createdAt: string;
  qrCodeValue: string;
  status?: string;
  tableNumber?: string;
  emailNotification?: MockEmailNotification;
}

export interface PrivateHirePackage {
  id: string;
  title: string;
  capacity: string;
  minimumSpend: string;
  description: string;
  includes: string[];
  recommendedFor: string;
}

export interface QuizAnswer {
  flavorPreference: 'bitter-sweet' | 'citrus-refreshing' | 'rich-herbal' | 'low-abv';
  occasion: 'post-work' | 'intimate-date' | 'group-celebration' | 'casual-drink';
  foodPairing: 'charcuterie' | 'seafood-cicchetti' | 'artisan-focaccia' | 'cheeses';
}

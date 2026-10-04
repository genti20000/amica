import React, { useState, useMemo } from 'react';
import { PageId, BookingFormData, BookingConfirmation } from '../types';
import { saveBooking } from '../data/bookingStorage';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Wine,
  Sparkles,
  Check,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Building,
  Flame,
  Zap,
  PhoneCall,
  UtensilsCrossed
} from 'lucide-react';

interface BookPageProps {
  onNavigate: (page: PageId) => void;
  onBookingComplete: (confirmation: BookingConfirmation) => void;
  savedPairingsCount: number;
}

export const BookPage: React.FC<BookPageProps> = ({ onNavigate, onBookingComplete, savedPairingsCount }) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [formData, setFormData] = useState<BookingFormData>({
    date: todayStr,
    timeSlot: '19:00 – Prime Vault Dining & Drinks',
    guests: 2,
    seatingArea: 'Arched Wine Vault Booth',
    name: '',
    email: '',
    phone: '',
    dietaryNotes: '',
    specialOccasion: 'None / Casual Aperitivo'
  });

  const [slotCategory, setSlotCategory] = useState<'all' | 'aperitivo' | 'dinner' | 'late-night'>('all');

  // AMICA Opening Times: 5:00 PM to 3:00 AM (17:00 – 03:00), 7 days a week
  const allTimeSlots = [
    { slot: '17:00 – Golden Hour Opening', time: '17:00', cat: 'aperitivo', note: 'Complimentary Cicchetti' },
    { slot: '17:30 – Spritz & Early Aperitivo', time: '17:30', cat: 'aperitivo', note: 'Aperitivo Hour' },
    { slot: '18:00 – Aperitivo & Cicchetti', time: '18:00', cat: 'aperitivo', note: 'Early Evening' },
    { slot: '18:30 – Evening Transition', time: '18:30', cat: 'aperitivo', note: 'Available' },
    { slot: '19:00 – Prime Vault Dining & Drinks', time: '19:00', cat: 'dinner', note: 'High Demand' },
    { slot: '19:30 – Evening Wine & Plates', time: '19:30', cat: 'dinner', note: 'Candlelit Session' },
    { slot: '20:00 – Prime Dinner & Cocktails', time: '20:00', cat: 'dinner', note: 'Peak Atmosphere' },
    { slot: '20:30 – Vinyl Jazz & Dining', time: '20:30', cat: 'dinner', note: 'Analog Soundscapes' },
    { slot: '21:00 – Dinner & Amaro', time: '21:00', cat: 'dinner', note: 'Available' },
    { slot: '21:30 – Late Evening Banquette', time: '21:30', cat: 'dinner', note: 'Available' },
    { slot: '22:00 – Nocturnal Vault Cocktails', time: '22:00', cat: 'dinner', note: 'Subterranean Vibe' },
    { slot: '22:30 – Late Night Speakeasy', time: '22:30', cat: 'dinner', note: 'Available' },
    { slot: '23:00 – Late Night Soho Session', time: '23:00', cat: 'late-night', note: 'Midnight Drinks' },
    { slot: '23:30 – Vault Beats & Cocktails', time: '23:30', cat: 'late-night', note: 'Curated Vinyl DJs' },
    { slot: '00:00 – Midnight Aperitivo Lounge', time: '00:00', cat: 'late-night', note: 'Open till 3:00 AM' },
    { slot: '00:30 – Late Night Selectors', time: '00:30', cat: 'late-night', note: 'Cocktails & Mischief' },
    { slot: '01:00 – Subterranean Nightcap', time: '01:00', cat: 'late-night', note: 'Open till 3:00 AM' },
    { slot: '01:30 – Late Night Pour', time: '01:30', cat: 'late-night', note: 'Open till 3:00 AM' },
    { slot: '02:00 – Final Seating (Till 3:00 AM)', time: '02:00', cat: 'late-night', note: 'Service till 3:00 AM' },
  ];

  const filteredSlots = useMemo(() => {
    if (slotCategory === 'all') return allTimeSlots;
    return allTimeSlots.filter((ts) => ts.cat === slotCategory);
  }, [slotCategory]);

  // Seating areas with capacity recommendations for 1 to 20 guests
  const seatingAreas = [
    {
      id: 'Arched Wine Vault Booth',
      title: 'Arched Wine Vault Booth',
      recommended: 'Ideal for 2 to 8 guests',
      minMax: '2 – 8 Pax',
      desc: 'Subterranean candlelit exposed brick alcove beneath Frith Street with curved leather banquettes.'
    },
    {
      id: 'Brass Cocktail Counter & High Bar',
      title: 'Brass Cocktail Counter',
      recommended: 'Ideal for 1 to 4 guests',
      minMax: '1 – 4 Pax',
      desc: 'Interactive brushed brass counter facing master mixologists & sommelier spirit trolley.'
    },
    {
      id: 'Plush Velvet Banquette',
      title: 'Plush Velvet Banquette',
      recommended: 'Ideal for 2 to 6 guests',
      minMax: '2 – 6 Pax',
      desc: 'Luxurious burgundy velvet banquettes within the vinyl listening perimeter.'
    },
    {
      id: 'Semi-Private Feasting Vault',
      title: 'Semi-Private Feasting Vault',
      recommended: 'Ideal for 7 to 14 guests',
      minMax: '7 – 14 Pax',
      desc: 'Connected double vault table with dedicated sommelier service for group celebrations.'
    },
    {
      id: 'Exclusive Vault Lounge Section',
      title: 'Exclusive Vault Lounge Section',
      recommended: 'Ideal for 12 to 20 guests',
      minMax: '12 – 20 Pax',
      desc: 'Dedicated private subterranean alcove lounge accommodating up to 20 guests seamlessly.'
    },
    {
      id: 'First Available Table',
      title: 'First Available Table',
      recommended: 'Suitable for 1 to 20 guests',
      minMax: '1 – 20 Pax',
      desc: 'Our maitre d’ will arrange the optimum table configuration for your party upon arrival.'
    }
  ];

  // Party size helper note
  const getPartyNote = (pax: number) => {
    if (pax === 1) return 'Solo Guest: Choice of intimate brass bar counter or quiet velvet corner.';
    if (pax === 2) return 'Intimate Pair: Perfect for candlelight dates, arched booths, or cocktail counter.';
    if (pax <= 6) return 'Small Group: Reserved table in the vault booths or velvet banquettes.';
    if (pax <= 12) return 'Large Group: Automatically reserved at our connected Feasting Vault table.';
    return 'Party of 13–20: Dedicated semi-private Vault Lounge area allocated with personal host.';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const bookingId = 'AMICA-' + Math.floor(100000 + Math.random() * 900000);
    const confirmation: BookingConfirmation = {
      bookingId,
      formData,
      createdAt: new Date().toISOString(),
      qrCodeValue: `AMICA-SOHO-${bookingId}-${formData.date}-${formData.guests}PAX`,
      status: 'Auto-Confirmed'
    };

    // Save to persistent storage so it appears in Admin Bookings Page
    saveBooking(confirmation);

    onBookingComplete(confirmation);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Page Title & Highlights Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#200A0E] border border-[#DFBE7B]/50 shadow-[0_0_20px_rgba(223,190,123,0.15)] text-[#DFBE7B] text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold">
          <Zap className="w-3.5 h-3.5 text-[#DFBE7B] animate-pulse" />
          <span>Auto-Confirm Restaurant Reservation System · 1 to 20 Pax</span>
        </div>

        <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl md:text-6xl text-[#FDFBF7] tracking-wider font-light">
          Reserve a Table at <span className="text-[#E8CCA0]">AMICA SOHO</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#DFBE7B]/85 max-w-2xl mx-auto leading-relaxed font-sans">
          Online table reservations for <strong>1 to 20 guests</strong> are <strong className="text-[#FFEAA7]">automatically confirmed instantly</strong>.
          Open <strong>7 days a week from 5:00 PM to 3:00 AM (17:00 – 03:00)</strong>.
        </p>

        {/* 1-Hour Notice & Opening Schedule Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
          <div className="bg-[#140306]/90 border border-[#DFBE7B]/30 rounded-lg p-3.5 flex items-start gap-3 shadow-md">
            <Clock className="w-4 h-4 text-[#DFBE7B] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#DFBE7B] font-bold block">
                Opening Times · 7 Days a Week
              </span>
              <p className="text-xs text-[#FDFBF7] font-medium mt-0.5">
                5:00 PM – 3:00 AM Daily (17:00 – 03:00)
              </p>
              <p className="text-[10px] text-[#DFBE7B]/70 mt-0.5">
                Aperitivo from 5pm · Late-night service till 3am
              </p>
            </div>
          </div>

          <div className="bg-[#140306]/90 border border-emerald-500/40 rounded-lg p-3.5 flex items-start gap-3 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-emerald-400 font-bold block">
                Instant Auto-Confirmation
              </span>
              <p className="text-xs text-[#FDFBF7] font-medium mt-0.5">
                Up to 1 hour before seating time
              </p>
              <p className="text-[10px] text-[#DFBE7B]/70 mt-0.5">
                Guaranteed immediate table confirmation pass
              </p>
            </div>
          </div>
        </div>

        {savedPairingsCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#200A0E] border border-[#C5A059] text-[#DFBE7B] text-xs rounded-full">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>You have {savedPairingsCount} saved menu pairing{savedPairingsCount > 1 ? 's' : ''} attached to your session!</span>
          </div>
        )}
      </div>

      {/* Main Reservation Form Card */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border border-[#DFBE7B]/40 rounded-2xl p-5 sm:p-9 shadow-2xl space-y-9 relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#DFBE7B]/5 rounded-full blur-3xl pointer-events-none" />

        {/* =========================================================================
            STEP 1: PARTY SIZE (1 TO 20 PAX)
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFBE7B]/20 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">1</span>
              <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
                Party Size (1 to 20 Guests)
              </h3>
            </div>
            <span className="text-[10px] font-sans tracking-[0.16em] uppercase text-emerald-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Auto-Confirmed
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-sans text-[#DFBE7B] uppercase tracking-wider font-semibold">
                Select Guests (Pax): <span className="text-[#FFEAA7] text-sm font-bold ml-1">{formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}</span>
              </label>
              <span className="text-[11px] text-[#DFBE7B]/70 font-sans">
                Range: 1 – 20 Pax
              </span>
            </div>

            {/* Quick-Select Buttons from 1 to 20 Pax */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 mb-3">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                const isSelected = formData.guests === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      let area = formData.seatingArea;
                      if (num >= 15) area = 'Exclusive Vault Lounge Section';
                      else if (num >= 8) area = 'Semi-Private Feasting Vault';
                      setFormData({ ...formData, guests: num, seatingArea: area });
                    }}
                    className={`py-2.5 sm:py-3 rounded font-sans text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] border-[#FFEAA7] shadow-[0_0_12px_rgba(223,190,123,0.4)] scale-105'
                        : 'bg-[#180307]/80 text-[#FDFBF7] border-[#DFBE7B]/25 hover:border-[#DFBE7B]/60 hover:bg-[#200A0E]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Party Guidance Banner */}
            <div className="bg-[#200A0E]/80 border border-[#DFBE7B]/30 rounded-lg p-3 flex items-center gap-2.5 text-xs text-[#FFEAA7] font-sans">
              <Users className="w-4 h-4 text-[#DFBE7B] shrink-0" />
              <span>{getPartyNote(formData.guests)}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: RESERVATION DATE (7 DAYS A WEEK)
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFBE7B]/20 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">2</span>
              <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
                Reservation Date
              </h3>
            </div>
            <span className="text-[10px] font-sans tracking-[0.16em] uppercase text-[#DFBE7B]/70">
              Open 7 Days a Week (Mon – Sun)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-2 font-semibold">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0D0204] border border-[#DFBE7B]/40 rounded-lg text-sm text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans cursor-pointer"
                  required
                />
              </div>
            </div>

            <div className="bg-[#140306]/60 border border-[#DFBE7B]/20 rounded-lg p-3.5 flex flex-col justify-center text-xs text-[#DFBE7B]/80 font-sans space-y-1">
              <div className="flex items-center gap-1.5 text-[#FDFBF7] font-semibold">
                <CalendarIcon className="w-4 h-4 text-[#DFBE7B]" />
                <span>Service Schedule for Selected Day:</span>
              </div>
              <p>• Doors open at 5:00 PM (17:00)</p>
              <p>• Continuous cocktail, wine & dining service until 3:00 AM (03:00)</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 3: TIME SLOT (5PM TO 3AM)
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFBE7B]/20 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">3</span>
              <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
                Time Slot (5:00 PM – 3:00 AM)
              </h3>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-[10px] uppercase font-sans tracking-wider">
              {[
                { id: 'all', label: 'All (5pm–3am)' },
                { id: 'aperitivo', label: 'Aperitivo (5–7pm)' },
                { id: 'dinner', label: 'Dinner (7–11pm)' },
                { id: 'late-night', label: 'Late Night (11pm–3am)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSlotCategory(tab.id as any)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    slotCategory === tab.id
                      ? 'bg-[#DFBE7B] text-[#120205] font-semibold'
                      : 'text-[#DFBE7B]/60 hover:text-[#DFBE7B] hover:bg-[#200A0E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredSlots.map((ts) => {
              const isSelected = formData.timeSlot === ts.slot;
              return (
                <button
                  key={ts.slot}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeSlot: ts.slot })}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#2A080F] border-[#DFBE7B] shadow-[0_0_15px_rgba(223,190,123,0.3)] ring-1 ring-[#DFBE7B]'
                      : 'bg-[#0D0204]/90 border-[#DFBE7B]/25 hover:border-[#DFBE7B]/60 hover:bg-[#1A0509]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel',serif] text-xs sm:text-sm font-semibold text-[#FDFBF7]">
                      {ts.slot.split('–')[0]}
                    </span>
                    <span className="text-[9px] font-sans text-emerald-400 font-semibold">
                      Auto-Confirm ✓
                    </span>
                  </div>
                  <span className="block text-[10px] font-sans text-[#DFBE7B] mt-0.5 tracking-wide">
                    {ts.slot.split('–')[1] || ts.note}
                  </span>
                  <span className="block text-[9px] font-sans text-[#DFBE7B]/50 mt-0.5">
                    {ts.note}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#140306] border border-[#DFBE7B]/20 rounded p-2.5 flex items-center gap-2 text-[11px] text-[#DFBE7B]/80 font-sans">
            <Info className="w-3.5 h-3.5 text-[#DFBE7B] shrink-0" />
            <span>
              <strong>1-Hour Policy:</strong> Reservations are automatically confirmed instantly when booked at least 1 hour prior to seating time. Immediate walk-ins are welcomed on a first-come basis at the cocktail bar counter.
            </span>
          </div>
        </div>

        {/* =========================================================================
            STEP 4: SEATING AREA PREFERENCE
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#DFBE7B]/20 pb-3">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">4</span>
            <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
              Seating Area Preference
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seatingAreas.map((area) => {
              const isSelected = formData.seatingArea === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, seatingArea: area.id })}
                  className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2A080F] border-[#DFBE7B] shadow-[0_0_15px_rgba(223,190,123,0.3)] ring-1 ring-[#DFBE7B]'
                      : 'bg-[#0D0204]/90 border-[#DFBE7B]/25 hover:border-[#DFBE7B]/60 hover:bg-[#1A0509]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel',serif] text-sm font-bold text-[#E8CCA0]">{area.title}</span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#200A0E] border border-[#DFBE7B]/30 text-[#DFBE7B]">
                      {area.minMax}
                    </span>
                  </div>
                  <span className="block text-[11px] text-[#DFBE7B]/80 font-medium mt-1 font-sans">{area.recommended}</span>
                  <span className="block text-xs text-[#FDFBF7]/70 mt-1 font-sans leading-relaxed">{area.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP 5: GUEST DETAILS & CONFIRMATION
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#DFBE7B]/20 pb-3">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">5</span>
            <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
              Guest Contact & Occasion
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1.5 font-semibold">
                Lead Guest Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sofia Loren"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-3 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1.5 font-semibold">
                Email Address (For Pass & Auto-Confirmation) *
              </label>
              <input
                type="email"
                required
                placeholder="sofia@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-3 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1.5 font-semibold">
                Mobile Phone (For Arrival SMS) *
              </label>
              <input
                type="tel"
                required
                placeholder="+44 7987 654321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-3 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1.5 font-semibold">
                Special Occasion
              </label>
              <select
                value={formData.specialOccasion}
                onChange={(e) => setFormData({ ...formData, specialOccasion: e.target.value })}
                className="w-full px-3.5 py-3 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans cursor-pointer"
              >
                <option value="None / Casual Aperitivo">None / Casual Aperitivo & Drinks</option>
                <option value="Birthday Celebration">Birthday Celebration</option>
                <option value="Anniversary / Date Night">Anniversary / Date Night</option>
                <option value="Group Celebration (Feasting)">Group Celebration / Party (1–20 Pax)</option>
                <option value="Corporate / Client Entertaining">Corporate / Client Entertaining</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1.5 font-semibold">
              Dietary Requirements / Special Seating Notes
            </label>
            <input
              type="text"
              placeholder="e.g. 2 Vegan guests, 1 Nut allergy, prefer booth near vinyl DJ..."
              value={formData.dietaryNotes}
              onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
              className="w-full px-3.5 py-3 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
            />
          </div>
        </div>

        {/* =========================================================================
            SUBMIT CTA: INSTANT AUTO-CONFIRMATION
           ========================================================================= */}
        <div className="pt-4 border-t border-[#DFBE7B]/25 space-y-4">
          <div className="bg-[#1A0509] border border-[#DFBE7B]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 font-sans">
              <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Auto-Confirmation Ready: {formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}
              </span>
              <p className="text-[#FDFBF7]/90 text-[11px]">
                {formData.date} · {formData.timeSlot.split('–')[0]} · {formData.seatingArea}
              </p>
            </div>

            <span className="text-[10px] text-[#DFBE7B]/80 uppercase tracking-widest bg-[#200A0E] px-3 py-1.5 rounded border border-[#DFBE7B]/30 text-center">
              100% Instant Pass Guarantee
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-[#C5A059] via-[#DFBE7B] to-[#C5A059] hover:from-[#DFBE7B] hover:via-[#FFEAA7] hover:to-[#DFBE7B] text-[#120205] font-sans font-bold text-xs sm:text-sm tracking-[0.24em] uppercase transition-all duration-200 cursor-pointer shadow-[0_6px_24px_rgba(197,160,89,0.35)] active:scale-[0.99] flex items-center justify-center gap-2.5"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Auto-Confirm Reservation & Generate Digital Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 text-[10px] text-[#DFBE7B]/70 font-sans text-center">
            <span className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFBE7B]" />
              No deposit required · Instant auto-confirm 1 to 20 pax
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Open 5:00 PM to 3:00 AM (7 Days a Week)</span>
            <span className="hidden sm:inline">•</span>
            <span>Free cancellation up to 2 hours prior</span>
          </div>
        </div>

      </form>
    </div>
  );
};

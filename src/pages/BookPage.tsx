import React, { useState, useMemo, useEffect } from 'react';
import { PageId, BookingFormData, BookingConfirmation } from '../types';
import {
  saveBooking,
  fetchBlockedDates,
  fetchSystemSettings,
  BlockedDateItem,
  SystemSettings,
  DEFAULT_SETTINGS
} from '../data/bookingStorage';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Ban
} from 'lucide-react';

interface BookPageProps {
  onNavigate: (page: PageId) => void;
  onBookingComplete: (confirmation: BookingConfirmation) => void;
  savedPairingsCount: number;
}

export const BookPage: React.FC<BookPageProps> = ({ onBookingComplete, savedPairingsCount }) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [formData, setFormData] = useState<BookingFormData>({
    date: todayStr,
    timeSlot: '19:00',
    guests: 2,
    seatingArea: 'Vault Dining',
    name: '',
    email: '',
    phone: '',
    dietaryNotes: '',
    specialOccasion: 'None / Casual Aperitivo'
  });

  const [slotCategory, setSlotCategory] = useState<'all' | 'aperitivo' | 'dinner' | 'late-night'>('all');
  const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);
  const [, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedDates().then((dates) => {
      if (dates) setBlockedDates(dates);
    });
    fetchSystemSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  // Day of week check for Wednesday (3) to Saturday (6) opening schedule
  const selectedDayOfWeek = useMemo(() => {
    if (!formData.date) return -1;
    const dateObj = new Date(formData.date + 'T00:00:00');
    return dateObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  }, [formData.date]);

  const isClosedDay = useMemo(() => {
    // Open Wednesday (3), Thursday (4), Friday (5), Saturday (6)
    // Closed Sunday (0), Monday (1), Tuesday (2)
    return selectedDayOfWeek === 0 || selectedDayOfWeek === 1 || selectedDayOfWeek === 2;
  }, [selectedDayOfWeek]);

  // Check if selected date is blocked in database
  const selectedDateBlock = useMemo(() => {
    return blockedDates.find((b) => b.blocked_date === formData.date);
  }, [blockedDates, formData.date]);

  const isSelectedDateBlocked = useMemo(() => {
    if (!selectedDateBlock) return false;
    if (selectedDateBlock.is_full_day === 1 || selectedDateBlock.is_full_day === true) return true;
    if (selectedDateBlock.start_time && selectedDateBlock.end_time) {
      const match = formData.timeSlot.match(/(\d{2}):(\d{2})/);
      if (match) {
        const slotTime = `${match[1]}:${match[2]}`;
        if (slotTime >= selectedDateBlock.start_time && slotTime <= selectedDateBlock.end_time) {
          return true;
        }
      }
    }
    return false;
  }, [selectedDateBlock, formData.timeSlot]);

  // Clean time slots - opening hours Wednesday to Saturday from 17:00 to 03:00
  const allTimeSlots = [
    { slot: '17:00', cat: 'aperitivo' },
    { slot: '17:30', cat: 'aperitivo' },
    { slot: '18:00', cat: 'aperitivo' },
    { slot: '18:30', cat: 'aperitivo' },
    { slot: '19:00', cat: 'dinner' },
    { slot: '19:30', cat: 'dinner' },
    { slot: '20:00', cat: 'dinner' },
    { slot: '20:30', cat: 'dinner' },
    { slot: '21:00', cat: 'dinner' },
    { slot: '21:30', cat: 'dinner' },
    { slot: '22:00', cat: 'dinner' },
    { slot: '22:30', cat: 'dinner' },
    { slot: '23:00', cat: 'late-night' },
    { slot: '23:30', cat: 'late-night' },
    { slot: '00:00', cat: 'late-night' },
    { slot: '00:30', cat: 'late-night' },
    { slot: '01:00', cat: 'late-night' },
    { slot: '01:30', cat: 'late-night' },
    { slot: '02:00', cat: 'late-night' },
  ];

  const filteredSlots = useMemo(() => {
    if (slotCategory === 'all') return allTimeSlots;
    return allTimeSlots.filter((ts) => ts.cat === slotCategory);
  }, [slotCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name || !formData.email || !formData.phone) return;

    if (isClosedDay) {
      setErrorMessage('AMICA SOHO is closed on the selected date. Opening times are Wednesday to Saturday from 5:00 PM to 3:00 AM.');
      return;
    }

    if (isSelectedDateBlocked) {
      setErrorMessage(`This date/time is unavailable due to: ${selectedDateBlock?.reason || 'Private Event'}. Please choose another date.`);
      return;
    }

    const bookingId = 'AMICA-' + Math.floor(100000 + Math.random() * 900000);
    let tableNumber = 'Vault Booth 02';
    if (formData.guests >= 13) tableNumber = 'Grand Vault Suite';
    else if (formData.guests >= 7) tableNumber = 'Feasting Table 01';

    const confirmation: BookingConfirmation = {
      bookingId,
      formData: {
        ...formData,
        seatingArea: 'Vault Dining'
      },
      createdAt: new Date().toISOString(),
      qrCodeValue: `AMICA-SOHO-${bookingId}-${formData.date}-${formData.guests}PAX`,
      status: 'Confirmed',
      tableNumber
    };

    // Save to database
    saveBooking(confirmation);
    onBookingComplete(confirmation);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Page Title Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#200A0E] border border-[#DFBE7B]/50 shadow-[0_0_20px_rgba(223,190,123,0.15)] text-[#DFBE7B] text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#DFBE7B]" />
          <span>Opening Times: Wednesday to Saturday · 5:00 PM to 3:00 AM</span>
        </div>

        <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl md:text-6xl text-[#FDFBF7] tracking-wider font-light">
          Reserve a Table at <span className="text-[#E8CCA0]">AMICA SOHO</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#DFBE7B]/85 max-w-2xl mx-auto leading-relaxed font-sans">
          Online table reservations for <strong>1 to 20 guests</strong>.
          Opening hours are <strong>Wednesday to Saturday from 5:00 PM to 3:00 AM (17:00 – 03:00)</strong>.
        </p>

        {/* Schedule Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
          <div className="bg-[#140306]/90 border border-[#DFBE7B]/30 rounded-lg p-3.5 flex items-start gap-3 shadow-md">
            <Clock className="w-4 h-4 text-[#DFBE7B] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#DFBE7B] font-bold block">
                Operating Schedule
              </span>
              <p className="text-xs text-[#FDFBF7] font-medium mt-0.5">
                Wednesday to Saturday: 5:00 PM – 3:00 AM
              </p>
              <p className="text-[10px] text-[#DFBE7B]/70 mt-0.5">
                Closed Sunday, Monday & Tuesday
              </p>
            </div>
          </div>

          <div className="bg-[#140306]/90 border border-[#DFBE7B]/30 rounded-lg p-3.5 flex items-start gap-3 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-[#DFBE7B] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#DFBE7B] font-bold block">
                Party Capacity
              </span>
              <p className="text-xs text-[#FDFBF7] font-medium mt-0.5">
                1 to 20 Guests (Pax)
              </p>
              <p className="text-[10px] text-[#DFBE7B]/70 mt-0.5">
                Table reserved upon request
              </p>
            </div>
          </div>
        </div>

        {savedPairingsCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#200A0E] border border-[#C5A059] text-[#DFBE7B] text-xs rounded-full">
            <span>You have {savedPairingsCount} saved menu pairing{savedPairingsCount > 1 ? 's' : ''} attached to your session!</span>
          </div>
        )}
      </div>

      {/* Main Reservation Form Card */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border border-[#DFBE7B]/40 rounded-2xl p-5 sm:p-9 shadow-2xl space-y-9 relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#DFBE7B]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-950/90 border-2 border-red-500 text-red-200 p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
            <span className="text-[10px] font-sans tracking-[0.16em] uppercase text-[#DFBE7B] font-semibold">
              Select Guests
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
                    onClick={() => setFormData({ ...formData, guests: num })}
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

            <div className="bg-[#200A0E]/80 border border-[#DFBE7B]/30 rounded-lg p-3 flex items-center gap-2.5 text-xs text-[#FFEAA7] font-sans">
              <Users className="w-4 h-4 text-[#DFBE7B] shrink-0" />
              <span>
                {formData.guests === 1
                  ? 'Solo Guest: Intimate seating reserved.'
                  : formData.guests <= 6
                  ? 'Small Group: Reserved table in the vault.'
                  : 'Large Group: Feasting suite allocated for your party.'}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: RESERVATION DATE (WEDNESDAY TO SATURDAY)
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFBE7B]/20 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">2</span>
              <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
                Reservation Date
              </h3>
            </div>
            <span className="text-[10px] font-sans tracking-[0.16em] uppercase text-[#DFBE7B]">
              Open Wed – Sat (5pm – 3am)
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
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setErrorMessage(null);
                  }}
                  className="w-full px-4 py-3 bg-[#0D0204] border border-[#DFBE7B]/40 rounded-lg text-sm text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans cursor-pointer"
                  required
                />
              </div>
            </div>

            <div className="bg-[#140306]/60 border border-[#DFBE7B]/20 rounded-lg p-3.5 flex flex-col justify-center text-xs text-[#DFBE7B]/80 font-sans space-y-1">
              <div className="flex items-center gap-1.5 text-[#FDFBF7] font-semibold">
                <CalendarIcon className="w-4 h-4 text-[#DFBE7B]" />
                <span>Operating Schedule:</span>
              </div>
              <p>• Wednesday to Saturday: 5:00 PM – 3:00 AM</p>
              <p>• Closed: Sunday, Monday, Tuesday</p>
            </div>
          </div>

          {/* Closed Day Notice */}
          {isClosedDay && (
            <div className="bg-[#2D0911] border-2 border-amber-500/60 rounded-xl p-4 text-xs font-sans space-y-1 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Ban className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Venue Closed on Selected Date</span>
              </div>
              <p className="text-[#FDFBF7] text-xs leading-relaxed">
                AMICA SOHO is only open from <strong>Wednesday to Saturday (5:00 PM to 3:00 AM)</strong>. Please select a Wednesday, Thursday, Friday, or Saturday.
              </p>
            </div>
          )}

          {/* Blocked Date / Private Buyout Warning */}
          {selectedDateBlock && (
            <div className="bg-[#2D0911] border-2 border-red-500/60 rounded-xl p-4 text-xs font-sans space-y-2 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                  <Ban className="w-4 h-4 shrink-0 text-red-400" />
                  <span>Date Blocked: {selectedDateBlock.reason}</span>
                </div>
                <span className="text-[10px] bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40 text-red-300 font-mono">
                  {selectedDateBlock.is_full_day ? 'Full Day Closed' : `${selectedDateBlock.start_time} - ${selectedDateBlock.end_time}`}
                </span>
              </div>
              <p className="text-[#FDFBF7] text-xs leading-relaxed">
                {selectedDateBlock.notes || 'This evening is unavailable for reservations.'}
              </p>
            </div>
          )}
        </div>

        {/* =========================================================================
            STEP 3: TIME SLOT (5:00 PM TO 3:00 AM)
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
                { id: 'all', label: 'All' },
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredSlots.map((ts) => {
              const isSelected = formData.timeSlot === ts.slot;
              return (
                <button
                  key={ts.slot}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeSlot: ts.slot })}
                  className={`py-3 px-4 rounded-lg border text-center transition-all cursor-pointer font-['Cinzel',serif] text-sm sm:text-base font-semibold ${
                    isSelected
                      ? 'bg-[#2A080F] border-[#DFBE7B] text-[#FFEAA7] shadow-[0_0_15px_rgba(223,190,123,0.3)] ring-1 ring-[#DFBE7B]'
                      : 'bg-[#0D0204]/90 border-[#DFBE7B]/25 text-[#FDFBF7] hover:border-[#DFBE7B]/60 hover:bg-[#1A0509]'
                  }`}
                >
                  {ts.slot}
                </button>
              );
            })}
          </div>

          <div className="bg-[#140306] border border-[#DFBE7B]/20 rounded p-2.5 flex items-center gap-2 text-[11px] text-[#DFBE7B]/80 font-sans">
            <Info className="w-3.5 h-3.5 text-[#DFBE7B] shrink-0" />
            <span>
              Opening times are <strong>Wednesday to Saturday, 5:00 PM to 3:00 AM</strong>.
            </span>
          </div>
        </div>

        {/* =========================================================================
            STEP 4: GUEST CONTACT & DETAILS
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#DFBE7B]/20 pb-3">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">4</span>
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
                Email Address *
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
                Mobile Phone *
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
              Dietary Requirements / Special Requests
            </label>
            <input
              type="text"
              placeholder="e.g. 2 Vegan guests, 1 Nut allergy..."
              value={formData.dietaryNotes}
              onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
              className="w-full px-3.5 py-3 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
            />
          </div>
        </div>

        {/* =========================================================================
            SUBMIT CTA: RESERVE ONLY
           ========================================================================= */}
        <div className="pt-4 border-t border-[#DFBE7B]/25 space-y-4">
          <div className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isClosedDay || isSelectedDateBlocked
              ? 'bg-[#2D0911] border-red-500/50'
              : 'bg-[#1A0509] border-[#DFBE7B]/40'
          }`}>
            <div className="space-y-0.5 font-sans">
              {isClosedDay ? (
                <>
                  <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-amber-400" />
                    Venue Closed on Selected Date
                  </span>
                  <p className="text-[#FDFBF7]/90 text-[11px]">
                    Open Wednesday to Saturday from 5:00 PM to 3:00 AM.
                  </p>
                </>
              ) : isSelectedDateBlocked ? (
                <>
                  <span className="text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-red-400" />
                    Date Unavailable: {selectedDateBlock?.reason || 'Private Event'}
                  </span>
                  <p className="text-[#FDFBF7]/90 text-[11px]">
                    Online table bookings closed for {formData.date}. Please select another date.
                  </p>
                </>
              ) : (
                <>
                  <span className="text-[#DFBE7B] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#DFBE7B]" />
                    Reservation Summary
                  </span>
                  <p className="text-[#FDFBF7]/90 text-[11px]">
                    {formData.date} · {formData.timeSlot} · {formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isClosedDay || isSelectedDateBlocked}
            className={`w-full py-4 px-6 rounded-lg font-sans font-bold text-xs sm:text-sm tracking-[0.24em] uppercase transition-all duration-200 flex items-center justify-center gap-2.5 ${
              isClosedDay || isSelectedDateBlocked
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#C5A059] via-[#DFBE7B] to-[#C5A059] hover:from-[#DFBE7B] hover:via-[#FFEAA7] hover:to-[#DFBE7B] text-[#120205] cursor-pointer shadow-[0_6px_24px_rgba(197,160,89,0.35)] active:scale-[0.99]'
            }`}
          >
            {isClosedDay ? (
              <>
                <Ban className="w-4 h-4" />
                <span>Closed on Selected Date · Open Wed – Sat</span>
              </>
            ) : isSelectedDateBlocked ? (
              <>
                <Ban className="w-4 h-4" />
                <span>Date Blocked ({selectedDateBlock?.reason || 'Unavailable'})</span>
              </>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4" />
                <span>Reserve Only</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 text-[10px] text-[#DFBE7B]/70 font-sans text-center">
            <span className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFBE7B]" />
              No deposit required for reservations
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Open Wednesday to Saturday (5:00 PM to 3:00 AM)</span>
          </div>
        </div>

      </form>
    </div>
  );
};

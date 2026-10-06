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
  AlertCircle,
  ArrowRight,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck
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
    specialOccasion: 'Casual Dining & Drinks'
  });

  const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);
  const [, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Pop-Up Date Picker State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<Date>(() => new Date(formData.date + 'T00:00:00'));

  useEffect(() => {
    fetchBlockedDates().then((dates) => {
      if (dates) setBlockedDates(dates);
    });
    fetchSystemSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  // Formatted selected date display
  const formattedSelectedDate = useMemo(() => {
    if (!formData.date) return 'Select Date';
    const d = new Date(formData.date + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [formData.date]);

  // Day of week check: Open Wednesday (3), Thursday (4), Friday (5), Saturday (6). Closed Sun (0), Mon (1), Tue (2).
  const selectedDayOfWeek = useMemo(() => {
    if (!formData.date) return -1;
    const dateObj = new Date(formData.date + 'T00:00:00');
    return dateObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  }, [formData.date]);

  const isClosedDay = useMemo(() => {
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
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30',
    '01:00', '01:30', '02:00'
  ];

  // Calendar Grid Calculation for Pop-up Picker
  const pickerDays = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(year, month - 1, pDay);
      const y = pDate.getFullYear();
      const m = String(pDate.getMonth() + 1).padStart(2, '0');
      const d = String(pDay).padStart(2, '0');
      days.push({
        dayNumber: pDay,
        dateStr: `${y}-${m}-${d}`,
        isCurrentMonth: false,
        dayOfWeek: pDate.getDay()
      });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const cDate = new Date(year, month, d);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        dayNumber: d,
        dateStr: `${year}-${mStr}-${dStr}`,
        isCurrentMonth: true,
        dayOfWeek: cDate.getDay()
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nDate = new Date(year, month + 1, n);
      const y = nDate.getFullYear();
      const m = String(nDate.getMonth() + 1).padStart(2, '0');
      const d = String(n).padStart(2, '0');
      days.push({
        dayNumber: n,
        dateStr: `${y}-${m}-${d}`,
        isCurrentMonth: false,
        dayOfWeek: nDate.getDay()
      });
    }

    return days;
  }, [pickerMonth]);

  const monthYearHeader = useMemo(() => {
    return pickerMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [pickerMonth]);

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

    const confirmation: BookingConfirmation = {
      bookingId,
      formData: {
        ...formData,
        seatingArea: 'Vault Dining'
      },
      createdAt: new Date().toISOString(),
      qrCodeValue: `AMICA-SOHO-${bookingId}-${formData.date}-${formData.guests}PAX`,
      status: 'Confirmed'
    };

    // Save to database
    saveBooking(confirmation).then((saved) => {
      onBookingComplete(saved || confirmation);
    }).catch(() => {
      onBookingComplete(confirmation);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
      
      {/* Compact Header with H1 Fade-In */}
      <div className="text-center space-y-1">
        <h1 className="font-['Cinzel',serif] text-2xl sm:text-4xl text-[#FDFBF7] tracking-wider font-light animate-hero-fade-in">
          Reserve a Table at <span className="text-[#E8CCA0]">AMICA SOHO</span>
        </h1>
        <p className="text-xs text-[#DFBE7B]/85 font-sans">
          Wednesday – Saturday · 5:00 PM – 3:00 AM
        </p>

        {savedPairingsCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-[#200A0E] border border-[#C5A059] text-[#DFBE7B] text-xs rounded-full mt-1">
            <span>You have {savedPairingsCount} saved menu pairing{savedPairingsCount > 1 ? 's' : ''} attached to your session</span>
          </div>
        )}
      </div>

      {/* Main Form starting directly with Date, Time, and Guests */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border border-[#DFBE7B]/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#DFBE7B]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-950/90 border-2 border-red-500 text-red-200 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =========================================================================
            1. RESERVATION DATE (POPUP PICKER - NO TEXT IN CELLS)
           ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-[#DFBE7B]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">1</span>
            <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
              Select Date
            </h3>
          </div>

          <div>
            <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
              Date *
            </label>

            {/* Custom Pop-up Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setPickerMonth(new Date(formData.date + 'T00:00:00'));
                setIsDatePickerOpen(true);
              }}
              className="w-full px-4 py-3 bg-[#0D0204] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] rounded-lg text-sm sm:text-base text-[#FFEAA7] focus:outline-none focus:border-[#DFBE7B] font-['Cinzel',serif] font-semibold flex items-center justify-between shadow-inner cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-[#DFBE7B]" />
                <span>{formattedSelectedDate}</span>
              </div>
              <span className="text-[10px] font-sans px-2.5 py-1 rounded bg-[#200A0E] border border-[#DFBE7B]/30 text-[#DFBE7B] uppercase tracking-wider font-bold">
                Change Date ▾
              </span>
            </button>

            <input type="hidden" name="date" value={formData.date} />
          </div>

          {/* Closed Day Notice */}
          {isClosedDay && (
            <div className="bg-[#2D0911] border border-amber-500/60 rounded-xl p-3 text-xs font-sans space-y-0.5 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Ban className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Venue Closed on Selected Date</span>
              </div>
              <p className="text-[#FDFBF7] text-xs leading-relaxed">
                AMICA SOHO is open Wednesday to Saturday (5:00 PM to 3:00 AM). Please select a Wednesday, Thursday, Friday, or Saturday.
              </p>
            </div>
          )}

          {/* Blocked Date Warning */}
          {selectedDateBlock && (
            <div className="bg-[#2D0911] border border-red-500/60 rounded-xl p-3 text-xs font-sans space-y-0.5 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                  <Ban className="w-4 h-4 shrink-0 text-red-400" />
                  <span>Date Blocked: {selectedDateBlock.reason}</span>
                </div>
              </div>
              <p className="text-[#FDFBF7] text-xs leading-relaxed">
                {selectedDateBlock.notes || 'This evening is unavailable for reservations.'}
              </p>
            </div>
          )}
        </div>

        {/* =========================================================================
            CUSTOM DATE POP-UP PICKER MODAL (NO TEXT IN DAY CELLS)
           ========================================================================= */}
        {isDatePickerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDatePickerOpen(false);
            }}
          >
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#1C0409] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-2xl p-5 text-[#FDFBF7] shadow-2xl space-y-4">
              
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DFBE7B] via-[#C5A059] to-[#DFBE7B] rounded-t-2xl" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#200A0E] border border-[#DFBE7B]/30 hover:border-[#DFBE7B] text-[#DFBE7B] hover:text-[#FFEAA7] cursor-pointer transition-colors"
                aria-label="Close date picker"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Title */}
              <div className="text-center pr-6">
                <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#DFBE7B] font-bold block mb-0.5">
                  AMICA SOHO
                </span>
                <h3 className="font-['Cinzel',serif] text-xl text-[#FFEAA7]">
                  Select Reservation Date
                </h3>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-[#140306] border border-[#DFBE7B]/30 rounded-xl p-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));
                  }}
                  className="p-2 text-[#DFBE7B] hover:text-[#FFEAA7] hover:bg-[#200A0E] rounded-lg cursor-pointer transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-['Cinzel',serif] text-sm font-semibold text-[#FFEAA7] tracking-wider">
                  {monthYearHeader}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
                  }}
                  className="p-2 text-[#DFBE7B] hover:text-[#FFEAA7] hover:bg-[#200A0E] rounded-lg cursor-pointer transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-sans text-[10px] font-bold uppercase tracking-wider text-[#DFBE7B] border-b border-[#DFBE7B]/20 pb-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Days Grid - CLEAN NUMBER CELLS ONLY (NO TEXT IN CELLS) */}
              <div className="grid grid-cols-7 gap-1.5">
                {pickerDays.map((cell, idx) => {
                  const isSelected = cell.dateStr === formData.date;
                  const isPast = cell.dateStr < todayStr;
                  const isClosedSchedule = cell.dayOfWeek === 0 || cell.dayOfWeek === 1 || cell.dayOfWeek === 2; // Closed Sun, Mon, Tue
                  const isBlocked = blockedDates.some((b) => b.blocked_date === cell.dateStr);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPast || isBlocked || isClosedSchedule}
                      onClick={() => {
                        setFormData({ ...formData, date: cell.dateStr });
                        setErrorMessage(null);
                        setIsDatePickerOpen(false);
                      }}
                      className={`h-11 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#C5A059] via-[#DFBE7B] to-[#C5A059] text-[#120205] border-[#FFEAA7] font-bold shadow-[0_0_15px_rgba(223,190,123,0.5)] scale-105 z-10'
                          : isPast
                          ? 'bg-[#0A0103]/40 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-30'
                          : isBlocked
                          ? 'bg-[#2D0911] border-red-500/60 text-red-300 opacity-60 cursor-not-allowed'
                          : isClosedSchedule
                          ? 'bg-[#0A0103]/60 border-[#DFBE7B]/10 text-[#DFBE7B]/30 cursor-not-allowed opacity-40'
                          : 'bg-[#180307] border-[#DFBE7B]/30 hover:border-[#DFBE7B] text-[#FDFBF7] hover:bg-[#200A0E]'
                      }`}
                    >
                      <span className="font-mono text-sm font-bold">
                        {cell.dayNumber}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-2 border-t border-[#DFBE7B]/20 flex items-center justify-between text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, date: todayStr });
                    setPickerMonth(new Date());
                    setErrorMessage(null);
                    setIsDatePickerOpen(false);
                  }}
                  className="px-3 py-1.5 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs uppercase tracking-wider cursor-pointer"
                >
                  Select Today
                </button>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="px-4 py-1.5 rounded bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Confirm Date
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            2. TIME SLOT DROPDOWN
           ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-[#DFBE7B]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">2</span>
            <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
              Select Time
            </h3>
          </div>

          <div>
            <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
              Time Slot *
            </label>
            <div className="relative">
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-4 py-3 bg-[#0D0204] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] rounded-lg text-sm sm:text-base text-[#FFEAA7] focus:outline-none focus:border-[#DFBE7B] font-['Cinzel',serif] font-semibold appearance-none cursor-pointer shadow-inner transition-all pr-10"
              >
                {allTimeSlots.map((slot) => (
                  <option key={slot} value={slot} className="bg-[#120205] text-[#FFEAA7]">
                    {slot}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#DFBE7B]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. GUESTS DROPDOWN (1 TO 20 PAX)
           ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-[#DFBE7B]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">3</span>
            <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
              Select Guests
            </h3>
          </div>

          <div>
            <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
              Number of Guests *
            </label>
            <div className="relative">
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#0D0204] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] rounded-lg text-sm sm:text-base text-[#FFEAA7] focus:outline-none focus:border-[#DFBE7B] font-['Cinzel',serif] font-semibold appearance-none cursor-pointer shadow-inner transition-all pr-10"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num} className="bg-[#120205] text-[#FFEAA7]">
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#DFBE7B]">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. GUEST CONTACT & OCCASION
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#DFBE7B]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#DFBE7B] text-[#120205] text-xs font-bold font-sans flex items-center justify-center">4</span>
            <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-[#FDFBF7] tracking-wider">
              Guest Contact & Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
                Lead Guest Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Sofia Loren"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="sofia@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
                Mobile Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+44 7987 654321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
                Special Occasion
              </label>
              <select
                value={formData.specialOccasion}
                onChange={(e) => setFormData({ ...formData, specialOccasion: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans cursor-pointer"
              >
                <option value="Casual Dining & Drinks" className="bg-[#120205] text-[#FFEAA7]">Casual Dining & Drinks</option>
                <option value="Birthday Celebration" className="bg-[#120205] text-[#FFEAA7]">Birthday Celebration</option>
                <option value="Anniversary / Date Night" className="bg-[#120205] text-[#FFEAA7]">Anniversary / Date Night</option>
                <option value="Group Celebration (Feasting)" className="bg-[#120205] text-[#FFEAA7]">Group Celebration / Party (1–20 Pax)</option>
                <option value="Corporate / Client Entertaining" className="bg-[#120205] text-[#FFEAA7]">Corporate / Client Entertaining</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans text-[#DFBE7B] uppercase tracking-wider mb-1 font-semibold">
              Dietary Requirements / Special Requests
            </label>
            <input
              type="text"
              placeholder="e.g. 2 Vegan guests, 1 Nut allergy..."
              value={formData.dietaryNotes}
              onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 focus:outline-none focus:border-[#DFBE7B] font-sans"
            />
          </div>
        </div>

        {/* =========================================================================
            SUBMIT CTA
           ========================================================================= */}
        <div className="pt-2 border-t border-[#DFBE7B]/25 space-y-3">
          <div className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
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
            className={`w-full py-3.5 px-6 rounded-lg font-sans font-bold text-xs sm:text-sm tracking-[0.24em] uppercase transition-all duration-200 flex items-center justify-center gap-2.5 ${
              isClosedDay || isSelectedDateBlocked
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#C5A059] via-[#DFBE7B] to-[#C5A059] hover:from-[#DFBE7B] hover:via-[#FFEAA7] hover:to-[#DFBE7B] text-[#120205] cursor-pointer shadow-[0_6px_24px_rgba(197,160,89,0.35)] active:scale-[0.99]'
            }`}
          >
            {isClosedDay ? (
              <>
                <Ban className="w-4 h-4" />
                <span>Closed on Selected Date</span>
              </>
            ) : isSelectedDateBlocked ? (
              <>
                <Ban className="w-4 h-4" />
                <span>Date Blocked ({selectedDateBlock?.reason || 'Unavailable'})</span>
              </>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4" />
                <span>Reserve Table</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1 text-[10px] text-[#DFBE7B]/70 font-sans text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#DFBE7B]" />
            <span>No deposit required for reservations</span>
          </div>
        </div>

      </form>
    </div>
  );
};

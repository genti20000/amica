import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Ban,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BookingConfirmation } from '../types';
import { BlockedDateItem } from '../data/bookingStorage';

interface AdminCalendarViewProps {
  bookings: BookingConfirmation[];
  blockedDates: BlockedDateItem[];
  onSelectBooking: (booking: BookingConfirmation) => void;
  onAddBookingForDate: (dateStr: string) => void;
  onBlockDate: (dateStr: string) => void;
}

export const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  bookings,
  blockedDates,
  onSelectBooking,
  onAddBookingForDate,
  onBlockDate
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Time slots for Day View timeline
  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
    '23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00'
  ];

  // Helper date navigation
  const navigateDate = (amount: number) => {
    const newD = new Date(currentDate);
    if (viewMode === 'day') {
      newD.setDate(newD.getDate() + amount);
    } else if (viewMode === 'week') {
      newD.setDate(newD.getDate() + amount * 7);
    } else if (viewMode === 'month') {
      newD.setMonth(newD.getMonth() + amount);
    }
    setCurrentDate(newD);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Date strings for current view
  const currentDateStr = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  // Week Days calculation (Monday through Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    let dayOfWeek = curr.getDay() - 1; // 0 = Mon, 6 = Sun
    if (dayOfWeek === -1) dayOfWeek = 6;

    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dateNum}`;
      const dow = d.getDay(); // 0 = Sun, 1 = Mon, ...

      days.push({
        dateObj: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        isClosedSchedule: dow === 0 || dow === 1 || dow === 2, // Closed Sun, Mon, Tue
        isToday: dateStr === todayStr
      });
    }
    return days;
  }, [currentDate, todayStr]);

  // Month Days calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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
  }, [currentDate]);

  // Day view bookings for selected date
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => b.formData.date === currentDateStr);
  }, [bookings, currentDateStr]);

  const dayBlock = useMemo(() => {
    return blockedDates.find((b) => b.blocked_date === currentDateStr);
  }, [blockedDates, currentDateStr]);

  const dayTotalCovers = useMemo(() => {
    return dayBookings.reduce((acc, b) => acc + (b.formData.guests || 0), 0);
  }, [dayBookings]);

  return (
    <div className="bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border border-[#DFBE7B]/30 rounded-2xl p-4 sm:p-7 shadow-2xl space-y-6">
      
      {/* Top Header: View Mode Switcher & Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFBE7B]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#DFBE7B]" />
            <h3 className="font-['Cinzel',serif] text-xl text-[#FDFBF7] font-semibold tracking-wider">
              Maître D’ Calendar Dashboard
            </h3>
          </div>
          <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
            Real-time visual schedule view across Day, Week, and Month views.
          </p>
        </div>

        {/* View Switcher Buttons & Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week / Month Mode Toggle */}
          <div className="flex items-center bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg p-1 text-xs font-sans uppercase font-bold tracking-wider">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  viewMode === m
                    ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] shadow-md'
                    : 'text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#200A0E]'
                }`}
              >
                {m === 'day' ? 'Day View' : m === 'week' ? 'Week View' : 'Month View'}
              </button>
            ))}
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs font-sans uppercase tracking-wider cursor-pointer"
            >
              Today
            </button>

            <div className="flex items-center bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg p-1 text-xs">
              <button
                onClick={() => navigateDate(-1)}
                className="p-1.5 text-[#DFBE7B] hover:text-[#FFEAA7] hover:bg-[#200A0E] rounded cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-['Cinzel',serif] text-xs sm:text-sm font-semibold text-[#FFEAA7] px-3 min-w-[140px] text-center">
                {viewMode === 'day' && currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {viewMode === 'week' && `Week of ${weekDays[0]?.formattedDate} – ${weekDays[6]?.formattedDate}`}
                {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>

              <button
                onClick={() => navigateDate(1)}
                className="p-1.5 text-[#DFBE7B] hover:text-[#FFEAA7] hover:bg-[#200A0E] rounded cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: DAY VIEW (TIMELINE & SLOTS)
         ========================================================================= */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Header Summary */}
          <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel',serif] text-base font-bold text-[#FFEAA7]">
                  {currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {currentDateStr === todayStr && (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Today
                  </span>
                )}
              </div>
              <p className="text-[#DFBE7B]/80 text-[11px]">
                Schedule: {dayBlock ? `🔴 Blocked (${dayBlock.reason})` : 'Wed–Sat Open Hours (17:00 – 03:00)'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#200A0E] px-3 py-1.5 rounded border border-[#DFBE7B]/30 text-center">
                <span className="text-[10px] uppercase text-[#DFBE7B]/70 block">Bookings</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{dayBookings.length}</span>
              </div>
              <div className="bg-[#200A0E] px-3 py-1.5 rounded border border-[#DFBE7B]/30 text-center">
                <span className="text-[10px] uppercase text-[#DFBE7B]/70 block">Total Pax</span>
                <span className="font-mono font-bold text-[#FFEAA7] text-sm">{dayTotalCovers} Pax</span>
              </div>

              <button
                onClick={() => onAddBookingForDate(currentDateStr)}
                className="px-3.5 py-2 rounded bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Res</span>
              </button>
            </div>
          </div>

          {/* Timeline Slots */}
          <div className="space-y-2">
            {timeSlots.map((time) => {
              const slotBookings = dayBookings.filter((b) => b.formData.timeSlot.includes(time));

              return (
                <div
                  key={time}
                  className="bg-[#0D0204]/90 border border-[#DFBE7B]/20 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:border-[#DFBE7B]/50 transition-colors"
                >
                  {/* Time Badge */}
                  <div className="w-20 shrink-0 font-['Cinzel',serif] text-sm font-bold text-[#E8CCA0] bg-[#1F070C] p-2 rounded border border-[#DFBE7B]/30 text-center">
                    {time}
                  </div>

                  {/* Bookings in slot */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {slotBookings.length === 0 ? (
                      <div className="text-[11px] text-[#DFBE7B]/40 font-sans italic py-1">
                        No reservations at {time}
                      </div>
                    ) : (
                      slotBookings.map((b) => (
                        <div
                          key={b.bookingId}
                          onClick={() => onSelectBooking(b)}
                          className="bg-[#200A0E] hover:bg-[#2A080F] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] rounded-lg p-2.5 transition-all cursor-pointer shadow-md space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#FDFBF7] truncate">{b.formData.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded border border-emerald-500/30">
                              {b.formData.guests} Pax
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#DFBE7B]/80">
                            <span className="truncate max-w-[130px]">{b.formData.specialOccasion || 'Casual Dining'}</span>
                            <span className="text-emerald-400 font-semibold">{b.status || 'Confirmed'}</span>
                          </div>

                          {b.formData.phone && (
                            <span className="text-[9px] font-mono text-[#DFBE7B]/60 block truncate">
                              {b.formData.phone}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: WEEK VIEW (7 COLUMNS)
         ========================================================================= */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayBookings = bookings.filter((b) => b.formData.date === day.dateStr);
            const totalCovers = dayBookings.reduce((acc, b) => acc + (b.formData.guests || 0), 0);
            const block = blockedDates.find((b) => b.blocked_date === day.dateStr);

            return (
              <div
                key={day.dateStr}
                className={`rounded-xl border p-3 min-h-[380px] flex flex-col justify-between transition-all ${
                  block
                    ? 'bg-[#2D0911]/90 border-red-500/60'
                    : day.isToday
                    ? 'bg-[#2A080F] border-[#DFBE7B] shadow-[0_0_15px_rgba(223,190,123,0.2)]'
                    : day.isClosedSchedule
                    ? 'bg-[#0D0204]/60 border-[#DFBE7B]/15'
                    : 'bg-[#140306] border-[#DFBE7B]/25 hover:border-[#DFBE7B]/50'
                }`}
              >
                {/* Column Header */}
                <div className="border-b border-[#DFBE7B]/20 pb-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel',serif] text-xs font-bold uppercase tracking-wider text-[#E8CCA0]">
                      {day.dayName}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      day.isToday
                        ? 'bg-[#DFBE7B] text-[#120205]'
                        : 'bg-[#200A0E] text-[#DFBE7B]'
                    }`}>
                      {day.formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-sans">
                    <span className={block ? 'text-red-400 font-bold' : day.isClosedSchedule ? 'text-zinc-500' : 'text-emerald-400 font-semibold'}>
                      {block ? '🔴 Blocked' : day.isClosedSchedule ? 'Closed' : 'Open'}
                    </span>
                    <span className="text-[#FFEAA7] font-mono">
                      {dayBookings.length} Res ({totalCovers} Pax)
                    </span>
                  </div>
                </div>

                {/* Reservation Cards List */}
                <div className="my-2 space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-0.5">
                  {block ? (
                    <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-2.5 text-[10px] text-red-200 font-sans space-y-1">
                      <div className="flex items-center gap-1 font-bold text-red-300 uppercase">
                        <Ban className="w-3 h-3 text-red-400 shrink-0" />
                        <span>{block.reason}</span>
                      </div>
                      {block.notes && <p className="text-[#DFBE7B]/80 text-[9px]">{block.notes}</p>}
                    </div>
                  ) : dayBookings.length === 0 ? (
                    <div className="py-8 text-center text-[10px] text-[#DFBE7B]/40 font-sans italic">
                      No reservations
                    </div>
                  ) : (
                    dayBookings.map((b) => (
                      <div
                        key={b.bookingId}
                        onClick={() => onSelectBooking(b)}
                        className="bg-[#200A0E] hover:bg-[#2A080F] border border-[#DFBE7B]/30 hover:border-[#DFBE7B] rounded-lg p-2 transition-all cursor-pointer shadow space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-[#FDFBF7] truncate group-hover:text-[#FFEAA7]">
                            {b.formData.name}
                          </span>
                          <span className="text-[9px] font-mono bg-[#140306] px-1 py-0.2 rounded text-[#DFBE7B] font-bold">
                            {b.formData.timeSlot.split('–')[0]}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-[#DFBE7B]/80 font-sans">
                          <span>{b.formData.guests} Guests</span>
                          <span className="text-emerald-400">{b.status || 'Confirmed'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Column Footer Action */}
                <div className="pt-2 border-t border-[#DFBE7B]/15 flex items-center justify-between text-[10px]">
                  <button
                    onClick={() => onAddBookingForDate(day.dateStr)}
                    className="text-[#DFBE7B] hover:text-[#FFEAA7] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Book Date</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentDate(new Date(day.dateStr + 'T00:00:00'));
                      setViewMode('day');
                    }}
                    className="text-[#DFBE7B]/60 hover:text-[#DFBE7B] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Day View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: MONTH VIEW (GRID)
         ========================================================================= */}
      {viewMode === 'month' && (
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-[#DFBE7B] border-b border-[#DFBE7B]/20 pb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const dow = cell.dayOfWeek;
              const isClosedSchedule = dow === 0 || dow === 1 || dow === 2;

              const block = blockedDates.find((b) => b.blocked_date === cell.dateStr);
              const cellBookings = bookings.filter((b) => b.formData.date === cell.dateStr);
              const cellCovers = cellBookings.reduce((acc, b) => acc + (b.formData.guests || 0), 0);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(new Date(cell.dateStr + 'T00:00:00'));
                    setViewMode('day');
                  }}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    !cell.isCurrentMonth
                      ? 'bg-[#0A0103]/40 border-[#DFBE7B]/10 opacity-30 hover:opacity-70'
                      : block
                      ? 'bg-[#2D0911]/90 border-red-500/70 hover:border-red-400'
                      : isToday
                      ? 'bg-[#2A080F] border-[#DFBE7B] ring-2 ring-[#DFBE7B]/50'
                      : isClosedSchedule
                      ? 'bg-[#0D0204]/70 border-[#DFBE7B]/15 hover:border-[#DFBE7B]/40'
                      : 'bg-[#140306]/90 border-[#DFBE7B]/25 hover:border-[#DFBE7B]/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-bold font-mono ${
                      isToday ? 'text-[#FFEAA7] bg-[#DFBE7B]/20 px-1 rounded' : cell.isCurrentMonth ? 'text-[#FDFBF7]' : 'text-zinc-600'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {isToday && (
                      <span className="text-[9px] font-sans uppercase font-extrabold text-[#DFBE7B]">Today</span>
                    )}
                  </div>

                  <div className="space-y-1 my-1">
                    {block ? (
                      <div className="bg-red-950/80 border border-red-500/50 rounded px-1 py-0.5 text-[9px] text-red-200 truncate font-semibold">
                        🔴 {block.reason}
                      </div>
                    ) : cellBookings.length > 0 ? (
                      <div className="bg-emerald-950/90 border border-emerald-500/50 rounded px-1 py-0.5 text-[9px] text-emerald-300 font-bold flex items-center justify-between">
                        <span>{cellBookings.length} Res</span>
                        <span className="text-[#FFEAA7]">{cellCovers} Pax</span>
                      </div>
                    ) : isClosedSchedule ? (
                      <span className="text-[9px] text-zinc-500 block italic">Closed</span>
                    ) : (
                      <span className="text-[9px] text-emerald-400/80 block">Open</span>
                    )}
                  </div>

                  <div className="text-[9px] font-sans text-[#DFBE7B]/50 group-hover:text-[#FFEAA7] flex items-center justify-between pt-1 border-t border-[#DFBE7B]/10">
                    <span>{isClosedSchedule ? 'Wed-Sat' : '17:00-03:00'}</span>
                    <span className="font-bold text-[#DFBE7B]">Day →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

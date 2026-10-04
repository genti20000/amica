import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Ban,
  Calendar as CalendarIcon,
  Users,
  Plus,
  Unlock,
  Eye,
  Info,
  CheckCircle2
} from 'lucide-react';
import { BookingConfirmation } from '../types';
import { BlockedDateItem } from '../data/bookingStorage';

interface MonthlyCalendarWidgetProps {
  blockedDates: BlockedDateItem[];
  bookings: BookingConfirmation[];
  onBlockDate: (dateStr: string) => void;
  onUnblockDate: (id: number, dateStr: string) => void;
  onFilterByDate: (dateStr: string) => void;
}

export const MonthlyCalendarWidget: React.FC<MonthlyCalendarWidgetProps> = ({
  blockedDates,
  bookings,
  onBlockDate,
  onUnblockDate,
  onFilterByDate
}) => {
  // Current calendar month view (default to current month or October 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = useMemo(() => {
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Generate calendar grid days (Monday as first day of week)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();

    // Get day of week for 1st of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // convert so 0 = Mon, 6 = Sun
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Padding days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(year, month - 1, pDay);
      const dateStr = pDate.toISOString().split('T')[0];
      days.push({
        dayNumber: pDay,
        dateStr,
        isCurrentMonth: false,
        dayOfWeek: pDate.getDay()
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const cDate = new Date(year, month, d);
      // Format YYYY-MM-DD cleanly using local numbers
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        dayOfWeek: cDate.getDay()
      });
    }

    // Padding days for next month to complete grid (multiples of 7)
    const totalCells = days.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      const nDate = new Date(year, month + 1, n);
      const dateStr = nDate.toISOString().split('T')[0];
      days.push({
        dayNumber: n,
        dateStr,
        isCurrentMonth: false,
        dayOfWeek: nDate.getDay()
      });
    }

    return days;
  }, [year, month]);

  // Selected day details calculations
  const selectedDayInfo = useMemo(() => {
    if (!selectedDayDetail) return null;
    const dateObj = new Date(selectedDayDetail + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const isClosedSchedule = dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2;

    const block = blockedDates.find((b) => b.blocked_date === selectedDayDetail);
    const dayBookings = bookings.filter((b) => b.formData.date === selectedDayDetail);
    const totalCovers = dayBookings.reduce((acc, b) => acc + (b.formData.guests || 0), 0);

    return {
      dateStr: selectedDayDetail,
      formattedDate: dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
      isClosedSchedule,
      block,
      dayBookings,
      totalCovers
    };
  }, [selectedDayDetail, blockedDates, bookings]);

  return (
    <div className="bg-gradient-to-b from-[#180307] to-[#100204] border border-[#DFBE7B]/30 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFBE7B]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#DFBE7B]" />
            <h3 className="font-['Cinzel',serif] text-xl text-[#FDFBF7] font-semibold tracking-wider">
              Staff Availability & Blackout Calendar
            </h3>
          </div>
          <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
            Visual monthly schedule. Click any date to view bookings, block out private buyouts, or manage availability.
          </p>
        </div>

        {/* Month Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs font-sans uppercase tracking-wider cursor-pointer transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center bg-[#0D0204] border border-[#DFBE7B]/30 rounded-lg p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-[#DFBE7B] hover:text-[#FFEAA7] hover:bg-[#200A0E] rounded cursor-pointer transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-['Cinzel',serif] text-sm font-semibold text-[#FFEAA7] px-3 min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-[#DFBE7B] hover:text-[#FFEAA7] hover:bg-[#200A0E] rounded cursor-pointer transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-sans text-[#DFBE7B]/80 bg-[#140306] p-2.5 rounded-lg border border-[#DFBE7B]/20">
        <span className="font-bold text-[#FFEAA7] uppercase tracking-wider">Schedule Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400" />
          <span>Wed–Sat Open Hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600/90 border border-red-400" />
          <span>🔴 Blocked / Buyout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-300" />
          <span>🟢 Active Bookings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-zinc-700/80 border border-zinc-600" />
          <span>Closed Schedule (Sun–Tue)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-1">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 gap-1.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-[#DFBE7B] border-b border-[#DFBE7B]/20 pb-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const dayOfWeek = cell.dayOfWeek; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
            const isClosedSchedule = dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2;

            const block = blockedDates.find((b) => b.blocked_date === cell.dateStr);
            const dayBookings = bookings.filter((b) => b.formData.date === cell.dateStr);
            const totalCovers = dayBookings.reduce((acc, b) => acc + (b.formData.guests || 0), 0);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayDetail(cell.dateStr)}
                className={`min-h-[85px] sm:min-h-[100px] p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  !cell.isCurrentMonth
                    ? 'bg-[#0A0103]/40 border-[#DFBE7B]/10 opacity-30 hover:opacity-70'
                    : block
                    ? 'bg-[#2D0911]/90 border-red-500/70 hover:border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                    : isToday
                    ? 'bg-[#2A080F] border-[#DFBE7B] ring-2 ring-[#DFBE7B]/50'
                    : isClosedSchedule
                    ? 'bg-[#0D0204]/70 border-[#DFBE7B]/15 hover:border-[#DFBE7B]/40'
                    : 'bg-[#140306]/90 border-[#DFBE7B]/25 hover:border-[#DFBE7B]/70 hover:bg-[#1A0509]'
                }`}
              >
                {/* Top Row: Day number & Today pill */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      isToday
                        ? 'text-[#FFEAA7] bg-[#DFBE7B]/20 px-1.5 py-0.5 rounded border border-[#DFBE7B]/50'
                        : block
                        ? 'text-red-300'
                        : cell.isCurrentMonth
                        ? 'text-[#FDFBF7]'
                        : 'text-zinc-600'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {isToday && (
                    <span className="text-[9px] font-sans uppercase font-extrabold text-[#DFBE7B] bg-[#200A0E] px-1 rounded border border-[#DFBE7B]/40">
                      Today
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="space-y-1 my-1">
                  {block ? (
                    <div className="bg-red-950/80 border border-red-500/60 rounded px-1.5 py-1 text-[9px] text-red-200 font-sans font-semibold flex items-center gap-1">
                      <Ban className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">{block.reason}</span>
                    </div>
                  ) : dayBookings.length > 0 ? (
                    <div className="bg-emerald-950/90 border border-emerald-500/50 rounded px-1.5 py-1 text-[9px] text-emerald-300 font-sans font-bold flex items-center justify-between">
                      <span>{dayBookings.length} {dayBookings.length === 1 ? 'Res' : 'Res'}</span>
                      <span className="text-[#FFEAA7]">{totalCovers} Pax</span>
                    </div>
                  ) : isClosedSchedule ? (
                    <span className="text-[9px] text-[#DFBE7B]/40 font-sans block italic">
                      Closed Schedule
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-400/80 font-sans block font-medium">
                      Open Service
                    </span>
                  )}
                </div>

                {/* Bottom Row: Quick Action Indicator */}
                <div className="text-[9px] font-sans text-[#DFBE7B]/50 group-hover:text-[#FFEAA7] flex items-center justify-between pt-1 border-t border-[#DFBE7B]/10">
                  <span>{isClosedSchedule ? 'Wed-Sat' : '17:00-03:00'}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[#DFBE7B]">
                    Manage →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Quick Action Modal */}
      {selectedDayInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-2xl p-6 text-[#FDFBF7] shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#DFBE7B]/20 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#DFBE7B]" />
                <div>
                  <h4 className="font-['Cinzel',serif] text-lg text-[#FFEAA7]">
                    {selectedDayInfo.formattedDate}
                  </h4>
                  <span className="text-[10px] font-sans text-[#DFBE7B]/80">
                    Date Key: <code className="font-mono text-[#FFEAA7]">{selectedDayInfo.dateStr}</code>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-2.5 py-1 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-3">
                  <span className="text-[10px] uppercase text-[#DFBE7B]/70 block font-semibold">Schedule Status</span>
                  <p className="font-bold text-sm text-[#FDFBF7] mt-0.5">
                    {selectedDayInfo.isClosedSchedule ? 'Standard Closed (Sun-Tue)' : 'Open Service (Wed-Sat)'}
                  </p>
                </div>

                <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-3">
                  <span className="text-[10px] uppercase text-[#DFBE7B]/70 block font-semibold">Database Status</span>
                  <p className={`font-bold text-sm mt-0.5 ${selectedDayInfo.block ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedDayInfo.block ? '🔴 Date Blocked' : '🟢 Open for Booking'}
                  </p>
                </div>
              </div>

              {/* Block Details if exists */}
              {selectedDayInfo.block && (
                <div className="bg-[#2D0911] border border-red-500/50 rounded-lg p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5 text-red-400" />
                      <span>{selectedDayInfo.block.reason}</span>
                    </span>
                    <span className="text-[10px] font-mono text-red-200 bg-red-950 px-1.5 py-0.5 rounded border border-red-500/40">
                      {selectedDayInfo.block.is_full_day ? 'Full Day Closed' : `${selectedDayInfo.block.start_time} - ${selectedDayInfo.block.end_time}`}
                    </span>
                  </div>
                  {selectedDayInfo.block.notes && (
                    <p className="text-[#DFBE7B]/90 text-[11px] pt-1">{selectedDayInfo.block.notes}</p>
                  )}
                </div>
              )}

              {/* Bookings Summary */}
              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#FFEAA7] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#DFBE7B]" />
                    <span>Existing Reservations ({selectedDayInfo.dayBookings.length})</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{selectedDayInfo.totalCovers} Total Covers</span>
                </div>

                {selectedDayInfo.dayBookings.length === 0 ? (
                  <p className="text-[11px] text-[#DFBE7B]/60 italic">No bookings recorded in database for this date yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1 divide-y divide-[#DFBE7B]/10">
                    {selectedDayInfo.dayBookings.map((b) => (
                      <div key={b.bookingId} className="pt-1 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-[#FDFBF7]">{b.formData.name}</span>
                          <span className="text-[#DFBE7B]/70 ml-2">({b.formData.guests} Pax · {b.formData.timeSlot.split('–')[0]})</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">{b.bookingId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1 border-t border-[#DFBE7B]/20 text-xs">
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#DFBE7B] font-semibold block">
                Quick Staff Actions:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDayInfo.block ? (
                  <button
                    onClick={() => {
                      onUnblockDate(selectedDayInfo.block!.id, selectedDayInfo.dateStr);
                      setSelectedDayDetail(null);
                    }}
                    className="py-2.5 px-3 rounded bg-[#200A0E] hover:bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unblock This Date</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onBlockDate(selectedDayInfo.dateStr);
                      setSelectedDayDetail(null);
                    }}
                    className="py-2.5 px-3 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span>Block Out This Date</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onFilterByDate(selectedDayInfo.dateStr);
                    setSelectedDayDetail(null);
                  }}
                  className="py-2.5 px-3 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#DFBE7B]" />
                  <span>View Run Sheet ({selectedDayInfo.dayBookings.length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { X, CheckCircle, Calendar, Clock, MapPin, Download, Share2, Users, Wine, Zap, ShieldCheck } from 'lucide-react';
import { BookingConfirmation } from '../types';

interface BookingConfirmationModalProps {
  confirmation: BookingConfirmation | null;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({ confirmation, onClose }) => {
  if (!confirmation) return null;

  const { bookingId, formData } = confirmation;

  // Generate standard ICS content for Add to Calendar
  const downloadCalendarFile = () => {
    // Extract hour from timeSlot e.g. "19:00"
    const timeMatch = formData.timeSlot.match(/(\d{2}):(\d{2})/);
    const startHour = timeMatch ? timeMatch[1] : '19';
    const startMin = timeMatch ? timeMatch[2] : '00';
    const endHourNum = (parseInt(startHour, 10) + 2) % 24;
    const endHour = String(endHourNum).padStart(2, '0');

    const cleanDate = formData.date.replace(/-/g, '');
    const dtStart = `${cleanDate}T${startHour}${startMin}00`;
    const dtEnd = `${cleanDate}T${endHour}${startMin}00`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AMICA SOHO//RESTAURANT RESERVATION//EN
BEGIN:VEVENT
SUMMARY:Table Reservation at AMICA SOHO (${formData.guests} Pax)
DESCRIPTION:Auto-Confirmed Restaurant Reservation for ${formData.guests} guests in ${formData.seatingArea}. Ref: ${bookingId}. Opening hours: 5:00 PM to 3:00 AM (7 Days a week).
LOCATION:AMICA SOHO, 23 Frith Street, Soho, London W1D 4RR
DTSTART:${dtStart}
DTEND:${dtEnd}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMICA_SOHO_Reservation_${bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl overflow-hidden">
        
        {/* Top Metallic Border Decor */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DFBE7B] via-[#C5A059] to-[#DFBE7B]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#FDFBF7]/60 hover:text-[#DFBE7B] p-1 transition-colors cursor-pointer"
          aria-label="Close confirmation pass"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-b from-[#200A0E] to-[#120205] border border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-1">
            <CheckCircle className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] uppercase font-sans font-bold tracking-widest">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>AUTO-CONFIRMED RESERVATION · PASS #{bookingId}</span>
          </div>

          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FDFBF7] tracking-wider font-light">
            Reservation Confirmed at <span className="text-[#E8CCA0]">AMICA SOHO</span>
          </h2>
          <p className="text-xs text-[#DFBE7B]/80 font-sans">
            Thank you, {formData.name}. Your table for <strong>{formData.guests} {formData.guests === 1 ? 'guest' : 'guests'} (Pax)</strong> is auto-confirmed.
          </p>
        </div>

        {/* Pass Details Card */}
        <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-5 space-y-4 mb-6 shadow-inner">
          
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#DFBE7B]/20">
            <div>
              <span className="text-[10px] text-[#DFBE7B] uppercase font-sans tracking-wider block font-semibold">
                Date & Time
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#FDFBF7] mt-0.5 font-sans">
                <Calendar className="w-3.5 h-3.5 text-[#DFBE7B]" />
                <span>{formData.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#DFBE7B] mt-0.5 font-sans">
                <Clock className="w-3.5 h-3.5 text-[#DFBE7B]" />
                <span>{formData.timeSlot}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#DFBE7B] uppercase font-sans tracking-wider block font-semibold">
                Party & Table
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#FDFBF7] mt-0.5 font-sans">
                <Users className="w-3.5 h-3.5 text-[#DFBE7B]" />
                <span>{formData.guests} Guests (Pax)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#DFBE7B] mt-0.5 font-sans truncate">
                <Wine className="w-3.5 h-3.5 text-[#DFBE7B] shrink-0" />
                <span className="truncate">{formData.seatingArea}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#FDFBF7]/80 font-sans">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#DFBE7B] shrink-0 mt-0.5" />
              <span>AMICA SOHO, 23 Frith Street, Soho, London W1D 4RR</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#DFBE7B]/80">
              <Clock className="w-3 h-3 text-[#DFBE7B] shrink-0" />
              <span>Opening Times: 5:00 PM to 3:00 AM · 7 Days a Week (Mon – Sun)</span>
            </div>
            {formData.dietaryNotes && (
              <p className="text-[11px] text-[#DFBE7B] bg-[#0A0103] p-2.5 rounded border border-[#DFBE7B]/20 mt-1">
                <strong className="text-[#FFEAA7]">Dietary / Notes:</strong> {formData.dietaryNotes}
              </p>
            )}
          </div>

          {/* QR Code Graphic Simulation */}
          <div className="pt-2 flex items-center justify-between bg-[#0A0103] p-3 rounded-lg border border-[#DFBE7B]/25">
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-sans text-emerald-400 uppercase tracking-wider block font-bold">
                ✓ Auto-Confirmed Pass (1 to 20 Pax)
              </span>
              <span className="font-mono text-xs text-[#FDFBF7] font-bold block">{bookingId}</span>
              <span className="text-[10px] text-[#DFBE7B]/60 block font-sans">
                Show upon arrival at 23 Frith St entrance
              </span>
            </div>
            
            {/* Simulated Gold QR Pattern */}
            <div className="w-13 h-13 bg-[#FDFBF7] p-1.5 rounded flex flex-col justify-between shrink-0">
              <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      (i * 7) % 3 === 0 ? 'bg-[#180307]' : 'bg-[#C5A059]'
                    } w-full h-full`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadCalendarFile}
            className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] hover:from-[#DFBE7B] hover:to-[#FFEAA7] text-[#120205] text-xs font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Add To Calendar (.ics)</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-6 rounded-lg bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] text-[#DFBE7B] text-xs font-sans tracking-wider uppercase flex items-center justify-center transition-colors cursor-pointer"
          >
            <span>Done</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-[#DFBE7B]/60 mt-4 font-sans">
          Instant confirmation sent to {formData.email}. Free cancellation up to 2 hours prior.
        </p>
      </div>
    </div>
  );
};

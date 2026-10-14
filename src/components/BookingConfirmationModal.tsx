import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Download,
  Users,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { BookingConfirmation } from '../types';

interface BookingConfirmationModalProps {
  confirmation: BookingConfirmation | null;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({ confirmation, onClose }) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!confirmation) return null;

  const { bookingId, formData } = confirmation;
  const isConfirmed = confirmation.status !== 'Pending';

  // Generate standard ICS content for Add to Calendar
  const downloadCalendarFile = () => {
    const timeMatch = formData.timeSlot.match(/(\d{2}):(\d{2})/);
    const startHour = timeMatch ? timeMatch[1] : '19';
    const startMin = timeMatch ? timeMatch[2] : '00';
    const serviceDay = new Date(formData.date+'T12:00:00Z');
    if (Number(startHour)<5) serviceDay.setUTCDate(serviceDay.getUTCDate()+1);
    const cleanDate=serviceDay.toISOString().slice(0,10).replace(/-/g,'');
    const dtStart=`${cleanDate}T${startHour}${startMin}00`;
    const end=new Date(serviceDay); if(Number(startHour)+2>=24)end.setUTCDate(end.getUTCDate()+1);
    const dtEnd=`${end.toISOString().slice(0,10).replace(/-/g,'')}T${String((Number(startHour)+2)%24).padStart(2,'0')}${startMin}00`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AMICA SOHO//RESTAURANT RESERVATION//EN
BEGIN:VEVENT
UID:${bookingId}@amicasoho.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}
SUMMARY:Table Reservation at AMICA SOHO (${formData.guests} Pax)
DESCRIPTION:Table Reservation for ${formData.guests} guests. Ref: ${bookingId}. Opening hours: Wednesday to Saturday from 5:00 PM to 3:00 AM.
LOCATION:AMICA SOHO, 23 Frith Street, Soho, London W1D 4RR
DTSTART;TZID=Europe/London:${dtStart}
DTEND;TZID=Europe/London:${dtEnd}
STATUS:${isConfirmed ? 'CONFIRMED' : 'TENTATIVE'}
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
    URL.revokeObjectURL(url);
  };

  const handleCopyDetails = () => {
    const text =
      `AMICA SOHO · ${isConfirmed ? 'Table Reservation Confirmed' : 'Reservation Request Saved'}\n` +
      `Reference: ${bookingId}\n` +
      `Name: ${formData.name}\n` +
      `Date: ${formData.date}\n` +
      `Time: ${formData.timeSlot}\n` +
      `Party Size: ${formData.guests} Guests\n` +
      `Occasion: ${formData.specialOccasion || 'Casual Dining & Drinks'}\n` +
      `Venue: 23 Frith Street, Soho, London W1D 4RR\n` +
      `Hours: Wed–Sat, 5:00 PM – 3:00 AM`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-xl p-5 sm:p-7 text-[#FDFBF7] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
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
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#200A0E] to-[#120205] border border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-1">
            <CheckCircle className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] uppercase font-sans font-bold tracking-widest">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{isConfirmed ? 'RESERVATION CONFIRMED' : 'RESERVATION REQUEST SAVED'} · REF #{bookingId}</span>
          </div>

          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FDFBF7] tracking-wider font-light">
            {isConfirmed ? 'Table Reserved at' : 'Reservation Requested at'} <span className="text-[#E8CCA0]">AMICA SOHO</span>
          </h2>
          <p className="text-xs text-[#DFBE7B]/80 font-sans">
            Thank you, {formData.name}. Your table for <strong>{formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}</strong> {isConfirmed ? 'is confirmed.' : 'is awaiting confirmation by the venue.'}
          </p>
        </div>

        {/* Pass Details Card */}
        <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 sm:p-5 space-y-3.5 mb-5 shadow-inner">
          
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#DFBE7B]/20">
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
                Party Size
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#FDFBF7] mt-0.5 font-sans">
                <Users className="w-3.5 h-3.5 text-[#DFBE7B]" />
                <span>{formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
              <span className="text-[11px] text-[#DFBE7B]/80 block font-sans mt-0.5 truncate">
                {formData.specialOccasion || 'Casual Dining & Drinks'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#FDFBF7]/80 font-sans">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#DFBE7B] shrink-0 mt-0.5" />
              <span>AMICA SOHO, 23 Frith Street, Soho, London W1D 4RR</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#DFBE7B]/80">
              <Clock className="w-3 h-3 text-[#DFBE7B] shrink-0" />
              <span>Wednesday to Saturday, 5:00 PM to 3:00 AM (17:00 – 03:00)</span>
            </div>
            {formData.dietaryNotes && (
              <p className="text-[11px] text-[#DFBE7B] bg-[#0A0103] p-2 rounded border border-[#DFBE7B]/20 mt-1">
                <strong className="text-[#FFEAA7]">Dietary / Notes:</strong> {formData.dietaryNotes}
              </p>
            )}
          </div>

          {/* Reference Bar */}
          <div className="pt-2 flex items-center justify-between bg-[#0A0103] p-2.5 rounded-lg border border-[#DFBE7B]/25">
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-sans text-emerald-400 uppercase tracking-wider block font-bold">
                {isConfirmed ? '✓ Confirmed Reservation' : 'Pending Venue Confirmation'}
              </span>
              <span className="font-mono text-xs text-[#FDFBF7] font-bold block">{bookingId}</span>
            </div>
            
            <button
              type="button"
              onClick={handleCopyDetails}
              className="px-2.5 py-1 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/30 text-[#DFBE7B] text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Copy reservation details to clipboard"
            >
              {copiedText ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={downloadCalendarFile}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] text-[#DFBE7B] text-xs font-sans font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Add To Calendar (.ics)</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] hover:from-[#DFBE7B] hover:to-[#FFEAA7] text-[#120205] text-xs font-sans font-bold tracking-wider uppercase flex items-center justify-center transition-all cursor-pointer shadow-md font-sans"
          >
            <span>Done</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-[#DFBE7B]/60 mt-3 font-sans">
          Free cancellation up to 2 hours prior. Tables held for 15 minutes past reservation time.
        </p>
      </div>
    </div>
  );
};

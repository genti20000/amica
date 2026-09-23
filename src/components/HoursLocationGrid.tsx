import React from 'react';
import { Clock, MapPin, Mail, Phone, ExternalLink, Calendar, Instagram, Music, Navigation, ShieldCheck } from 'lucide-react';
import { PageId } from '../types';

interface HoursLocationGridProps {
  onNavigate?: (page: PageId) => void;
  className?: string;
}

export const HoursLocationGrid: React.FC<HoursLocationGridProps> = ({ onNavigate, className = '' }) => {
  const hoursData = [
    { day: 'Tuesday – Thursday', hours: '17:00 – 00:00', note: 'Aperitivo Hour 17:00 – 18:30' },
    { day: 'Friday', hours: '16:30 – 01:30', note: 'Late Night Selectors & Vinyl' },
    { day: 'Saturday', hours: '16:00 – 01:30', note: 'Aperitivo & Speakeasy Sessions' },
    { day: 'Sunday', hours: '16:00 – 23:00', note: 'Subterranean Jazz & Amaro' },
    { day: 'Monday', hours: 'Closed', note: 'Private Vault Hire by Request' },
  ];

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Container: Two-Column Information Section on Dark Charcoal Background */}
      <div className="bg-[#121215] border border-[#9D7E54]/35 rounded-2xl p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative bronze ambient glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#9D7E54]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#DFBE7B]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[10px] sm:text-xs font-display uppercase tracking-[0.25em] text-[#9D7E54] block">
            Plan Your Subterranean Evening
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#FDFBF7] tracking-wide">
            Hours & Location
          </h2>
          <p className="text-xs sm:text-sm text-[#DFBE7B]/80 font-sans">
            Stepping down behind the burgundy curved awning at 23 Frith Street.
          </p>
        </div>

        {/* Two-Column Grid with Thin Vertical Divider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start relative">
          
          {/* LEFT COLUMN: Clean, row-separated opening hours table with subtle bottom borders */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-[#9D7E54]/30">
              <Clock className="w-4 h-4 text-[#DFBE7B]" />
              <h3 className="font-display text-sm sm:text-base font-bold text-[#FDFBF7] tracking-wider uppercase">
                Opening Hours
              </h3>
            </div>

            <div className="space-y-1">
              {hoursData.map((row, index) => (
                <div
                  key={index}
                  className="py-3.5 border-b border-[#9D7E54]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 transition-colors hover:bg-[#181820]/50 px-2 rounded"
                >
                  <div>
                    <span className="font-display text-sm font-semibold text-[#FDFBF7] block">
                      {row.day}
                    </span>
                    <span className="text-[11px] text-[#DFBE7B]/70 font-sans">
                      {row.note}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="font-display font-medium text-xs sm:text-sm text-[#FFEAA7] tracking-wider">
                      {row.hours}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Aperitivo Golden Hour Note */}
            <div className="p-4 rounded-xl bg-[#181822]/80 border border-[#9D7E54]/25 space-y-1 mt-4">
              <div className="flex items-center gap-2 text-xs font-display text-[#DFBE7B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9D7E54]" />
                <span className="uppercase tracking-wider">The Golden Hour Ritual</span>
              </div>
              <p className="text-xs text-[#FDFBF7]/75 font-sans leading-relaxed">
                Complimentary chef’s cicchetti boards served alongside your first aperitivo or cocktail every Tuesday through Saturday between 16:30 – 18:30.
              </p>
            </div>
          </div>

          {/* THIN VERTICAL DIVIDER LINE (Visible on Desktop) */}
          <div className="hidden lg:block lg:col-span-1 h-full min-h-[340px] flex justify-center items-center">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-[#9D7E54]/40 to-transparent" />
          </div>

          {/* RIGHT COLUMN: Venue contact details, address, email, phone, and muted gold social icon links */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-[#9D7E54]/30">
              <MapPin className="w-4 h-4 text-[#DFBE7B]" />
              <h3 className="font-display text-sm sm:text-base font-bold text-[#FDFBF7] tracking-wider uppercase">
                Venue & Contact
              </h3>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#9D7E54] block">
                Address
              </span>
              <p className="font-display text-base font-bold text-[#FDFBF7]">
                AMICA SOHO
              </p>
              <p className="font-sans text-sm text-[#DFBE7B]/90">
                23 Frith Street, Soho, London W1D 4RR
              </p>
              <p className="font-sans text-xs text-[#FDFBF7]/60 italic">
                Directly beneath the curved burgundy canopy with amber reeded doors.
              </p>
            </div>

            {/* Communications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#9D7E54] block">
                  Reservations & Inquiries
                </span>
                <a
                  href="mailto:reservations@amicasoho.com"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FDFBF7] hover:text-[#DFBE7B] transition-colors font-sans"
                >
                  <Mail className="w-3.5 h-3.5 text-[#9D7E54]" />
                  <span>reservations@amicasoho.com</span>
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#9D7E54] block">
                  Direct Line
                </span>
                <a
                  href="tel:+442074372323"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FDFBF7] hover:text-[#DFBE7B] transition-colors font-mono"
                >
                  <Phone className="w-3.5 h-3.5 text-[#9D7E54]" />
                  <span>+44 20 7437 2323</span>
                </a>
              </div>
            </div>

            {/* Transit & Underground */}
            <div className="p-3.5 rounded-lg bg-[#181820]/90 border border-[#9D7E54]/20 space-y-1">
              <span className="text-[10px] font-display uppercase tracking-wider text-[#DFBE7B] block">
                Nearest Underground Stations
              </span>
              <p className="text-xs text-[#FDFBF7]/80 font-sans">
                Tottenham Court Road (Elizabeth / Northern / Central Line) · 4 min walk<br />
                Leicester Square (Piccadilly / Northern Line) · 5 min walk
              </p>
            </div>

            {/* Muted Gold Social Icon Links */}
            <div className="pt-2">
              <span className="text-[10px] font-display uppercase tracking-[0.25em] text-[#9D7E54] block mb-2.5">
                Sound & Nocturnal Dispatch
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-[#181820] border border-[#9D7E54]/30 text-[#DFBE7B] hover:text-[#FFEAA7] hover:border-[#DFBE7B] transition-all cursor-pointer"
                  title="Amica Soho on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-[#181820] border border-[#9D7E54]/30 text-[#DFBE7B] hover:text-[#FFEAA7] hover:border-[#DFBE7B] transition-all cursor-pointer"
                  title="Amica Soho Vinyl Selections on Spotify"
                >
                  <Music className="w-4 h-4" />
                </a>

                <a
                  href="https://maps.google.com/?q=23+Frith+Street+Soho+London"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-[#181820] border border-[#9D7E54]/30 text-[#DFBE7B] hover:text-[#FFEAA7] hover:border-[#DFBE7B] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-display"
                  title="Directions on Google Maps"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="hidden sm:inline">Directions</span>
                </a>
              </div>
            </div>

            {/* CTAs */}
            {onNavigate && (
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('book')}
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-[#DFBE7B] via-[#C5A059] to-[#9D7E54] text-[#0A0A0C] font-display font-bold text-xs tracking-wider uppercase shadow-md hover:brightness-110 transition-all cursor-pointer"
                >
                  Reserve Table Online
                </button>
                <button
                  onClick={() => onNavigate('visit')}
                  className="px-5 py-2.5 rounded bg-[#181820] border border-[#9D7E54]/40 text-[#DFBE7B] hover:text-[#FFEAA7] hover:border-[#DFBE7B] font-display text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  Full Visit Guide
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};

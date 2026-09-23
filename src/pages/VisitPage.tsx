import React, { useState } from 'react';
import { PageId } from '../types';
import { VENUE_INFO } from '../data/venueData';
import { MapPin, Clock, Phone, Mail, Navigation, HelpCircle, ShieldAlert, ChevronDown, ChevronUp, Wine } from 'lucide-react';
import { HoursLocationGrid } from '../components/HoursLocationGrid';

interface VisitPageProps {
  onNavigate: (page: PageId) => void;
}

export const VisitPage: React.FC<VisitPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need a reservation, or do you take walk-ins?',
      a: 'We warmly welcome both walk-ins and reservations! During our Golden Hour (16:30 – 18:30) and on weekend evenings, reservations are strongly recommended to guarantee seating in our vault alcoves or crimson cocktail bar.'
    },
    {
      q: 'What is the dress code at AMICA SOHO?',
      a: 'Smart casual / relaxed nocturnal elegance. We encourage style that fits Soho’s evening culture, but there is no strict jacket requirement. Tracksuits and sportswear are politely discouraged.'
    },
    {
      q: 'Are dogs permitted in the venue?',
      a: 'Well-behaved dogs on leads are welcome in the lounge area during early evening hours (until 19:00).'
    },
    {
      q: 'Do you cater to dietary requirements and vegans?',
      a: 'Sì! Our menu features extensive vegan (VG), vegetarian (V), and gluten-free (GF) options including plant-based cicchetti, dairy-free pestos, and artisanal gluten-free focaccia.'
    },
    {
      q: 'Is the basement venue wheelchair accessible?',
      a: 'Due to the historic subterranean architecture of our 18th-century Frith Street building, access is via a flight of stairs. Please contact our team prior to arrival so we can assist with entry arrangements.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[#9D7E54] text-xs font-display uppercase tracking-[0.25em] block">
          LOCATION & GUEST INFORMATION
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#FDFBF7] tracking-wide">
          Visit & House Rules
        </h1>
        <p className="text-xs sm:text-sm text-[#DFBE7B]/80 leading-relaxed font-sans">
          Everything you need to know before stepping beneath the burgundy curved awning and fluted amber doors at 23 Frith Street, Soho.
        </p>
      </div>

      {/* Grid: Hours & Location */}
      <HoursLocationGrid onNavigate={onNavigate} />

      {/* House Rules & Etiquette */}
      <div className="p-8 bg-[#121215] border border-[#9D7E54]/30 rounded-2xl space-y-6 shadow-xl">
        <div className="flex items-center gap-2 text-[#DFBE7B] text-xs font-display uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4 text-[#9D7E54]" />
          <span>House Etiquette</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FDFBF7]">The Amica Soho Protocol</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#FDFBF7]/80 font-sans">
          <div className="p-4 bg-[#181820] rounded border border-[#9D7E54]/20 space-y-2">
            <h4 className="font-display text-sm font-bold text-[#DFBE7B]">The Unhurried Pace</h4>
            <p>We believe cocktails and aperitivo are an exercise in slowing down. Take your time over drinks and cicchetti—there are no rushed table turnarounds during Golden Hour.</p>
          </div>

          <div className="p-4 bg-[#181820] rounded border border-[#9D7E54]/20 space-y-2">
            <h4 className="font-display text-sm font-bold text-[#DFBE7B]">Smart Casual Attire</h4>
            <p>Soho evening attire encouraged. Please refrain from wearing athletic tracksuits or beachwear in the cellar.</p>
          </div>

          <div className="p-4 bg-[#181820] rounded border border-[#9D7E54]/20 space-y-2">
            <h4 className="font-display text-sm font-bold text-[#DFBE7B]">Conversational Volume</h4>
            <p>Our vinyl sound system is tuned for warm acoustic acoustics. Please keep mobile phone conversations discreet.</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[#9D7E54] text-xs font-display uppercase tracking-widest">Common Questions</span>
          <h2 className="font-display text-3xl font-bold text-[#FDFBF7]">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#121215] border border-[#9D7E54]/30 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-display text-base font-bold text-[#FDFBF7] flex items-center justify-between gap-4 hover:text-[#DFBE7B] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#DFBE7B]" /> : <ChevronDown className="w-4 h-4 text-[#9D7E54]" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#FDFBF7]/80 leading-relaxed border-t border-[#9D7E54]/10 pt-3 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

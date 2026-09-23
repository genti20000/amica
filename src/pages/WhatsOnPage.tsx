import React, { useState } from 'react';
import { PageId, EventItem } from '../types';
import { EVENTS_DATA } from '../data/eventsData';
import { Music, Calendar, Clock, Sparkles, Filter, Wine, ArrowRight, Ticket } from 'lucide-react';
import { amicaMirrorSconces } from '../assets/images/photos';

interface WhatsOnPageProps {
  onNavigate: (page: PageId) => void;
}

export const WhatsOnPage: React.FC<WhatsOnPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Live Music & Cabaret', 'Aperitivo Hours', 'Vinyl & Beats', 'Masterclass', 'Tasting'];

  const filteredEvents = activeCategory === 'All'
    ? EVENTS_DATA
    : EVENTS_DATA.filter((e) => e.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Page Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[#DFBE7B] text-xs font-display uppercase tracking-widest block">
          CURATED PROGRAMME · AMICA SOHO LONDON
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#FDFBF7] tracking-wide">
          What’s On & Cellar Sessions
        </h1>
        <p className="text-xs sm:text-sm text-[#DFBE7B]/80 leading-relaxed font-sans">
          From analog vinyl disco nights and daily golden hour cicchetti to intimate sommelier vermouth masterclasses, experience AMICA SOHO in motion.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 border-b border-[#C5A059]/20">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 text-xs font-display tracking-wider uppercase rounded-full transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#C5A059] text-[#0B0B0C] font-bold shadow-md'
                : 'bg-[#121215] border border-[#C5A059]/30 text-[#FDFBF7]/80 hover:text-[#DFBE7B]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-[#121215] border border-[#C5A059]/30 rounded-2xl p-6 sm:p-8 space-y-6 hover:border-[#C5A059] transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 bg-[#1A1A22] border border-[#C5A059]/30 text-[#FFEAA7] text-[10px] font-display uppercase tracking-wider rounded-full">
                  {event.category}
                </span>
                <span className="text-xs font-display text-[#DFBE7B] font-bold tracking-wider">
                  {event.priceInfo}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#DFBE7B] font-display tracking-wider block">{event.subtitle}</span>
                <h3 className="font-display text-2xl font-bold text-[#FDFBF7] group-hover:text-[#FFEAA7] transition-colors mt-0.5">
                  {event.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#FDFBF7]/80 font-display tracking-wider pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="font-sans">{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{event.time}</span>
                </div>
              </div>

              <p className="text-xs text-[#FDFBF7]/75 leading-relaxed font-sans">
                {event.description}
              </p>

              <div className="p-3 bg-[#181820] rounded border border-[#C5A059]/20 text-xs text-[#DFBE7B] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span className="font-sans"><strong className="font-display text-[#FFEAA7]">Highlight:</strong> {event.highlight}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#C5A059]/20 flex items-center justify-between">
              <span className="text-[10px] font-display text-[#DFBE7B]/60 uppercase tracking-wider">23 Frith St · Soho</span>
              <button
                onClick={() => onNavigate('book')}
                className="px-5 py-2.5 btn-brass text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Reserve Entry</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Vinyl Night Banner */}
      <div className="bg-[#141418] border-2 border-[#C5A059] rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={amicaMirrorSconces}
            alt="Amica Soho Vinyl & Cocktails"
            className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.2]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#141418]/80 to-transparent" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <Music className="w-10 h-10 text-[#C5A059] mx-auto animate-pulse" />
          <span className="text-xs font-display text-[#DFBE7B] uppercase tracking-widest block">Analog Sound System</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FDFBF7] tracking-wide">
            Vinyl & Vermouth Thursdays
          </h2>
          <p className="text-xs sm:text-sm text-[#DFBE7B]/85 leading-relaxed font-sans">
            Every Thursday evening, our resident selectors spin rare 70s Italo-disco, obscure jazz funk, and cosmic lounge vinyl on our custom analog sound system. No loud club noise—just pure warm music engineered for conversation.
          </p>
          <button
            onClick={() => onNavigate('book')}
            className="px-8 py-3.5 btn-brass text-xs uppercase tracking-widest rounded shadow-lg cursor-pointer"
          >
            Reserve Table For Thursday Night
          </button>
        </div>
      </div>

    </div>
  );
};

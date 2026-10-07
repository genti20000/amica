import React, { useState } from 'react';
import { PageId } from '../types';
import { Mail, Phone, Instagram, MapPin, X, ChevronRight, ExternalLink } from 'lucide-react';
import {
  amicaEntranceDome,
  amicaFacadeNight,
  amicaCrimsonBar,
  amicaVaultBooth,
  amicaArchBooth,
  amicaOxbloodLounge,
  amicaNeonLounge,
  amicaBarDisplay,
  amicaMirrorSconces,
  amicaPowderRoom,
} from '../assets/images/photos';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenQuiz?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenQuiz }) => {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Gallery items featuring the 10 authentic AMICA SOHO photographs
  const galleryItems = [
    {
      src: amicaCrimsonBar,
      alt: 'The Crimson Speakeasy Bar',
      caption: 'Subterranean walnut counter with crimson illuminated backbar & cocktail trolley',
    },
    {
      src: amicaVaultBooth,
      alt: 'Barrel-Vaulted Dining Arch',
      caption: 'Warm gold cove lighting, tufted leather banquettes & brass sunburst medallion',
    },
    {
      src: amicaArchBooth,
      alt: 'The Private Scalloped Alcove',
      caption: 'Burgundy Art Deco fan wallpaper with ambient uplighting & chilled champagne',
    },
    {
      src: amicaOxbloodLounge,
      alt: 'The Oxblood Cocktail Lounge',
      caption: 'Arched golden wine displays, cognac leather Chesterfield & mid-century armchairs',
    },
    {
      src: amicaNeonLounge,
      alt: 'Soho After Dark Neon Wall',
      caption: 'Curated red typography panels: Cocktails & Mischief Till Late',
    },
    {
      src: amicaBarDisplay,
      alt: 'The Curated Back-Bar Cabinet',
      caption: 'Antiqued mercury mirror cubbies, decanters & vintage coupe collection',
    },
    {
      src: amicaMirrorSconces,
      alt: 'Midnight Wall & Fluted Sconces',
      caption: 'Brushed brass pivot mirror capturing golden reflections of the cocktail bar',
    },
    {
      src: amicaPowderRoom,
      alt: 'The Art Deco Powder Room',
      caption: 'Burgundy ginkgo fan wallpaper, dark glazed tiles & polished brass fittings',
    },
    {
      src: amicaFacadeNight,
      alt: '23 Frith Street Wedge Awning',
      caption: 'Cocktail coupe icon, solid black doors & Parisian bistro table at night',
    },
    {
      src: amicaEntranceDome,
      alt: 'Burgundy Dome Entrance',
      caption: 'Velvet rounded canopy, brass sconces & nighttime Soho cobblestones',
    },
  ];

  return (
    <div className="w-full bg-maroon-deep text-[#FDFBF7] font-sans selection:bg-[#C5A059] selection:text-[#150306] overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO SECTION
          Full-bleed atmospheric hero image (The Crimson Speakeasy Cocktail Bar)
          with signature velvet maroon & gold typography overlay
         ========================================================================= */}
      <section className="relative w-full border-b border-maroon bg-maroon-deep overflow-hidden min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center">
        
        {/* Full Hero Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={amicaCrimsonBar}
            alt="AMICA SOHO Crimson Speakeasy Cocktail Bar"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layer atmospheric dark vignette for pristine contrast & luxury speakeasy depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0204]/95 via-[#180307]/80 to-[#0F0204]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-transparent to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_45%,transparent_0%,rgba(15,2,4,0.6)_100%)]" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 flex flex-col justify-center">
          <div className="max-w-2xl">
            {/* Awning-inspired pill badge */}
            <div className="awning-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-maroon-gold w-fit mb-4 bg-maroon-deep/80 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-amica animate-pulse shadow-[0_0_8px_#DFBE7B]"></span>
              <span className="text-[10px] sm:text-[10.5px] font-sans tracking-[0.26em] uppercase text-gold-amica font-semibold">
                23 FRITH ST, SOHO
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-light text-[#FDFBF7] leading-[1.08] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              Cocktails <span className="text-gold-amica font-normal">&amp;</span><br />
              Aperitivo
            </h1>

            {/* Golden Amica accent divider */}
            <div className="w-16 h-[1.5px] bg-gradient-to-r from-[#DFBE7B] to-[#9D7E54] my-5 shadow-[0_0_8px_rgba(223,190,123,0.5)]" />

            <p className="text-[10.5px] sm:text-[12px] font-sans tracking-[0.26em] text-gold-amica uppercase font-medium mb-8 drop-shadow-md">
              GOOD DRINKS &nbsp;/&nbsp; LATE NIGHTS &nbsp;/&nbsp; SOHO SPIRIT
            </p>

            {/* Action Buttons: Primary Brushed Gold 'EXPLORE THE VENUE' + High-Contrast 'VIEW MENU' */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('venue')}
                className="bg-[#C5A059] hover:bg-[#DFBE7B] text-[#08080A] font-sans font-semibold text-xs tracking-[0.22em] uppercase min-h-[44px] py-3.5 px-8 transition-all duration-200 cursor-pointer shadow-[0_4px_22px_rgba(0,0,0,0.7)] active:scale-95 border border-[#FFEAA7]/50 text-center flex items-center justify-center rounded-sm"
              >
                EXPLORE THE VENUE
              </button>

              <button
                onClick={() => onNavigate('drinks-food')}
                className="bg-[#180307]/85 hover:bg-[#28060D] text-[#FFEAA7] border border-[#DFBE7B] font-sans font-semibold text-xs tracking-[0.22em] uppercase min-h-[44px] py-3.5 px-8 transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-md active:scale-95 rounded-sm text-center flex items-center justify-center"
              >
                VIEW MENU
              </button>
            </div>
          </div>
        </div>

        {/* Right side subtle vertical Soho creed (Desktop) */}
        <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-4 text-[9px] font-sans tracking-[0.3em] text-gold-amica/70 uppercase [writing-mode:vertical-rl] rotate-180 select-none">
          <span>COCKTAILS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#DFBE7B]/50" />
          <span>MUSIC</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#DFBE7B]/50" />
          <span>PEOPLE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#DFBE7B]/50" />
          <span className="text-[#FFEAA7] font-semibold">SOHO</span>
        </div>
      </section>

      {/* =========================================================================
          AWNING MOTIF SIGNATURE BANNER
          Directly celebrates the rich maroon velvet dome awning with gold embroidery
         ========================================================================= */}
      <div className="w-full bg-maroon-awning border-y border-maroon-gold py-2.5 sm:py-3 px-3 sm:px-4 text-center select-none shadow-[inset_0_1px_0_rgba(223,190,123,0.3)]">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 sm:gap-8 text-gold-amica">
          <span className="hidden sm:inline text-xs opacity-70">✦</span>
          <span className="font-serif text-xs sm:text-base tracking-[0.25em] sm:tracking-[0.35em] text-[#FDFBF7] uppercase font-light">
            A M I C A&nbsp;&nbsp;S O H O
          </span>
          <span className="text-xs text-gold-subtle">✦</span>
          <span className="font-serif text-[10px] sm:text-xs tracking-[0.22em] sm:tracking-[0.3em] text-[#FFEAA7] uppercase font-medium">
            APERITIVO &nbsp;•&nbsp; MUSIC &nbsp;•&nbsp; LATE
          </span>
          <span className="hidden sm:inline text-xs opacity-70">✦</span>
        </div>
      </div>


      {/* =========================================================================
          2. THREE-COLUMN SECTION: [ About Amica ] | [ Cocktails / Menu ] | [ Music / DJs ]
          Matches mockup:
          - Each block split 50/50: Text on left, Photo on right
          - Thin maroon-gold borders between blocks
         ========================================================================= */}
      <section className="w-full border-b border-maroon bg-maroon-deep">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-maroon">
          
          {/* Card 1: About Amica */}
          <div className="flex flex-col sm:flex-row items-stretch bg-gradient-to-b from-burgundy-dark via-maroon-dark to-maroon-deep hover:from-burgundy transition-all duration-300">
            <div className="w-full sm:w-1/2 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#FDFBF7] font-normal">
                  About Amica
                </h3>
                <div className="w-8 h-[1.5px] bg-gold-amica mt-1.5 mb-3" />
                <p className="text-xs text-gold-amica/90 font-sans leading-relaxed">
                  A subterranean cocktail bar in the heart of Soho, where refined drinks, intimate spaces and a nocturnal spirit come together.
                </p>
              </div>
              <div className="pt-5">
                <button
                  onClick={() => onNavigate('venue')}
                  className="btn-maroon-gold min-h-[44px] text-[10.5px] font-sans font-semibold tracking-[0.2em] uppercase py-2.5 px-5 transition-all cursor-pointer shadow-sm active:scale-95 w-full sm:w-auto inline-flex items-center justify-center rounded-sm"
                >
                  OUR STORY
                </button>
              </div>
            </div>
            <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[190px] relative overflow-hidden border-t sm:border-t-0 sm:border-l border-maroon">
              <img
                src={amicaVaultBooth}
                alt="AMICA SOHO warm vaulted candlelit booths"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Card 2: Cocktails / Menu */}
          <div className="flex flex-col sm:flex-row items-stretch bg-gradient-to-b from-burgundy-dark via-maroon-dark to-maroon-deep hover:from-burgundy transition-all duration-300">
            <div className="w-full sm:w-1/2 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#FDFBF7] font-normal">
                  Cocktails / Menu
                </h3>
                <div className="w-8 h-[1.5px] bg-gold-amica mt-1.5 mb-3" />
                <p className="text-xs text-gold-amica/90 font-sans leading-relaxed">
                  Considered cocktails, classic serves and seasonal creations in an intimate setting.
                </p>
              </div>
              <div className="pt-5">
                <button
                  onClick={() => onNavigate('drinks-food')}
                  className="btn-maroon-gold min-h-[44px] text-[10.5px] font-sans font-semibold tracking-[0.2em] uppercase py-2.5 px-5 transition-all cursor-pointer shadow-sm active:scale-95 w-full sm:w-auto inline-flex items-center justify-center rounded-sm"
                >
                  VIEW MENU
                </button>
              </div>
            </div>
            <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[190px] relative overflow-hidden border-t sm:border-t-0 sm:border-l border-maroon">
              <img
                src={amicaBarDisplay}
                alt="AMICA SOHO curated backbar and crystal cocktail coupes"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Card 3: Music / DJs */}
          <div className="flex flex-col sm:flex-row items-stretch bg-gradient-to-b from-burgundy-dark via-maroon-dark to-maroon-deep hover:from-burgundy transition-all duration-300">
            <div className="w-full sm:w-1/2 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#FDFBF7] font-normal">
                  Music / DJs
                </h3>
                <div className="w-8 h-[1.5px] bg-gold-amica mt-1.5 mb-3" />
                <p className="text-xs text-gold-amica/90 font-sans leading-relaxed">
                  Curated sounds for late nights in Soho. An intimate space for music, drinks and good company.
                </p>
              </div>
              <div className="pt-5">
                <button
                  onClick={() => onNavigate('whats-on')}
                  className="btn-maroon-gold min-h-[44px] text-[10.5px] font-sans font-semibold tracking-[0.2em] uppercase py-2.5 px-5 transition-all cursor-pointer shadow-sm active:scale-95 w-full sm:w-auto inline-flex items-center justify-center rounded-sm"
                >
                  WHAT'S ON
                </button>
              </div>
            </div>
            <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[190px] relative overflow-hidden border-t sm:border-t-0 sm:border-l border-maroon">
              <img
                src={amicaMirrorSconces}
                alt="AMICA SOHO midnight wall and brass sconces"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          3. PRIVATE HIRE SECTION
          Matches mockup:
          - Left: Title "Private Hire" + underline + description + ENQUIRE NOW
          - Right: Wide panoramic lounge image
         ========================================================================= */}
      <section className="w-full border-b border-maroon bg-maroon-deep">
        <div className="w-full flex flex-col lg:flex-row items-stretch min-h-[260px] sm:min-h-[300px]">
          
          {/* Left Text Block */}
          <div className="w-full lg:w-[28%] xl:w-[26%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-burgundy via-burgundy-dark to-maroon-dark border-b lg:border-b-0 lg:border-r border-maroon">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FDFBF7] font-normal">
                Private Hire
              </h2>
              <div className="w-8 h-[1.5px] bg-gold-amica mt-1.5 mb-3" />
              <p className="text-xs text-gold-amica/90 font-sans leading-relaxed">
                An exclusive setting for private events, celebrations and bespoke experiences in Soho.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={() => onNavigate('private-hire')}
                className="btn-maroon-gold min-h-[44px] text-[10.5px] font-sans font-semibold tracking-[0.2em] uppercase py-2.5 px-6 transition-all cursor-pointer shadow-sm active:scale-95 w-full sm:w-auto inline-flex items-center justify-center rounded-sm"
              >
                ENQUIRE NOW
              </button>
            </div>
          </div>

          {/* Right Panoramic Image */}
          <div className="w-full lg:w-[72%] xl:w-[74%] min-h-[220px] sm:min-h-[280px] relative overflow-hidden border-t lg:border-t-0 lg:border-l border-maroon">
            <img
              src={amicaNeonLounge}
              alt="AMICA SOHO Subterranean Private Hire Lounge and Bar"
              className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </section>


      {/* =========================================================================
          4. GALLERY SECTION
          Matches mockup:
          - Left: Title "Gallery" + underline + "A glimpse inside AMICA SOHO."
          - Right: Horizontal row of 6 seamless thumbnails
         ========================================================================= */}
      <section className="w-full border-b border-maroon bg-maroon-deep">
        <div className="w-full flex flex-col lg:flex-row items-stretch">
          
          {/* Left Title Block */}
          <div className="w-full lg:w-[18%] p-6 sm:p-8 flex flex-col justify-center bg-gradient-to-b from-burgundy-dark to-maroon-deep border-b lg:border-b-0 lg:border-r border-maroon">
            <h2 className="font-serif text-2xl text-[#FDFBF7] font-normal">
              Gallery
            </h2>
            <div className="w-8 h-[1.5px] bg-gold-amica mt-1.5 mb-2" />
            <p className="text-[11px] text-gold-amica/90 font-sans">
              A glimpse inside AMICA SOHO.
            </p>
          </div>

          {/* Right 6-Thumbnail Strip */}
          <div className="w-full lg:w-[82%] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t lg:border-t-0 lg:border-l border-maroon divide-x divide-y sm:divide-y-0 divide-maroon">
            {galleryItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLightboxIndex(idx)}
                className="relative group aspect-square sm:aspect-[4/3] lg:aspect-[4/3] overflow-hidden cursor-pointer focus:outline-none bg-maroon-deep min-h-[44px]"
                title={item.alt}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-maroon-deep/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-maroon-awning/60">
                  <span className="text-[10px] tracking-widest uppercase font-serif text-[#FFEAA7] border border-gold-amica px-2.5 py-1 bg-maroon-dark/90 shadow-md">
                    VIEW
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          5. OPENING HOURS & FIND US ROW
          Matches mockup:
          - Column 1: Opening Hours (7 days)
          - Column 2: Find Us (23 Frith St, Soho + 4 contact icons + VIEW ON MAP)
          - Column 3: Dark Soho map with streets and gold location pin
         ========================================================================= */}
      <section className="w-full border-b border-maroon bg-maroon-deep">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-maroon">
          
          {/* Column 1: Opening Hours (Takes 4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-burgundy-dark to-maroon-deep flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#FDFBF7] font-normal">
                Opening Hours
              </h2>
              <div className="w-8 h-[1.5px] bg-gold-amica mt-1.5 mb-5" />

              <div className="space-y-2 text-xs font-sans">
                {[
                  { day: 'Wednesday', hours: '17:00 – 03:00' },
                  { day: 'Thursday', hours: '17:00 – 03:00' },
                  { day: 'Friday', hours: '17:00 – 03:00' },
                  { day: 'Saturday', hours: '17:00 – 03:00' },
                  { day: 'Sun – Tue', hours: 'Closed' },
                ].map((slot) => (
                  <div key={slot.day} className="flex items-center justify-between text-[#E5DFD7]">
                    <span className="font-light">{slot.day}</span>
                    <span className="font-mono text-gold-amica tracking-wider font-medium">{slot.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Find Us (Takes 4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-burgundy via-burgundy-dark to-maroon-dark flex flex-col items-center justify-center text-center space-y-5">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#FDFBF7] font-normal">
                Find Us
              </h2>
              <p className="text-xs text-gold-amica font-sans mt-1.5 tracking-wider uppercase font-medium">
                23 Frith St, Soho · London W1D 4RR
              </p>
            </div>

            {/* 4 Contact & Social Icons in Maroon Velvet Rings with Gold Borders (Min 44x44px touch targets) */}
            <div className="flex items-center justify-center gap-4 text-gold-amica">
              <a
                href="mailto:reservations@amicasoho.com"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-burgundy border border-maroon-gold text-gold-amica hover:bg-maroon-awning hover:border-gold-amica flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:+442079460192"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-burgundy border border-maroon-gold text-gold-amica hover:bg-maroon-awning hover:border-gold-amica flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="Call Reservations"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-burgundy border border-maroon-gold text-gold-amica hover:bg-maroon-awning hover:border-gold-amica flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="Follow Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://maps.google.com/?q=23+Frith+Street+Soho+London"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-burgundy border border-maroon-gold text-gold-amica hover:bg-maroon-awning hover:border-gold-amica flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="View on Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>

            <a
              href="https://maps.google.com/?q=23+Frith+Street+Soho+London+W1D+4RR"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-maroon-gold min-h-[44px] text-[10.5px] font-sans font-semibold tracking-[0.2em] uppercase py-2.5 px-6 transition-all cursor-pointer inline-flex items-center justify-center shadow-sm active:scale-95 w-full sm:w-auto rounded-sm"
            >
              VIEW ON MAP
            </a>
          </div>

          {/* Column 3: Stylized Dark Soho Map (Takes 4 cols) */}
          <div className="lg:col-span-4 min-h-[240px] bg-[#0A0B0E] relative overflow-hidden flex items-center justify-center p-6 select-none group">
            {/* Minimal Vector Street Map Canvas / Graphic */}
            <div className="absolute inset-0 opacity-40">
              {/* Street grid lines */}
              <svg className="w-full h-full text-[#2A1017]" viewBox="0 0 400 250" fill="none" stroke="currentColor">
                {/* Diagonal roads */}
                <line x1="0" y1="60" x2="400" y2="180" strokeWidth="6" stroke="#1F080D" />
                <line x1="40" y1="0" x2="320" y2="250" strokeWidth="5" stroke="#1F080D" />
                <line x1="180" y1="0" x2="380" y2="200" strokeWidth="4" stroke="#1F080D" />
                <line x1="10" y1="200" x2="380" y2="40" strokeWidth="4" stroke="#1F080D" />
                <line x1="120" y1="250" x2="280" y2="0" strokeWidth="3" stroke="#1F080D" />
              </svg>
            </div>

            {/* Street Names matching Soho layout */}
            <span className="absolute left-10 bottom-14 text-[9px] font-sans tracking-[0.25em] text-[#DFBE7B]/70 uppercase">
              SOHO
            </span>
            <span className="absolute left-24 bottom-6 text-[8px] font-sans tracking-[0.2em] text-[#DFBE7B]/60 uppercase rotate-[-25deg]">
              CARNABY ST
            </span>
            <span className="absolute right-6 top-10 text-[8px] font-sans tracking-[0.2em] text-[#DFBE7B]/60 uppercase rotate-[-28deg]">
              OLD COMPTON ST
            </span>

            {/* Maroon & Gold Awning Pin Marker */}
            <a
              href="https://maps.google.com/?q=23+Frith+Street+Soho+London+W1D+4RR"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 flex flex-col items-center group-hover:scale-110 transition-transform duration-300 cursor-pointer min-h-[44px] min-w-[44px] justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#DFBE7B] via-[#851C2C] to-[#3B0A12] p-[1.5px] shadow-[0_0_25px_rgba(223,190,123,0.6)]">
                <div className="w-full h-full bg-burgundy rounded-full flex items-center justify-center text-gold-amica">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </div>
              <span className="font-serif text-[11px] tracking-[0.25em] text-[#FDFBF7] uppercase mt-1.5 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                AMICA SOHO
              </span>
              <span className="text-[8px] tracking-wider text-gold-amica uppercase font-sans">
                23 Frith Street
              </span>
            </a>
          </div>

        </div>
      </section>


      {/* =========================================================================
          6. SIGNATURE BOTTOM RESERVATION BANNER: "Make a Reservation"
          Rich Velvet Maroon Awning with Golden Accents & Mobile Safe Layout
         ========================================================================= */}
      <section className="relative w-full border-t border-b border-maroon-gold bg-maroon-awning py-9 px-6 sm:px-12 overflow-hidden shadow-[0_10px_35px_rgba(21,3,6,0.9)]">
        {/* Fine gold border inlay top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#DFBE7B] to-transparent opacity-60" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left: Atmospheric awning facade thumbnail */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#DFBE7B] shadow-md">
              <img
                src={amicaEntranceDome}
                alt="Amica Soho Entrance"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-serif tracking-[0.28em] text-gold-amica uppercase font-bold">
                AMICA SOHO
              </span>
              <span className="text-[8.5px] font-sans tracking-[0.2em] text-[#FDFBF7] uppercase">
                23 Frith Street
              </span>
            </div>
          </div>

          {/* Center: "Make a Reservation —" + BOOK NOW */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center w-full sm:w-auto">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#FDFBF7] font-light drop-shadow-sm">
                Make a Reservation <span className="text-gold-amica mx-2 font-normal">—</span>
              </h3>
              <p className="text-[10px] text-gold-amica/80 tracking-wider uppercase font-sans mt-0.5">
                1 to 20 Pax · Auto-Confirmed · 5pm – 3am (7 Days a Week)
              </p>
            </div>

            <button
              onClick={() => onNavigate('book')}
              className="bg-[#C5A059] hover:bg-[#DFBE7B] text-[#08080A] font-sans font-semibold text-xs tracking-[0.22em] uppercase min-h-[48px] py-3.5 px-8 transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95 whitespace-nowrap border border-[#FFEAA7]/60 w-full sm:w-auto flex items-center justify-center rounded-sm"
            >
              BOOK NOW
            </button>
          </div>

          {/* Right: Vertical words stack in gold */}
          <div className="text-center md:text-right">
            <div className="text-[9px] font-sans tracking-[0.28em] text-gold-amica uppercase flex md:flex-col gap-3 md:gap-1 font-medium justify-center">
              <span>GOOD DRINKS</span>
              <span>GOOD COMPANY</span>
              <span className="text-[#FFEAA7] font-semibold">SOHO SPIRIT</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. LIGHTBOX MODAL FOR GALLERY (Mobile Responsive)
         ========================================================================= */}
      {activeLightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-maroon-deep/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-maroon-dark border border-maroon-gold p-4 sm:p-6 shadow-2xl rounded-lg">
            {/* Close Button with min 44x44px touch area */}
            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 w-11 h-11 rounded-full border border-maroon-gold hover:border-gold-amica text-[#FDFBF7] hover:text-gold-amica flex items-center justify-center transition-colors cursor-pointer z-10 bg-burgundy/80"
              aria-label="Close image"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="w-full aspect-[16/10] overflow-hidden rounded mb-4">
              <img
                src={galleryItems[activeLightboxIndex].src}
                alt={galleryItems[activeLightboxIndex].alt}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-maroon">
              <div>
                <h4 className="font-serif text-lg text-[#FDFBF7]">
                  {galleryItems[activeLightboxIndex].alt}
                </h4>
                <p className="text-xs text-gold-amica font-sans mt-0.5">
                  {galleryItems[activeLightboxIndex].caption}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveLightboxIndex(
                      (activeLightboxIndex - 1 + galleryItems.length) % galleryItems.length
                    )
                  }
                  className="px-4 py-2 min-h-[44px] text-xs text-gold-amica border border-maroon-gold hover:border-gold-amica transition-colors cursor-pointer bg-burgundy/60 rounded flex items-center justify-center"
                >
                  Prev
                </button>
                <span className="text-xs text-gold-subtle font-mono px-2">
                  {activeLightboxIndex + 1} / {galleryItems.length}
                </span>
                <button
                  onClick={() =>
                    setActiveLightboxIndex((activeLightboxIndex + 1) % galleryItems.length)
                  }
                  className="px-4 py-2 min-h-[44px] text-xs text-gold-amica border border-maroon-gold hover:border-gold-amica transition-colors cursor-pointer bg-burgundy/60 rounded flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

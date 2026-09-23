import React, { useState } from 'react';
import { PageId } from '../types';
import { VENUE_INFO } from '../data/venueData';
import { MapPin, Wine, Music, Calendar, Clock, Award, Compass, Sparkles, BookOpen, X, ChevronRight, Eye } from 'lucide-react';
import { HoursLocationGrid } from '../components/HoursLocationGrid';
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
  AMICA_PHOTOS,
} from '../assets/images/photos';

interface VenuePageProps {
  onNavigate: (page: PageId) => void;
}

export const VenuePage: React.FC<VenuePageProps> = ({ onNavigate }) => {
  const [activePhotoModal, setActivePhotoModal] = useState<number | null>(null);

  return (
    <div className="space-y-20 pb-20 bg-[#08080A]">
      
      {/* Header Banner */}
      <section className="relative min-h-[55vh] flex items-center justify-center bg-[#08080A] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={amicaFacadeNight}
            alt="AMICA SOHO exterior facade and subterranean cocktail haven on 23 Frith Street"
            className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-4 pt-16 pb-12">
          <span className="text-[#9D7E54] text-xs font-display uppercase tracking-[0.25em] block">
            HISTORIC SUBTERRANEAN SANCTUARY · 23 FRITH STREET SOHO
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#FDFBF7] tracking-wide">
            The Amica Soho Venue
          </h1>
          <p className="text-sm sm:text-base text-[#DFBE7B]/85 max-w-2xl mx-auto font-sans leading-relaxed">
            Marked by the burgundy canopy and amber reeded doors of 23 Frith Street, where plush banquettes, exposed brick vaults, and analog music converge.
          </p>
        </div>
      </section>

      {/* Main Editorial Story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[#9D7E54] text-xs font-display uppercase tracking-[0.2em] block">Subterranean Atmosphere</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FDFBF7] leading-tight">
              An Intimate Soho Cellar Born for Unhurried Evenings
            </h2>
            <p className="text-xs sm:text-sm text-[#FDFBF7]/80 leading-relaxed font-sans">
              Step past the brass plaque on Frith Street and descend into our candlelit basement. The air carries the rich aroma of aged oak, roasted botanicals, and bespoke spirit infusions.
            </p>
            <p className="text-xs sm:text-sm text-[#FDFBF7]/80 leading-relaxed font-sans">
              Designed as a refuge from the clamour of the West End, AMICA SOHO takes residence within historic brick vaults. With dim amber sconces, custom leather seating, and aged brass fixtures, every corner invites relaxed conversation and lingering over an artisanal cocktail.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 text-xs font-display text-[#DFBE7B]">
                <MapPin className="w-4 h-4 text-[#9D7E54] shrink-0" />
                <span>23 Frith Street, Soho London W1D 4RR</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-[#9D7E54]/40 shadow-2xl aspect-[4/3]">
            <img
              src={amicaVaultBooth}
              alt="Barrel-vaulted dining booth at AMICA SOHO"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#121215]/90 border border-[#9D7E54]/30 backdrop-blur-md rounded text-xs text-[#DFBE7B] font-serif italic">
              "The vault alcoves offer complete privacy for intimate gatherings and late-night toasts."
            </div>
          </div>
        </div>

        {/* SPACES PHOTO SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative rounded-xl overflow-hidden border border-[#9D7E54]/40 shadow-xl group aspect-[16/10]">
            <img
              src={amicaCrimsonBar}
              alt="The Crimson Speakeasy Bar at AMICA SOHO"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 text-xs font-display text-[#DFBE7B]">
              <span className="block font-bold text-sm text-[#FDFBF7]">The Crimson Cocktail Bar</span>
              <span className="text-[11px] text-[#DFBE7B]/80 font-sans">Fluted walnut counter with backlit amber and ruby spirits</span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-[#9D7E54]/40 shadow-xl group aspect-[16/10]">
            <img
              src={amicaNeonLounge}
              alt="The Nocturnal Lounge and Neon Wall at AMICA SOHO"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 text-xs font-display text-[#DFBE7B]">
              <span className="block font-bold text-sm text-[#FDFBF7]">Soho After Dark Neon Lounge</span>
              <span className="text-[11px] text-[#DFBE7B]/80 font-sans">Curated red neon typography grid and late-night seating</span>
            </div>
          </div>
        </div>

        {/* 10 ARCHITECTURAL SPACES GALLERY GRID */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[#9D7E54] text-xs font-display uppercase tracking-[0.25em] block">
              PHOTOGRAPHIC ARCHIVE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FDFBF7]">
              The Ten Spaces of AMICA SOHO
            </h2>
            <p className="text-xs sm:text-sm text-[#DFBE7B]/80 font-sans">
              Explore every corner of 23 Frith Street, from our iconic street facade and crimson speakeasy counter to intimate private brick alcoves and opulent powder room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AMICA_PHOTOS.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setActivePhotoModal(index)}
                className="group relative rounded-xl overflow-hidden border border-[#9D7E54]/30 bg-[#121215] shadow-lg cursor-pointer hover:border-[#DFBE7B] transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent opacity-70" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#08080A]/80 border border-[#9D7E54] flex items-center justify-center text-[#DFBE7B] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-4 bg-[#121215] border-t border-[#9D7E54]/20 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[10px] font-display text-[#9D7E54] uppercase tracking-wider block">
                      {photo.category}
                    </span>
                    <h4 className="font-display text-base font-bold text-[#FDFBF7] group-hover:text-[#FFEAA7] transition-colors">
                      {photo.title}
                    </h4>
                    <p className="text-[11px] text-[#DFBE7B]/80 font-sans mt-0.5">
                      {photo.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal for Photo Gallery */}
        {activePhotoModal !== null && (
          <div
            className="fixed inset-0 z-50 bg-[#08080A]/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePhotoModal(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#121215] border border-[#9D7E54] rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#08080A] border border-[#9D7E54] text-[#DFBE7B] hover:text-[#FDFBF7] flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
                <img
                  src={AMICA_PHOTOS[activePhotoModal].src}
                  alt={AMICA_PHOTOS[activePhotoModal].alt}
                  className="max-h-[70vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] font-display text-[#9D7E54] uppercase tracking-widest block">
                    {AMICA_PHOTOS[activePhotoModal].category} · PHOTO {activePhotoModal + 1} OF {AMICA_PHOTOS.length}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FDFBF7]">
                    {AMICA_PHOTOS[activePhotoModal].title}
                  </h3>
                  <p className="text-xs text-[#DFBE7B] font-sans mt-0.5">
                    {AMICA_PHOTOS[activePhotoModal].subtitle}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActivePhotoModal((prev) => (prev! > 0 ? prev! - 1 : AMICA_PHOTOS.length - 1))}
                    className="px-3 py-1.5 rounded bg-[#1C1C22] border border-[#9D7E54]/40 text-[#DFBE7B] hover:text-white text-xs font-display cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setActivePhotoModal((prev) => (prev! + 1) % AMICA_PHOTOS.length)}
                    className="px-3 py-1.5 rounded bg-[#1C1C22] border border-[#9D7E54]/40 text-[#DFBE7B] hover:text-white text-xs font-display cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Three Pillars of the Venue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-[#121215] border border-[#9D7E54]/30 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded bg-[#1C1C22] border border-[#9D7E54] text-[#DFBE7B] flex items-center justify-center">
              <Wine className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#FDFBF7]">The Spirit & Wine Vaults</h3>
            <p className="text-xs text-[#FDFBF7]/75 leading-relaxed font-sans">
              Housing hand-selected rare spirits, small-batch amari, and old-world vintages maintained under precise cellar temperature control.
            </p>
          </div>

          <div className="bg-[#121215] border border-[#9D7E54]/30 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded bg-[#1C1C22] border border-[#9D7E54] text-[#DFBE7B] flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#FDFBF7]">Analog Vinyl Acoustics</h3>
            <p className="text-xs text-[#FDFBF7]/75 leading-relaxed font-sans">
              Curated analog sound system playing warm 70s jazz, afro-beats, and ambient nocturnal vinyl seamlessly integrated into space acoustics.
            </p>
          </div>

          <div className="bg-[#121215] border border-[#9D7E54]/30 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded bg-[#1C1C22] border border-[#9D7E54] text-[#DFBE7B] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#FDFBF7]">Bespoke Hospitality</h3>
            <p className="text-xs text-[#FDFBF7]/75 leading-relaxed font-sans">
              Founded by veteran hospitality masters who believe late-night service should feel personal, discerning, and deeply welcoming.
            </p>
          </div>

        </div>

        {/* Sommelier Philosophy Callout */}
        <div className="p-8 sm:p-12 bg-[#141418] border-2 border-[#9D7E54]/40 rounded-2xl text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-4">
            <BookOpen className="w-8 h-8 text-[#9D7E54] mx-auto" />
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
              The Amica Soho Philosophy
            </h3>
            <p className="font-serif text-lg sm:text-xl italic text-[#DFBE7B] leading-relaxed">
              "Great cocktails and fine wine should not be restricted to formal white-cloth dining. At AMICA SOHO, we bring the best spirits in the world down into a candlelit Soho basement, paired with Italian cicchetti and great music."
            </p>
            <span className="block text-xs font-display text-[#DFBE7B] uppercase tracking-widest pt-2">
              — AMICA SOHO Founders, 23 Frith Street
            </span>
          </div>
        </div>

        {/* DEDICATED HOURS & LOCATION GRID */}
        <HoursLocationGrid onNavigate={onNavigate} />

        {/* Call to action */}
        <div className="text-center pt-4 space-y-4">
          <h3 className="font-display text-2xl font-bold text-[#FDFBF7]">Experience AMICA SOHO Firsthand</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('book')}
              className="px-8 py-3.5 rounded bg-gradient-to-r from-[#DFBE7B] via-[#C5A059] to-[#9D7E54] text-[#08080A] font-display font-bold text-xs tracking-widest uppercase cursor-pointer hover:brightness-110 shadow-lg"
            >
              Reserve A Table
            </button>
            <button
              onClick={() => onNavigate('private-hire')}
              className="px-8 py-3.5 rounded bg-[#181820] border border-[#9D7E54]/50 text-[#DFBE7B] hover:text-[#FFEAA7] font-display text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Inquire About Private Hire
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};

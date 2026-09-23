import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Sparkles, BookOpen, Quote, ShieldCheck } from 'lucide-react';

import {
  amicaNeonLounge as posterBurlesque,
  amicaBarDisplay as posterMilanoNy,
  amicaCrimsonBar as posterSpritz,
  amicaVaultBooth as posterVermouth,
  amicaArchBooth as posterCampari,
  amicaOxbloodLounge as posterCicchetti,
} from '../assets/images/photos';

interface VintagePoster {
  id: string;
  year: string;
  title: string;
  tagline: string;
  image: string;
  style: string;
  locationInClub: string;
  description: string;
  quote: string;
  pairingNote: string;
}

const VINTAGE_POSTERS: VintagePoster[] = [
  {
    id: 'poster-burlesque-1930s',
    year: '1930s',
    title: 'La Bella Cabaret & Live Burlesque',
    tagline: 'Seductive Milano-Soho Cabaret Nightlife',
    image: posterBurlesque,
    style: '1930s Italian Art Deco Cabaret Poster',
    locationInClub: 'Subterranean Stage Entry & VIP Lounge Wall',
    description:
      'A glamorous Art Deco cabaret poster depicting the sultry live jazz vocalist and burlesque sirens of 1930s Milano and Soho. Celebrates midnight aperitivo and live stage performances.',
    quote: '“La notte appartiene alla musica e alla passione.” (The night belongs to music and passion.)',
    pairingNote: 'Recommended during Friday & Saturday Live Burlesque Sessions with a Sbagliato Royal',
  },
  {
    id: 'poster-milano-ny-1950s',
    year: '1950s',
    title: 'Milano Soho Manhattan Transatlantic',
    tagline: 'High Fashion Meets Soho Industrial Loft Vibe',
    image: posterMilanoNy,
    style: 'Transatlantic Modernist Graphic Poster',
    locationInClub: 'Central Bar Counter Wall Display',
    description:
      'Blending the high-fashion runway elegance of Milano with the cast-iron architecture of New York Soho, this poster showcases the crossover of transatlantic cocktail culture.',
    quote: '“Da Milano a New York, il rito dell’Aperitivo.” (From Milan to New York, the ritual of Aperitivo.)',
    pairingNote: 'Pairs with Campari Sbagliato & Truffled Crostini',
  },
  {
    id: 'poster-spritz-1950s',
    year: '1950s',
    title: 'Il Spritz Veneziano',
    tagline: 'The Golden Age of Effervescence',
    image: posterSpritz,
    style: 'Mid-Century Italian Graphic Art',
    locationInClub: 'Framed in Vault Alcove 2',
    description:
      'Created during the post-war resurgence of Venetian café culture, this iconic poster captures the luminous orange glow of Prosecco, Select aperitivo, and soda over ice. It symbolises the joyous ritual of meeting friends at sunset.',
    quote: '“Un’ora di gioia prima della cena.” (An hour of joy before dinner.)',
    pairingNote: 'Recommended with our LAC Signature Spritz & Rosemary Focaccia',
  },
  {
    id: 'poster-vermouth-1920s',
    year: '1920s',
    title: 'Vermouth di Torino Extra Superior',
    tagline: 'Art Deco Botanical Masterpiece',
    image: posterVermouth,
    style: 'Art Deco Gold & Crimson Lithograph',
    locationInClub: 'Hanging above the Main Bar Counter',
    description:
      'A striking 1920s Art Deco print celebrating Piemontese vermouth makers who infused alpine wormwood, rhubarb, and citrus peel into rich fortified wines. The golden sunburst accentuates the deep ruby tint of cask-rested vermouth.',
    quote: '“L’Elisir delle Montagne Piemontesi.” (The Elixir of the Piedmont Mountains.)',
    pairingNote: 'Pairs with Negroni di Cantina & 24-Month Prosciutto di Parma',
  },
  {
    id: 'poster-campari-1930s',
    year: '1930s',
    title: 'Futurismo e Bitter Campari',
    tagline: 'Geometric Avant-Garde Italian Graphic',
    image: posterCampari,
    style: 'Italian Futurist Graphic Movement',
    locationInClub: 'Displayed at 23 Frith St Entrance Vestibule',
    description:
      'Inspired by Fortunato Depero’s revolutionary 1930s Futurist designs for Campari, this piece features sharp angular geometry, bold crimson typography, and the clean silhouette of a vintage soda siphon.',
    quote: '“Energia, colore, aperitivo moderno.” (Energy, color, modern aperitivo.)',
    pairingNote: 'Pairs with House Americano & Gordal Olives',
  },
  {
    id: 'poster-cicchetti-1940s',
    year: '1940s',
    title: 'Vino e Cicchetti di Venezia',
    tagline: 'The Bacaro Gastronomic Heritage',
    image: posterCicchetti,
    style: 'Classic Venetian Tavern Lithograph',
    locationInClub: 'Mounted in Private Dining Vault',
    description:
      'An authentic depiction of Venetian bacari tavern life, celebrating small savoury bites (cicchetti) accompanied by a small glass of wine (un ombra di vino). Illustrates hand-carved charcuterie and artisan cheeses.',
    quote: '“Mangiar bene, bere con garbo.” (Eat well, drink with grace.)',
    pairingNote: 'Pairs with Whipped Baccalà Mantecato & Polenta',
  },
];

export const AnimatedPosterSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [zoomModalImage, setZoomModalImage] = useState<VintagePoster | null>(null);

  // Auto-slide poster artwork every 7 seconds
  React.useEffect(() => {
    if (isPaused || zoomModalImage) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % VINTAGE_POSTERS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, zoomModalImage]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % VINTAGE_POSTERS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + VINTAGE_POSTERS.length) % VINTAGE_POSTERS.length);
  };

  const activePoster = VINTAGE_POSTERS[currentIndex];

  return (
    <section className="bg-[#0e0e11] border-y border-[#C5A059]/30 py-16 sm:py-24 relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#DFBE7B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181820] border border-[#C5A059]/40 text-[#DFBE7B] text-[10px] font-display uppercase tracking-[0.25em]">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>SUBTERRANEAN ART ARCHIVE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FDFBF7] tracking-wide">
            Vintage Italian Poster Heritage
          </h2>
          <p className="text-xs sm:text-sm text-[#DFBE7B]/80 leading-relaxed font-sans">
            Our 23 Frith Street cellars house an archive of original 1920s–1950s Art Deco and Futurist Italian aperitivo advertising artwork. Slide through the collection below.
          </p>
        </div>

        {/* Poster Selector Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap pb-2">
          {VINTAGE_POSTERS.map((poster, idx) => (
            <button
              key={poster.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                idx === currentIndex
                  ? 'bg-[#C5A059] text-[#0B0B0C] border-[#C5A059] shadow-lg scale-105 font-bold'
                  : 'bg-[#181820]/90 text-[#FDFBF7]/70 border-[#C5A059]/30 hover:text-[#DFBE7B] hover:border-[#C5A059]/60'
              }`}
            >
              <span className="font-display text-[10px] opacity-80">{poster.year}</span>
              <span>{poster.title}</span>
            </button>
          ))}
        </div>

        {/* Main Animated Poster Slide Display */}
        <div className="bg-[#121215]/95 border border-[#C5A059]/40 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Interactive Animated Image Box */}
            <div className="lg:col-span-5 relative group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePoster.id}
                  initial={{ opacity: 0, x: -30, rotate: -1 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: 30, rotate: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="relative rounded-xl overflow-hidden border-2 border-[#C5A059]/50 shadow-2xl bg-[#0B0B0C] aspect-[3/4]"
                >
                  <img
                    src={activePoster.image}
                    alt={activePoster.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />

                  {/* Overlay Gradient & Zoom Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-80" />
                  
                  <button
                    onClick={() => setZoomModalImage(activePoster)}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-[#121215]/80 border border-[#C5A059] text-[#DFBE7B] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all shadow-xl cursor-pointer"
                    title="View Full High-Res Artwork"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {/* Year Tag Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-display text-[#DFBE7B]">
                    <span className="px-3 py-1 bg-[#121215]/90 border border-[#C5A059]/40 rounded-md font-display font-bold">
                      ERA: {activePoster.year}
                    </span>
                    <span className="text-[10px] text-[#FDFBF7]/80 font-sans italic bg-[#121215]/80 px-2 py-1 rounded">
                      {activePoster.style}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Historical Text & Artwork Details */}
            <div className="lg:col-span-7 space-y-6">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePoster.id + '-text'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  <div>
                    <span className="text-xs font-display text-[#DFBE7B] uppercase tracking-widest block mb-1">
                      {activePoster.locationInClub}
                    </span>
                    <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#FDFBF7] tracking-wide">
                      {activePoster.title}
                    </h3>
                    <p className="text-sm font-display italic text-[#DFBE7B] mt-1">
                      {activePoster.tagline}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-[#FDFBF7]/85 leading-relaxed font-sans">
                    {activePoster.description}
                  </p>

                  {/* Historical Quote Box */}
                  <div className="p-4 rounded-xl bg-[#181820] border-l-4 border-[#C5A059] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-display text-[#DFBE7B]">
                      <Quote className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>HISTORICAL APERITIVO MOTTO</span>
                    </div>
                    <p className="font-display italic text-sm text-[#FDFBF7]/90">
                      {activePoster.quote}
                    </p>
                  </div>

                  {/* Menu Pairing Box */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#181820] border border-[#C5A059]/30 text-xs text-[#FDFBF7]">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span className="font-sans">{activePoster.pairingNote}</span>
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Navigation Bar for Posters */}
              <div className="pt-4 border-t border-[#C5A059]/30 flex items-center justify-between">
                <div className="text-xs font-display text-[#DFBE7B]">
                  Poster {currentIndex + 1} of {VINTAGE_POSTERS.length}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="min-w-[44px] min-h-[44px] p-3 rounded-lg bg-[#181820] border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    aria-label="Previous Poster"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="min-w-[44px] min-h-[44px] p-3 rounded-lg bg-[#181820] border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    aria-label="Next Poster"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Full Screen High-Res Lightbox Modal */}
      <AnimatePresence>
        {zoomModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B0B0C]/98 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8"
            onClick={() => setZoomModalImage(null)}
          >
            {/* Top Close Bar */}
            <div className="w-full flex items-center justify-between text-[#DFBE7B] max-w-6xl z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span className="font-display text-sm sm:text-base font-bold text-[#FDFBF7]">
                  {zoomModalImage.title} ({zoomModalImage.year})
                </span>
              </div>

              <button
                onClick={() => setZoomModalImage(null)}
                className="px-4 py-2 rounded-full bg-[#181820] border border-[#C5A059] text-[#DFBE7B] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all cursor-pointer flex items-center gap-2 text-xs font-display"
              >
                <span>CLOSE FULLSCREEN</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Image - Fills Screen */}
            <div className="relative w-full max-w-5xl h-[75vh] flex items-center justify-center my-auto" onClick={(e) => e.stopPropagation()}>
              
              <motion.img
                key={zoomModalImage.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={zoomModalImage.image}
                alt={zoomModalImage.title}
                className="max-w-full max-h-full object-contain rounded-xl border border-[#C5A059]/40 shadow-2xl"
              />

              {/* Prev / Next Buttons in Full Screen */}
              <button
                onClick={() => {
                  const newIdx = (currentIndex - 1 + VINTAGE_POSTERS.length) % VINTAGE_POSTERS.length;
                  setCurrentIndex(newIdx);
                  setZoomModalImage(VINTAGE_POSTERS[newIdx]);
                }}
                className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#181820]/90 border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all cursor-pointer shadow-2xl"
                title="Previous Poster"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  const newIdx = (currentIndex + 1) % VINTAGE_POSTERS.length;
                  setCurrentIndex(newIdx);
                  setZoomModalImage(VINTAGE_POSTERS[newIdx]);
                }}
                className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#181820]/90 border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all cursor-pointer shadow-2xl"
                title="Next Poster"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>

            {/* Bottom Details Bar */}
            <div className="w-full max-w-3xl text-center space-y-1 z-10" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs font-display text-[#DFBE7B] uppercase tracking-widest block">
                {zoomModalImage.style} · {zoomModalImage.locationInClub}
              </span>
              <p className="text-xs sm:text-sm text-[#FDFBF7]/80 italic max-w-xl mx-auto font-sans">
                {zoomModalImage.description}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

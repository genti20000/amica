import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, MapPin, Clock } from 'lucide-react';
import { PageId } from '../types';
import { AMICA_PHOTOS } from '../assets/images/photos';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  type: 'venue' | 'poster';
  subtitle: string;
}

const HERO_SLIDES: HeroSlide[] = AMICA_PHOTOS.map((photo) => ({
  id: `amica-${photo.id}`,
  image: photo.src,
  title: photo.title,
  type: 'venue',
  subtitle: photo.subtitle,
}));

interface AnimatedHeroSliderProps {
  onNavigate: (page: PageId) => void;
  onOpenQuiz: () => void;
}

export const AnimatedHeroSlider: React.FC<AnimatedHeroSliderProps> = ({
  onNavigate,
  onOpenQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-slide every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const activeSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      className="relative w-full h-[58vh] sm:h-[88vh] md:h-[92vh] lg:h-[95vh] flex items-center justify-center overflow-hidden bg-[#100305]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Vivid Animated Image or Poster */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
        >
          {/* Image Display */}
          {activeSlide.type === 'poster' ? (
            <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4 bg-[#100305]">
              {/* Full poster image formatted in portrait ratio on mobile */}
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="relative z-10 max-h-[52vh] sm:max-h-none w-auto h-full sm:w-full object-contain aspect-[3/4] sm:aspect-auto rounded-lg border border-[#C5A059]/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-1000 ease-out"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] transition-all duration-1000 ease-out"
              referrerPolicy="no-referrer"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Removed bottom shade overlay to keep image completely unshaded */}

      {/* Floating Hero Info Overlay Card for instant conversion (Desktop & Tablet) */}
      <div className="hidden sm:flex absolute bottom-6 left-8 right-8 z-20 max-w-4xl mx-auto bg-[#121215]/95 border border-[#C5A059]/40 backdrop-blur-md rounded-xl p-5 shadow-2xl items-center justify-between gap-6">
        <div className="space-y-1 text-left">
          <div className="flex flex-wrap items-center justify-start gap-2 text-[11px] text-[#DFBE7B] font-display uppercase tracking-wider">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#C5A059]" /> 23 Frith St, Soho</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#C5A059]" /> Tue–Sat: 16:30–Late</span>
          </div>
          <h1 className="font-display text-base lg:text-lg font-bold text-[#FDFBF7] tracking-wide line-clamp-1">
            {activeSlide.title}
          </h1>
          <p className="text-xs text-[#DFBE7B]/80 font-sans line-clamp-1">
            {activeSlide.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('book')}
            className="btn-brass px-4 py-2 rounded text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Table</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="btn-brass-outline px-3.5 py-2 rounded font-medium text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Pairing Quiz</span>
          </button>
        </div>
      </div>

      {/* Slider Left Arrow (Minimum 44x44px touch target) */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121215]/90 border border-[#C5A059] text-[#DFBE7B] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all flex items-center justify-center shadow-2xl backdrop-blur-md cursor-pointer active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Slider Right Arrow (Minimum 44x44px touch target) */}
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121215]/90 border border-[#C5A059] text-[#DFBE7B] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all flex items-center justify-center shadow-2xl backdrop-blur-md cursor-pointer active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};

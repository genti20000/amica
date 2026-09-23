import React from 'react';
import { motion } from 'motion/react';
import { PageId } from '../types';
import FACADE_IMAGE from '../assets/images/regenerated_image_1790200582456.png';

interface ComingSoonPageProps {
  onNavigate?: (page: PageId) => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = () => {
  return (
    <div className="w-full min-h-screen bg-[#000000] text-[#FDFBF7] font-sans selection:bg-[#C5A059] selection:text-[#150306] flex flex-col items-center justify-start">
      
      {/* Centered Column for both Mobile & Desktop surrounded by dark black */}
      <div className="w-full max-w-[560px] mx-auto bg-[#000000] flex flex-col shadow-2xl relative">
        
        {/* Semantic accessibility information */}
        <h1 className="sr-only">AMICA SOHO — Coming Soon — 23 Frith Street, London</h1>
        <p className="sr-only">Aperitivo • Music • Late. Some nights stay with you. Soho is calling.</p>

        {/* =========================================================================
            HERO FACADE WITH SUBTLE FADE-IN
           ========================================================================= */}
        <motion.div
          id="coming-soon-hero"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full relative flex items-center justify-center bg-[#000000] overflow-hidden select-none"
        >
          {/* Main Facade Image */}
          <img
            src={FACADE_IMAGE}
            alt="AMICA SOHO 23 Frith Street Entrance Facade"
            className="w-full h-auto block select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* =========================================================================
            LOWER SECTION: SIGNATURE VELVET MAROON CANVAS WITH BRAND CREST
           ========================================================================= */}
        <motion.section
          id="coming-soon-creed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full bg-gradient-to-b from-[#140205] via-[#180307] to-[#0A0103] py-10 sm:py-14 px-6 flex flex-col items-center justify-center text-center overflow-hidden"
        >
          {/* Subtle warm ambient glow in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#DFBE7B]/5 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-sm mx-auto flex flex-col items-center select-none">
            {/* AMICA */}
            <h2 className="font-['Cinzel',serif] text-3xl sm:text-4xl tracking-[0.24em] sm:tracking-[0.28em] text-[#E8CCA0] uppercase font-light leading-none">
              AMICA
            </h2>

            {/* — SOHO — */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 text-[#E8CCA0]">
              <span className="w-8 sm:w-12 h-[1px] bg-[#DFBE7B]/80" />
              <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.36em] uppercase font-medium">
                SOHO
              </span>
              <span className="w-8 sm:w-12 h-[1px] bg-[#DFBE7B]/80" />
            </div>

            {/* APERITIVO • MUSIC • LATE */}
            <div className="flex items-center justify-center gap-2 mt-4 font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.32em] uppercase text-[#E8CCA0] font-medium">
              <span>APERITIVO</span>
              <span className="text-[6px] text-[#DFBE7B]">•</span>
              <span>MUSIC</span>
              <span className="text-[6px] text-[#DFBE7B]">•</span>
              <span>LATE</span>
            </div>

            {/* Horizontal Gold Line Divider */}
            <div className="w-12 h-[1px] bg-[#DFBE7B]/80 my-3.5" />

            {/* SOHO IS CALLING */}
            <p className="font-['Cormorant_Garamond',serif] text-[10.5px] sm:text-xs tracking-[0.38em] text-[#E8CCA0] uppercase font-light">
              SOHO IS CALLING
            </p>

          </div>

        </motion.section>

      </div>

    </div>
  );
};

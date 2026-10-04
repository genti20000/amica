import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Calendar } from 'lucide-react';
import { PageId } from '../types';
import FACADE_IMAGE from '../assets/images/regenerated_image_1790200582456.png';

interface ComingSoonPageProps {
  onNavigate?: (page: PageId) => void;
  onOpenLogin?: () => void;
  isUnlocked?: boolean;
  onLockSite?: () => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  onNavigate,
  onOpenLogin,
  isUnlocked = false,
  onLockSite
}) => {
  return (
    <div className="w-full min-h-[calc(100dvh-3.25rem)] sm:min-h-[calc(100dvh-4rem)] bg-[#000000] text-[#FDFBF7] font-sans selection:bg-[#C5A059] selection:text-[#150306] flex flex-col items-center justify-start">
      
      {/* Centered Column for both Mobile & Desktop surrounded by dark black */}
      <div className="w-full max-w-[560px] mx-auto bg-[#000000] flex flex-col shadow-2xl relative">
        
        {/* Semantic accessibility information */}
        <h1 className="sr-only">AMICA SOHO — Coming Soon — 23 Frith Street, London</h1>
        <p className="sr-only">Opening Soon · 23 Frith Street, Soho London · info@amicasoho.com</p>

        {/* =========================================================================
            HERO FACADE - DISPLAYED IN FULL (NO CROPPING)
           ========================================================================= */}
        <motion.div
          id="coming-soon-hero"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full relative flex items-center justify-center bg-[#000000] overflow-hidden select-none"
        >
          {/* Main Facade Image - 100% full view */}
          <img
            src={FACADE_IMAGE}
            alt="AMICA SOHO 23 Frith Street Entrance Facade"
            className="w-full h-auto block select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* =========================================================================
            LOWER SECTION: SIGNATURE VELVET MAROON CANVAS WITH OPENING SOON & CONTACT
           ========================================================================= */}
        <motion.section
          id="coming-soon-creed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full bg-gradient-to-b from-[#140205] via-[#180307] to-[#0A0103] py-4 sm:py-7 px-4 sm:px-6 flex flex-col items-center justify-center text-center overflow-hidden shrink-0"
        >
          {/* Subtle warm ambient glow in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#DFBE7B]/5 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-sm mx-auto flex flex-col items-center select-none w-full">
            {/* OPENING SOON with Radiant Golden Shine Animation */}
            <div className="flex flex-col items-center select-none">
              <div className="golden-shine-badge px-4 sm:px-7 py-2 sm:py-2.5 rounded-[3px] bg-gradient-to-r from-[#200A0E] via-[#321118] to-[#200A0E] border border-[#DFBE7B]/60 shadow-[0_4px_24px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,234,167,0.35)]">
                <span className="golden-shine-text font-['Cinzel',serif] text-xs sm:text-sm md:text-base tracking-[0.32em] sm:tracking-[0.4em] uppercase font-bold leading-none block">
                  OPENING SOON
                </span>
              </div>
            </div>

            {/* Instant Auto-Confirm Table Reservation CTA */}
            {onNavigate && (
              <div className="mt-3.5">
                <button
                  onClick={() => onNavigate('book')}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded bg-gradient-to-r from-[#2A080F] via-[#3D0C15] to-[#2A080F] hover:from-[#3D0C15] hover:to-[#55101E] border border-[#DFBE7B]/60 hover:border-[#FFEAA7] text-[#DFBE7B] hover:text-[#FFEAA7] font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.7)] active:scale-95"
                >
                  <Calendar className="w-3 h-3 text-[#DFBE7B]" />
                  <span>Reserve Table · 1 to 20 Pax (Auto-Confirmed)</span>
                </button>
              </div>
            )}

            {/* CONTACT US: info@amicasoho.com */}
            <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#DFBE7B]/20 w-full flex flex-col items-center">
              <span className="font-sans text-[7.5px] sm:text-[9px] tracking-[0.3em] text-[#DFBE7B]/80 uppercase font-semibold">
                Contact Us
              </span>
              <a
                href="mailto:info@amicasoho.com"
                className="mt-1.5 inline-flex items-center gap-1.5 sm:gap-2 group text-[#FDFBF7] hover:text-[#FFEAA7] transition-all cursor-pointer"
                aria-label="Contact us at info@amicasoho.com"
              >
                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DFBE7B] group-hover:scale-110 transition-transform" />
                <span className="font-sans text-[11px] sm:text-xs md:text-[13px] tracking-[0.2em] font-medium border-b border-[#DFBE7B]/50 group-hover:border-[#FFEAA7] transition-colors pb-0.5">
                  info@amicasoho.com
                </span>
              </a>
              <p className="mt-2.5 sm:mt-3 text-[7px] sm:text-[8px] tracking-[0.26em] text-[#E8CCA0]/40 uppercase select-none">
                © 2026 AMICA SOHO · All Rights Reserved
              </p>

              {/* Login to Main Site Trigger */}
              <div className="mt-3 pt-2.5 border-t border-[#DFBE7B]/15 w-full flex items-center justify-center">
                {isUnlocked ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onNavigate?.('home')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[#200A0E] via-[#321118] to-[#200A0E] hover:from-[#321118] hover:to-[#4A1521] border border-[#DFBE7B]/50 hover:border-[#DFBE7B] text-[#DFBE7B] hover:text-[#FFEAA7] font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>Enter Main Site</span>
                      <ArrowRight className="w-3 h-3 text-[#DFBE7B]" />
                    </button>
                    {onLockSite && (
                      <button
                        onClick={onLockSite}
                        className="text-[8px] sm:text-[9px] text-[#DFBE7B]/50 hover:text-[#DFBE7B] tracking-[0.2em] uppercase transition-colors cursor-pointer py-1 px-2"
                        title="Lock Site"
                      >
                        Lock
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {onOpenLogin && (
                      <button
                        onClick={onOpenLogin}
                        className="inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] tracking-[0.24em] uppercase text-[#DFBE7B]/70 hover:text-[#FFEAA7] transition-all py-1 px-2.5 rounded hover:bg-[#200A0E] border border-transparent hover:border-[#DFBE7B]/30 cursor-pointer active:scale-95"
                        title="Enter password to access main site"
                      >
                        <Lock className="w-2.5 h-2.5 text-[#DFBE7B]" />
                        <span>Staff Login</span>
                      </button>
                    )}
                    <span className="text-[#DFBE7B]/30 text-[9px]">•</span>
                    <button
                      onClick={() => onNavigate?.('admin-bookings')}
                      className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-[#DFBE7B]/60 hover:text-[#FFEAA7] transition-colors py-1 px-2.5 rounded hover:bg-[#200A0E] cursor-pointer"
                      title="Maître d' Admin Bookings Dashboard"
                    >
                      <span>Admin Bookings</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </motion.section>

      </div>

    </div>
  );
};

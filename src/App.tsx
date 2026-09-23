/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageId, BookingConfirmation } from './types';
import { Calendar, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AperitivoQuizModal } from './components/AperitivoQuizModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';

// Pages
import { ComingSoonPage } from './pages/ComingSoonPage';
import { HomePage } from './pages/HomePage';
import { DrinksFoodPage } from './pages/DrinksFoodPage';
import { VenuePage } from './pages/VenuePage';
import { PrivateHirePage } from './pages/PrivateHirePage';
import { WhatsOnPage } from './pages/WhatsOnPage';
import { VisitPage } from './pages/VisitPage';
import { BookPage } from './pages/BookPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('coming-soon');
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [activeConfirmation, setActiveConfirmation] = useState<BookingConfirmation | null>(null);

  // Saved pairings state in localStorage
  const [savedPairings, setSavedPairings] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lac_saved_pairings');
      return stored ? JSON.parse(stored) : ['lac-signature-spritz', 'focaccia-rosemary'];
    } catch {
      return ['lac-signature-spritz', 'focaccia-rosemary'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lac_saved_pairings', JSON.stringify(savedPairings));
    } catch (e) {
      console.error(e);
    }
  }, [savedPairings]);

  const handleToggleSavedPairing = (id: string) => {
    setSavedPairings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBookingComplete = (confirmation: BookingConfirmation) => {
    setActiveConfirmation(confirmation);
  };

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col ${currentPage === 'coming-soon' ? 'bg-[#000000]' : 'bg-maroon-deep'} text-[#FDFBF7] font-sans selection:bg-[#C5A059] selection:text-[#150306] overflow-x-hidden`}>
      
      {/* Header Bar */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        savedPairingsCount={savedPairings.length}
      />

      {/* Main Page Content */}
      <main className={`flex-1 ${currentPage === 'coming-soon' ? 'bg-[#000000]' : 'pb-20 md:pb-0'}`}>
        {currentPage === 'coming-soon' && (
          <ComingSoonPage onNavigate={navigateTo} />
        )}

        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onOpenQuiz={() => setQuizOpen(true)}
          />
        )}

        {currentPage === 'drinks-food' && (
          <DrinksFoodPage
            onNavigate={navigateTo}
            savedPairings={savedPairings}
            onToggleSavedPairing={handleToggleSavedPairing}
            onOpenQuiz={() => setQuizOpen(true)}
          />
        )}

        {currentPage === 'venue' && (
          <VenuePage onNavigate={navigateTo} />
        )}

        {currentPage === 'private-hire' && (
          <PrivateHirePage onNavigate={navigateTo} />
        )}

        {currentPage === 'whats-on' && (
          <WhatsOnPage onNavigate={navigateTo} />
        )}

        {currentPage === 'visit' && (
          <VisitPage onNavigate={navigateTo} />
        )}

        {currentPage === 'book' && (
          <BookPage
            onNavigate={navigateTo}
            onBookingComplete={handleBookingComplete}
            savedPairingsCount={savedPairings.length}
          />
        )}
      </main>

      {/* Footer (Hidden on Coming Soon landing page to match design screenshot exactly) */}
      {currentPage !== 'coming-soon' && (
        <Footer onNavigate={navigateTo} />
      )}

      {/* Sticky Mobile Bottom CTA Bar (Hidden on Coming Soon landing page) */}
      {currentPage !== 'coming-soon' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-maroon-dark/95 backdrop-blur-xl border-t border-maroon-gold p-2.5 px-4 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(21,3,6,0.95)]">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-xs text-gold-amica min-h-[44px] cursor-pointer text-left focus:outline-none"
          >
            <span className="w-2 h-2 rounded-full bg-gold-amica animate-pulse shadow-[0_0_8px_#DFBE7B]"></span>
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-[#FDFBF7] tracking-[0.2em] uppercase text-[11px] leading-tight">
                AMICA SOHO
              </span>
              <span className="text-[8px] text-[#DFBE7B]/80 font-sans tracking-widest uppercase">23 Frith St, Soho</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('drinks-food')}
              className="bg-burgundy hover:bg-maroon-awning border border-maroon-gold text-gold-amica px-3.5 py-2 min-h-[44px] text-[10.5px] tracking-wider uppercase font-sans cursor-pointer active:scale-95 transition-all flex items-center justify-center rounded"
            >
              Menu
            </button>

            <button
              onClick={() => navigateTo('book')}
              className="btn-maroon-gold font-semibold px-4 py-2 min-h-[44px] text-[10.5px] tracking-widest uppercase font-sans cursor-pointer shadow-[0_4px_15px_rgba(59,10,18,0.7)] active:scale-95 flex items-center justify-center rounded border border-[#DFBE7B]"
            >
              Book
            </button>
          </div>
        </div>
      )}

      {/* Interactive Aperitivo Finder Quiz Modal */}
      <AperitivoQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onBookTable={() => navigateTo('book')}
      />

      {/* Digital Booking Confirmation Modal */}
      <BookingConfirmationModal
        confirmation={activeConfirmation}
        onClose={() => setActiveConfirmation(null)}
      />

    </div>
  );
}


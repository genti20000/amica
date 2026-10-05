/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageId, BookingConfirmation } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { AperitivoQuizModal } from './components/AperitivoQuizModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';

import { ComingSoonPage } from './pages/ComingSoonPage';
import { HomePage } from './pages/HomePage';
import { DrinksFoodPage } from './pages/DrinksFoodPage';
import { VenuePage } from './pages/VenuePage';
import { PrivateHirePage } from './pages/PrivateHirePage';
import { WhatsOnPage } from './pages/WhatsOnPage';
import { VisitPage } from './pages/VisitPage';
import { BookPage } from './pages/BookPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';

export default function App() {
  // Lock the site: always default to locked (false)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      // Clear any legacy permanent unlock
      localStorage.removeItem('amica_unlocked');
      return sessionStorage.getItem('amica_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Always default to coming-soon when locked
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    try {
      const isSessionUnlocked = sessionStorage.getItem('amica_unlocked') === 'true';
      if (!isSessionUnlocked) {
        return 'coming-soon';
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin' || window.location.hash === '#admin-bookings') {
        return 'admin-bookings';
      }
      return 'home';
    } catch {
      return 'coming-soon';
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [postLoginTarget, setPostLoginTarget] = useState<PageId>('home');
  const [savedPairings, setSavedPairings] = useState<string[]>([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);

  // Direct URL support for ?admin=true or #admin
  useEffect(() => {
    try {
      // Clear any cached localStorage unlock so the site stays locked
      localStorage.removeItem('amica_unlocked');

      const params = new URLSearchParams(window.location.search);
      const isDirectAdmin = params.get('admin') === 'true' || window.location.hash === '#admin' || window.location.hash === '#admin-bookings';
      if (isDirectAdmin) {
        if (sessionStorage.getItem('amica_unlocked') === 'true') {
          setIsUnlocked(true);
          setCurrentPage('admin-bookings');
        } else {
          setPostLoginTarget('admin-bookings');
          setIsLoginModalOpen(true);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const handleNavigate = (page: PageId) => {
    if (page === 'coming-soon') {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isUnlocked) {
      setPostLoginTarget(page);
      setIsLoginModalOpen(true);
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem('amica_unlocked', 'true');
    } catch {
      // fallback if storage disabled
    }
    setIsLoginModalOpen(false);
    const target = postLoginTarget || 'home';
    setCurrentPage(target);
    setPostLoginTarget('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLockSite = () => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem('amica_unlocked');
      sessionStorage.removeItem('amica_unlocked');
    } catch {
      // fallback
    }
    setCurrentPage('coming-soon');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSavedPairing = (id: string) => {
    setSavedPairings((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FDFBF7] font-sans selection:bg-[#C5A059] selection:text-[#150306] flex flex-col items-center justify-start overflow-x-hidden">
      {/* Header Bar (hidden only if on dedicated full-screen admin bookings page) */}
      {currentPage !== 'admin-bookings' && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          savedPairingsCount={savedPairings.length}
          onOpenLogin={() => {
            setPostLoginTarget('home');
            setIsLoginModalOpen(true);
          }}
          isUnlocked={isUnlocked}
          onLockSite={handleLockSite}
        />
      )}

      {/* Main Content Area */}
      <main className="w-full flex-1 bg-[#000000]">
        {currentPage === 'coming-soon' && (
          <ComingSoonPage
            onNavigate={handleNavigate}
            onOpenLogin={() => {
              setPostLoginTarget('home');
              setIsLoginModalOpen(true);
            }}
            isUnlocked={isUnlocked}
            onLockSite={handleLockSite}
          />
        )}

        {isUnlocked && currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenQuiz={() => setIsQuizOpen(true)}
          />
        )}

        {isUnlocked && currentPage === 'drinks-food' && (
          <DrinksFoodPage
            onNavigate={handleNavigate}
            savedPairings={savedPairings}
            onToggleSavedPairing={handleToggleSavedPairing}
            onOpenQuiz={() => setIsQuizOpen(true)}
          />
        )}

        {isUnlocked && currentPage === 'venue' && (
          <VenuePage onNavigate={handleNavigate} />
        )}

        {isUnlocked && currentPage === 'private-hire' && (
          <PrivateHirePage onNavigate={handleNavigate} />
        )}

        {isUnlocked && currentPage === 'whats-on' && (
          <WhatsOnPage onNavigate={handleNavigate} />
        )}

        {isUnlocked && currentPage === 'visit' && (
          <VisitPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'book' && (
          <BookPage
            onNavigate={handleNavigate}
            onBookingComplete={(confirmation) => setBookingConfirmation(confirmation)}
            savedPairingsCount={savedPairings.length}
          />
        )}

        {currentPage === 'admin-bookings' && (
          <AdminBookingsPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Show full footer when on unlocked main site pages or booking page */}
      {(isUnlocked || currentPage === 'book') && currentPage !== 'coming-soon' && currentPage !== 'admin-bookings' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Login Modal with Password 'Joni' */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Aperitivo Interactive Recommender Quiz Modal */}
      <AperitivoQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onBookTable={() => {
          setIsQuizOpen(false);
          handleNavigate('book');
        }}
      />

      {/* Booking Confirmation Pass Modal */}
      <BookingConfirmationModal
        confirmation={bookingConfirmation}
        onClose={() => setBookingConfirmation(null)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { PageId } from '../types';
import { X, Calendar, ArrowRight, Instagram, MapPin, Phone, Lock, LogOut, Users } from 'lucide-react';
import { VENUE_INFO } from '../data/venueData';

interface HeaderProps {
  currentPage: PageId;
  onNavigate?: (page: PageId) => void;
  savedPairingsCount?: number;
  onOpenLogin?: () => void;
  isUnlocked?: boolean;
  onLockSite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  savedPairingsCount = 0,
  onOpenLogin,
  isUnlocked = false,
  onLockSite
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; sub?: string }[] = [
    { id: 'coming-soon', label: 'Coming Soon', sub: '23 Frith St Teaser & VIP Guestlist' },
    { id: 'home', label: 'Home', sub: 'Atmosphere & Overview' },
    { id: 'drinks-food', label: 'Cocktails & Menu', sub: 'Aperitivi, Classic Serves & Cicchetti' },
    { id: 'venue', label: 'About Amica / The Venue', sub: 'Subterranean Vaults & Nocturnal Spirit' },
    { id: 'private-hire', label: 'Private Hire', sub: 'Exclusive Buyouts & Vault Celebrations' },
    { id: 'whats-on', label: 'Music / DJs & What’s On', sub: 'Curated Vinyl Soundscapes & Tastings' },
    { id: 'visit', label: 'Opening Hours & Location', sub: '23 Frith Street & Directions' },
    { id: 'book', label: 'Book A Table', sub: 'Instant Table Reservation Pass' },
    { id: 'admin-bookings', label: 'Admin Bookings', sub: 'Maître D’ Reservations Management & Run Sheet' },
  ];

  const handleNavClick = (page: PageId) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on Coming Soon page (or Book page while locked), render the minimal header
  if (currentPage === 'coming-soon' || (!isUnlocked && currentPage === 'book')) {
    return (
      <header className="w-full bg-[#000000] border-b border-[#140206] select-none z-40 relative">
        <div className="w-full max-w-[560px] mx-auto px-4 sm:px-6 h-13 sm:h-16 flex items-center justify-between">
          {/* Left: AMICA / — SOHO — */}
          <div
            onClick={() => handleNavClick('coming-soon')}
            className="flex flex-col items-start cursor-pointer group"
          >
            <span className="font-['Cinzel',serif] text-base sm:text-xl md:text-2xl tracking-[0.24em] sm:tracking-[0.28em] text-[#E8CCA0] uppercase font-light leading-none group-hover:text-[#FFEAA7] transition-colors">
              AMICA
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[#DFBE7B]">
              <span className="w-3 sm:w-4 h-[1px] bg-[#DFBE7B]/80" />
              <span className="font-sans text-[7px] sm:text-[8.5px] tracking-[0.34em] uppercase font-medium">
                SOHO
              </span>
              <span className="w-3 sm:w-4 h-[1px] bg-[#DFBE7B]/80" />
            </div>
          </div>

          {/* Right: Address & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 select-none">
            {currentPage === 'book' ? (
              <button
                onClick={() => handleNavClick('coming-soon')}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/50 hover:border-[#DFBE7B] text-[#DFBE7B] hover:text-[#FFEAA7] font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              >
                <span>← Coming Soon</span>
              </button>
            ) : isUnlocked ? (
              <button
                onClick={() => handleNavClick('book')}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/50 hover:border-[#DFBE7B] text-[#DFBE7B] hover:text-[#FFEAA7] font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                title="Book Table (1–20 Pax Auto-Confirmed)"
              >
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#DFBE7B]" />
                <span>Book</span>
              </button>
            ) : null}

            <span className="font-sans text-[10px] sm:text-[11.5px] tracking-[0.22em] sm:tracking-[0.26em] uppercase text-[#E8CCA0] font-medium leading-tight">
              23 Frith St, Soho
            </span>

            {isUnlocked ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('home')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#C5A059] hover:bg-[#DFBE7B] text-[#0A0103] font-sans font-semibold text-[8.5px] sm:text-[10px] tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                  title="Return to Main Site"
                >
                  <span>Main Site</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                {onLockSite && (
                  <button
                    onClick={onLockSite}
                    className="p-1 rounded text-[#DFBE7B]/60 hover:text-[#DFBE7B] transition-colors cursor-pointer"
                    title="Lock Main Site"
                    aria-label="Lock Main Site"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-[#1D060B] hover:bg-[#2F0B13] border border-[#DFBE7B]/50 hover:border-[#DFBE7B] text-[#DFBE7B] hover:text-[#FFEAA7] font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                  title="Staff Login"
                  aria-label="Login to Main Site"
                >
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#DFBE7B]" />
                  <span>Login</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-maroon-deep/95 backdrop-blur-md border-b border-maroon transition-all duration-300">
        <div className="w-full px-3 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 relative">
            
            {/* Left: AMICA / — SOHO — (New Logo) */}
            <div className="flex items-center">
              <button 
                onClick={() => handleNavClick('coming-soon')} 
                className="group flex flex-col items-start focus:outline-none cursor-pointer min-h-[44px] justify-center text-left"
                aria-label="AMICA SOHO"
              >
                <span className="font-['Cinzel',serif] text-base sm:text-xl md:text-2xl tracking-[0.24em] sm:tracking-[0.28em] text-[#E8CCA0] uppercase font-light leading-none group-hover:text-[#FFEAA7] transition-colors">
                  AMICA
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-[#DFBE7B]">
                  <span className="w-3 sm:w-4 h-[1px] bg-[#DFBE7B]/80" />
                  <span className="font-sans text-[7px] sm:text-[8.5px] tracking-[0.34em] uppercase font-medium">
                    SOHO
                  </span>
                  <span className="w-3 sm:w-4 h-[1px] bg-[#DFBE7B]/80" />
                </div>
              </button>
            </div>

            {/* Right: HOME | COMING SOON + BOOK NOW + 3-line Hamburger Menu */}
            <div className="flex items-center gap-3 sm:gap-6">
              
              {/* HOME | COMING SOON Navigation (Faithfully matching user screenshot) */}
              <nav className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-sans tracking-[0.2em] sm:tracking-[0.26em] uppercase">
                <button
                  onClick={() => handleNavClick('home')}
                  className={`relative py-1 cursor-pointer transition-colors min-h-[44px] flex items-center ${
                    currentPage === 'home'
                      ? 'text-[#FDFBF7] font-semibold'
                      : 'text-gold-amica/70 hover:text-gold-amica font-normal'
                  }`}
                >
                  <span>HOME</span>
                  {currentPage === 'home' && (
                    <span className="absolute bottom-1 left-0 right-0 h-[1.5px] bg-[#DFBE7B] shadow-[0_0_8px_#DFBE7B]" />
                  )}
                </button>

                <span className="text-[#DFBE7B]/40 select-none">|</span>

                <button
                  onClick={() => handleNavClick('coming-soon')}
                  className={`relative py-1 cursor-pointer transition-colors min-h-[44px] flex items-center ${
                    currentPage === 'coming-soon'
                      ? 'text-[#FDFBF7] font-semibold'
                      : 'text-gold-amica/70 hover:text-gold-amica font-normal'
                  }`}
                >
                  <span>COMING SOON</span>
                  {currentPage === 'coming-soon' && (
                    <span className="absolute bottom-1 left-0 right-0 h-[1.5px] bg-[#DFBE7B] shadow-[0_0_8px_#DFBE7B]" />
                  )}
                </button>
              </nav>

              {/* Lock Site / Exit to Coming Soon Button */}
              {onLockSite && (
                <button
                  onClick={onLockSite}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded bg-burgundy/60 hover:bg-burgundy border border-maroon-gold/50 hover:border-maroon-gold text-gold-subtle hover:text-[#FFEAA7] text-[10px] tracking-[0.18em] uppercase transition-all duration-200 cursor-pointer"
                  title="Lock Main Site & Return to Coming Soon"
                >
                  <Lock className="w-3 h-3 text-[#DFBE7B]" />
                  <span>Lock Site</span>
                </button>
              )}

              {/* Admin Bookings Button */}
              <button
                onClick={() => handleNavClick('admin-bookings')}
                className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded text-[10px] tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer border ${
                  currentPage === 'admin-bookings'
                    ? 'bg-[#C5A059] text-[#120205] border-[#FFEAA7] font-bold shadow-md'
                    : 'bg-burgundy/50 hover:bg-burgundy border-maroon-gold/40 text-gold-subtle hover:text-[#FFEAA7]'
                }`}
                title="Maître d' Admin Bookings Dashboard"
              >
                <Users className="w-3 h-3 text-[#DFBE7B]" />
                <span>Admin Bookings</span>
              </button>

              {/* Brushed Gold 'BOOK NOW' Button */}
              <button
                onClick={() => handleNavClick('book')}
                className="hidden sm:flex bg-[#C5A059] hover:bg-[#DFBE7B] text-[#08080A] font-sans font-semibold text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.22em] uppercase min-h-[44px] py-2 sm:py-2.5 px-3 sm:px-5 transition-all duration-200 cursor-pointer shadow-[0_4px_14px_rgba(74,14,23,0.5)] active:scale-95 whitespace-nowrap border border-[#FFEAA7]/40 items-center justify-center rounded-sm"
              >
                BOOK NOW
              </button>

              {/* Minimal 3-Line Hamburger Trigger with min 44x44px touch target */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1.5 p-2 rounded bg-burgundy border border-maroon-gold text-gold-amica hover:text-[#FFEAA7] hover:bg-maroon-awning hover:border-gold-amica transition-colors focus:outline-none cursor-pointer shadow-sm active:scale-95"
                aria-label="Toggle navigation menu"
              >
                <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Luxury Fullscreen/Slide Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex bg-maroon-deep/95 backdrop-blur-2xl animate-fadeIn">
          <div className="relative w-full max-w-2xl ml-auto bg-maroon-deep border-l border-maroon h-full flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
            
            {/* Awning-inspired curved header block in rich velvet maroon & gold */}
            <div className="awning-badge relative rounded-xl p-6 border-maroon-gold shadow-[0_8px_30px_rgba(74,14,23,0.6)] text-center mb-6">
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-burgundy border border-maroon-gold hover:border-gold-amica flex items-center justify-center text-[#FDFBF7] hover:text-gold-amica transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-gold-subtle block mb-1">
                23 FRITH STREET · SOHO
              </span>
              <h2 className="font-['Cinzel',serif] text-3xl sm:text-4xl text-[#E8CCA0] tracking-[0.26em] uppercase font-light drop-shadow-md">
                AMICA
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-[#DFBE7B]">
                <span className="w-5 sm:w-6 h-[1px] bg-[#DFBE7B]/80" />
                <span className="font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.36em] uppercase font-medium">
                  SOHO
                </span>
                <span className="w-5 sm:w-6 h-[1px] bg-[#DFBE7B]/80" />
              </div>
              <div className="w-16 h-[1px] bg-gold-subtle mx-auto my-3 opacity-80" />
              <p className="text-[10px] font-sans tracking-[0.32em] text-[#FFEAA7] uppercase">
                APERITIVO &nbsp;•&nbsp; MUSIC &nbsp;•&nbsp; LATE
              </p>
            </div>

            {/* Navigation Links with Maroon and Gold accents */}
            <nav className="space-y-3">
              {navItems.map((item, idx) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full group text-left flex items-center justify-between p-3.5 min-h-[48px] rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-burgundy border-maroon-gold text-[#FFEAA7] shadow-md'
                        : 'bg-burgundy-dark/80 border-maroon hover:bg-burgundy hover:border-maroon-gold'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-gold-subtle">0{idx + 1}</span>
                        <span className={`font-serif text-lg sm:text-xl tracking-wide transition-colors ${
                          isActive ? 'text-gold-amica font-semibold' : 'text-[#FDFBF7] group-hover:text-gold-amica'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {item.sub && (
                        <p className="text-xs text-gold-subtle/80 pl-7 font-sans">{item.sub}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gold-subtle group-hover:text-gold-amica group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer Info */}
            <div className="pt-6 border-t border-maroon space-y-4 text-xs text-gold-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[#FDFBF7] font-serif tracking-wider uppercase text-sm">23 Frith Street, Soho</p>
                  <p className="text-[11px] text-gold-subtle">London W1D 4RR</p>
                </div>
                <div>
                  <p className="text-[#FDFBF7] font-serif tracking-wider uppercase text-sm">Hours</p>
                  <p className="text-[11px] text-gold-subtle">Mon – Sun: 17:00 – 03:00 (7 Days)</p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-6 text-gold-amica">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 min-h-[44px]">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
                <a href="tel:+442079460192" className="hover:text-white transition-colors flex items-center gap-1.5 min-h-[44px]">
                  <Phone className="w-4 h-4" />
                  <span>Call Us</span>
                </a>
                <a href="https://maps.google.com/?q=23+Frith+Street+Soho+London" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 min-h-[44px]">
                  <MapPin className="w-4 h-4" />
                  <span>Map</span>
                </a>
              </div>

              {onLockSite && (
                <div className="pt-3 border-t border-maroon/60">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLockSite();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#1A0509] hover:bg-[#2A080F] border border-maroon-gold text-[#DFBE7B] hover:text-[#FFEAA7] text-xs font-sans tracking-[0.2em] uppercase transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#DFBE7B]" />
                    <span>Lock Main Site (Return to Coming Soon)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

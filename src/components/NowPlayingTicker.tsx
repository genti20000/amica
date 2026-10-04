import React, { useState, useEffect } from 'react';
import { Disc, Radio, Calendar, Sparkles, Music2, ChevronRight, ChevronLeft } from 'lucide-react';

export interface JazzTrack {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: string;
  dayShort: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  label: string;
  catalogNumber: string;
  bpm: string;
  tempo: string;
  cocktailPairing: string;
  vibe: string;
}

export const WEEKLY_JAZZ_TRACKS: JazzTrack[] = [
  {
    dayIndex: 0,
    dayName: 'Sunday',
    dayShort: 'SUN',
    title: 'Corcovado (Quiet Nights of Quiet Stars)',
    artist: 'Stan Getz & João Gilberto',
    album: 'Getz/Gilberto',
    year: '1964',
    label: 'Verve Records',
    catalogNumber: 'V6-8545',
    bpm: '68 BPM',
    tempo: 'Bossa Nova Aperitivo',
    cocktailPairing: 'Venetian Peach Bellini & Frith St Spritz',
    vibe: 'Warm candlelight, whispers, and gentle acoustic guitar over Sunday dusk.',
  },
  {
    dayIndex: 1,
    dayName: 'Monday',
    dayShort: 'MON',
    title: 'Blue in Green',
    artist: 'Miles Davis (feat. Bill Evans)',
    album: 'Kind of Blue',
    year: '1959',
    label: 'Columbia Records',
    catalogNumber: 'CL-1355',
    bpm: '56 BPM',
    tempo: 'Modal Jazz Noir',
    cocktailPairing: 'Barrel-Aged Smoked Negroni',
    vibe: 'Muted trumpet reveries echoing softly off vaulted brick walls.',
  },
  {
    dayIndex: 2,
    dayName: 'Tuesday',
    dayShort: 'TUE',
    title: 'Waltz for Debby',
    artist: 'Bill Evans Trio',
    album: 'Waltz for Debby (Live at Village Vanguard)',
    year: '1961',
    label: 'Riverside Records',
    catalogNumber: 'RLP-399',
    bpm: '72 BPM',
    tempo: 'Intimate Post-Bop Piano',
    cocktailPairing: 'Turin Vermouth & Soda with Orange Twist',
    vibe: 'Crystal clinking, delicate piano trills, and deep velvet booth seclusion.',
  },
  {
    dayIndex: 3,
    dayName: 'Wednesday',
    dayShort: 'WED',
    title: 'I Fall in Love Too Easily',
    artist: 'Chet Baker',
    album: 'Chet Baker Sings',
    year: '1954',
    label: 'Pacific Jazz',
    catalogNumber: 'PJ-1202',
    bpm: '52 BPM',
    tempo: 'West Coast Cool Jazz',
    cocktailPairing: 'Classic Dry Gin Martini with Sicilian Olive',
    vibe: 'Melancholic velvet vocals floating through the late-evening haze.',
  },
  {
    dayIndex: 4,
    dayName: 'Thursday',
    dayShort: 'THU',
    title: "'Round Midnight",
    artist: 'Thelonious Monk',
    album: 'Genius of Modern Music, Vol. 1',
    year: '1947',
    label: 'Blue Note Records',
    catalogNumber: 'BLP-1510',
    bpm: '60 BPM',
    tempo: 'Bebop & Subterranean Chords',
    cocktailPairing: 'Cask-Strength Rye Manhattan',
    vibe: 'Angular syncopation and bold harmonic warmth at midnight.',
  },
  {
    dayIndex: 5,
    dayName: 'Friday',
    dayShort: 'FRI',
    title: 'My One and Only Love',
    artist: 'John Coltrane & Johnny Hartman',
    album: 'John Coltrane and Johnny Hartman',
    year: '1963',
    label: 'Impulse! Records',
    catalogNumber: 'A-40',
    bpm: '54 BPM',
    tempo: 'Golden Hour Ballad',
    cocktailPairing: 'Vintage 1930s Boulevardier',
    vibe: 'Rich baritone croon intertwined with Coltrane’s tender saxophone lines.',
  },
  {
    dayIndex: 6,
    dayName: 'Saturday',
    dayShort: 'SAT',
    title: 'Take Five',
    artist: 'The Dave Brubeck Quartet',
    album: 'Time Out',
    year: '1959',
    label: 'Columbia Records',
    catalogNumber: 'CS-8192',
    bpm: '174 BPM',
    tempo: '5/4 Late-Night Swing',
    cocktailPairing: 'Amica Soho Signature Spritz & Campari Shakerato',
    vibe: 'Hypnotic 5/4 drum solos and Paul Desmond’s timeless dry saxophone tone.',
  },
];

export const NowPlayingTicker: React.FC = () => {
  // Get current day index in local time (0 = Sunday, 1 = Monday, etc.)
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(todayIndex);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Auto update if midnight passes
  useEffect(() => {
    setSelectedDay(todayIndex);
  }, [todayIndex]);

  const activeTrack =
    WEEKLY_JAZZ_TRACKS.find((t) => t.dayIndex === selectedDay) || WEEKLY_JAZZ_TRACKS[todayIndex];
  const isToday = selectedDay === todayIndex;

  const handlePrevDay = () => {
    setSelectedDay((prev) => (prev === 0 ? 6 : prev - 1));
  };

  const handleNextDay = () => {
    setSelectedDay((prev) => (prev === 6 ? 0 : prev + 1));
  };

  return (
    <div className="w-full max-w-full bg-[#0E0306] border border-[#9D7E54]/40 rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(223,190,123,0.3)]">
      {/* Top Banner: Fully Responsive Vinyl Header with Marquee */}
      <div className="bg-gradient-to-r from-[#1B0509] via-[#2A0810] to-[#1B0509] border-b border-[#9D7E54]/30 px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 text-xs min-w-0">
        
        {/* Row 1 on mobile / Left group on desktop */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center shrink-0">
              {/* Spinning micro vinyl */}
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#111] border border-[#DFBE7B]/60 shadow-[0_0_8px_rgba(223,190,123,0.3)] flex items-center justify-center ${
                  isRotating ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#7C1826] border border-[#DFBE7B]/80 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#DFBE7B]" />
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-['Cinzel',serif] font-bold text-[9.5px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.24em] text-[#DFBE7B] uppercase leading-none">
                Now Spinning
              </span>
              <span className="px-1.5 py-0.5 text-[7px] sm:text-[8px] tracking-[0.18em] sm:tracking-[0.2em] uppercase font-sans font-semibold rounded bg-[#4A0E17]/80 text-[#FFEAA7] border border-[#DFBE7B]/40">
                33⅓ RPM
              </span>
            </div>
          </div>

          {/* Audio Sync Badge (Visible on mobile right & desktop far-right) */}
          <div className="flex sm:hidden items-center gap-1.5 text-[9px] font-sans text-[#DFBE7B]/80">
            <Radio className="w-2.5 h-2.5 text-[#DFBE7B] animate-pulse" />
            <span className="tracking-[0.14em] uppercase">Soho Cellar</span>
          </div>
        </div>

        {/* Marquee Scrolling Strip (Fades nicely on edges) */}
        <div className="flex-1 min-w-0 overflow-hidden relative mx-0 sm:mx-2 py-0.5">
          {/* Subtle edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#1B0509] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#1B0509] to-transparent z-10 pointer-events-none" />

          <div className="inline-flex whitespace-nowrap animate-marquee items-center gap-4 sm:gap-6 text-[10px] sm:text-[10.5px] font-sans text-[#E8CCA0]/90">
            {/* First sequence */}
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3 h-3 text-[#DFBE7B] shrink-0" />
              <span className="font-semibold text-[#DFBE7B]">TONIGHT’S SELECTION:</span>
              <span>{activeTrack.artist} — “{activeTrack.title}”</span>
              <span className="text-[#DFBE7B]/60">({activeTrack.year} · {activeTrack.label})</span>
            </span>
            <span className="text-[#9D7E54]">✦</span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[#DFBE7B]">PAIRING:</span>
              <span className="text-[#FFEAA7]">{activeTrack.cocktailPairing}</span>
            </span>
            <span className="text-[#9D7E54]">✦</span>
            <span>Subterranean Vinyl Sanctuary · 23 Frith Street, Soho</span>
            <span className="text-[#9D7E54]">✦</span>
            <span className="flex items-center gap-1.5 sm:gap-2 mr-6">
              <span className="text-[#DFBE7B]">ORIGINAL PRESSING:</span>
              <span className="font-mono text-[9px] sm:text-[9.5px] text-[#DFBE7B]/90">{activeTrack.catalogNumber}</span>
            </span>

            {/* Seamless duplicate loop */}
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3 h-3 text-[#DFBE7B] shrink-0" />
              <span className="font-semibold text-[#DFBE7B]">TONIGHT’S SELECTION:</span>
              <span>{activeTrack.artist} — “{activeTrack.title}”</span>
              <span className="text-[#DFBE7B]/60">({activeTrack.year} · {activeTrack.label})</span>
            </span>
            <span className="text-[#9D7E54]">✦</span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[#DFBE7B]">PAIRING:</span>
              <span className="text-[#FFEAA7]">{activeTrack.cocktailPairing}</span>
            </span>
            <span className="text-[#9D7E54]">✦</span>
            <span>Subterranean Vinyl Sanctuary · 23 Frith Street, Soho</span>
            <span className="text-[#9D7E54]">✦</span>
            <span className="flex items-center gap-1.5 sm:gap-2 mr-6">
              <span className="text-[#DFBE7B]">ORIGINAL PRESSING:</span>
              <span className="font-mono text-[9px] sm:text-[9.5px] text-[#DFBE7B]/90">{activeTrack.catalogNumber}</span>
            </span>
          </div>
        </div>

        {/* Live Audio Sync Badge (Desktop only) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 text-[10px] font-sans text-[#DFBE7B]/80">
          <Radio className="w-3 h-3 text-[#DFBE7B] animate-pulse shrink-0" />
          <span className="tracking-[0.16em] uppercase whitespace-nowrap">Soho Hi-Fi Cellar</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-5 lg:p-6 bg-gradient-to-b from-[#120306] via-[#0E0205] to-[#0A0103] space-y-4 sm:space-y-5">
        
        {/* Weekday Switcher Strip - Responsive Grid that fits ANY width */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-[#9D7E54]/20">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#DFBE7B] shrink-0" />
            <span className="text-[9.5px] sm:text-[10px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#DFBE7B]/90 font-medium">
              Weekly Vinyl Schedule:
            </span>
          </div>

          {/* 7 Days Grid on Mobile, Flex on Desktop */}
          <div className="grid grid-cols-7 sm:flex sm:items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
            {WEEKLY_JAZZ_TRACKS.map((track) => {
              const isSelected = track.dayIndex === selectedDay;
              const isCurrentDay = track.dayIndex === todayIndex;
              return (
                <button
                  key={track.dayIndex}
                  onClick={() => setSelectedDay(track.dayIndex)}
                  className={`py-1.5 sm:py-1 px-1 sm:px-2.5 rounded text-[8.5px] sm:text-[10px] font-sans uppercase font-medium transition-all duration-200 cursor-pointer relative text-center flex items-center justify-center min-h-[30px] sm:min-h-[26px] ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#DFBE7B] to-[#9D7E54] text-[#120306] font-bold shadow-[0_2px_8px_rgba(223,190,123,0.35)]'
                      : 'bg-[#1D060B]/70 text-[#DFBE7B]/70 hover:text-[#FFEAA7] hover:bg-[#2E0A12] border border-[#9D7E54]/20'
                  }`}
                  title={`${track.dayName}: ${track.title} by ${track.artist}`}
                >
                  <span className="truncate">{track.dayShort}</span>
                  {isCurrentDay && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#DFBE7B] shadow-[0_0_4px_#DFBE7B]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Track Detailed Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5 items-stretch md:items-center min-w-0">
          
          {/* Left: Vinyl Record & Catalog Badge */}
          <div className="md:col-span-5 lg:col-span-4 flex items-center gap-3 sm:gap-4 bg-[#180408]/80 p-2.5 sm:p-3.5 rounded-lg border border-[#9D7E54]/30 shadow-inner min-w-0">
            <div className="relative shrink-0 flex items-center justify-center">
              {/* Outer Grooved Vinyl Disc */}
              <div
                onClick={() => setIsRotating(!isRotating)}
                title="Click to toggle vinyl rotation"
                className={`w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-[#0d0d0f] border-2 border-[#DFBE7B]/40 shadow-[0_4px_14px_rgba(0,0,0,0.9),0_0_12px_rgba(157,126,84,0.25)] flex items-center justify-center cursor-pointer relative group shrink-0 ${
                  isRotating ? 'animate-spin' : ''
                }`}
                style={{
                  animationDuration: '6s',
                  backgroundImage:
                    'repeating-radial-gradient(circle, #151518 0, #151518 1px, #0b0b0c 2px, #0b0b0c 3px)',
                }}
              >
                {/* Center Record Label */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-tr from-[#681420] via-[#8C1E2E] to-[#450B13] border border-[#DFBE7B] flex flex-col items-center justify-center text-center p-0.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                  <span className="text-[5px] sm:text-[5.5px] font-serif font-black text-[#DFBE7B] leading-none">AMICA</span>
                  <span className="text-[4px] sm:text-[4.5px] font-sans font-bold text-[#FFEAA7] tracking-tighter leading-none mt-0.5">33⅓</span>
                </div>

                {/* Spindle Hole */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#000] border border-[#DFBE7B]/50 absolute" />
              </div>
            </div>

            {/* Catalog Info beside vinyl */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[8px] sm:text-[8.5px] text-[#DFBE7B]/80 tracking-widest uppercase truncate">
                  {activeTrack.catalogNumber}
                </span>
                <span className="font-mono text-[7.5px] sm:text-[8px] text-[#FFEAA7]/70 shrink-0">
                  {activeTrack.bpm}
                </span>
              </div>
              <div className="text-[9.5px] sm:text-[10px] font-sans text-[#E8CCA0] font-semibold truncate">
                {activeTrack.label}
              </div>
              <div className="text-[8.5px] sm:text-[9px] font-sans text-[#9D7E54] tracking-wider uppercase truncate">
                {activeTrack.tempo}
              </div>
              <div className="pt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-ping shrink-0" />
                <span className="text-[7.5px] sm:text-[8px] font-sans text-amber-200 uppercase tracking-widest font-medium truncate">
                  Analog Master
                </span>
              </div>
            </div>
          </div>

          {/* Right: Track Title, Artist, Vibe & Cocktail Pairing */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-2.5 sm:space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 text-[8px] sm:text-[8.5px] font-sans uppercase font-bold tracking-[0.18em] sm:tracking-[0.2em] rounded bg-[#9D7E54]/30 text-[#FFEAA7] border border-[#DFBE7B]/30 shrink-0">
                    {activeTrack.dayName} Night
                  </span>
                  {isToday ? (
                    <span className="px-2 py-0.5 text-[8px] sm:text-[8.5px] font-sans uppercase font-bold tracking-[0.18em] sm:tracking-[0.2em] rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                      Playing Tonight
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedDay(todayIndex)}
                      className="text-[8px] sm:text-[8.5px] font-sans text-[#DFBE7B]/80 hover:text-[#FFEAA7] underline cursor-pointer shrink-0"
                    >
                      Return to Tonight
                    </button>
                  )}
                </div>

                {/* Track Title */}
                <h4 className="font-['Cinzel',serif] text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#FDFBF7] tracking-wide leading-snug break-words">
                  “{activeTrack.title}”
                </h4>

                {/* Artist & Album */}
                <p className="text-[11px] sm:text-xs md:text-sm font-sans text-[#DFBE7B] font-medium mt-0.5 break-words">
                  {activeTrack.artist} <span className="text-[#9D7E54]/70">·</span>{' '}
                  <span className="text-[#E8D5C4]/90 italic">
                    {activeTrack.album} ({activeTrack.year})
                  </span>
                </p>
              </div>

              {/* Prev / Next Track arrows */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handlePrevDay}
                  className="p-1.5 sm:p-2 rounded bg-[#1C050A] hover:bg-[#2D0911] border border-[#9D7E54]/40 text-[#DFBE7B] transition-colors cursor-pointer"
                  title="Previous day track"
                  aria-label="Previous day track"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextDay}
                  className="p-1.5 sm:p-2 rounded bg-[#1C050A] hover:bg-[#2D0911] border border-[#9D7E54]/40 text-[#DFBE7B] transition-colors cursor-pointer"
                  title="Next day track"
                  aria-label="Next day track"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Atmosphere note & Drink Pairing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-[#9D7E54]/20 text-xs">
              <div className="space-y-0.5">
                <span className="text-[8.5px] sm:text-[9px] font-sans uppercase tracking-[0.18em] text-[#9D7E54] block font-semibold">
                  Listening Vibe
                </span>
                <p className="text-[10.5px] sm:text-[11px] font-sans text-[#E8CCA0]/90 leading-relaxed">
                  {activeTrack.vibe}
                </p>
              </div>

              <div className="space-y-0.5 bg-[#1A0509]/60 p-2 sm:p-2.5 rounded border border-[#9D7E54]/20">
                <span className="text-[8.5px] sm:text-[9px] font-sans uppercase tracking-[0.18em] text-[#DFBE7B] block font-semibold flex items-center gap-1">
                  <Music2 className="w-2.5 h-2.5 shrink-0" /> Pairing Suggestion
                </span>
                <p className="text-[10.5px] sm:text-[11px] font-sans text-[#FFEAA7] font-medium leading-tight">
                  {activeTrack.cocktailPairing}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

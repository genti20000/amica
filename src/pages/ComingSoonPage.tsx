import React, { useEffect, useState } from 'react';
import { Calendar, Instagram, MessageCircle } from 'lucide-react';
import { PageId } from '../types';
interface ComingSoonPageProps { onNavigate?: (page: PageId) => void; onOpenLogin?: () => void; isUnlocked?: boolean; onLockSite?: () => void; }
export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ onNavigate }) => {
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setScrolling(true);
      clearTimeout(timer); timer = setTimeout(() => setScrolling(false), 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, []);
  return <div className="bg-[#080505] text-[#F7EFE1] pb-28">
    <div className="w-full">
      <h1 className="sr-only">AMICA Soho — 23 Frith Street</h1>
      <div className="relative w-full overflow-hidden bg-[#080505] sm:mx-auto sm:max-w-[1200px] sm:h-[min(76svh,900px)] sm:min-h-[560px]">
        <img
          src="/images/amica-entrance-retouched.jpg"
          alt="AMICA Soho’s burgundy canopy and entrance at 23 Frith Street, framed by plants and warm lights"
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-[50%_30%]"
          sizes="100vw"
          fetchPriority="high"
        />
        <nav aria-label="Social links and menu" className="absolute inset-x-0 bottom-[3%] z-10 px-4 sm:px-8">
          <div className="mx-auto grid max-w-[760px] grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 sm:gap-6">
            <a href="https://instagram.com/amicasoho" target="_blank" rel="noopener noreferrer" aria-label="AMICA Soho on Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-[#D4B887]/70 bg-[#080505]/75 text-[#F0D7A7] shadow-lg backdrop-blur-sm hover:bg-[#240609]">
              <Instagram className="h-5 w-5" />
            </a>
            <button onClick={() => onNavigate?.('drinks-food')} className="min-h-12 w-full border border-[#D4B887]/80 bg-[#080505]/80 px-2 sm:px-5 text-center text-[10px] sm:text-xs tracking-[.12em] sm:tracking-[.18em] text-[#F0D7A7] shadow-lg backdrop-blur-sm hover:bg-[#240609]">
              View Food and Drinks Menu
            </button>
            <a href="https://www.tiktok.com/@amicasoho" target="_blank" rel="noopener noreferrer" aria-label="AMICA Soho on TikTok" className="grid h-11 w-11 place-items-center rounded-full border border-[#D4B887]/70 bg-[#080505]/75 text-[#F0D7A7] shadow-lg backdrop-blur-sm hover:bg-[#240609]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M14 3v13a5 5 0 1 1-4-4.9M14 3c1 4 3 6 7 6M17 8v8a8 8 0 1 1-7-7.9" /></svg>
            </a>
          </div>
        </nav>
      </div>
      <footer className="bg-[#080505] px-4 py-5 text-center">
        <a href="mailto:info@amicasoho.com" className="text-xs text-[#E9D6B6] hover:underline">info@amicasoho.com</a>
        <p className="mt-2 text-[9px] tracking-widest text-[#B29678]">© {new Date().getFullYear()} AMICA SOHO</p>
      </footer>
    </div>
    <nav aria-label="Booking and WhatsApp" onFocus={() => setScrolling(false)} className={`fixed bottom-0 inset-x-0 z-40 border-t border-[#D4B887]/40 bg-[#100608]/95 px-5 pt-3 pb-[max(13px,env(safe-area-inset-bottom))] transition-transform motion-reduce:transition-none ${scrolling ? 'translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-[602px] mx-auto grid grid-cols-2 gap-2.5">
        <button onClick={() => onNavigate?.('book')} className="min-h-12 flex justify-center items-center gap-2 bg-[#D4B887] text-[#230B0A] text-[11px] tracking-widest cursor-pointer"><Calendar className="w-4 h-4" />BOOK A TABLE</button>
        <a href="https://wa.me/447459959699" target="_blank" rel="noopener noreferrer" className="min-h-12 flex justify-center items-center gap-2 border border-[#D4B887]/60 text-[#D4B887] text-[11px] tracking-widest"><MessageCircle className="w-4 h-4" />WHATSAPP</a>
      </div>
    </nav>
  </div>;
};

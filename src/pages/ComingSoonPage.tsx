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
    <div className="max-w-[1200px] mx-auto">
      <h1 className="sr-only">AMICA Soho — 23 Frith Street</h1>
      <div className="relative w-full h-[min(72svh,780px)] min-h-[520px] overflow-hidden bg-[#080505] sm:h-[min(76svh,820px)] sm:min-h-[560px]">
        <img
          src="/images/amica-homepage-entrance.jpg"
          alt="AMICA Soho’s burgundy canopy and entrance at 23 Frith Street, framed by plants and warm lights"
          className="absolute inset-0 h-full w-full object-cover object-[50%_30%] sm:object-[50%_13%]"
          sizes="100vw"
          fetchPriority="high"
        />
      </div>
      <section className="bg-[#240609] px-6 pt-7 pb-5 text-center" aria-label="Menus and contact">
        <button onClick={() => onNavigate?.('drinks-food')} className="min-h-12 px-5 border border-[#D4B887]/60 text-[#D4B887] text-[11px] tracking-widest hover:bg-[#D4B887]/10 cursor-pointer">VIEW FOOD &amp; DRINKS MENU</button>
        <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-[#D4B887]/20">
          <a href="mailto:info@amicasoho.com" className="text-xs text-[#E9D6B6] hover:underline">info@amicasoho.com</a>
          <div className="flex gap-2">
            <a href="https://instagram.com/amicasoho" target="_blank" rel="noopener noreferrer" aria-label="AMICA Soho Instagram" className="w-11 h-11 grid place-items-center rounded-full border border-[#D4B887]/40 text-[#D4B887]"><Instagram className="w-5 h-5" /></a>
            <a href="https://www.tiktok.com/@amicasoho" target="_blank" rel="noopener noreferrer" aria-label="AMICA Soho TikTok" className="w-11 h-11 grid place-items-center rounded-full border border-[#D4B887]/40 text-[#D4B887]"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 3v13a5 5 0 1 1-4-4.9M14 3c1 4 3 6 7 6M17 8v8a8 8 0 1 1-7-7.9" /></svg></a>
          </div>
        </div>
      </section>
      <p className="text-center text-[9px] tracking-widest text-[#B29678] py-5">© {new Date().getFullYear()} AMICA SOHO</p>
    </div>
    <nav aria-label="Booking and WhatsApp" onFocus={() => setScrolling(false)} className={`fixed bottom-0 inset-x-0 z-40 border-t border-[#D4B887]/40 bg-[#100608]/95 px-5 pt-3 pb-[max(13px,env(safe-area-inset-bottom))] transition-transform motion-reduce:transition-none ${scrolling ? 'translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-[602px] mx-auto grid grid-cols-2 gap-2.5">
        <button onClick={() => onNavigate?.('book')} className="min-h-12 flex justify-center items-center gap-2 bg-[#D4B887] text-[#230B0A] text-[11px] tracking-widest cursor-pointer"><Calendar className="w-4 h-4" />BOOK A TABLE</button>
        <a href="https://wa.me/447459959699" target="_blank" rel="noopener noreferrer" className="min-h-12 flex justify-center items-center gap-2 border border-[#D4B887]/60 text-[#D4B887] text-[11px] tracking-widest"><MessageCircle className="w-4 h-4" />WHATSAPP</a>
      </div>
    </nav>
  </div>;
};

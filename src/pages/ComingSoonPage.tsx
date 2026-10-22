import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
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
            <a href="https://instagram.com/amicasoho" target="_blank" rel="noopener noreferrer" aria-label="AMICA Soho on Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-[#D4B887]/70 bg-[#080505]/75 shadow-lg backdrop-blur-sm hover:bg-[#240609]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <defs><linearGradient id="instagram-brand-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse"><stop stopColor="#FFDC80"/><stop offset=".32" stopColor="#F77737"/><stop offset=".68" stopColor="#E1306C"/><stop offset="1" stopColor="#833AB4"/></linearGradient></defs>
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#instagram-brand-gradient)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4.2" stroke="url(#instagram-brand-gradient)" strokeWidth="2"/>
                <circle cx="17.7" cy="6.5" r="1.15" fill="#E1306C"/>
              </svg>
            </a>
            <button onClick={() => onNavigate?.('drinks-food')} className="min-h-12 w-full border border-[#D4B887]/80 bg-[#080505]/80 px-2 sm:px-5 text-center text-[10px] sm:text-xs tracking-[.12em] sm:tracking-[.18em] text-[#F0D7A7] shadow-lg backdrop-blur-sm hover:bg-[#240609]">
              View Food and Drinks Menu
            </button>
            <a href="https://www.tiktok.com/@amicasoho" target="_blank" rel="noopener noreferrer" aria-label="AMICA Soho on TikTok" className="grid h-11 w-11 place-items-center rounded-full border border-[#D4B887]/70 bg-[#080505]/75 shadow-lg backdrop-blur-sm hover:bg-[#240609]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#25F4EE" d="M14.2 3h3.1c.3 1.8 1.3 3.2 3 4.1v3.2a10 10 0 0 1-6.1-2v7.2a6.2 6.2 0 1 1-6.2-6.2c.4 0 .9 0 1.3.1v3.4a2.8 2.8 0 1 0 1.9 2.7V3h3z" transform="translate(-1.1 .35)"/>
                <path fill="#FE2C55" d="M14.2 3h3.1c.3 1.8 1.3 3.2 3 4.1v3.2a10 10 0 0 1-6.1-2v7.2a6.2 6.2 0 1 1-6.2-6.2c.4 0 .9 0 1.3.1v3.4a2.8 2.8 0 1 0 1.9 2.7V3h3z" transform="translate(.8 -.3)"/>
                <path fill="#FFFFFF" d="M14.2 3h3.1c.3 1.8 1.3 3.2 3 4.1v3.2a10 10 0 0 1-6.1-2v7.2a6.2 6.2 0 1 1-6.2-6.2c.4 0 .9 0 1.3.1v3.4a2.8 2.8 0 1 0 1.9 2.7V3h3z"/>
              </svg>
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
        <a href="https://wa.me/447459959699" target="_blank" rel="noopener noreferrer" className="min-h-12 flex justify-center items-center gap-2 border border-[#D4B887]/60 text-[#D4B887] text-[11px] tracking-widest">
          <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#25D366" d="M12.04 2a9.9 9.9 0 0 0-8.49 15l-1.2 4.38 4.5-1.18A9.9 9.9 0 1 0 12.04 2Z"/>
            <path fill="#fff" d="M17.5 14.3c-.3-.16-1.72-.85-1.99-.95-.27-.1-.46-.16-.65.16-.19.3-.75.95-.92 1.15-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.65-2.04-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.65-1.58-.9-2.16-.24-.58-.48-.5-.65-.5h-.55c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.22 1.35.19 1.86.11.57-.08 1.72-.7 1.96-1.39.24-.68.24-1.27.17-1.39-.07-.13-.26-.2-.55-.35Z" transform="translate(2.7 1.1) scale(.82)"/>
          </svg>
          WHATSAPP
        </a>
      </div>
    </nav>
  </div>;
};

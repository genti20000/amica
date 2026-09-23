import React from 'react';

interface AmicaEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  tagline?: string;
  className?: string;
  onClick?: () => void;
}

export const AmicaEmblem: React.FC<AmicaEmblemProps> = ({
  size = 'md',
  showSubtitle = true,
  tagline,
  className = '',
  onClick,
}) => {
  const titleSizes = {
    sm: 'text-sm sm:text-base tracking-[0.24em]',
    md: 'text-lg sm:text-2xl tracking-[0.28em]',
    lg: 'text-2xl sm:text-4xl tracking-[0.32em]',
    xl: 'text-4xl sm:text-6xl tracking-[0.36em]',
  };

  const sohoSizes = {
    sm: 'text-[7px] tracking-[0.3em]',
    md: 'text-[8.5px] sm:text-[10px] tracking-[0.36em]',
    lg: 'text-[10px] sm:text-[12px] tracking-[0.4em]',
    xl: 'text-[12px] sm:text-[14px] tracking-[0.45em]',
  };

  const lineSizes = {
    sm: 'w-3 sm:w-4',
    md: 'w-4 sm:w-6',
    lg: 'w-6 sm:w-8',
    xl: 'w-8 sm:w-12',
  };

  const subSizes = {
    sm: 'text-[7px] tracking-[0.22em]',
    md: 'text-[8px] sm:text-[9.5px] tracking-[0.28em]',
    lg: 'text-[10px] sm:text-[11.5px] tracking-[0.34em]',
    xl: 'text-xs sm:text-sm tracking-[0.38em]',
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-center select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* AMICA */}
      <h1
        className={`font-['Cinzel',serif] ${titleSizes[size]} font-light text-[#E8CCA0] uppercase leading-none drop-shadow-sm group-hover:text-[#FFEAA7] transition-colors`}
      >
        AMICA
      </h1>

      {/* — SOHO — */}
      <div className="flex items-center justify-center gap-2 mt-1.5 text-[#DFBE7B]">
        <span className={`${lineSizes[size]} h-[1px] bg-[#DFBE7B]/80`} />
        <span className={`font-sans ${sohoSizes[size]} uppercase font-medium`}>
          SOHO
        </span>
        <span className={`${lineSizes[size]} h-[1px] bg-[#DFBE7B]/80`} />
      </div>

      {/* APERITIVO • MUSIC • LATE */}
      {showSubtitle && (
        <div
          className={`flex items-center justify-center gap-2 mt-2.5 font-sans ${subSizes[size]} uppercase text-[#E8CCA0]/90 font-light`}
        >
          <span>APERITIVO</span>
          <span className="text-[6px] text-[#DFBE7B]">•</span>
          <span>MUSIC</span>
          <span className="text-[6px] text-[#DFBE7B]">•</span>
          <span>LATE</span>
        </div>
      )}

      {/* Optional Tagline with Divider */}
      {tagline && (
        <>
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent via-[#DFBE7B] to-transparent my-4 opacity-70" />
          <p className="font-serif text-[11px] sm:text-xs tracking-[0.32em] text-[#FFEAA7] uppercase font-light drop-shadow-sm">
            {tagline}
          </p>
        </>
      )}
    </div>
  );
};

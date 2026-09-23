import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showIcon?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  layout = 'horizontal',
}) => {
  const titleSizes = {
    sm: 'text-sm sm:text-base tracking-[0.22em]',
    md: 'text-base sm:text-xl md:text-2xl tracking-[0.24em] sm:tracking-[0.28em]',
    lg: 'text-xl sm:text-2xl md:text-3xl tracking-[0.28em]',
    xl: 'text-3xl sm:text-4xl md:text-5xl tracking-[0.30em]',
  };

  const sohoSizes = {
    sm: 'text-[6.5px] tracking-[0.3em]',
    md: 'text-[7.5px] sm:text-[8.5px] tracking-[0.34em]',
    lg: 'text-[9px] sm:text-[10px] tracking-[0.36em]',
    xl: 'text-[11px] sm:text-[13px] tracking-[0.4em]',
  };

  const lineSizes = {
    sm: 'w-2.5 sm:w-3',
    md: 'w-3 sm:w-4',
    lg: 'w-4 sm:w-6',
    xl: 'w-6 sm:w-8',
  };

  return (
    <div
      className={`flex flex-col ${
        layout === 'vertical' ? 'items-center text-center' : 'items-start text-left'
      } select-none ${className}`}
    >
      <span
        className={`font-['Cinzel',serif] ${titleSizes[size]} font-light text-[#E8CCA0] uppercase leading-none drop-shadow-sm`}
      >
        AMICA
      </span>
      <div className="flex items-center gap-1.5 mt-1 text-[#DFBE7B]">
        <span className={`${lineSizes[size]} h-[1px] bg-[#DFBE7B]/80`} />
        <span className={`font-sans ${sohoSizes[size]} uppercase font-medium`}>
          SOHO
        </span>
        <span className={`${lineSizes[size]} h-[1px] bg-[#DFBE7B]/80`} />
      </div>

      {showSubtitle && (
        <div className="space-y-0.5 mt-2.5">
          <span className="block font-sans text-[8px] sm:text-[9px] font-semibold text-[#DFBE7B] tracking-[0.28em] uppercase leading-tight opacity-95">
            APERITIVO · MUSIC · LATE
          </span>
          <span className="block font-sans text-[7px] sm:text-[7.5px] font-medium text-[#9D7E54] tracking-[0.22em] uppercase leading-none opacity-80">
            23 Frith Street · London W1
          </span>
        </div>
      )}
    </div>
  );
};

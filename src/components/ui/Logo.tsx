import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const titleSizes = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Contemporary Minimal Geometric Monogram */}
      <div
        className={`${iconSizes[size]} rounded-[4px] bg-[#4F46A5] text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-white"
        >
          {/* Two parallel structural verticals with dynamic diagonal connector */}
          <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Subtle Muted Saffron Focus Dot */}
          <circle cx="19" cy="5" r="2" fill="#B7791F" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`tracking-tight text-[#202124] ${titleSizes[size]}`}
          >
            ExamCraft
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
            CAT 2026
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[#787774] font-normal tracking-normal mt-0.5 ${subtitleSizes[size]}`}
          >
            CAT Preparation Engine
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export { Logo };

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
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Restrained Geometric Monogram Emblem */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs border border-slate-800 relative overflow-hidden group`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-stone-100"
        >
          {/* Subtle architectural vertical pillars representing knowledge & structure */}
          <rect x="6" y="6" width="3.5" height="20" rx="1" fill="currentColor" />
          <rect x="22.5" y="6" width="3.5" height="20" rx="1" fill="currentColor" />
          {/* Modern geometric diagonal beam with subtle saffron accent dot */}
          <path
            d="M9 7.5L23 24.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="24.2" cy="7.8" r="1.8" fill="#d97706" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight text-slate-900 font-sans ${titleSizes[size]}`}
          >
            Nalanda
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
            Platform
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-slate-500 font-medium tracking-wide uppercase mt-0.5 ${subtitleSizes[size]}`}
          >
            Integrated Learning & Examination System
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export { Logo };

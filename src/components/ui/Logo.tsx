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
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ExamCraft Geometric Prism Delta Mark */}
      <div className={`${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Top vertex facet */}
          <path
            d="M14 2 L25 21 L19 21 L14 11 L9 21 L3 21 Z"
            fill="#18181B"
            className="dark:fill-white"
          />
          {/* Inner prism facets with lighting illusion */}
          <path
            d="M14 7 L21 19 L16.5 19 L14 14 L11.5 19 L7 19 Z"
            fill="#3F3F46"
            className="dark:fill-zinc-400"
          />
          {/* Bottom stabilizing bar */}
          <rect
            x="8.5"
            y="23"
            width="11"
            height="2"
            rx="1"
            fill="#2E7D62"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-tight">
        <span className={`tracking-tight text-ink ${titleSizes[size]}`}>
          ExamCraft
        </span>
        {showSubtitle && (
          <span className={`text-ink-muted font-normal tracking-tight mt-0.5 ${subtitleSizes[size]}`}>
            Plan. Practice. Perform.
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

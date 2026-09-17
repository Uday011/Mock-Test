'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface ToggleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number | string;
  badge?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export function ToggleSection({
  title,
  children,
  defaultOpen = false,
  count,
  badge,
  className = '',
  headerClassName = '',
}: ToggleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-[#F1F1EF] text-left transition-colors select-none group text-xs sm:text-sm font-medium text-[#202124] ${headerClassName}`}
      >
        <ChevronRight
          className={`w-4 h-4 shrink-0 text-[#787774] transition-transform duration-150 ${
            isOpen ? 'rotate-90 text-[#202124]' : 'group-hover:text-[#202124]'
          }`}
        />
        <div className="flex-1 min-w-0 flex items-center gap-2 truncate">
          <span className="truncate">{title}</span>
          {count !== undefined && (
            <span className="text-[11px] font-mono text-[#787774] px-1.5 py-0.2 rounded bg-[#F1F1EF] border border-[#E6E6E3]">
              {count}
            </span>
          )}
          {badge}
        </div>
      </button>

      {isOpen && <div className="pl-6 pt-1 space-y-2">{children}</div>}
    </div>
  );
}

export default ToggleSection;

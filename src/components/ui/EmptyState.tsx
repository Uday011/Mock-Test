import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#E6E6E3] rounded-lg bg-[#F7F7F5]/50 ${className}`}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-md bg-[#F1F1EF] flex items-center justify-center text-[#787774] mb-3.5 border border-[#E6E6E3]">
          <Icon className="w-5 h-5 stroke-[1.75]" />
        </div>
      )}
      <h3 className="text-sm sm:text-base font-semibold text-[#202124] mb-1 tracking-tight font-sans">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#787774] max-w-md mb-5 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

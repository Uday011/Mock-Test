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
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-stone-300 rounded-xl bg-stone-50/50 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 mb-4 border border-stone-200">
          <Icon className="w-6 h-6 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-900 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-stone-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

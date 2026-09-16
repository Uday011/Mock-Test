import React from 'react';

export interface MetricCalloutProps {
  label: string;
  value: string | number;
  max?: number;
  subtext?: string;
  trend?: {
    value?: string;
    text?: string;
    isPositive?: boolean;
    positive?: boolean;
    neutral?: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'saffron' | 'navy' | 'emerald' | 'stone' | 'rose';
  accent?: 'saffron' | 'emerald' | 'navy' | 'stone' | 'rose' | 'default';
  className?: string;
}

export default function MetricCallout({
  label,
  value,
  max,
  subtext,
  trend,
  icon,
  variant,
  accent = 'default',
  className = '',
}: MetricCalloutProps) {
  const chosenStyle = variant || accent;

  const borderVariants: Record<string, string> = {
    default: 'border-stone-200/90 bg-white',
    stone: 'border-stone-200/90 bg-white',
    saffron: 'border-amber-200/90 bg-amber-50/25',
    navy: 'border-slate-200/90 bg-slate-50/25',
    emerald: 'border-emerald-200/90 bg-emerald-50/25',
    rose: 'border-rose-200/90 bg-rose-50/25',
  };

  const accentPills: Record<string, string> = {
    default: 'bg-stone-500',
    stone: 'bg-stone-500',
    saffron: 'bg-amber-600',
    navy: 'bg-slate-700',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
  };

  const trendText = trend?.value || trend?.text;
  const isPos = trend?.isPositive ?? trend?.positive;

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-xl border bg-white shadow-2xs overflow-hidden flex flex-col justify-between ${
        borderVariants[chosenStyle] || borderVariants.default
      } ${className}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          accentPills[chosenStyle] || accentPills.default
        }`}
      />

      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-sans font-medium text-stone-500 uppercase tracking-wider truncate">
          {label}
        </span>
        {icon && <span className="text-stone-400 shrink-0">{icon}</span>}
      </div>

      <div className="space-y-1 my-auto">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            {value}
          </span>
          {max !== undefined && (
            <span className="text-xs sm:text-sm font-mono text-stone-400">
              / {max}
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] text-stone-500 leading-tight truncate">
            {subtext}
          </p>
        )}
      </div>

      {trendText && (
        <div className="mt-2.5 pt-2 border-t border-stone-100/80 flex items-center text-[10px] font-medium font-mono">
          <span
            className={
              isPos
                ? 'text-emerald-700 font-semibold'
                : 'text-stone-500'
            }
          >
            {trendText}
          </span>
        </div>
      )}
    </div>
  );
}

export { MetricCallout };

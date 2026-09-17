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
  icon?: any;
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
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' || typeof icon === 'number') return <span>{icon}</span>;
    if (typeof icon === 'function' || (typeof icon === 'object' && ('render' in icon || '$$typeof' in icon))) {
      const IconComponent = icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();
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
      className={`p-3.5 sm:p-4 rounded-lg border border-[#ebebeb] bg-white text-[#37352f] flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-medium text-[#787774] uppercase tracking-wider truncate">
          {label}
        </span>
        {renderedIcon && (
          <span className="text-[#9b9a97] shrink-0 opacity-80">
            {renderedIcon}
          </span>
        )}
      </div>

      <div className="space-y-0.5 my-auto">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-semibold text-[#37352f] tracking-tight font-sans">
            {value}
          </span>
          {max !== undefined && (
            <span className="text-xs font-mono text-[#9b9a97]">
              / {max}
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] text-[#787774] leading-tight truncate">
            {subtext}
          </p>
        )}
      </div>

      {trendText && (
        <div className="mt-2 pt-1.5 border-t border-[#f0f0ee] flex items-center text-[10px] font-medium">
          <span
            className={
              isPos
                ? 'text-[#0f7b6c]'
                : 'text-[#787774]'
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

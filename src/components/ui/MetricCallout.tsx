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
  variant?: 'default' | 'indigo' | 'saffron' | 'navy' | 'emerald' | 'stone' | 'rose';
  accent?: 'indigo' | 'saffron' | 'emerald' | 'navy' | 'stone' | 'rose' | 'default';
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
      return <IconComponent className="w-3.5 h-3.5" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();
  const trendText = trend?.value || trend?.text;
  const isPos = trend?.isPositive ?? trend?.positive;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-md border border-[#E6E6E3] bg-white text-[#202124] flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold text-[#787774] uppercase tracking-wider truncate">
          {label}
        </span>
        {renderedIcon && (
          <span className="text-[#787774] shrink-0 opacity-80">
            {renderedIcon}
          </span>
        )}
      </div>

      <div className="space-y-0.5 my-auto">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-semibold text-[#202124] tracking-tight font-sans">
            {value}
          </span>
          {max !== undefined && (
            <span className="text-xs font-mono text-[#787774]">
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
        <div className="pt-2 mt-2 border-t border-[#E6E6E3] flex items-center gap-1 text-[11px]">
          <span
            className={`font-medium ${
              trend?.neutral
                ? 'text-[#787774]'
                : isPos
                ? 'text-[#1B5E20]'
                : 'text-[#C53030]'
            }`}
          >
            {isPos ? '↑' : '↓'} {trendText}
          </span>
        </div>
      )}
    </div>
  );
}

export { MetricCallout };

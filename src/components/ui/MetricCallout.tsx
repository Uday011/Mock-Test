import React from 'react';

export interface MetricCalloutProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    text: string;
    positive?: boolean;
    neutral?: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'saffron' | 'navy' | 'emerald';
  className?: string;
}

export default function MetricCallout({
  label,
  value,
  subtext,
  trend,
  icon,
  variant = 'default',
  className = '',
}: MetricCalloutProps) {
  const borderVariants = {
    default: 'border-stone-200/90',
    saffron: 'border-amber-200/90 bg-amber-50/30',
    navy: 'border-blue-200/90 bg-blue-50/30',
    emerald: 'border-emerald-200/90 bg-emerald-50/30',
  };

  const iconBg = {
    default: 'bg-stone-100 text-slate-700',
    saffron: 'bg-amber-100 text-amber-800',
    navy: 'bg-blue-100 text-blue-800',
    emerald: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white border ${borderVariants[variant]} shadow-2xs flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl ${iconBg[variant]} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
          {value}
        </div>

        {(trend || subtext) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs flex-wrap">
            {trend && (
              <span
                className={`font-bold inline-flex items-center gap-0.5 ${
                  trend.neutral
                    ? 'text-slate-600'
                    : trend.positive
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {trend.text}
              </span>
            )}
            {subtext && <span className="text-slate-500 text-[11px]">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

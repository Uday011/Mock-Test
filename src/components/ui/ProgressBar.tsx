import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'saffron' | 'emerald' | 'navy' | 'stone' | 'rose' | 'blue' | 'amber' | 'green' | 'default';
  className?: string;
}

const variantFills: Record<string, string> = {
  saffron: 'bg-[#d9730d]',
  emerald: 'bg-[#0f7b6c]',
  navy: 'bg-[#0b6e99]',
  stone: 'bg-[#787774]',
  rose: 'bg-[#c93b3b]',
  blue: 'bg-[#2383e2]',
  amber: 'bg-[#d9730d]',
  green: 'bg-[#0f7b6c]',
  default: 'bg-[#37352f]',
};

const sizeHeights: Record<string, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  showValue = false,
  size = 'md',
  variant = 'saffron',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue || sublabel) && (
        <div className="flex items-center justify-between mb-1.5 text-xs text-stone-600 font-medium">
          <div className="flex items-center gap-2">
            {label && <span className="text-stone-900 font-semibold">{label}</span>}
            {sublabel && <span className="text-stone-400 font-normal">({sublabel})</span>}
          </div>
          {showValue && (
            <span className="font-mono text-stone-700">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-stone-200/80 rounded-full overflow-hidden ${sizeHeights[size]}`}>
        <div
          className={`${sizeHeights[size]} rounded-full transition-all duration-500 ease-out ${variantFills[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

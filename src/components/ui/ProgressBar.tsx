import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'indigo' | 'saffron' | 'emerald' | 'navy' | 'stone' | 'rose' | 'blue' | 'amber' | 'green' | 'default';
  className?: string;
}

const variantFills: Record<string, string> = {
  indigo: 'bg-[#4F46A5]',
  saffron: 'bg-[#B7791F]',
  emerald: 'bg-[#1B5E20]',
  navy: 'bg-[#4F46A5]',
  stone: 'bg-[#787774]',
  rose: 'bg-[#C53030]',
  blue: 'bg-[#4F46A5]',
  amber: 'bg-[#B7791F]',
  green: 'bg-[#1B5E20]',
  default: 'bg-[#4F46A5]',
};

const sizeHeights: Record<string, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  showValue = false,
  size = 'md',
  variant = 'default',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue || sublabel) && (
        <div className="flex items-center justify-between mb-1 text-xs text-[#787774] font-medium">
          <div className="flex items-center gap-1.5">
            {label && <span className="text-[#202124] font-medium">{label}</span>}
            {sublabel && <span className="text-[#787774] font-normal">({sublabel})</span>}
          </div>
          {showValue && (
            <span className="font-mono text-xs text-[#787774]">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-[#E6E6E3] rounded-full overflow-hidden ${sizeHeights[size]}`}>
        <div
          className={`${sizeHeights[size]} rounded-full transition-all duration-300 ease-out ${variantFills[variant] || variantFills.default}`}
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

export default ProgressBar;

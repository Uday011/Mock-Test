import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'indigo' | 'green' | 'gold' | 'coral' | 'lavender' | 'emerald' | 'saffron' | 'navy' | 'stone' | 'rose' | 'blue' | 'amber';
  className?: string;
}

const variantFills: Record<string, string> = {
  default: 'bg-accent',
  accent: 'bg-accent',
  indigo: 'bg-accent',
  navy: 'bg-accent',
  blue: 'bg-accent',
  stone: 'bg-ink-muted',
  green: 'bg-[#72A88F]',
  emerald: 'bg-[#72A88F]',
  gold: 'bg-[#C5A05A]',
  saffron: 'bg-[#C5A05A]',
  amber: 'bg-[#C5A05A]',
  coral: 'bg-[#D8897D]',
  rose: 'bg-[#D8897D]',
  lavender: 'bg-[#9185C7]',
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
        <div className="flex items-center justify-between mb-1.5 text-xs text-ink-muted font-medium">
          <div className="flex items-center gap-1.5">
            {label && <span className="text-ink font-medium">{label}</span>}
            {sublabel && <span className="text-ink-muted font-normal">({sublabel})</span>}
          </div>
          {showValue && (
            <span className="font-mono text-xs text-ink-muted">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-line rounded-full overflow-hidden ${sizeHeights[size]}`}>
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

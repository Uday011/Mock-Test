import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'saffron' | 'navy' | 'emerald' | 'purple' | 'outline' | 'stone' | 'danger';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className = '',
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center font-bold tracking-tight rounded-full transition-colors select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    stone: 'bg-stone-100 text-stone-800 border border-stone-200',
    saffron: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    navy: 'bg-blue-50 text-blue-900 border border-blue-200/80',
    emerald: 'bg-emerald-50 text-emerald-900 border border-emerald-200/80',
    purple: 'bg-purple-50 text-purple-900 border border-purple-200/80',
    danger: 'bg-rose-50 text-rose-900 border border-rose-200/80',
    outline: 'bg-transparent text-slate-700 border border-stone-300',
  };

  const dotColors = {
    default: 'bg-slate-500',
    stone: 'bg-stone-500',
    saffron: 'bg-amber-600',
    navy: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    purple: 'bg-purple-600',
    danger: 'bg-rose-600',
    outline: 'bg-slate-400',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

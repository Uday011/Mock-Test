import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'saffron' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99] touch-manipulation min-h-[44px]';

  const variantStyles = {
    primary:
      'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-2xs focus:ring-slate-900 border border-slate-800',
    secondary:
      'bg-white hover:bg-stone-50 active:bg-stone-100 text-slate-800 border border-stone-200 shadow-2xs focus:ring-stone-400',
    saffron:
      'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-2xs focus:ring-amber-500 border border-amber-600',
    outline:
      'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-slate-700 border border-stone-300 focus:ring-stone-400',
    ghost:
      'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-slate-700 focus:ring-stone-300 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs focus:ring-rose-500 border border-rose-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}

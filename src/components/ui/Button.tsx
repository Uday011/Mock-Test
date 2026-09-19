import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'green' | 'saffron' | 'coral';
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
    'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none touch-manipulation active:scale-[0.99]';

  const variantStyles = {
    primary:
      'bg-accent hover:bg-accent-hover text-white border border-transparent shadow-xs',
    secondary:
      'bg-surface hover:bg-secondary text-ink border border-line shadow-xs',
    saffron:
      'bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30',
    outline:
      'bg-transparent hover:bg-secondary text-ink border border-line',
    ghost:
      'bg-transparent hover:bg-secondary text-ink border border-transparent',
    danger:
      'bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30',
    coral:
      'bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30',
    gold:
      'bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30',
    green:
      'bg-green/10 hover:bg-green/20 text-green border border-green/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 min-h-[30px]',
    md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2 min-h-[36px]',
    lg: 'text-sm sm:text-base px-4.5 py-2.5 gap-2.5 min-h-[42px]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const renderIcon = (ic: any) => {
    if (!ic) return null;
    if (React.isValidElement(ic)) return ic;
    if (typeof ic === 'string' || typeof ic === 'number') return <span>{ic}</span>;
    if (typeof ic === 'function' || (typeof ic === 'object' && ('render' in ic || '$$typeof' in ic))) {
      const IconComponent = ic as any;
      return <IconComponent className="w-3.5 h-3.5" />;
    }
    return null;
  };

  const renderedIcon = renderIcon(icon);
  const renderedIconRight = renderIcon(iconRight);

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {renderedIcon && <span className="shrink-0">{renderedIcon}</span>}
          <span>{children}</span>
          {renderedIconRight && <span className="shrink-0">{renderedIconRight}</span>}
        </>
      )}
    </button>
  );
}

export { Button };

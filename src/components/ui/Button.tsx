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
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-100 select-none focus:outline-none focus:ring-1 focus:ring-[#4F46A5]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none touch-manipulation min-h-[34px]';

  const variantStyles = {
    primary:
      'bg-[#4F46A5] hover:bg-[#433B91] text-white border border-[#4F46A5]',
    secondary:
      'bg-white hover:bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3]',
    saffron:
      'bg-[#FDF6EC] hover:bg-[#F6E3C7] text-[#B7791F] border border-[#F6E3C7]',
    outline:
      'bg-transparent hover:bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3]',
    ghost:
      'bg-transparent hover:bg-[#F1F1EF] text-[#202124] border border-transparent',
    danger:
      'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#C53030] border border-[#FEE2E2]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 min-h-[30px]',
    md: 'text-xs sm:text-sm px-3 py-1.5 gap-2 min-h-[34px]',
    lg: 'text-sm sm:text-base px-4 py-2 gap-2.5 min-h-[40px]',
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

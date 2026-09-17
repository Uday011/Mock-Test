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
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-100 select-none focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none touch-manipulation min-h-[36px]';

  const variantStyles = {
    primary:
      'bg-[#37352f] hover:bg-[#2f2d28] text-white border border-[#37352f]',
    secondary:
      'bg-white hover:bg-[#f7f6f3] text-[#37352f] border border-[#ebebeb]',
    saffron:
      'bg-[#faece3] hover:bg-[#f5e1d3] text-[#d9730d] border border-[#f0d6c2]',
    outline:
      'bg-transparent hover:bg-[#efefed] text-[#37352f] border border-[#ebebeb]',
    ghost:
      'bg-transparent hover:bg-[#efefed] text-[#37352f] border border-transparent',
    danger:
      'bg-[#fdebec] hover:bg-[#fbd8da] text-[#c93b3b] border border-[#f7c5c8]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm sm:text-base px-4 py-2.5 gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const renderIcon = (ic: any) => {
    if (!ic) return null;
    if (React.isValidElement(ic)) return ic;
    if (typeof ic === 'string' || typeof ic === 'number') return <span>{ic}</span>;
    if (typeof ic === 'function' || (typeof ic === 'object' && ('render' in ic || '$$typeof' in ic))) {
      const IconComponent = ic as any;
      return <IconComponent className="w-4 h-4" />;
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
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
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

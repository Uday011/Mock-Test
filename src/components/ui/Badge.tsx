import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'indigo'
    | 'saffron'
    | 'navy'
    | 'emerald'
    | 'purple'
    | 'outline'
    | 'stone'
    | 'danger'
    | 'rose'
    | 'orange'
    | 'amber'
    | 'blue'
    | 'green'
    | 'red'
    | 'gray'
    | 'brown'
    | 'yellow'
    | 'pink'
    | 'teal';
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
    'inline-flex items-center font-medium rounded-[3px] transition-colors select-none';

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-1 leading-none',
    md: 'text-xs px-2 py-0.5 gap-1.5 leading-none',
  };

  const variantStyles: Record<string, string> = {
    default: 'bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3]',
    stone: 'bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3]',
    gray: 'bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]',
    indigo: 'bg-[#EEF0FB] text-[#4F46A5] border border-[#DCDDF7]',
    saffron: 'bg-[#FDF6EC] text-[#B7791F] border border-[#F6E3C7]',
    navy: 'bg-[#EEF0FB] text-[#4F46A5] border border-[#DCDDF7]',
    blue: 'bg-[#EEF0FB] text-[#4F46A5] border border-[#DCDDF7]',
    emerald: 'bg-[#EDF7ED] text-[#1B5E20] border border-[#C8E6C9]',
    green: 'bg-[#EDF7ED] text-[#1B5E20] border border-[#C8E6C9]',
    teal: 'bg-[#EDF7ED] text-[#1B5E20] border border-[#C8E6C9]',
    amber: 'bg-[#FFFBEB] text-[#B7791F] border border-[#FEF3C7]',
    orange: 'bg-[#FDF6EC] text-[#B7791F] border border-[#F6E3C7]',
    yellow: 'bg-[#FFFBEB] text-[#B7791F] border border-[#FEF3C7]',
    purple: 'bg-[#EEF0FB] text-[#4F46A5] border border-[#DCDDF7]',
    pink: 'bg-[#FAF0F5] text-[#9A2862] border border-[#F5D8E8]',
    brown: 'bg-[#F4EEEE] text-[#64473A] border border-[#E8DCD9]',
    danger: 'bg-[#FEF2F2] text-[#C53030] border border-[#FEE2E2]',
    rose: 'bg-[#FEF2F2] text-[#C53030] border border-[#FEE2E2]',
    red: 'bg-[#FEF2F2] text-[#C53030] border border-[#FEE2E2]',
    outline: 'bg-transparent text-[#787774] border border-[#E6E6E3]',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-[#787774]',
    stone: 'bg-[#787774]',
    gray: 'bg-[#787774]',
    indigo: 'bg-[#4F46A5]',
    saffron: 'bg-[#B7791F]',
    navy: 'bg-[#4F46A5]',
    blue: 'bg-[#4F46A5]',
    emerald: 'bg-[#1B5E20]',
    green: 'bg-[#1B5E20]',
    teal: 'bg-[#1B5E20]',
    amber: 'bg-[#B7791F]',
    orange: 'bg-[#B7791F]',
    yellow: 'bg-[#B7791F]',
    purple: 'bg-[#4F46A5]',
    pink: 'bg-[#9A2862]',
    brown: 'bg-[#64473A]',
    danger: 'bg-[#C53030]',
    rose: 'bg-[#C53030]',
    red: 'bg-[#C53030]',
    outline: 'bg-[#787774]',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' || typeof icon === 'number') return <span>{icon}</span>;
    if (typeof icon === 'function' || (typeof icon === 'object' && ('render' in icon || '$$typeof' in icon))) {
      const IconComponent = icon as any;
      return <IconComponent className="w-3 h-3" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {renderedIcon && <span className="shrink-0">{renderedIcon}</span>}
      <span>{children}</span>
    </span>
  );
}

export { Badge };

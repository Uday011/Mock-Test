import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
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
    default: 'bg-[#f1f1ef] text-[#37352f]',
    stone: 'bg-[#f1f1ef] text-[#37352f]',
    saffron: 'bg-[#faece3] text-[#d9730d]',
    navy: 'bg-[#e7f3f8] text-[#0b6e99]',
    emerald: 'bg-[#edf3ec] text-[#0f7b6c]',
    purple: 'bg-[#f4f0f7] text-[#6940a5]',
    danger: 'bg-[#fdebec] text-[#c93b3b]',
    rose: 'bg-[#fdebec] text-[#c93b3b]',
    outline: 'bg-transparent text-[#787774] border border-[#ebebeb]',
    orange: 'bg-[#faece3] text-[#d9730d]',
    amber: 'bg-[#fbf3db] text-[#8f6b10]',
    blue: 'bg-[#e7f3f8] text-[#0b6e99]',
    green: 'bg-[#edf3ec] text-[#0f7b6c]',
    red: 'bg-[#fdebec] text-[#c93b3b]',
    gray: 'bg-[#f1f1ef] text-[#787774]',
    brown: 'bg-[#f4eeee] text-[#64473a]',
    yellow: 'bg-[#fbf3db] text-[#8f6b10]',
    pink: 'bg-[#faf0f5] text-[#9a2862]',
    teal: 'bg-[#edf3ec] text-[#0f7b6c]',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-[#787774]',
    stone: 'bg-[#787774]',
    saffron: 'bg-[#d9730d]',
    navy: 'bg-[#0b6e99]',
    emerald: 'bg-[#0f7b6c]',
    purple: 'bg-[#6940a5]',
    danger: 'bg-[#c93b3b]',
    rose: 'bg-[#c93b3b]',
    outline: 'bg-[#9b9a97]',
    orange: 'bg-[#d9730d]',
    amber: 'bg-[#8f6b10]',
    blue: 'bg-[#0b6e99]',
    green: 'bg-[#0f7b6c]',
    red: 'bg-[#c93b3b]',
    gray: 'bg-[#787774]',
    brown: 'bg-[#64473a]',
    yellow: 'bg-[#8f6b10]',
    pink: 'bg-[#9a2862]',
    teal: 'bg-[#0f7b6c]',
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
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {renderedIcon && <span className="shrink-0 opacity-80">{renderedIcon}</span>}
      <span>{children}</span>
    </span>
  );
}

export { Badge };

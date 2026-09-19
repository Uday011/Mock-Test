import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'indigo'
    | 'accent'
    | 'lavender'
    | 'green'
    | 'gold'
    | 'coral'
    | 'stone'
    | 'gray'
    | 'outline'
    | 'saffron'
    | 'navy'
    | 'emerald'
    | 'purple'
    | 'danger'
    | 'rose'
    | 'orange'
    | 'amber'
    | 'blue'
    | 'red'
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
    'inline-flex items-center font-medium rounded-control transition-colors select-none';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 leading-none',
    md: 'text-xs px-2.5 py-1 gap-1.5 leading-none',
  };

  const variantStyles: Record<string, string> = {
    default: 'bg-secondary text-ink border border-line',
    stone: 'bg-secondary text-ink border border-line',
    gray: 'bg-secondary text-ink-muted border border-line',
    indigo: 'bg-accent/10 text-accent border border-accent/20',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    navy: 'bg-accent/10 text-accent border border-accent/20',
    blue: 'bg-accent/10 text-accent border border-accent/20',
    purple: 'bg-accent/10 text-accent border border-accent/20',
    lavender: 'bg-lavender/15 text-lavender border border-lavender/30',
    green: 'bg-green/15 text-green border border-green/30',
    emerald: 'bg-green/15 text-green border border-green/30',
    teal: 'bg-green/15 text-green border border-green/30',
    gold: 'bg-gold/15 text-gold border border-gold/30',
    saffron: 'bg-gold/15 text-gold border border-gold/30',
    amber: 'bg-gold/15 text-gold border border-gold/30',
    orange: 'bg-gold/15 text-gold border border-gold/30',
    yellow: 'bg-gold/15 text-gold border border-gold/30',
    coral: 'bg-coral/15 text-coral border border-coral/30',
    danger: 'bg-coral/15 text-coral border border-coral/30',
    rose: 'bg-coral/15 text-coral border border-coral/30',
    red: 'bg-coral/15 text-coral border border-coral/30',
    pink: 'bg-coral/10 text-coral border border-coral/20',
    brown: 'bg-secondary text-ink-muted border border-line',
    outline: 'bg-transparent text-ink-muted border border-line',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-ink-muted',
    stone: 'bg-ink-muted',
    gray: 'bg-ink-muted',
    indigo: 'bg-accent',
    accent: 'bg-accent',
    navy: 'bg-accent',
    blue: 'bg-accent',
    purple: 'bg-accent',
    lavender: 'bg-lavender',
    green: 'bg-green',
    emerald: 'bg-green',
    teal: 'bg-green',
    gold: 'bg-gold',
    saffron: 'bg-gold',
    amber: 'bg-gold',
    orange: 'bg-gold',
    yellow: 'bg-gold',
    coral: 'bg-coral',
    danger: 'bg-coral',
    rose: 'bg-coral',
    red: 'bg-coral',
    pink: 'bg-coral',
    brown: 'bg-ink-muted',
    outline: 'bg-ink-muted',
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

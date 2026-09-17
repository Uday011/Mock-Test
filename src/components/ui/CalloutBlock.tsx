import React from 'react';

export interface CalloutBlockProps {
  icon?: any;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'indigo' | 'saffron' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'neutral' | 'stone' | 'gray';
  action?: React.ReactNode;
  className?: string;
}

export function CalloutBlock({
  icon,
  title,
  children,
  variant = 'default',
  action,
  className = '',
}: CalloutBlockProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-[#F1F1EF] border-[#E6E6E3] text-[#202124]',
    neutral: 'bg-[#F1F1EF] border-[#E6E6E3] text-[#202124]',
    stone: 'bg-[#F1F1EF] border-[#E6E6E3] text-[#202124]',
    gray: 'bg-[#F1F1EF] border-[#E6E6E3] text-[#202124]',
    indigo: 'bg-[#EEF0FB] border-[#DCDDF7] text-[#4F46A5]',
    saffron: 'bg-[#FDF6EC] border-[#F6E3C7] text-[#B7791F]',
    amber: 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B7791F]',
    emerald: 'bg-[#EDF7ED] border-[#C8E6C9] text-[#1B5E20]',
    rose: 'bg-[#FEF2F2] border-[#FEE2E2] text-[#C53030]',
    blue: 'bg-[#EEF0FB] border-[#DCDDF7] text-[#4F46A5]',
    purple: 'bg-[#EEF0FB] border-[#DCDDF7] text-[#4F46A5]',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' || typeof icon === 'number') {
      return <span className="text-sm sm:text-base leading-none">{icon}</span>;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && ('render' in icon || '$$typeof' in icon))) {
      const IconComponent = icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();

  return (
    <div
      className={`rounded-md border p-3.5 sm:p-4 flex items-start gap-3 text-xs sm:text-sm leading-relaxed transition-colors ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      {renderedIcon && (
        <span className="shrink-0 mt-0.5 select-none text-inherit">
          {renderedIcon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-xs sm:text-sm mb-1 text-inherit tracking-tight">
            {title}
          </h4>
        )}
        <div className="text-inherit opacity-90">{children}</div>
      </div>
      {action && <div className="shrink-0 pt-0.5">{action}</div>}
    </div>
  );
}

export default CalloutBlock;

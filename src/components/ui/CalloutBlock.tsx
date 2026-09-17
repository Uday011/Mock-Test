import React from 'react';

export interface CalloutBlockProps {
  icon?: any;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'neutral' | 'stone' | 'gray';
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
    default: 'bg-[#f7f6f3] border-[#ebebeb] text-[#37352f]',
    neutral: 'bg-[#f7f6f3] border-[#ebebeb] text-[#37352f]',
    stone: 'bg-[#f7f6f3] border-[#ebebeb] text-[#37352f]',
    gray: 'bg-[#f7f6f3] border-[#ebebeb] text-[#37352f]',
    amber: 'bg-[#fbf3db]/60 border-[#f6e5b4] text-[#493a19]',
    emerald: 'bg-[#edf3ec]/70 border-[#d3e5d2] text-[#1c3829]',
    rose: 'bg-[#fdebec]/60 border-[#f7d4d6] text-[#4d1f22]',
    blue: 'bg-[#e7f3f8]/70 border-[#cfe5f0] text-[#193b4d]',
    purple: 'bg-[#f4f0f7]/70 border-[#e5daf0] text-[#3d2459]',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' || typeof icon === 'number') {
      return <span className="text-base sm:text-lg leading-none">{icon}</span>;
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
      className={`rounded-lg border p-3.5 sm:p-4 flex items-start gap-3 text-xs sm:text-sm leading-relaxed transition-colors ${
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

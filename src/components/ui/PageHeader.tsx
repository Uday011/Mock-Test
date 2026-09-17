import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  breadcrumbs,
  badge,
  actions,
  children,
  className = '',
}: PageHeaderProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' || typeof icon === 'number') return <span>{icon}</span>;
    if (typeof icon === 'function' || (typeof icon === 'object' && ('render' in icon || '$$typeof' in icon))) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-4 h-4" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();

  return (
    <header className={`pb-4 border-b border-[#ebebeb] mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-2.5">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {renderedIcon && (
              <div className="w-7 h-7 rounded-[4px] bg-[#f1f1ef] flex items-center justify-center text-[#37352f] shrink-0">
                {renderedIcon}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#37352f] tracking-tight font-sans">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-[#787774] max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="mt-5 pt-4 border-t border-[#ebebeb]">
          {children}
        </div>
      )}
    </header>
  );
}

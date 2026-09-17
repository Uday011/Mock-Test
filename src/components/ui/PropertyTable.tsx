import React from 'react';

export interface PropertyRowProps {
  icon?: any;
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PropertyRow({ icon, label, value, children, className = '' }: PropertyRowProps) {
  const content = value !== undefined ? value : children;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' || typeof icon === 'number') return <span>{icon}</span>;
    if (typeof icon === 'function' || (typeof icon === 'object' && ('render' in icon || '$$typeof' in icon))) {
      const IconComponent = icon;
      return <IconComponent className="w-3.5 h-3.5" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();

  return (
    <div
      className={`flex items-center py-1.5 px-2 rounded-md hover:bg-[#f7f6f3] transition-colors text-xs ${className}`}
    >
      <div className="w-36 sm:w-44 flex items-center gap-2 text-[#787774] shrink-0 font-normal select-none">
        {renderedIcon && (
          <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 opacity-70">
            {renderedIcon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex-1 min-w-0 text-[#37352f] font-medium flex items-center gap-1.5">
        {content}
      </div>
    </div>
  );
}

export interface PropertyTableProps {
  children: React.ReactNode;
  className?: string;
}

export function PropertyTable({ children, className = '' }: PropertyTableProps) {
  return (
    <div className={`space-y-0.5 py-2 border-y border-[#ebebeb] my-4 ${className}`}>
      {children}
    </div>
  );
}

export default PropertyTable;

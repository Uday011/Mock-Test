import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = true,
  className = '',
}: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-[#787774] font-medium ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="text-[#787774] hover:text-[#202124] transition-colors p-1 rounded hover:bg-[#F1F1EF] flex items-center"
              title="Dashboard"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-[#E6E6E3] flex-shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[#202124] transition-colors py-0.5 px-1 rounded hover:bg-[#F1F1EF] max-w-[200px] truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`py-0.5 px-1 max-w-[240px] truncate ${isLast ? 'text-[#202124] font-semibold' : 'text-[#787774]'}`}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

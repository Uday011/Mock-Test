'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'segmented';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}: TabsProps) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={`inline-flex items-center p-1 bg-secondary rounded-control border border-line ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
                isActive
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'bg-line text-ink-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-line ${className}`}>
      <nav role="tablist" className="flex space-x-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`group inline-flex items-center gap-2 py-2.5 px-1 border-b-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-accent text-ink font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-line'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-accent' : 'text-ink-muted group-hover:text-ink'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[11px] font-mono ml-1 px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'bg-secondary text-ink-muted group-hover:bg-line'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

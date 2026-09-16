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
        className={`inline-flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200/80 ${className}`}
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
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-white text-stone-900 shadow-sm font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-stone-200 text-stone-500'
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
    <div className={`border-b border-stone-200 ${className}`}>
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
              className={`group inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-amber-600 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-500'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-xs font-mono ml-1 px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 font-semibold'
                      : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
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

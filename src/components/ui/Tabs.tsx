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
        className={`inline-flex items-center p-1 bg-[#F1F1EF] rounded-md border border-[#E6E6E3] ${className}`}
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
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                isActive
                  ? 'bg-white text-[#202124] shadow-xs font-semibold'
                  : 'text-[#787774] hover:text-[#202124]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#EEF0FB] text-[#4F46A5] font-medium'
                      : 'bg-[#E6E6E3] text-[#787774]'
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
    <div className={`border-b border-[#E6E6E3] ${className}`}>
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
                  ? 'border-[#4F46A5] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:border-[#E6E6E3]'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-[#4F46A5]' : 'text-[#787774] group-hover:text-[#202124]'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[11px] font-mono ml-1 px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#EEF0FB] text-[#4F46A5] font-medium'
                      : 'bg-[#F1F1EF] text-[#787774] group-hover:bg-[#E6E6E3]'
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

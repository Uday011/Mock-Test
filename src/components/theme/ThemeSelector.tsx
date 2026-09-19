'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

export function ThemeSelector({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-btn text-ink-muted hover:text-ink hover:bg-secondary transition-colors"
        title={`Theme: ${theme}`}
        aria-label="Toggle Theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 bg-surface rounded-card border border-line shadow-lg py-1 z-50 text-xs text-ink animate-fade-in">
          <button
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-ink-muted" />
              <span>Light</span>
            </span>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-accent" />}
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-ink-muted" />
              <span>Dark</span>
            </span>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-accent" />}
          </button>

          <button
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-ink-muted" />
              <span>System</span>
            </span>
            {theme === 'system' && <Check className="w-3.5 h-3.5 text-accent" />}
          </button>
        </div>
      )}
    </div>
  );
}

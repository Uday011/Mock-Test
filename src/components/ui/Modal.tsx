'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeWidths = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f0f0f]/40 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Body */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeWidths[size]} bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[#ebebeb] overflow-hidden z-10 text-[#37352f] ${className}`}
      >
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#ebebeb]">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-[#37352f] tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#787774] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#787774] hover:text-[#37352f] hover:bg-[#efefed] transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3 bg-[#fbfbfa] border-t border-[#ebebeb]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

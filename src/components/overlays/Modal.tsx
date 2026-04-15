'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'bottom' | 'center';
}

export function Modal({ onClose, children, variant = 'bottom' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[999] flex justify-center bg-[rgba(3,8,5,0.6)] backdrop-blur-md',
        variant === 'center' ? 'items-center' : 'items-end'
      )}
      style={{ animation: 'fadeIn 0.22s ease' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'relative w-full max-w-[var(--shell-width)] border border-[var(--line-soft)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lifted)]',
          variant === 'center' ? 'mx-4 rounded-[var(--radius-lg)]' : 'rounded-t-[var(--radius-lg)]'
        )}
        style={{
          animation: variant === 'center' ? 'fadeIn 0.25s ease' : 'slideUp 0.32s cubic-bezier(.22,1,.36,1)',
          maxHeight: '88dvh',
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

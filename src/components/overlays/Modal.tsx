'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
      className="fixed inset-0 z-[999] flex items-end justify-center bg-[rgba(5,10,8,0.72)] backdrop-blur-md data-[variant=center]:items-center"
      data-variant={variant}
      style={{ animation: 'fadeIn 0.25s ease' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[var(--shell-width)] overflow-hidden rounded-t-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.98),rgba(10,15,13,0.96))] p-0 shadow-[0_34px_84px_rgba(1,8,5,0.34)] data-[variant=center]:mx-4 data-[variant=center]:rounded-[30px]"
        data-variant={variant}
        style={{ animation: 'slideUp 0.35s cubic-bezier(.4,0,.2,1)', maxHeight: '88dvh' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-sm text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Fechar"
        >
          ✕
        </button>
        {variant === 'bottom' && (
          <div className="mx-auto my-3 h-1 w-14 rounded-full bg-white/16" aria-hidden />
        )}
        <div className="max-h-[82dvh] overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

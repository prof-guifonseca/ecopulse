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
      className="fixed inset-0 z-[999] flex items-end bg-[rgba(2,6,14,0.76)] backdrop-blur-md data-[variant=center]:items-center data-[variant=center]:justify-center"
      data-variant={variant}
      style={{ animation: 'fadeIn 0.25s ease' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="surface surface-hud surface-accent-cyan relative mx-auto w-full max-w-xl overflow-hidden rounded-t-[28px] p-0 data-[variant=center]:rounded-[28px]"
        data-variant={variant}
        style={{ animation: 'slideUp 0.35s cubic-bezier(.4,0,.2,1)', maxHeight: '85dvh' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-text-secondary transition-colors hover:border-white/15 hover:bg-white/8 hover:text-text-primary"
          aria-label="Fechar"
        >
          ✕
        </button>
        {variant === 'bottom' && (
          <div className="mx-auto my-3 h-1 w-14 rounded-full bg-white/16" aria-hidden />
        )}
        <div className="max-h-[80dvh] overflow-y-auto px-5 pb-6 pt-3 sm:px-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

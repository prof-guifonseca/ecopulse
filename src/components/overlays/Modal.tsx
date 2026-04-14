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
      className="fixed inset-0 z-[999] flex items-end bg-black/60 backdrop-blur-sm data-[variant=center]:items-center data-[variant=center]:justify-center"
      data-variant={variant}
      style={{ animation: 'fadeIn 0.25s ease' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card relative mx-auto w-full max-w-lg overflow-hidden rounded-t-[24px] p-0 data-[variant=center]:rounded-[24px]"
        data-variant={variant}
        style={{ animation: 'slideUp 0.35s cubic-bezier(.4,0,.2,1)', maxHeight: '85dvh' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-sm text-text-secondary transition-colors hover:bg-[rgba(255,255,255,0.12)] hover:text-text-primary"
          aria-label="Fechar"
        >
          ✕
        </button>
        {variant === 'bottom' && (
          <div className="mx-auto my-2.5 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        )}
        <div className="max-h-[80dvh] overflow-y-auto px-5 pb-6 pt-2">{children}</div>
      </div>
    </div>,
    document.body
  );
}

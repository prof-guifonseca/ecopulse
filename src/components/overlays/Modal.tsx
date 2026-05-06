'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'bottom' | 'center';
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ onClose, children, variant = 'bottom' }: Props) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Focus trap + return focus to opener on close.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move initial focus into the modal on next paint.
    const t = setTimeout(() => {
      const surface = surfaceRef.current;
      if (!surface) return;
      const first = surface.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? surface).focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const surface = surfaceRef.current;
      if (!surface) return;
      const focusables = Array.from(surface.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      // Restore focus to whatever was focused before the modal opened.
      previouslyFocusedRef.current?.focus?.();
    };
  }, [onClose]);

  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (variant !== 'bottom') return;
    startY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (variant !== 'bottom' || startY.current == null) return;
    const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current;
    if (dy > 0) {
      setDragging(true);
      setDragY(dy);
    }
  };
  const onTouchEnd = () => {
    if (variant !== 'bottom') return;
    const dy = dragY;
    startY.current = null;
    setDragging(false);
    setDragY(0);
    if (dy > 120) onClose(); // matches --modal-drag-dismiss in globals.css
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'animate-fade-in fixed inset-0 z-[999] flex justify-center bg-scrim backdrop-blur-xl',
        variant === 'center' ? 'items-center' : 'items-end'
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={surfaceRef}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-[var(--shell-width)] border-soft bg-[var(--bg-secondary)] shadow-[var(--shadow-lifted)] outline-none',
          variant === 'center'
            ? 'mx-4 rounded-[var(--radius-lg)] animate-fade-in'
            : 'rounded-t-[var(--radius-lg)] animate-slide-up'
        )}
        style={{
          maxHeight: 'var(--modal-max-h)',
          transform: variant === 'bottom' && dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : 'transform 0.22s cubic-bezier(.22,1,.36,1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Subtle green-tinted glow on the top edge of the bottom sheet */}
        {variant === 'bottom' ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent-green) 40%, transparent) 50%, transparent 100%)',
            }}
          />
        ) : null}
        {children}
      </div>
    </div>,
    document.body
  );
}

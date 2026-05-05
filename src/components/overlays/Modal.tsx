'use client';

import { useEffect, useRef, useState } from 'react';
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
        'animate-fade-in fixed inset-0 z-[999] flex justify-center bg-scrim backdrop-blur-md',
        variant === 'center' ? 'items-center' : 'items-end'
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'relative w-full max-w-[var(--shell-width)] border-soft bg-[var(--bg-secondary)] shadow-[var(--shadow-lifted)]',
          variant === 'center' ? 'mx-4 rounded-[var(--radius-lg)] animate-fade-in' : 'rounded-t-[var(--radius-lg)] animate-slide-up'
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
        {children}
      </div>
    </div>,
    document.body
  );
}

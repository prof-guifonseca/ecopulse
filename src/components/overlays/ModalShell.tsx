'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Icon } from '@/components/ui/Icon';
import { Modal } from './Modal';
import { cn } from '@/lib/cn';

interface Props {
  title?: ReactNode;
  eyebrow?: ReactNode;
  onClose?: () => void;
  variant?: 'bottom' | 'center';
  footer?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  showHandle?: boolean;
}

export function ModalShell({
  title,
  eyebrow,
  onClose,
  variant = 'bottom',
  footer,
  children,
  bodyClassName,
  showHandle = true,
}: Props) {
  const closeModal = useUIStore((s) => s.closeModal);
  const close = onClose ?? closeModal;

  return (
    <Modal onClose={close} variant={variant}>
      {variant === 'bottom' && showHandle ? (
        <div className="flex justify-center pt-2.5">
          <span aria-hidden className="h-1 w-12 rounded-full bg-[var(--line-strong)]" />
        </div>
      ) : null}

      <header className="flex items-start justify-between gap-3 px-5 pb-4 pt-4">
        <div className="min-w-0 flex-1">
          {eyebrow ? <div className="t-eyebrow mb-1">{eyebrow}</div> : null}
          {title ? <h2 className="t-headline">{title}</h2> : null}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-soft bg-tint-2 text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
        >
          <Icon icon={X} size={18} />
        </button>
      </header>

      <div
        className={cn(
          'overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)]',
          footer ? 'pb-4' : '',
          bodyClassName
        )}
        style={{ maxHeight: 'var(--modal-body-max-h)' }}
      >
        {children}
      </div>

      {footer ? (
        <footer className="border-t border-[var(--line-soft)] bg-[var(--bg-primary)]/40 px-5 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          {footer}
        </footer>
      ) : null}
    </Modal>
  );
}

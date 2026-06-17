import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Async-state presentation primitives (P5). The three states every async or
 * hydration-gated surface needs, factored out of the per-page hand-rolling so
 * loading/empty/error look and read the same app-wide. Pure and presentational
 * (props only, no store) — so they compose into both server boundaries
 * (`loading.tsx`) and client features, and satisfy the `ui` firewall.
 */

interface LoadingProps {
  /** Visible + screen-reader label for the busy state. */
  label?: string;
  className?: string;
}

export function Loading({ label = 'Carregando…', className }: LoadingProps) {
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center px-6 py-10', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-[var(--primary)]"
          aria-hidden
        />
        <p className="t-caption">{label}</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-10 text-center',
        className,
      )}
      role="status"
    >
      {icon ? (
        <div className="text-[var(--muted-foreground)]" aria-hidden>
          {icon}
        </div>
      ) : null}
      <p className="t-title">{title}</p>
      {description ? (
        <p className="t-body-sm text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  /** When provided, renders a retry button wired to this handler. */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Algo travou.',
  description = 'Tente de novo.',
  onRetry,
  retryLabel = 'Tentar de novo',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-10 text-center',
        className,
      )}
      role="alert"
    >
      <p className="t-eyebrow">Erro</p>
      <h2 className="t-headline">{title}</h2>
      {description ? (
        <p className="t-body-sm" style={{ maxWidth: 280 }}>
          {description}
        </p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] px-5 text-sm font-semibold"
          style={{ background: 'var(--gradient-primary)', color: 'var(--primary-foreground)' }}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

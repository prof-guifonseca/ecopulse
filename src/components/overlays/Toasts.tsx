'use client';

import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/cn';

const ICONS = { success: '✅', info: 'ℹ️', reward: '🪙' } as const;

export function Toasts() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px)+14px)] left-1/2 z-[1100] flex w-full max-w-[var(--shell-width)] -translate-x-1/2 flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'surface pointer-events-auto flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium shadow-[0_16px_34px_rgba(1,8,5,0.24)]',
            t.type === 'reward'
              ? 'surface-panel surface-accent-amber'
              : t.type === 'info'
              ? 'surface-panel surface-accent-cyan'
              : 'surface-panel surface-accent-mint'
          )}
          style={{ animation: 'slideDown 0.3s ease' }}
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base"
          >
            {ICONS[t.type]}
          </span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

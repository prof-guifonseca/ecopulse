'use client';

import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/cn';

const ICONS = { success: '✅', info: 'ℹ️', reward: '🪙' } as const;

export function Toasts() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px)+16px)] left-1/2 z-[1100] flex w-full max-w-[var(--shell-width)] -translate-x-1/2 flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-sm font-medium shadow-[0_20px_40px_rgba(1,8,5,0.24)] backdrop-blur-xl',
            t.type === 'reward'
              ? 'border-accent-gold/18 bg-[rgba(213,187,123,0.12)]'
              : t.type === 'info'
              ? 'border-white/8 bg-[rgba(172,193,184,0.1)]'
              : 'border-accent-green/18 bg-[rgba(145,216,159,0.1)]'
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

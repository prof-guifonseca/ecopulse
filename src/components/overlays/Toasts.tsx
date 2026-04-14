'use client';

import { useUIStore } from '@/store/uiStore';

const ICONS = { success: '✅', info: 'ℹ️', reward: '🪙' } as const;

export function Toasts() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-20 z-[1100] flex w-full max-w-xs -translate-x-1/2 flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glass-card pointer-events-auto flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
          style={{ animation: 'slideDown 0.3s ease' }}
        >
          <span aria-hidden>{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

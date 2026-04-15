'use client';

import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';

export function AppHeader() {
  const hydrated = useHydrated();
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);

  const pct = hydrated ? Math.min(100, (xp / xpToNext) * 100) : 0;

  return (
    <header id="app-header" className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="surface surface-hud surface-accent-cyan flex min-h-[calc(var(--header-height)-12px)] items-center gap-4 px-4 py-3 sm:px-5 lg:px-6">
          <div className="min-w-0 flex-1 lg:flex-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(70,247,194,0.08)]">
                <span className="text-[24px]" aria-hidden>🌿</span>
              </div>
              <div className="min-w-0">
                <div className="hud-label">eco pulse // tactical layer</div>
                <div className="gradient-text font-display text-xl font-bold sm:text-2xl">EcoPulse</div>
              </div>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="hud-label shrink-0">Level Sync</span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/6">
                <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent)]" />
                <div
                  className="relative h-full rounded-full shadow-[0_0_22px_rgba(54,215,255,0.28)] transition-[width] duration-500"
                  style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}
                />
              </div>
            </div>
            <div className="command-pill" data-active="true">
              <span className="text-text-muted">NV</span>
              <span className="text-sm text-text-primary">{hydrated ? level : '—'}</span>
              <span className="text-text-muted">{hydrated ? `${xp}/${xpToNext} XP` : 'syncing'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right md:block">
              <div className="hud-label">Signal</div>
              <div className="font-display text-sm font-semibold text-text-primary">Green Sector</div>
            </div>
            <button
              type="button"
              aria-label="Notificações"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-text-secondary transition-colors hover:border-white/15 hover:bg-white/8 hover:text-text-primary"
            >
              <span className="text-lg" aria-hidden>🔔</span>
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-accent-red shadow-[0_0_18px_rgba(255,105,124,0.55)]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

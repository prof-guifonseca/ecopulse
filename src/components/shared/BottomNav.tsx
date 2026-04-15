'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const TABS = [
  { page: 'home', label: 'Início' },
  { page: 'scanner', label: 'Scan' },
  { page: 'map', label: 'Mapa' },
  { page: 'community', label: 'Rede' },
  { page: 'profile', label: 'Perfil' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
      <nav
        id="bottom-nav"
        className="pointer-events-auto mx-auto max-w-[var(--shell-width)]"
        role="tablist"
      >
        <div className="surface surface-panel surface-accent-mint flex min-h-[var(--nav-height)] items-end justify-between rounded-[30px] px-2 py-2">
          {TABS.map((t) => {
            const active = pathname === `/${t.page}`;
            const isScanner = t.page === 'scanner';

            return (
              <Link
                key={t.page}
                href={`/${t.page}`}
                role="tab"
                aria-current={active ? 'page' : undefined}
                aria-selected={active}
                className={cn(
                  'group flex min-w-0 flex-1 items-center justify-center px-1 py-2 transition-transform duration-200',
                  isScanner && 'self-start',
                  active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {isScanner ? (
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-full text-sm font-extrabold uppercase tracking-[0.16em] text-bg-primary transition-transform duration-200',
                        active && 'scale-[1.03]'
                      )}
                      style={{
                        background: 'var(--gradient-primary)',
                        boxShadow: '0 18px 36px rgba(145, 216, 159, 0.18)',
                        animation: 'fabPulse 2s ease-in-out infinite',
                      }}
                    >
                      Scan
                    </span>
                    <span className="text-[11px] font-semibold">{t.label}</span>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        'h-1.5 w-8 rounded-full bg-white/8 transition-all duration-200',
                        active && 'bg-accent-green'
                      )}
                    />
                    <div className="min-w-0 text-center">
                      <div className="text-[11px] font-semibold">{t.label}</div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

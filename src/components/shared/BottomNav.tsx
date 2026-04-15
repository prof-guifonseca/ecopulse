'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const TABS = [
  { page: 'home', label: 'Início', icon: '⌂' },
  { page: 'scanner', label: 'Scanner', icon: '◉' },
  { page: 'map', label: 'Mapa', icon: '⌖' },
  { page: 'community', label: 'Rede', icon: '☰' },
  { page: 'profile', label: 'Perfil', icon: '◌' },
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
        <div className="surface surface-panel flex min-h-[var(--nav-height)] items-center justify-between rounded-[28px] px-2 py-2">
          {TABS.map((t) => {
            const active = pathname === `/${t.page}`;

            return (
              <Link
                key={t.page}
                href={`/${t.page}`}
                role="tab"
                aria-current={active ? 'page' : undefined}
                aria-selected={active}
                className={cn(
                  'group flex min-w-0 flex-1 items-center justify-center px-1 py-1.5 transition-transform duration-200',
                  active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <div className="flex min-w-0 flex-col items-center gap-1">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl text-lg transition-all duration-200',
                      active
                        ? 'bg-accent-green/14 text-accent-green shadow-[0_10px_24px_rgba(145,216,159,0.1)]'
                        : 'bg-white/4 text-text-secondary'
                    )}
                  >
                    {t.icon}
                  </span>
                  <span className="text-[0.72rem] font-medium">{t.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

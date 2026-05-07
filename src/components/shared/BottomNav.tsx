'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, ScanLine, Users, UserRound, type LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const TABS: Array<{ page: string; label: string; icon: LucideIcon }> = [
  { page: 'home', label: 'Início', icon: Home },
  { page: 'scanner', label: 'Scan', icon: ScanLine },
  { page: 'map', label: 'Mapa', icon: MapPin },
  { page: 'community', label: 'Social', icon: Users },
  { page: 'profile', label: 'Perfil', icon: UserRound },
];

/**
 * BottomNav with a sliding "ride" indicator that animates between active
 * tabs instead of just toggling background colors. The indicator is one
 * absolutely-positioned bar driven by the active tab's index — cheap,
 * predictable, and respects reduced-motion via the global media query.
 */
export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((t) => pathname === `/${t.page}`);
  const indicatorVisible = activeIndex >= 0;

  return (
    <nav
      id="bottom-nav"
      role="tablist"
      className="shrink-0 border-t border-[var(--line-soft)] bg-[color-mix(in_srgb,var(--bg-primary)_92%,transparent)] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2 backdrop-blur-xl sm:px-8"
    >
      <div className="relative mx-auto flex min-w-0 max-w-[var(--content-width)] items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-tint-1 p-1">
        <span
          aria-hidden
          className="gradient-primary pointer-events-none absolute bottom-1 top-1 rounded-[var(--radius-md)]"
          style={{
            left: '0.25rem',
            width: `calc((100% - 0.5rem) / ${TABS.length})`,
            transform: `translateX(${(indicatorVisible ? activeIndex : 0) * 100}%)`,
            transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease',
            opacity: indicatorVisible ? 1 : 0,
          }}
        />

        {TABS.map((t) => {
          const active = pathname === `/${t.page}`;
          return (
            <Link
              key={t.page}
              href={`/${t.page}`}
              role="tab"
              aria-current={active ? 'page' : undefined}
              aria-selected={active}
              aria-label={t.label}
              className={cn(
                'group relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-1 py-1.5 transition-colors duration-200',
                active ? 'text-[var(--on-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] transition-all duration-300',
                  active ? 'scale-105' : 'scale-100'
                )}
              >
                <Icon icon={t.icon} size={17} strokeWidth={active ? 2.2 : 1.7} />
              </span>
              <span
                className={cn(
                  'max-w-full truncate text-[0.62rem] font-semibold leading-none tracking-normal transition-colors duration-200',
                  active ? 'text-[var(--on-primary)]' : 'text-[var(--text-muted)]'
                )}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScanLine, MapPin, Users, UserRound, type LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const TABS: Array<{ page: string; label: string; icon: LucideIcon }> = [
  { page: 'home', label: 'Início', icon: Home },
  { page: 'scanner', label: 'Scanner', icon: ScanLine },
  { page: 'map', label: 'Mapa', icon: MapPin },
  { page: 'community', label: 'Comunidade', icon: Users },
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
      className="shrink-0 border-t border-[var(--line-soft)] bg-[var(--glass-bg)] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2 backdrop-blur-md"
    >
      <div className="relative flex items-center gap-1">
        {/* Sliding ride indicator — a thin gradient bar above the active tab */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-2 h-[3px] rounded-full"
          style={{
            left: 0,
            width: `${100 / TABS.length}%`,
            transform: `translateX(${(indicatorVisible ? activeIndex : 0) * 100}%)`,
            transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease',
            opacity: indicatorVisible ? 1 : 0,
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 12px rgba(141, 219, 152, 0.45)',
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
                'group relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-1 pb-1 pt-2 transition-colors duration-200',
                active ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300',
                  active ? 'bg-[var(--tint-green-3)] scale-105' : 'bg-transparent scale-100'
                )}
              >
                <Icon icon={t.icon} size={20} strokeWidth={active ? 2.1 : 1.6} />
              </span>
              <span
                className={cn(
                  'text-[0.7rem] font-medium leading-none tracking-[0.01em] transition-colors duration-200',
                  active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
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

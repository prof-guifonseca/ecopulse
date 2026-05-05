'use client';

import { usePathname } from 'next/navigation';
import { Coins, Flame, Heart, MapPin, Package, Leaf, type LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';

const ROUTE_TITLES: Record<string, string> = {
  '/home': 'Sua rotina',
  '/scanner': 'Scanner',
  '/map': 'Mapa local',
  '/community': 'Comunidade',
  '/profile': 'Seu perfil',
};

export function AppHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const level = useUserStore((s) => s.level);
  const tokensToday = useUserStore((s) => s.tokensToday);
  const streak = useUserStore((s) => s.streak);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const visitedCount = useGameStore((s) => s.visitedPoints.length);
  const likedPosts = useSocialStore((s) => s.likedPosts.length);

  const title = ROUTE_TITLES[pathname] ?? 'EcoPulse';

  let summaryIcon: LucideIcon = Coins;
  let summaryText = '';

  if (!hydrated) {
    summaryText = '···';
  } else if (pathname === '/home') {
    summaryIcon = Flame;
    summaryText = `${streak} dias`;
  } else if (pathname === '/scanner') {
    summaryIcon = Package;
    summaryText = `${scannedCount}`;
  } else if (pathname === '/map') {
    summaryIcon = MapPin;
    summaryText = `${visitedCount}`;
  } else if (pathname === '/community') {
    summaryIcon = Heart;
    summaryText = `${likedPosts}`;
  } else if (pathname === '/profile') {
    summaryIcon = Coins;
    summaryText = `Nv ${level} · ${tokensToday}`;
  } else {
    summaryIcon = Coins;
    summaryText = `${tokensToday} hoje`;
  }

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 px-3 pt-[calc(env(safe-area-inset-top,0px)+10px)]"
    >
      <div className="card-glass flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Icon icon={Leaf} size={18} strokeWidth={2.2} className="text-[var(--on-primary)]" />
          </span>
          <div className="min-w-0">
            <div className="t-eyebrow leading-none">EcoPulse</div>
            <div className="mt-1 t-title leading-none">{title}</div>
          </div>
        </div>
        <Chip asStatic active leftIcon={<Icon icon={summaryIcon} size={14} className="text-[var(--accent-green)]" />}>
          {summaryText}
        </Chip>
      </div>
    </header>
  );
}

'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Coins, Flame, Heart, MapPin, Package, Leaf, type LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { clearDemoSeed } from '@/lib/demoSeed';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';

export function AppHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const level = useUserStore((s) => s.level);
  const tokensToday = useUserStore((s) => s.tokensToday);
  const streak = useUserStore((s) => s.streak);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const visitedCount = useGameStore((s) => s.visitedPoints.length);
  const likedPosts = useSocialStore((s) => s.likedPosts.length);

  let summaryIcon: LucideIcon = Coins;
  let summaryText = '';

  if (!hydrated) {
    summaryText = '···';
  } else if (pathname === '/home') {
    summaryIcon = Flame;
    summaryText = `${streak}d`;
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
    summaryText = `Nv ${level}`;
  } else {
    summaryIcon = Coins;
    summaryText = `${tokensToday}`;
  }

  // Long-press the logo (1.2s) to wipe the demo state and re-seed.
  // Hidden affordance — only useful for the person showing the demo.
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      if (confirm('Reiniciar demo? Apaga estado salvo e recarrega Arthur do zero.')) {
        clearDemoSeed();
      }
    }, 1200);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-[var(--bg-primary)] px-5 pt-[calc(env(safe-area-inset-top,0px)+18px)] pb-3 sm:px-8"
    >
      <div className="mx-auto flex max-w-[var(--content-width)] items-center justify-between gap-3">
        <div
          className="flex select-none items-center gap-2.5"
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onPointerCancel={cancelLongPress}
          title="Pressione 1.2s para reiniciar a demo"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Icon icon={Leaf} size={16} strokeWidth={2.2} className="text-[var(--on-primary)]" />
          </span>
          <span className="t-eyebrow">EcoPulse</span>
        </div>
        <Chip asStatic active leftIcon={<Icon icon={summaryIcon} size={14} className="text-[var(--accent-green)]" />}>
          {summaryText}
        </Chip>
      </div>
    </header>
  );
}

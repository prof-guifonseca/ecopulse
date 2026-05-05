'use client';

import Link from 'next/link';
import { ArrowRight, Coins, Flame } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useHydrated } from '@/hooks/useHydrated';
import { unsplashUrl } from '@/lib/unsplash';
import { InlineStat } from './InlineStat';
import { MissionsBlock } from './MissionsBlock';
import { DiscoveryBlock } from './DiscoveryBlock';
import { HomeSkeleton } from './HomeSkeleton';

export function HomePage() {
  const hydrated = useHydrated();
  const name = useUserStore((s) => s.name);
  const avatarBase = useUserStore((s) => s.avatarBase);
  const avatarOutfits = useUserStore((s) => s.avatarOutfits);
  const equippedSkinPack = useUserStore((s) => s.equippedSkinPack);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);

  if (!hydrated) return <HomeSkeleton />;

  const xpPct = xpToNext > 0 ? (xp / xpToNext) * 100 : 0;
  const heroImage = unsplashUrl('urbanGarden', { w: 900, h: 720, q: 70 });

  return (
    <PageShell spacing={5}>
      {/* Editorial cover with imagery */}
      <section
        className="card-editorial -mx-1 px-6 pb-6 pt-7"
        style={{ ['--bg-image' as string]: `url("${heroImage}")` }}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="t-eyebrow">Hoje</p>
            <h1 className="t-display mt-1.5 leading-[0.92]" style={{ fontSize: '2.3rem' }}>
              Oi, <span className="t-italic-soft">{name}.</span>
            </h1>
          </div>
          <div
            className="impact-ring shrink-0"
            style={{
              ['--ring-pct' as string]: xpPct,
              ['--ring-color' as string]: 'var(--accent-green)',
              ['--ring-size' as string]: '60px',
            }}
          >
            <Avatar baseId={avatarBase} outfits={avatarOutfits} skinPackId={equippedSkinPack} size="sm" />
          </div>
        </header>

        <div className="mt-6 flex items-baseline justify-between gap-2 t-caption">
          <span className="font-semibold text-[var(--text-primary)]">Nível {level}</span>
          <span className="text-[var(--text-secondary)]">{xp}/{xpToNext} XP</span>
        </div>
        <ProgressBar value={xpPct} size="sm" className="mt-2" />

        <Button
          as={Link}
          href="/scanner"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          rightIcon={<Icon icon={ArrowRight} size={16} />}
        >
          Abrir scanner
        </Button>
      </section>

      {/* Stat ribbon — secondary stats live below the cover, never in it */}
      <div className="flex items-center justify-center gap-2 -mt-2">
        <span className="stat-ribbon">
          <InlineStat icon={Flame} value={`${streak}d`} label="sequência" />
        </span>
        <span className="stat-ribbon">
          <InlineStat icon={Coins} value={tokens} label="tokens" />
        </span>
      </div>

      <MissionsBlock />

      <DiscoveryBlock />
    </PageShell>
  );
}

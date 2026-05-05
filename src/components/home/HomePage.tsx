'use client';

import Link from 'next/link';
import { ArrowRight, Coins, Flame } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Avatar } from '@/components/shared/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useHydrated } from '@/hooks/useHydrated';
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

  return (
    <PageShell spacing={5}>
      {/* Editorial cover */}
      <header className="flex items-start justify-between gap-4 pt-2">
        <div className="min-w-0">
          <p className="t-eyebrow">Hoje</p>
          <h1 className="t-display mt-1.5 leading-[0.95]">
            Oi, <span className="t-italic-soft">{name}.</span>
          </h1>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-soft bg-tint-1">
          <Avatar baseId={avatarBase} outfits={avatarOutfits} skinPackId={equippedSkinPack} size="md" />
        </div>
      </header>

      {/* Instrument: condensed status + single CTA */}
      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-baseline justify-between gap-2 t-caption">
          <span className="font-semibold text-[var(--text-secondary)]">Nível {level}</span>
          <span>{xp}/{xpToNext} XP</span>
        </div>
        <ProgressBar value={xpPct} size="sm" className="mt-2" />

        <div className="mt-4 flex items-center gap-3 text-[var(--text-secondary)]">
          <InlineStat icon={Flame} value={`${streak}d`} label="sequência" />
          <span className="text-[var(--line-strong)]">·</span>
          <InlineStat icon={Coins} value={tokens} label="tokens" />
        </div>

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
      </Card>

      <MissionsBlock />

      <DiscoveryBlock />
    </PageShell>
  );
}

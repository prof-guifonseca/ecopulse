'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useHydrated } from '@/hooks/useHydrated';
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
    <PageShell spacing={9}>
      {/* Hero — sem caixa, sem foto. Tipografia + 1 botão. */}
      <section className="pt-4 sm:pt-8">
        <header className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="t-eyebrow">Hoje</p>
            <h1
              className="t-display mt-2 leading-[0.95]"
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3rem)' }}
            >
              Oi, <span className="t-italic-soft">{name}.</span>
            </h1>
            <p className="mt-3 t-body text-[var(--text-secondary)]">
              {streak > 0 ? `${streak} dias seguidos.` : 'Pronto pra começar.'}
              {' '}
              <span className="text-[var(--text-muted)]">·</span>{' '}
              {tokens} tokens
            </p>
          </div>
          <div
            className="impact-ring shrink-0"
            style={{
              ['--ring-pct' as string]: xpPct,
              ['--ring-color' as string]: 'var(--accent-green)',
              ['--ring-size' as string]: '72px',
            }}
          >
            <Avatar baseId={avatarBase} outfits={avatarOutfits} skinPackId={equippedSkinPack} size="md" />
          </div>
        </header>

        <div className="mt-8 flex items-baseline justify-between gap-2 t-caption">
          <span className="font-semibold text-[var(--text-primary)]">Nível {level}</span>
          <span className="text-[var(--text-muted)]">{xp}/{xpToNext} XP</span>
        </div>
        <ProgressBar value={xpPct} size="sm" className="mt-2" />

        <Button
          as={Link}
          href="/scanner"
          variant="primary"
          size="lg"
          className="mt-8"
          rightIcon={<Icon icon={ArrowRight} size={16} />}
        >
          Abrir scanner
        </Button>
      </section>

      <MissionsBlock />

      <DiscoveryBlock />
    </PageShell>
  );
}

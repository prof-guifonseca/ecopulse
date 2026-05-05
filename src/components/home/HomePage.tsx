'use client';

import Link from 'next/link';
import { ArrowRight, Check, Coins, Flame, Sparkles, type LucideIcon } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { DAILY_MISSIONS, CHALLENGES, TUTORIALS } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/shared/Skeleton';
import { resolveIcon } from '@/lib/iconRegistry';
import { runChallenge } from '@/lib/challengeActions';
import { missionChecks, tryClaimDailyBonus } from '@/lib/missions';
import { cn } from '@/lib/cn';
import { useHydrated } from '@/hooks/useHydrated';

const DAILY_MISSION_TARGET = 3;

export function HomePage() {
  const hydrated = useHydrated();
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const avatarBase = useUserStore((s) => s.avatarBase);
  const avatarOutfits = useUserStore((s) => s.avatarOutfits);
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--tint-1)]">
          <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="md" />
        </div>
      </header>

      {/* Instrument: condensed status + single CTA */}
      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-baseline justify-between gap-2 t-caption">
          <span className="font-semibold text-[var(--text-secondary)]">Nível {level}</span>
          <span>{xp}/{xpToNext} XP</span>
        </div>
        <ProgressBar value={xpPct} tone="brand" size="sm" className="mt-2" />

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

function InlineStat({ icon, value, label }: { icon: LucideIcon; value: number | string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 t-body-sm">
      <Icon icon={icon} size={13} className="translate-y-[1px] text-[var(--accent-green)]" />
      <span className="font-semibold text-[var(--text-primary)]">{value}</span>
      <span className="t-caption">{label}</span>
    </span>
  );
}

function MissionsBlock() {
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  const bonusClaimed = useGameStore((s) => s.dailyMissions.bonusClaimed);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="t-title">Missões de hoje</h2>
        <span className="t-caption">{done}/{DAILY_MISSION_TARGET}</span>
      </div>

      <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
        {DAILY_MISSIONS.map((mission) => {
          const isDone = checks[mission.id as keyof typeof checks];
          const MissionIcon = resolveIcon(mission.iconName);

          return (
            <li
              key={mission.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isDone && 'bg-[var(--tint-green-2)]'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  isDone
                    ? 'bg-[var(--accent-green)] text-[var(--on-primary)]'
                    : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                )}
              >
                {isDone ? (
                  <Icon icon={Check} size={14} strokeWidth={2.6} />
                ) : MissionIcon ? (
                  <Icon icon={MissionIcon} size={15} />
                ) : (
                  <span className="text-sm">{mission.emoji}</span>
                )}
              </span>
              <span className={cn('flex-1 t-body', isDone && 'text-[var(--accent-green)]')}>
                {mission.title}
              </span>
              <span className="t-caption font-semibold text-[var(--accent-gold)]">+{mission.reward}</span>
            </li>
          );
        })}
      </ul>

      {done === DAILY_MISSION_TARGET && !bonusClaimed ? (
        <Button
          variant="reward"
          size="md"
          fullWidth
          className="mt-3"
          onClick={tryClaimDailyBonus}
          leftIcon={<Icon icon={Sparkles} size={16} />}
        >
          Coletar bônus diário
        </Button>
      ) : (
        <p className="mt-2 t-caption text-center">
          {bonusClaimed ? 'Bônus de hoje coletado.' : `Complete os 3 e ganhe +25.`}
        </p>
      )}
    </section>
  );
}

function DiscoveryBlock() {
  const openModal = useUIStore((s) => s.openModal);
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);

  // Surface the most relevant challenge: an active one if any, else next up.
  const featured =
    CHALLENGES.find((c) => activeChallenges.includes(c.id) && !completedChallenges.includes(c.id)) ??
    CHALLENGES.find((c) => !completedChallenges.includes(c.id)) ??
    CHALLENGES[0];
  const isActive = activeChallenges.includes(featured.id);
  const isDone = completedChallenges.includes(featured.id);
  const completion = isDone
    ? 100
    : isActive
    ? Math.min(100, ((progress[featured.id] ?? 0) / featured.duration) * 100)
    : 0;
  const ChallengeIcon = resolveIcon(featured.iconName);

  const tutorials = TUTORIALS.slice(0, 2);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="t-title">Em destaque</h2>
      </div>

      {/* Featured challenge */}
      <Card tone="solid" padded={false} className="px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line-active)] bg-[var(--tint-green-2)] text-[var(--accent-green)]">
            {ChallengeIcon ? <Icon icon={ChallengeIcon} size={18} /> : <span>{featured.emoji}</span>}
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Desafio</p>
            <h3 className="mt-0.5 t-title">{featured.title}</h3>
            <p className="mt-1 t-caption">
              {featured.duration} dias · {featured.participants.toLocaleString('pt-BR')} pessoas
            </p>
          </div>
          <Chip asStatic active className="shrink-0">
            <Icon icon={Coins} size={12} />
            {featured.tokens}
          </Chip>
        </div>

        {(isActive || isDone) ? (
          <ProgressBar value={completion} tone="brand" size="sm" className="mt-4" />
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="t-caption">
            {isDone ? 'Concluído' : isActive ? `${Math.round(completion)}% feito` : 'Pronto pra começar'}
          </span>
          <Button
            variant={isDone ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => runChallenge(featured)}
            disabled={isDone}
          >
            {isDone ? 'Completo' : isActive ? 'Avançar' : 'Participar'}
          </Button>
        </div>
      </Card>

      {/* Two upcycling cards */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {tutorials.map((tutorial) => (
          <button
            key={tutorial.id}
            onClick={() => openModal({ kind: 'tutorial', id: tutorial.id })}
            className="group block text-left transition-colors duration-200 [&_.card]:hover:border-[var(--line-strong)]"
          >
            <Card tone="solid" padded={false} className="h-full">
              <div className="relative flex min-h-[100px] items-end px-4 py-4" style={{ background: tutorial.gradient }}>
                <div className="absolute inset-0 bg-black/15" aria-hidden />
                <div className="relative text-3xl drop-shadow-md">{tutorial.emoji}</div>
              </div>
              <div className="px-4 py-3">
                <h3 className="t-title leading-tight">{tutorial.title}</h3>
                <p className="mt-1 t-caption">
                  {'●'.repeat(tutorial.difficulty)}{'○'.repeat(Math.max(0, 3 - tutorial.difficulty))} · {tutorial.time}
                </p>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-5 pt-2" aria-busy="true" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-44" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
      <div className="card-hero px-5 py-5 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-2 h-12 w-full rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

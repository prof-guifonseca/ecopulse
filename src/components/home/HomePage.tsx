'use client';

import Link from 'next/link';
import { ArrowRight, Check, Coins, Flame, Package, Sparkles, Target, Users } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { DAILY_MISSIONS, CHALLENGES, TUTORIALS } from '@/data';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Avatar } from '@/components/shared/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tile } from '@/components/ui/Tile';
import { IconTile } from '@/components/ui/IconTile';
import { Chip } from '@/components/ui/Chip';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/shared/Skeleton';
import { resolveIcon } from '@/lib/iconRegistry';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { missionChecks, tryClaimDailyBonus } from '@/lib/missions';
import { cn } from '@/lib/cn';
import { useHydrated } from '@/hooks/useHydrated';

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
  const scannedCount = useGameStore((s) => s.scannedProducts.length);

  if (!hydrated) return <HomeSkeleton />;

  return (
    <PageShell>
      <Card tone="hero" accent="none" padded={false} className="px-5 py-6">
        <div className="flex items-start gap-4">
          <IconTile size="xl" tone="ghost" icon={<Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />} />
          <div className="min-w-0 flex-1">
            <div className="t-eyebrow">Bom te ver</div>
            <h1 className="t-display mt-2">Oi, {name}</h1>
            <p className="t-body-sm mt-2">Complete as missões e libere o bônus do dia.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Tile size="sm" label="Sequência" value={`${streak}d`} icon={<Icon icon={Flame} size={13} />} />
          <Tile size="sm" label="Eco-Tokens" value={tokens} icon={<Icon icon={Coins} size={13} />} />
          <Tile size="sm" label="Scans" value={scannedCount} icon={<Icon icon={Package} size={13} />} />
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="t-caption">Nível {level}</span>
            <span className="t-caption font-semibold text-[var(--text-secondary)]">
              {xp}/{xpToNext} XP
            </span>
          </div>
          <ProgressBar value={xpToNext > 0 ? (xp / xpToNext) * 100 : 0} tone="brand" size="sm" />
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

      <MissionsPanel />

      <section>
        <SectionHeader title="Desafios" />
        <ChallengesList />
      </section>

      <section>
        <SectionHeader title="Upcycling" />
        <UpcyclingGrid />
      </section>
    </PageShell>
  );
}

function MissionsPanel() {
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  const bonusClaimed = useGameStore((s) => s.dailyMissions.bonusClaimed);

  return (
    <Card tone="solid" accent="brand" padded={false} className="px-5 py-5">
      <SectionHeader
        title="Missões do dia"
        right={
          <Chip asStatic active>
            {done}/3
          </Chip>
        }
      />

      <div className="space-y-2">
        {DAILY_MISSIONS.map((mission) => {
          const isDone = checks[mission.id as keyof typeof checks];
          const MissionIcon = resolveIcon(mission.iconName as never);

          return (
            <div
              key={mission.id}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors',
                isDone
                  ? 'border-[var(--line-active)] bg-[var(--tint-green-2)]'
                  : 'border-[var(--line-soft)] bg-[var(--tint-1)]'
              )}
            >
              <IconTile
                size="md"
                tone={isDone ? 'brand' : 'default'}
                icon={
                  isDone ? (
                    <Icon icon={Check} size={18} strokeWidth={2.4} />
                  ) : MissionIcon ? (
                    <Icon icon={MissionIcon} size={18} />
                  ) : (
                    <span>{mission.emoji}</span>
                  )
                }
              />
              <div className="min-w-0 flex-1">
                <div className={cn('t-title', isDone && 'text-[var(--accent-green)]')}>{mission.title}</div>
                <div className="mt-0.5 flex items-center gap-1 t-caption">
                  <Icon icon={Coins} size={12} />
                  +{mission.reward} tokens
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="t-caption">Bônus diário</span>
          <span className={cn('t-caption font-semibold', bonusClaimed ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)]')}>
            {bonusClaimed ? 'Coletado' : '+25 ao concluir'}
          </span>
        </div>
        <ProgressBar value={(done / 3) * 100} tone="brand" />
        {done === 3 && !bonusClaimed ? (
          <Button variant="reward" size="md" fullWidth className="mt-4" onClick={tryClaimDailyBonus} leftIcon={<Icon icon={Sparkles} size={16} />}>
            Coletar bônus diário
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function ChallengesList() {
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);
  const join = useGameStore((s) => s.joinChallenge);
  const advance = useGameStore((s) => s.advanceChallenge);
  const completeChallenge = useGameStore((s) => s.completeChallenge);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  return (
    <div className="space-y-3">
      {CHALLENGES.map((challenge) => {
        const isActive = activeChallenges.includes(challenge.id);
        const isDone = completedChallenges.includes(challenge.id);
        const currentProgress = progress[challenge.id] ?? 0;
        const completion = isDone
          ? 100
          : isActive
          ? Math.min(100, (currentProgress / challenge.duration) * 100)
          : 0;
        const ChallengeIcon = resolveIcon(challenge.iconName as never);

        const handle = () => {
          if (isDone) return;
          if (!isActive) {
            join(challenge.id);
            showToast(`Desafio aceito! ${challenge.title}`, 'info');
            return;
          }
          const finished = advance(challenge.id, challenge.duration);
          awardTokens(5);
          showToast('+5 Eco-Tokens', 'reward');
          if (finished) {
            completeChallenge(challenge.id);
            awardTokens(challenge.tokens);
            showToast(`Desafio completo! +${challenge.tokens} tokens`, 'reward');
            fireConfetti();
            const total = useGameStore.getState().completedChallenges.length;
            if (total === 1) unlockBadge('challenge-1');
          }
        };

        return (
          <Card key={challenge.id} tone="solid" padded={false} className="px-4 py-4">
            <div className="flex items-start gap-3">
              <IconTile
                size="md"
                tone="brand"
                icon={ChallengeIcon ? <Icon icon={ChallengeIcon} size={18} /> : <span>{challenge.emoji}</span>}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="t-title">{challenge.title}</h3>
                  <div className="flex shrink-0 items-center gap-1 t-body-sm font-semibold text-[var(--accent-gold)]">
                    <Icon icon={Coins} size={13} />
                    {challenge.tokens}
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 t-caption">
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={challenge.type === 'individual' ? Target : Users} size={12} />
                    {challenge.type === 'individual' ? 'Solo' : 'Em grupo'}
                  </span>
                  <span>{challenge.participants.toLocaleString('pt-BR')} pessoas</span>
                  <span>{challenge.duration} dias</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between t-caption">
                <span>Progresso</span>
                <span className="font-semibold text-[var(--text-secondary)]">{Math.round(completion)}%</span>
              </div>
              <ProgressBar value={completion} tone="brand" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="t-caption">
                {isDone ? 'Concluído' : isActive ? 'Em andamento' : 'Pronto pra começar'}
              </span>
              <Button
                variant={isDone ? 'secondary' : 'primary'}
                size="sm"
                onClick={handle}
                disabled={isDone}
              >
                {isDone ? 'Completo' : isActive ? 'Avançar' : 'Participar'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="card-hero px-5 py-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-[var(--radius-lg)]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Skeleton className="h-[60px] w-full" />
          <Skeleton className="h-[60px] w-full" />
          <Skeleton className="h-[60px] w-full" />
        </div>
        <div className="mt-5 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="mt-5 h-12 w-full rounded-full" />
      </div>
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function UpcyclingGrid() {
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="grid grid-cols-2 gap-3">
      {TUTORIALS.map((tutorial) => (
        <button
          key={tutorial.id}
          onClick={() => openModal({ kind: 'tutorial', id: tutorial.id })}
          className="group block text-left transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Card tone="solid" padded={false} className="h-full">
            <div className="relative flex min-h-[110px] items-end px-4 py-4" style={{ background: tutorial.gradient }}>
              <div className="absolute inset-0 bg-black/15" aria-hidden />
              <div className="relative text-4xl drop-shadow-md">{tutorial.emoji}</div>
            </div>
            <div className="px-4 py-3">
              <h3 className="t-title">{tutorial.title}</h3>
              <div className="mt-1 t-caption">
                {'●'.repeat(tutorial.difficulty)}{'○'.repeat(Math.max(0, 3 - tutorial.difficulty))} · {tutorial.time}
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

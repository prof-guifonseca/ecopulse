'use client';

import Link from 'next/link';
import { ArrowRight, Coins, Flame, Package, Sparkles, Sprout, Target, Users } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { DAILY_MISSIONS, CHALLENGES, TUTORIALS } from '@/data';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Avatar } from '@/components/shared/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Stat } from '@/components/ui/Stat';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { missionChecks, tryClaimDailyBonus } from '@/lib/missions';
import { cn } from '@/lib/cn';

export function HomePage() {
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const avatarBase = useUserStore((s) => s.avatarBase);
  const avatarOutfits = useUserStore((s) => s.avatarOutfits);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const tokensToday = useUserStore((s) => s.tokensToday);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const activeChallenges = useGameStore((s) => s.activeChallenges.length);

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.35s ease' }}>
      <Card tone="hero" accent="none" padded={false} className="px-5 py-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-white/4 p-2">
            <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="display-eyebrow">Bom te ver</div>
            <h1 className="mt-2 text-[1.55rem] font-semibold leading-tight text-text-primary">
              {name}, siga pelo essencial.
            </h1>
            <p className="mt-2 text-[0.9rem] leading-6 text-text-muted">
              Concluir as missões de hoje é o caminho mais curto pro bônus diário.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Sequência" value={`${streak}d`} icon={<Icon icon={Flame} size={13} />} />
          <Stat label="Tokens" value={tokens} icon={<Icon icon={Coins} size={13} />} />
          <Stat label="Scans" value={scannedCount} icon={<Icon icon={Package} size={13} />} />
        </div>

        <Link
          href="/scanner"
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold text-[#0a140e] shadow-[0_10px_22px_rgba(141,219,152,0.22)] transition-all hover:shadow-[0_14px_28px_rgba(141,219,152,0.3)] active:translate-y-px"
          style={{ background: 'var(--gradient-primary)' }}
        >
          Abrir scanner
          <Icon icon={ArrowRight} size={16} />
        </Link>
      </Card>

      <MissionsPanel />

      <section>
        <SectionHeader
          title="Seu dia em uma leitura rápida"
          subtitle="Sinais principais pra decidir onde colocar energia agora."
        />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Tokens hoje" value={tokensToday} icon={Coins} tone="reward" />
          <MetricCard label="Produtos vistos" value={scannedCount} icon={Package} tone="brand" />
          <MetricCard label="Sequência" value={`${streak}d`} icon={Flame} tone="reward" />
          <MetricCard label="Desafios ativos" value={activeChallenges} icon={Sprout} tone="brand" />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Desafios para manter ritmo"
          subtitle="Entre em um ciclo por vez e avance sem espalhar atenção."
        />
        <ChallengesList />
      </section>

      <section>
        <SectionHeader
          title="Ideias para reaproveitar melhor"
          subtitle="Tutoriais curtos pra transformar o que sobra em algo útil."
        />
        <UpcyclingGrid />
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof Coins;
  tone: 'brand' | 'reward';
}) {
  return (
    <Card tone="solid" accent="none" padded={false} className="px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">{label}</div>
          <div className="mt-2 text-[1.5rem] font-semibold leading-none text-text-primary">{value}</div>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            tone === 'brand'
              ? 'bg-[rgba(141,219,152,0.12)] text-accent-green'
              : 'bg-[rgba(224,194,122,0.12)] text-accent-gold'
          )}
        >
          <Icon icon={icon} size={18} strokeWidth={2} />
        </div>
      </div>
    </Card>
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
        subtitle="Três ações simples pra manter constância e liberar o bônus."
        right={
          <span className="command-pill" data-active="true">
            {done}/3
          </span>
        }
      />

      <div className="space-y-2">
        {DAILY_MISSIONS.map((mission) => {
          const isDone = checks[mission.id as keyof typeof checks];

          return (
            <div
              key={mission.id}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors',
                isDone
                  ? 'border-[rgba(141,219,152,0.3)] bg-[rgba(141,219,152,0.08)]'
                  : 'border-[var(--line-soft)] bg-white/[0.02]'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg',
                  isDone ? 'bg-[rgba(141,219,152,0.16)] text-accent-green' : 'bg-white/5'
                )}
              >
                {isDone ? '✓' : mission.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn('text-[0.92rem] font-semibold', isDone ? 'text-accent-green' : 'text-text-primary')}>
                  {mission.title}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[0.78rem] text-text-muted">
                  <Icon icon={Coins} size={12} />
                  +{mission.reward} tokens
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-[0.82rem]">
          <span className="text-text-muted">Bônus diário</span>
          <span className={cn('font-semibold', bonusClaimed ? 'text-accent-green' : 'text-text-secondary')}>
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

        const handle = () => {
          if (isDone) return;
          if (!isActive) {
            join(challenge.id);
            showToast(`Desafio aceito! ${challenge.emoji}`, 'info');
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{challenge.emoji}</span>
                  <h3 className="text-[0.98rem] font-semibold text-text-primary">{challenge.title}</h3>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[0.78rem] text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={challenge.type === 'individual' ? Target : Users} size={12} />
                    {challenge.type === 'individual' ? 'Solo' : 'Em grupo'}
                  </span>
                  <span>{challenge.participants.toLocaleString('pt-BR')} pessoas</span>
                  <span>{challenge.duration} dias</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-[0.85rem] font-semibold text-accent-gold">
                <Icon icon={Coins} size={13} />
                {challenge.tokens}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-[0.78rem] text-text-muted">
                <span>Progresso</span>
                <span className="font-semibold text-text-secondary">{Math.round(completion)}%</span>
              </div>
              <ProgressBar value={completion} tone="brand" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[0.82rem] text-text-muted">
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
              <div className="absolute inset-0 bg-black/20" aria-hidden />
              <div className="relative text-4xl drop-shadow-md">{tutorial.emoji}</div>
            </div>
            <div className="px-4 py-3">
              <h3 className="text-[0.88rem] font-semibold leading-5 text-text-primary">{tutorial.title}</h3>
              <div className="mt-1.5 text-[0.72rem] text-text-muted">
                {'●'.repeat(tutorial.difficulty)}{'○'.repeat(Math.max(0, 3 - tutorial.difficulty))} · {tutorial.time}
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { DAILY_MISSIONS, CHALLENGES, TUTORIALS } from '@/data';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
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
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <GlassCard variant="hud" accent="mint" className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="rounded-[28px] border border-white/8 bg-white/6 p-2 shadow-[0_18px_36px_rgba(145,216,159,0.12)]">
            <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="hud-label">Hoje no EcoPulse</div>
            <h1 className="mt-2 text-[2rem] font-semibold leading-none text-text-primary">
              {name}, seu impacto continua hoje.
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Priorize sua próxima missão, acompanhe os tokens do dia e mantenha o ritmo da semana.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatChip label="Streak" value={`${streak} dias`} />
          <StatChip label="Tokens" value={tokens} />
          <StatChip label="Scans" value={scannedCount} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/scanner"
            className="flex-1 rounded-full px-5 py-3 text-center text-sm font-bold text-bg-primary"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Abrir scanner
          </Link>
          <div className="command-pill" data-active="true">
            +{tokensToday} hoje
          </div>
        </div>
      </GlassCard>

      <MissionsPanel />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Panorama"
          title="Como está seu ritmo hoje"
          subtitle="Uma leitura rápida para decidir onde investir sua atenção agora."
        />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Tokens do dia" value={tokensToday} icon="🪙" accent="amber" />
          <MetricCard label="Produtos escaneados" value={scannedCount} icon="📦" accent="mint" />
          <MetricCard label="Streak atual" value={streak} icon="🔥" accent="amber" />
          <MetricCard label="Desafios ativos" value={activeChallenges} icon="🌱" accent="mint" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Desafios"
          title="Seu próximo ciclo da semana"
          subtitle="Entre em desafios solo ou em grupo para subir de nível sem dispersar sua atenção."
        />
        <ChallengesList />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Criatividade"
          title="Academia de upcycling"
          subtitle="Ideias práticas para transformar materiais do dia a dia em novas utilidades."
        />
        <UpcyclingGrid />
      </section>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface surface-ghost rounded-[20px] px-3 py-3 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: 'mint' | 'amber';
}) {
  return (
    <GlassCard variant="tile" accent={accent === 'mint' ? 'mint' : 'amber'} className="px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-text-primary">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/7 text-xl">
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

function MissionsPanel() {
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  const bonusClaimed = useGameStore((s) => s.dailyMissions.bonusClaimed);

  return (
    <GlassCard variant="panel" accent="mint" className="px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="hud-label">Missões do dia</div>
          <h2 className="mt-2 text-2xl font-semibold">Comece pelo que gera tração agora</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Três ações simples para manter consistência no app e abrir o bônus diário.
          </p>
        </div>
        <div className="command-pill" data-active="true">
          {done}/3 completas
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {DAILY_MISSIONS.map((mission) => {
          const isDone = checks[mission.id as keyof typeof checks];

          return (
            <div
              key={mission.id}
              className={cn(
                'surface surface-ghost flex items-center gap-3 rounded-[22px] px-4 py-4',
                isDone && 'surface-accent-mint border-accent-green/20 bg-accent-green/10'
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-lg',
                  isDone && 'bg-accent-green/16 text-accent-green'
                )}
              >
                {isDone ? '✓' : mission.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text-primary">{mission.title}</div>
                <div className="mt-1 text-sm text-text-secondary">+{mission.reward} tokens</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-text-secondary">
          <span>Bônus diário</span>
          <span>{bonusClaimed ? 'Coletado' : '+25 ao completar tudo'}</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/6">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${(done / 3) * 100}%`, background: 'var(--gradient-primary)' }}
          />
        </div>
        {done === 3 && !bonusClaimed ? <ClaimBonusButton /> : null}
      </div>
    </GlassCard>
  );
}

function ClaimBonusButton() {
  return (
    <button
      onClick={tryClaimDailyBonus}
      className="mt-4 w-full rounded-full px-5 py-3 text-sm font-bold text-bg-primary"
      style={{ background: 'var(--gradient-gold)' }}
    >
      Coletar bônus diário
    </button>
  );
}

function ChallengesList() {
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);
  const join = useGameStore((s) => s.joinChallenge);
  const advance = useGameStore((s) => s.advanceChallenge);
  const completeCh = useGameStore((s) => s.completeChallenge);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  return (
    <div className="space-y-3">
      {CHALLENGES.map((challenge) => {
        const isActive = activeChallenges.includes(challenge.id);
        const isDone = completedChallenges.includes(challenge.id);
        const cur = progress[challenge.id] ?? 0;
        const prog = isDone ? 100 : isActive ? Math.min(100, (cur / challenge.duration) * 100) : 0;

        const handle = () => {
          if (isDone) return;

          if (!isActive) {
            join(challenge.id);
            showToast(`Desafio aceito! ${challenge.emoji}`, 'info');
            return;
          }

          const finished = advance(challenge.id, challenge.duration);
          awardTokens(5);
          showToast('+5 Eco-Tokens! 💪', 'reward');

          if (finished) {
            completeCh(challenge.id);
            awardTokens(challenge.tokens);
            showToast(`Desafio completo! +${challenge.tokens} tokens 🏆`, 'reward');
            fireConfetti();
            const total = useGameStore.getState().completedChallenges.length;
            if (total === 1) unlockBadge('challenge-1');
          }
        };

        return (
          <GlassCard key={challenge.id} variant="tile" accent={challenge.type === 'individual' ? 'mint' : 'violet'} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl">{challenge.emoji}</span>
                  <h3 className="text-base font-semibold text-text-primary">{challenge.title}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-secondary">
                  <span>{challenge.type === 'individual' ? 'Solo' : 'Em grupo'}</span>
                  <span>{challenge.participants.toLocaleString('pt-BR')} participantes</span>
                  <span>{challenge.duration} dias</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-accent-gold">🪙 {challenge.tokens}</div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm text-text-secondary">
                <span>Progresso</span>
                <span>{Math.round(prog)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${prog}%`,
                    background:
                      challenge.type === 'individual' ? 'var(--gradient-primary)' : 'var(--gradient-purple)',
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-text-secondary">
                {isDone ? 'Concluído' : isActive ? 'Em andamento' : 'Pronto para começar'}
              </span>
              <button
                onClick={handle}
                disabled={isDone}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-opacity',
                  isDone ? 'bg-white/6 text-text-secondary' : 'text-bg-primary'
                )}
                style={
                  isDone
                    ? undefined
                    : {
                        background:
                          challenge.type === 'individual' ? 'var(--gradient-primary)' : 'var(--gradient-purple)',
                      }
                }
              >
                {isDone ? 'Completo' : isActive ? 'Avançar' : 'Participar'}
              </button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

function UpcyclingGrid() {
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="grid grid-cols-2 gap-3">
      {TUTORIALS.map((tutorial, index) => (
        <button
          key={tutorial.id}
          onClick={() => openModal({ kind: 'tutorial', id: tutorial.id })}
          className="group text-left"
        >
          <GlassCard
            variant="tile"
            accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
            className="h-full overflow-hidden p-0 transition-transform duration-200 group-hover:translate-y-[-2px]"
          >
            <div
              className="flex min-h-[124px] items-end px-4 py-4"
              style={{ background: tutorial.gradient }}
            >
              <div>
                <div className="text-4xl">{tutorial.emoji}</div>
              </div>
            </div>
            <div className="px-4 py-4">
              <h3 className="text-sm font-semibold leading-5 text-text-primary">{tutorial.title}</h3>
              <div className="mt-2 text-xs text-text-secondary">
                {'🌿'.repeat(tutorial.difficulty)} · {tutorial.time}
              </div>
            </div>
          </GlassCard>
        </button>
      ))}
    </div>
  );
}

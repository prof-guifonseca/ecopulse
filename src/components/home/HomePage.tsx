'use client';

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

  return (
    <div className="space-y-6 lg:space-y-8" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <GlassCard variant="hud" accent="mint" className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
            <div className="flex items-start gap-4">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-2 shadow-[0_0_40px_rgba(70,247,194,0.12)]">
                <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />
              </div>
              <div className="min-w-0">
                <div className="hud-label">central de comando</div>
                <h1 className="mt-2 font-display text-3xl font-bold leading-none sm:text-4xl lg:text-5xl">
                  {name}, o grid verde esta pronto.
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
                  Suas missoes, desafios e upgrades estao sincronizados. Continue operando para ampliar impacto hoje.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Streak ativo" value={`${streak} dias`} icon="🔥" accent="amber" />
              <StatCard label="Tokens totais" value={tokens} icon="🪙" accent="mint" />
              <StatCard label="Scan log" value={scannedCount} icon="📡" accent="cyan" />
            </div>
          </div>

          <div className="my-5 hud-divider" />

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <GlassCard variant="ghost" className="px-4 py-4">
              <div className="hud-label">Operacao do dia</div>
              <div className="mt-2 font-display text-2xl font-bold text-text-primary">Tokens hoje: {tokensToday}</div>
              <div className="mt-2 text-sm text-text-secondary">
                Complete missoes e desafios para manter o setor em vantagem.
              </div>
            </GlassCard>
            <GlassCard variant="ghost" accent="cyan" className="px-4 py-4">
              <div className="hud-label">Feed de progressao</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="command-pill" data-active="true">scan live</span>
                <span className="command-pill">tribe sync</span>
                <span className="command-pill">upcycling drop</span>
              </div>
            </GlassCard>
            <div className="flex items-end md:justify-end">
              <div className="command-pill" data-active="true">
                <span>Operador</span>
                <span className="text-text-primary">{name}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <MissionsPanel />
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="weekly loop"
            title="Desafios Semanais"
            subtitle="Ative operacoes solo ou cooperativas para ganhar tokens e destravar badges."
          />
          <ChallengesGrid />
        </div>

        <div className="space-y-6">
          <section>
            <SectionHeader
              eyebrow="telemetry"
              title="Impacto de Hoje"
              subtitle="Numeros de campo para acompanhar sua presenca no ecossistema."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricTile label="Tokens hoje" value={tokensToday} icon="🪙" accent="amber" />
              <MetricTile label="Produtos escaneados" value={scannedCount} icon="📱" accent="cyan" />
              <MetricTile label="Streak corrente" value={streak} icon="🔥" accent="mint" />
            </div>
          </section>

          <section>
            <SectionHeader
              eyebrow="craft lab"
              title="Academia de Upcycling"
              subtitle="Colete receitas de transformacao e converta criatividade em tokens."
            />
            <UpcyclingGrid />
          </section>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: 'mint' | 'cyan' | 'amber';
}) {
  return (
    <GlassCard variant="ghost" accent={accent} className="px-4 py-4">
      <div className="hud-label">{label}</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
          {icon}
        </div>
        <div className="font-display text-2xl font-bold text-text-primary">{value}</div>
      </div>
    </GlassCard>
  );
}

function MetricTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: 'mint' | 'cyan' | 'amber';
}) {
  return (
    <GlassCard variant="tile" accent={accent} className="px-4 py-4">
      <div className="hud-label">{label}</div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="font-display text-3xl font-bold">{value}</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
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
    <GlassCard variant="panel" accent="cyan" className="px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="hud-label">daily mission rail</div>
          <h2 className="mt-2 font-display text-2xl font-bold">Missoes Diarias</h2>
          <p className="mt-2 text-sm text-text-secondary">Reiniciam a meia-noite. Feche o ciclo completo para liberar bonus.</p>
        </div>
        <div className="command-pill" data-active="true">
          <span>{done}/3</span>
          <span>ready</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {DAILY_MISSIONS.map((mission) => {
          const isDone = checks[mission.id as keyof typeof checks];

          return (
            <div
              key={mission.id}
              className={cn(
                'surface surface-ghost flex items-center gap-3 px-4 py-3',
                isDone && 'surface-accent-mint border-accent-green/25 bg-accent-green/8'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-xl',
                  isDone ? 'bg-accent-green/12 text-accent-green' : 'bg-white/5'
                )}
              >
                {isDone ? '✓' : mission.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text-primary sm:text-base">{mission.title}</div>
                <div className="mt-1 text-sm text-accent-gold">+{mission.reward} tokens</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="hud-label">bonus diario</span>
          <span className="text-text-secondary">{bonusClaimed ? 'Coletado' : '+25 ao completar as 3 missoes'}</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-white/6">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent)]" />
          <div
            className="relative h-full rounded-full shadow-[0_0_22px_rgba(70,247,194,0.25)] transition-[width] duration-500"
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
      className="w-full rounded-full bg-[var(--gradient-gold)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-bg-primary shadow-[0_0_24px_rgba(255,191,90,0.22)] transition-transform duration-200 hover:translate-y-[-1px]"
    >
      Coletar Bonus
    </button>
  );
}

function ChallengesGrid() {
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);
  const join = useGameStore((s) => s.joinChallenge);
  const advance = useGameStore((s) => s.advanceChallenge);
  const completeCh = useGameStore((s) => s.completeChallenge);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {CHALLENGES.map((challenge) => {
        const isActive = activeChallenges.includes(challenge.id);
        const isDone = completedChallenges.includes(challenge.id);
        const cur = progress[challenge.id] ?? 0;
        const prog = isDone ? 100 : isActive ? Math.min(100, (cur / challenge.duration) * 100) : 0;
        const accent = challenge.type === 'individual' ? 'cyan' : 'violet';

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
          <GlassCard key={challenge.id} variant="tile" accent={accent} className="px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <span className="command-pill" data-active={isActive ? 'true' : undefined}>
                  <span>{challenge.type === 'individual' ? 'Solo' : 'Co-op'}</span>
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold leading-tight">{challenge.emoji} {challenge.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-secondary">
                    <span>👥 {challenge.participants.toLocaleString('pt-BR')}</span>
                    <span>📅 {challenge.duration} dia{challenge.duration > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <div className="font-display text-2xl font-bold text-accent-gold">🪙 {challenge.tokens}</div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm text-text-secondary">
                <span>Progresso da operacao</span>
                <span>{isDone ? '100%' : `${Math.round(prog)}%`}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className="relative h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${prog}%`,
                    background: challenge.type === 'individual' ? 'var(--gradient-primary)' : 'var(--gradient-purple)',
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-sm text-text-muted">
                {isDone ? 'Operacao concluida' : isActive ? 'Missao em andamento' : 'Pronto para ativar'}
              </div>
              <button
                onClick={handle}
                disabled={isDone}
                className={cn(
                  'rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] transition-transform duration-200',
                  isDone ? 'bg-white/6 text-text-secondary' : 'text-bg-primary hover:translate-y-[-1px]'
                )}
                style={
                  isDone
                    ? undefined
                    : {
                        background: challenge.type === 'individual' ? 'var(--gradient-primary)' : 'var(--gradient-purple)',
                      }
                }
              >
                {isDone ? 'Completo' : isActive ? 'Avancar' : 'Participar'}
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
    <div className="grid gap-4 sm:grid-cols-2">
      {TUTORIALS.map((tutorial, index) => (
        <button
          key={tutorial.id}
          onClick={() => openModal({ kind: 'tutorial', id: tutorial.id })}
          className="group text-left"
        >
          <GlassCard
            variant="tile"
            accent={index % 4 === 0 ? 'mint' : index % 4 === 1 ? 'cyan' : index % 4 === 2 ? 'amber' : 'violet'}
            className="overflow-hidden p-0 transition-transform duration-200 group-hover:translate-y-[-4px]"
          >
            <div className="relative flex min-h-[170px] items-end overflow-hidden px-5 py-5" style={{ background: tutorial.gradient }}>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(7,11,17,0.2)_100%)]" />
              <div className="relative">
                <div className="hud-label text-white/70">recipe drop</div>
                <div className="mt-3 text-5xl">{tutorial.emoji}</div>
              </div>
            </div>
            <div className="px-5 py-4">
              <h3 className="font-display text-xl font-bold leading-tight">{tutorial.title}</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span>{'🌿'.repeat(tutorial.difficulty)}</span>
                <span>⏱ {tutorial.time}</span>
                <span className="text-accent-gold">🪙 {tutorial.tokens}</span>
              </div>
            </div>
          </GlassCard>
        </button>
      ))}
    </div>
  );
}

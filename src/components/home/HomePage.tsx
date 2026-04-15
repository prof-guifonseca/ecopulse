'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar } from '@/components/shared/Avatar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { CHALLENGES, DAILY_MISSIONS, TUTORIALS } from '@/data';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { buildDemoHref, isDemoMode } from '@/lib/demoMode';
import { missionChecks, tryClaimDailyBonus } from '@/lib/missions';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/cn';

export function HomePage() {
  const searchParams = useSearchParams();
  const demoMode = isDemoMode(searchParams);
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const avatarBase = useUserStore((s) => s.avatarBase);
  const avatarOutfits = useUserStore((s) => s.avatarOutfits);
  const streak = useUserStore((s) => s.streak);
  const tokensToday = useUserStore((s) => s.tokensToday);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const checks = missionChecks();
  const completed = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-3" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,25,21,0.98),rgba(8,13,11,0.96))] px-5 pb-6 pt-5 shadow-[0_30px_80px_rgba(1,8,5,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(145,216,159,0.16),transparent_34%),radial-gradient(circle_at_80%_72%,rgba(213,187,123,0.12),transparent_24%)]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-[24px] border border-white/8 bg-white/6 p-2 shadow-[0_18px_40px_rgba(145,216,159,0.08)]">
                <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.78rem] font-medium text-text-secondary">Olá, {name}</p>
                <p className="text-sm font-semibold text-text-primary">Seu ponto de entrada para a demo</p>
              </div>
            </div>
            <span className="command-pill shrink-0" data-active="true">
              {completed}/3 hoje
            </span>
          </div>

          <div className="mt-8 max-w-[17ch]">
            <div className="text-[0.76rem] font-medium text-text-secondary">Fluxo hero</div>
            <h1 className="mt-3 text-[2.6rem] font-semibold leading-[0.92] tracking-[-0.06em] text-text-primary">
              Faça o básico bem feito.
            </h1>
            <p className="mt-4 max-w-[28ch] text-sm leading-6 text-text-secondary">
              Escaneie um item, passe pelo mapa e feche o bônus diário sem se perder em painéis paralelos.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <HeroStat label="Hoje" value={`+${tokensToday}`} />
            <HeroStat label="Sequência" value={`${streak} dias`} />
            <HeroStat label="Scans" value={`${scannedCount}`} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={buildDemoHref('/scanner', demoMode)}
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-[var(--gradient-primary)] px-5 text-sm font-semibold text-bg-primary shadow-[0_18px_34px_rgba(145,216,159,0.15)] transition-transform duration-200 hover:translate-y-[-1px]"
            >
              Abrir demonstração do scanner
            </Link>
            <Link
              href={buildDemoHref('/map', demoMode, { view: 'places', filter: 'todos' })}
              className="flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-white/8"
            >
              Ver próximo ponto
            </Link>
          </div>
        </div>
      </section>

      <MissionsPanel />

      <section className="space-y-3">
        <SectionHeader
          title="Depois do fluxo principal"
          subtitle="Dois blocos de apoio para aprofundar a apresentação sem lotar a primeira leitura."
        />
        <div className="space-y-3">
          {CHALLENGES.slice(0, 2).map((challenge) => (
            <ChallengeShowcase key={challenge.id} challenge={challenge} />
          ))}
          <TutorialShowcase tutorial={TUTORIALS[0]} />
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.045] px-3 py-3">
      <div className="text-[0.72rem] font-medium text-text-secondary">{label}</div>
      <div className="mt-1 text-base font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function MissionsPanel() {
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  const bonusClaimed = useGameStore((s) => s.dailyMissions.bonusClaimed);

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Missões do dia"
        subtitle="Este é o núcleo da demonstração: três passos, um bônus e uma sensação clara de progresso."
        right={
          <span className="command-pill" data-active="true">
            {done}/3 concluídas
          </span>
        }
      />

      <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.92))] shadow-[0_20px_56px_rgba(1,8,5,0.22)]">
        <div className="divide-y divide-white/6">
          {DAILY_MISSIONS.map((mission) => {
            const completed = checks[mission.id as keyof typeof checks];

            return (
              <div key={mission.id} className="flex items-center gap-4 px-4 py-4">
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-white/8 bg-white/5 text-lg',
                    completed && 'border-accent-green/22 bg-accent-green/10 text-accent-green'
                  )}
                >
                  {completed ? '✓' : mission.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-primary">{mission.title}</div>
                  <div className="mt-1 text-sm leading-6 text-text-secondary">Recompensa: +{mission.reward} tokens</div>
                </div>
                <div className="text-[0.76rem] font-medium text-text-secondary">
                  {completed ? 'Pronto' : 'Pendente'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/6 px-4 py-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm text-text-secondary">
            <span>Bônus diário</span>
            <span>{bonusClaimed ? 'Coletado' : '+25 ao completar tudo'}</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${(done / 3) * 100}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
          {done === 3 && !bonusClaimed ? (
            <button
              onClick={tryClaimDailyBonus}
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--gradient-gold)] px-5 text-sm font-semibold text-bg-primary"
            >
              Coletar bônus diário
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ChallengeShowcase({ challenge }: { challenge: (typeof CHALLENGES)[number] }) {
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);
  const join = useGameStore((s) => s.joinChallenge);
  const advance = useGameStore((s) => s.advanceChallenge);
  const completeChallenge = useGameStore((s) => s.completeChallenge);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  const isActive = activeChallenges.includes(challenge.id);
  const isDone = completedChallenges.includes(challenge.id);
  const currentProgress = progress[challenge.id] ?? 0;
  const completion = isDone
    ? 100
    : isActive
    ? Math.min(100, (currentProgress / challenge.duration) * 100)
    : 0;

  const handleChallenge = () => {
    if (isDone) return;

    if (!isActive) {
      join(challenge.id);
      showToast(`Desafio iniciado: ${challenge.title}`, 'info');
      return;
    }

    const finished = advance(challenge.id, challenge.duration);
    awardTokens(5);
    showToast('+5 tokens pelo avanço do desafio', 'reward');

    if (!finished) return;

    completeChallenge(challenge.id);
    awardTokens(challenge.tokens);
    showToast(`Desafio concluído: +${challenge.tokens} tokens`, 'reward');
    fireConfetti();

    const total = useGameStore.getState().completedChallenges.length;
    if (total === 1) unlockBadge('challenge-1');
  };

  return (
    <article className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[0.76rem] font-medium text-text-secondary">Desafio em destaque</div>
          <h3 className="mt-2 text-[1.02rem] font-semibold text-text-primary">
            {challenge.emoji} {challenge.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {challenge.participants.toLocaleString('pt-BR')} pessoas participando por {challenge.duration} dias.
          </p>
        </div>
        <span className="command-pill">🪙 {challenge.tokens}</span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-text-secondary">
          <span>{isDone ? 'Concluído' : isActive ? 'Em andamento' : 'Pronto para começar'}</span>
          <span>{Math.round(completion)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${completion}%`,
              background: challenge.type === 'individual' ? 'var(--gradient-primary)' : 'var(--gradient-purple)',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleChallenge}
        disabled={isDone}
        className={cn(
          'mt-4 flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-opacity',
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
        {isDone ? 'Desafio concluído' : isActive ? 'Avançar nesta demo' : 'Iniciar desafio'}
      </button>
    </article>
  );
}

function TutorialShowcase({ tutorial }: { tutorial: (typeof TUTORIALS)[number] }) {
  const openModal = useUIStore((s) => s.openModal);

  return (
    <button
      onClick={() => openModal({ kind: 'tutorial', id: tutorial.id })}
      className="block w-full rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4 text-left transition-transform duration-200 hover:translate-y-[-1px]"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] text-3xl"
          style={{ background: tutorial.gradient }}
        >
          {tutorial.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.76rem] font-medium text-text-secondary">Ideia para continuar a demo</div>
          <h3 className="mt-2 text-[1.02rem] font-semibold text-text-primary">{tutorial.title}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Abra a ficha e mostre como o conteúdo educativo aparece como desdobramento natural da rotina.
          </p>
          <div className="mt-3 text-sm font-medium text-text-secondary">
            {'🌿'.repeat(tutorial.difficulty)} · {tutorial.time}
          </div>
        </div>
      </div>
    </button>
  );
}

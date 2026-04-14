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
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      {/* Welcome banner */}
      <section className="flex items-center gap-3 rounded-lg p-4" style={{ background: 'var(--gradient-primary)' }}>
        <div className="rounded-full bg-white/20 p-1">
          <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="md" />
        </div>
        <div className="flex-1 min-w-0 text-bg-primary">
          <div className="text-xs opacity-80">Olá,</div>
          <div className="truncate font-display text-lg font-bold">{name}</div>
        </div>
        <div className="flex flex-col items-end text-bg-primary">
          <div className="text-xs opacity-80">🔥 {streak} dias</div>
          <div className="font-bold">🪙 {tokens}</div>
        </div>
      </section>

      {/* Daily missions */}
      <MissionsCard />

      {/* Weekly challenges */}
      <section>
        <SectionHeader title="Desafios Semanais" subtitle="Ative para ganhar tokens" />
        <ChallengesRow />
      </section>

      {/* Quick stats */}
      <section>
        <SectionHeader title="Impacto de Hoje" />
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="text-center">
            <div className="text-[10px] text-text-secondary">Tokens hoje</div>
            <div className="mt-1 font-display text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>🪙 {tokensToday}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-[10px] text-text-secondary">Produtos escaneados</div>
            <div className="mt-1 font-display text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>📱 {scannedCount}</div>
          </GlassCard>
        </div>
      </section>

      {/* Upcycling */}
      <section>
        <SectionHeader title="Academia de Upcycling" subtitle="Transforme, crie, ganhe tokens" />
        <div className="grid grid-cols-2 gap-3">
          {TUTORIALS.map((t) => (
            <button
              key={t.id}
              onClick={() => openModal({ kind: 'tutorial', id: t.id })}
              className="glass-card overflow-hidden text-left transition-transform active:scale-[0.98]"
            >
              <div
                className="flex h-24 items-center justify-center text-4xl"
                style={{ background: t.gradient }}
              >
                {t.emoji}
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-xs font-semibold">{t.title}</div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-text-secondary">
                  <span>{'🌿'.repeat(t.difficulty)}</span>
                  <span>⏱{t.time}</span>
                  <span style={{ color: 'var(--accent-gold)' }}>🪙{t.tokens}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function MissionsCard() {
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  const bonusClaimed = useGameStore((s) => s.dailyMissions.bonusClaimed);

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold">Missões Diárias</h2>
          <p className="text-xs text-text-secondary">Renovam à meia-noite</p>
        </div>
        <div className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>{done}/3</div>
      </div>

      <ul className="space-y-2">
        {DAILY_MISSIONS.map((m) => {
          const isDone = checks[m.id as keyof typeof checks];
          return (
            <li
              key={m.id}
              className={cn(
                'flex items-center gap-3 rounded-md p-2 transition-colors',
                isDone && 'bg-accent-green/10'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-lg',
                  isDone ? 'bg-accent-green text-bg-primary' : 'bg-bg-tertiary'
                )}
              >
                {isDone ? '✓' : m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold">{m.title}</div>
                <div className="text-[11px]" style={{ color: 'var(--accent-gold)' }}>🪙 +{m.reward} tokens</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3">
        <div className="mb-1.5 flex justify-between text-[11px] text-text-secondary">
          <span>Bônus diário</span>
          <span>{bonusClaimed ? '✅ Coletado' : '🎁 +25 tokens ao completar'}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${(done / 3) * 100}%`, background: 'var(--gradient-primary)' }}
          />
        </div>
        {done === 3 && !bonusClaimed && <ClaimBonusButton />}
      </div>
    </GlassCard>
  );
}

function ClaimBonusButton() {
  return (
    <button
      onClick={tryClaimDailyBonus}
      className="mt-3 w-full rounded-full py-2.5 text-xs font-bold text-bg-primary"
      style={{ background: 'var(--gradient-gold)' }}
    >
      🎁 Coletar Bônus
    </button>
  );
}

function ChallengesRow() {
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);
  const join = useGameStore((s) => s.joinChallenge);
  const advance = useGameStore((s) => s.advanceChallenge);
  const completeCh = useGameStore((s) => s.completeChallenge);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  return (
    <div className="grid grid-cols-1 gap-3">
      {CHALLENGES.map((c) => {
        const isActive = activeChallenges.includes(c.id);
        const isDone = completedChallenges.includes(c.id);
        const cur = progress[c.id] ?? 0;
        const prog = isDone ? 100 : isActive ? Math.min(100, (cur / c.duration) * 100) : 0;
        const handle = () => {
          if (isDone) return;
          if (!isActive) {
            join(c.id);
            showToast(`Desafio aceito! ${c.emoji}`, 'info');
            return;
          }
          const finished = advance(c.id, c.duration);
          awardTokens(5);
          showToast('+5 Eco-Tokens! 💪', 'reward');
          if (finished) {
            completeCh(c.id);
            awardTokens(c.tokens);
            showToast(`Desafio completo! +${c.tokens} tokens 🏆`, 'reward');
            fireConfetti();
            const total = useGameStore.getState().completedChallenges.length;
            if (total === 1) unlockBadge('challenge-1');
          }
        };
        return (
          <GlassCard key={c.id}>
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                background: c.type === 'individual' ? 'rgba(0,180,216,0.15)' : 'rgba(167,139,250,0.15)',
                color: c.type === 'individual' ? 'var(--accent-cyan)' : 'var(--accent-purple)',
              }}
            >
              {c.type === 'individual' ? '🧑 Individual' : '👥 Cooperativo'}
            </span>
            <h3 className="mt-2 text-sm font-semibold">{c.emoji} {c.title}</h3>
            <div className="mt-1 flex gap-3 text-[11px] text-text-secondary">
              <span>👥 {c.participants.toLocaleString('pt-BR')}</span>
              <span>📅 {c.duration} dia{c.duration > 1 ? 's' : ''}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${prog}%`, background: 'var(--gradient-primary)' }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--accent-gold)' }}>🪙 {c.tokens}</span>
              <button
                onClick={handle}
                disabled={isDone}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                  isDone
                    ? 'bg-bg-tertiary text-text-secondary'
                    : isActive
                    ? 'text-bg-primary'
                    : 'border border-accent-green text-accent-green'
                )}
                style={isActive && !isDone ? { background: 'var(--gradient-primary)' } : undefined}
              >
                {isDone ? '✅ Completo' : isActive ? 'Avançar' : 'Participar'}
              </button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

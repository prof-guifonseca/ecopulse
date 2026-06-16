'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react';
import { ARENA_OPPONENTS, GEAR_ITEMS, GEAR_SETS, arenaStageVisual, getGearSet, TRIBES } from '@/data';
import type { TribeId } from '@/data/tribes';
import type {
  ArenaOpponent,
  ArenaProgress,
  ArenaRivalMastery,
  BattleAction,
  BattleResult,
  BattleSession,
} from '@/types';
import { asBattleId } from '@/types';
import { useArenaStore } from '@/store/arenaStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useHydrated } from '@/hooks/useHydrated';
import {
  createPlayerFighter,
  opponentToFighter,
  resolveBattleRound,
  startBattleSession,
} from '@/lib/battle/rules';
import { battleArenaXpReward, FIRST_RIVAL_WIN_BONUS } from '@/lib/arena/progress';
import { computeLoadoutAffinity } from '@/lib/arena/affinity';
import { ARENA_ARCHETYPE_LABELS } from '@/lib/arena/presentation';
import { DOCTRINE_BY_RIVAL, DOCTRINE_LABEL } from '@/lib/doctrines';
import { unlockBadge } from '@/lib/gameActions';
import { hapticTap } from '@/lib/haptic';
import { syncEvent } from '@/lib/client/mvpSync';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/shared/Avatar';
import { BattleStatChips } from '@/components/shared/BattleStatChips';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { Skeleton } from '@/components/shared/Skeleton';
import { ArenaProgressPanel } from './ArenaProgressPanel';
import { BattleStage } from './BattleStage';
import { OpponentCard } from './OpponentCard';

export function ArenaPage() {
  const hydrated = useHydrated();
  const orderedOpponents = useMemo(
    () => [...ARENA_OPPONENTS].sort((a, b) => a.order - b.order),
    []
  );
  const [selectedOpponentId, setSelectedOpponentId] = useState(orderedOpponents[0]?.id ?? '');
  const [battleSession, setBattleSession] = useState<BattleSession | null>(null);
  const [battleMasteryAtStart, setBattleMasteryAtStart] = useState<ArenaRivalMastery | undefined>(undefined);
  const [completedBattleId, setCompletedBattleId] = useState<string | null>(null);

  const name = useUserStore((s) => s.name);
  const level = useUserStore((s) => s.level);
  const tribe = useUserStore((s) => s.tribe);
  const tokens = useUserStore((s) => s.tokens);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const wins = useArenaStore((s) => s.wins);
  const losses = useArenaStore((s) => s.losses);
  const defeatedOpponents = useArenaStore((s) => s.defeatedOpponents);
  const lastBattle = useArenaStore((s) => s.lastBattle);
  const history = useArenaStore((s) => s.history);
  const arenaXp = useArenaStore((s) => s.arenaXp);
  const arenaLevel = useArenaStore((s) => s.arenaLevel);
  const winStreak = useArenaStore((s) => s.winStreak);
  const bestStreak = useArenaStore((s) => s.bestStreak);
  const rivalMastery = useArenaStore((s) => s.rivalMastery);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  const selectedOpponent =
    orderedOpponents.find((opponent) => opponent.id === selectedOpponentId) ?? orderedOpponents[0];
  const selectedUnlocked = selectedOpponent
    ? isOpponentUnlocked(selectedOpponent, defeatedOpponents, orderedOpponents)
    : false;
  const activeSet = getGearSet(avatarLoadout.activeSetId);

  const progress = useMemo<ArenaProgress>(
    () => ({
      wins,
      losses,
      defeatedOpponents,
      lastBattle,
      history,
      arenaXp,
      arenaLevel,
      winStreak,
      bestStreak,
      rivalMastery,
    }),
    [
      arenaLevel,
      arenaXp,
      bestStreak,
      defeatedOpponents,
      history,
      lastBattle,
      losses,
      rivalMastery,
      winStreak,
      wins,
    ]
  );

  const playerFighter = useMemo(
    () =>
      createPlayerFighter({
        name,
        title: activeSet
          ? activeSet.name
          : tribe === 'guardioes'
            ? 'Guardião em Modo Livre'
            : 'EcoWarrior em Modo Livre',
        level,
        loadout: avatarLoadout,
        gearItems: GEAR_ITEMS,
        gearSets: GEAR_SETS,
      }),
    [activeSet, avatarLoadout, level, name, tribe]
  );

  const handleSelectOpponent = useCallback(
    (opponent: ArenaOpponent) => {
      if (battleSession?.status === 'active') {
        showToast('Termine o teste atual antes de trocar de rival.', 'info');
        return;
      }
      if (!isOpponentUnlocked(opponent, defeatedOpponents, orderedOpponents)) {
        showToast(lockHint(opponent, orderedOpponents), 'info');
        return;
      }
      setSelectedOpponentId(opponent.id);
      setBattleSession(null);
      setBattleMasteryAtStart(undefined);
      setCompletedBattleId(null);
    },
    [battleSession?.status, defeatedOpponents, orderedOpponents, showToast]
  );

  const handleStartBattle = useCallback(() => {
    if (!selectedOpponent || !selectedUnlocked) return;
    hapticTap();
    const seed = `${Date.now()}:${selectedOpponent.id}:${wins}:${losses}:${arenaXp}`;
    const opponent = opponentToFighter(selectedOpponent);
    setCompletedBattleId(null);
    setBattleMasteryAtStart(rivalMastery[selectedOpponent.id]);
    setBattleSession(
      startBattleSession({
        player: playerFighter,
        opponent,
        opponentId: selectedOpponent.id,
        seed,
        startedAt: new Date().toISOString(),
      })
    );
    showToast(selectedOpponent.introLine, 'info', 3600);
  }, [arenaXp, losses, playerFighter, rivalMastery, selectedOpponent, selectedUnlocked, showToast, wins]);

  const handleBattleAction = useCallback((action: BattleAction) => {
    hapticTap();
    setBattleSession((current) => {
      if (!current || current.status !== 'active') return current;
      return resolveBattleRound(current, action);
    });
  }, []);

  const handleBattleComplete = useCallback(
    (result: BattleResult) => {
      if (completedBattleId === result.id) return;
      setCompletedBattleId(result.id);

      const arena = useArenaStore.getState();
      const user = useUserStore.getState();
      const affinity = computeLoadoutAffinity(user.avatarLoadout, user.tribe);
      const reward = battleArenaXpReward(
        result,
        arena.rivalMastery[result.opponentId],
        { loadoutMultiplier: affinity.multiplier }
      );
      const nextWins = arena.wins + (result.outcome === 'win' ? 1 : 0);
      arena.recordBattle(result, affinity.multiplier);
      syncEvent('battle_completed', { battleId: asBattleId(result.id), outcome: result.outcome });

      const opponent = ARENA_OPPONENTS.find((item) => item.id === result.opponentId);
      if (result.outcome === 'win') {
        unlockBadge('arena-first');
        if (nextWins >= 3) unlockBadge('arena-trio');
        // Grant doctrine on first defeat of this rival.
        const doctrineId = DOCTRINE_BY_RIVAL[result.opponentId];
        const isFirstWin = (arena.rivalMastery[result.opponentId]?.wins ?? 0) === 0;
        if (doctrineId && isFirstWin) {
          if (user.adoptDoctrine(doctrineId)) {
            showToast(`Doutrina adotada · ${DOCTRINE_LABEL[doctrineId]}`, 'reward', 4200);
          }
        }
        fireConfetti();
        const alignedSuffix = affinity.aligned ? ' · loadout alinhado +25% XP' : '';
        showToast(
          `+${reward.total} XP de teste${alignedSuffix} · ${opponent?.defeatLine ?? 'Vitória registrada.'}`,
          'reward',
          4200
        );
      } else if (result.outcome === 'loss') {
        showToast(`+${reward.total} XP de teste · ${opponent?.victoryLine ?? 'Derrota sem custo.'}`, 'info', 4200);
      } else {
        showToast(`+${reward.total} XP de teste · Empate técnico registrado.`, 'info', 3800);
      }
    },
    [completedBattleId, fireConfetti, showToast]
  );

  const handleChangeOpponent = useCallback(() => {
    setBattleSession(null);
    setBattleMasteryAtStart(undefined);
    setCompletedBattleId(null);
  }, []);

  if (!hydrated) {
    return (
      <PageShell spacing={5}>
        <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-80 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-40 rounded-[var(--radius-lg)]" />
      </PageShell>
    );
  }

  return (
    <PageShell spacing={4} className="max-w-full overflow-hidden pb-3">
      <header className="pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="t-headline max-w-full break-words leading-none">Teste de Loadout</h1>
            <p className="mt-1 t-caption">Vestiário · rounds simulados</p>
          </div>
          <span className="shrink-0 rounded-full border-soft bg-tint-1 px-3 py-1 t-caption">
            0 tokens por treino
          </span>
        </div>
      </header>

      <LoadoutSummaryCard name={name} level={level} tokens={tokens} playerFighter={playerFighter} />

      {battleSession ? (
        <BattleStage
          key={battleSession.id}
          session={battleSession}
          stageTheme={selectedOpponent?.stageTheme}
          masteryAtStart={battleMasteryAtStart}
          onAction={handleBattleAction}
          onComplete={handleBattleComplete}
          onRematch={handleStartBattle}
          onChangeOpponent={handleChangeOpponent}
        />
      ) : selectedOpponent ? (
        <ArenaSetup
          playerName={name}
          playerFighter={playerFighter}
          opponent={selectedOpponent}
          unlocked={selectedUnlocked}
          masteryWins={rivalMastery[selectedOpponent.id]?.wins ?? 0}
          onStart={handleStartBattle}
        />
      ) : null}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="t-title">Rivais de treino</h2>
          <span className="t-caption">{defeatedOpponents.length}/{orderedOpponents.length} superados</span>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="relative flex gap-3 pb-1">
            <span className="absolute left-7 right-7 top-9 h-px bg-[var(--line-soft)]" aria-hidden />
            {orderedOpponents.map((opponent) => {
              const locked = !isOpponentUnlocked(opponent, defeatedOpponents, orderedOpponents);
              const tribeDef = TRIBES[(tribe ?? 'guardioes') as TribeId];
              const isPatron = opponent.id === tribeDef.patronRivalId;
              return (
                <OpponentCard
                  key={opponent.id}
                  opponent={opponent}
                  selected={opponent.id === selectedOpponent?.id}
                  defeated={defeatedOpponents.includes(opponent.id)}
                  locked={locked}
                  mastery={rivalMastery[opponent.id]}
                  className="w-[176px] shrink-0"
                  onSelect={() => handleSelectOpponent(opponent)}
                  isPatron={isPatron}
                  patronLabel={isPatron ? tribeDef.label : undefined}
                />
              );
            })}
          </div>
        </div>
      </section>

      <ArenaProgressPanel progress={progress} totalOpponents={orderedOpponents.length} />
    </PageShell>
  );
}

function LoadoutSummaryCard({
  name,
  level,
  tokens,
  playerFighter,
}: {
  name: string;
  level: number;
  tokens: number;
  playerFighter: ReturnType<typeof createPlayerFighter>;
}) {
  return (
    <Card tone="solid" padded={false} className="border-soft px-5 py-5">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--bg-primary)]">
          <Avatar loadout={playerFighter.loadout} size="lg" alt={name} pose="battleReady" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="t-eyebrow">Seu loadout</p>
              <h2 className="t-title mt-1 truncate">{playerFighter.title}</h2>
            </div>
            <Button
              as={Link}
              href="/profile?tab=shop"
              variant="secondary"
              size="sm"
              className="shrink-0"
              leftIcon={<Icon icon={ArrowLeft} size={14} />}
            >
              Vestiário
            </Button>
          </div>
          <p className="mt-1 t-caption">Nv {level} · {tokens} tokens</p>
          <BattleStatChips stats={playerFighter.stats} compact className="mt-3 max-w-[calc(100vw-152px)]" />
        </div>
      </div>
    </Card>
  );
}

function ArenaSetup({
  playerName,
  playerFighter,
  opponent,
  unlocked,
  masteryWins,
  onStart,
}: {
  playerName: string;
  playerFighter: ReturnType<typeof createPlayerFighter>;
  opponent: ArenaOpponent;
  unlocked: boolean;
  masteryWins: number;
  onStart: () => void;
}) {
  const firstWinBonus = masteryWins === 0 ? FIRST_RIVAL_WIN_BONUS : 0;
  const xpPreview = opponent.arenaXpReward + firstWinBonus;
  const stage = arenaStageVisual(opponent.stageTheme);

  return (
    <Card
      tone="hero"
      padded={false}
      className="relative isolate border border-[var(--line-soft)] px-4 py-5 shadow-[var(--shadow-deep-glow)]"
      style={{
        background: `radial-gradient(circle at 50% 12%, ${stage.palette.glow}2f, transparent 40%), linear-gradient(180deg, ${stage.palette.skyTop}, ${stage.palette.skyBottom})`,
      }}
    >
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/46 to-transparent" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="t-eyebrow">{stage.name}</p>
          <h2 className="t-headline mt-1 truncate">{opponent.name}</h2>
          <p className="mt-1 line-clamp-2 t-body-sm">&ldquo;{opponent.quote}&rdquo;</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/24 text-[var(--accent-gold)]">
          <Icon icon={Sparkles} size={21} />
        </span>
      </div>

      <div className="relative z-10 mt-4 grid min-h-[178px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
        <div
          aria-hidden
          className="absolute inset-x-3 bottom-6 h-20 rounded-full opacity-80"
          style={{ background: `radial-gradient(ellipse, ${stage.palette.floor} 0%, transparent 68%)` }}
        />
        <SetupFighter name={playerName} title={playerFighter.title} loadout={playerFighter.loadout} />
        <div className="relative z-10 mb-16 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/32 t-title text-[var(--accent-gold)]">
          VS
        </div>
        <SetupFighter name={opponent.name} title={opponent.title} loadout={opponent.loadout} mirror />
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
        <InfoPill icon={Swords} label={ARENA_ARCHETYPE_LABELS[opponent.archetype]} />
        <InfoPill icon={Zap} label={`+${xpPreview} XP teste`} />
        <InfoPill icon={Shield} label="0 tokens" muted />
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="relative z-10 mt-5"
        onClick={onStart}
        disabled={!unlocked}
        leftIcon={<Icon icon={unlocked ? Swords : Shield} size={16} />}
      >
        {unlocked ? 'Testar loadout' : 'Treino bloqueado'}
      </Button>
      <p className="relative z-10 mt-3 text-center t-caption">
        {unlocked
          ? 'Treino local · 0 tokens · atributos do Vestiário'
          : 'Avance na trilha superando os rivais anteriores.'}
      </p>
    </Card>
  );
}

function SetupFighter({
  name,
  title,
  loadout,
  mirror,
}: {
  name: string;
  title: string;
  loadout: ReturnType<typeof createPlayerFighter>['loadout'];
  mirror?: boolean;
}) {
  return (
    <div className="relative z-10 min-w-0 text-center">
      <div className="mx-auto flex h-32 w-[min(39vw,8rem)] items-end justify-center rounded-b-[44%] rounded-t-full bg-black/12">
        <Avatar loadout={loadout} size="xl" alt={name} mirror={mirror} pose="battleReady" />
      </div>
      <p className="mt-2 truncate t-title">{name}</p>
      <p className="truncate t-caption">{title}</p>
    </div>
  );
}

function InfoPill({ icon, label, muted }: { icon: LucideIcon; label: string; muted?: boolean }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-white/10 bg-black/18 px-2 py-3 text-center">
      <Icon icon={icon} size={16} className={cn('mx-auto', muted ? 'text-[var(--text-muted)]' : 'text-[var(--accent-green)]')} />
      <p className="mt-1 break-words t-caption text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function isOpponentUnlocked(
  opponent: ArenaOpponent,
  defeatedOpponents: string[],
  orderedOpponents: ArenaOpponent[]
) {
  return orderedOpponents
    .filter((item) => item.order < opponent.order)
    .every((item) => defeatedOpponents.includes(item.id));
}

function lockHint(opponent: ArenaOpponent, orderedOpponents: ArenaOpponent[]) {
  const previous = [...orderedOpponents]
    .reverse()
    .find((item) => item.order < opponent.order);
  return previous ? `Supere ${previous.name} para liberar o treino com ${opponent.name}.` : 'Treino bloqueado na trilha.';
}

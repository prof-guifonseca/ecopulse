'use client';

import { useCallback, useMemo, useState } from 'react';
import { Shield, Swords, Trophy, Zap, type LucideIcon } from 'lucide-react';
import { ARENA_OPPONENTS, GEAR_ITEMS, GEAR_SETS, getGearSet } from '@/data';
import type { ArenaOpponent, ArenaProgress, BattleAction, BattleResult, BattleSession } from '@/types';
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
import { unlockBadge } from '@/lib/gameActions';
import { hapticTap } from '@/lib/haptic';
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
        showToast('Termine a sessão atual antes de trocar de rival.', 'info');
        return;
      }
      if (!isOpponentUnlocked(opponent, defeatedOpponents, orderedOpponents)) {
        showToast(lockHint(opponent, orderedOpponents), 'info');
        return;
      }
      setSelectedOpponentId(opponent.id);
      setBattleSession(null);
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
  }, [arenaXp, losses, playerFighter, selectedOpponent, selectedUnlocked, showToast, wins]);

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
      const reward = battleArenaXpReward(result, arena.rivalMastery[result.opponentId]);
      const nextWins = arena.wins + (result.outcome === 'win' ? 1 : 0);
      arena.recordBattle(result);

      const opponent = ARENA_OPPONENTS.find((item) => item.id === result.opponentId);
      if (result.outcome === 'win') {
        unlockBadge('arena-first');
        if (nextWins >= 3) unlockBadge('arena-trio');
        fireConfetti();
        showToast(`+${reward.total} Arena XP · ${opponent?.defeatLine ?? 'Vitória registrada.'}`, 'reward', 4200);
      } else if (result.outcome === 'loss') {
        showToast(`+${reward.total} Arena XP · ${opponent?.victoryLine ?? 'Derrota sem custo.'}`, 'info', 4200);
      } else {
        showToast(`+${reward.total} Arena XP · Empate técnico registrado.`, 'info', 3800);
      }
    },
    [completedBattleId, fireConfetti, showToast]
  );

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
    <PageShell spacing={5} className="max-w-full overflow-hidden pb-3">
      <header className="pt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Arena Tática</p>
            <h1 className="t-display mt-1.5 max-w-full break-words leading-[0.95]">
              Escolha.
              <br />
              Responda.
              <br />
              <span className="t-italic-soft">Domine</span>.
            </h1>
          </div>
          <span className="hidden shrink-0 rounded-full border-soft bg-tint-1 px-3 py-1 t-caption sm:inline">
            0 tokens por luta
          </span>
        </div>
        <p className="mt-3 t-body-sm">
          Mini-RPG local por rounds. Vitória dá Arena XP e domínio de rival, nunca Eco-Tokens.
        </p>
      </header>

      {battleSession ? (
        <BattleStage
          key={battleSession.id}
          session={battleSession}
          stageTheme={selectedOpponent?.stageTheme}
          onAction={handleBattleAction}
          onComplete={handleBattleComplete}
        />
      ) : selectedOpponent ? (
        <ArenaSetup
          playerName={name}
          playerFighter={playerFighter}
          opponent={selectedOpponent}
          unlocked={selectedUnlocked}
          tokens={tokens}
          masteryWins={rivalMastery[selectedOpponent.id]?.wins ?? 0}
          onStart={handleStartBattle}
        />
      ) : null}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="t-title">Trilha de rivais</h2>
          <span className="t-caption">contra IA · local</span>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 pb-1">
          <div className="flex gap-3">
            {orderedOpponents.map((opponent) => {
              const locked = !isOpponentUnlocked(opponent, defeatedOpponents, orderedOpponents);
              return (
                <OpponentCard
                  key={opponent.id}
                  opponent={opponent}
                  selected={opponent.id === selectedOpponent?.id}
                  defeated={defeatedOpponents.includes(opponent.id)}
                  locked={locked}
                  mastery={rivalMastery[opponent.id]}
                  className="w-[284px] shrink-0"
                  onSelect={() => handleSelectOpponent(opponent)}
                />
              );
            })}
          </div>
        </div>
      </section>

      <Card tone="solid" padded={false} className="border-soft px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--bg-primary)]">
            <Avatar loadout={avatarLoadout} size="lg" alt={name} pose="battleReady" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Seu loadout</p>
            <h2 className="t-title mt-1 truncate">{playerFighter.title}</h2>
            <p className="mt-1 t-caption">Nível {level} · {tokens} Eco-Tokens preservados</p>
            <BattleStatChips stats={playerFighter.stats} compact className="mt-3 max-w-[calc(100vw-152px)]" />
          </div>
        </div>
      </Card>

      <ArenaProgressPanel progress={progress} totalOpponents={orderedOpponents.length} />
    </PageShell>
  );
}

function ArenaSetup({
  playerName,
  playerFighter,
  opponent,
  unlocked,
  tokens,
  masteryWins,
  onStart,
}: {
  playerName: string;
  playerFighter: ReturnType<typeof createPlayerFighter>;
  opponent: ArenaOpponent;
  unlocked: boolean;
  tokens: number;
  masteryWins: number;
  onStart: () => void;
}) {
  const firstWinBonus = masteryWins === 0 ? FIRST_RIVAL_WIN_BONUS : 0;
  const xpPreview = opponent.arenaXpReward + firstWinBonus;

  return (
    <Card tone="hero" padded={false} className="px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="t-eyebrow">Próximo rival</p>
          <h2 className="t-headline mt-1 truncate">{opponent.name}</h2>
          <p className="mt-1 t-body-sm">&ldquo;{opponent.quote}&rdquo;</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint-green-3 text-[var(--accent-green)]">
          <Icon icon={Trophy} size={21} />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
        <SetupFighter name={playerName} title={playerFighter.title} loadout={playerFighter.loadout} />
        <div className="mb-14 flex h-10 w-10 items-center justify-center rounded-full border-soft bg-[var(--bg-primary)] t-title text-[var(--accent-gold)]">
          VS
        </div>
        <SetupFighter name={opponent.name} title={opponent.title} loadout={opponent.loadout} mirror />
      </div>

      <div className="mt-5 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
        <InfoPill icon={Swords} label="Por round" />
        <InfoPill icon={Zap} label={`+${xpPreview} XP`} />
        <InfoPill icon={Shield} label={`${tokens} tokens`} />
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5"
        onClick={onStart}
        disabled={!unlocked}
        leftIcon={<Icon icon={unlocked ? Swords : Shield} size={16} />}
      >
        {unlocked ? 'Iniciar batalha tática' : 'Rival bloqueado'}
      </Button>
      <p className="mt-3 text-center t-caption">
        {unlocked
          ? 'Simulação local · sem aposta · sem perda de Eco-Tokens'
          : 'Avance na trilha vencendo os rivais anteriores.'}
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
    <div className="min-w-0 text-center">
      <div className="mx-auto flex h-28 w-28 items-end justify-center rounded-full bg-black/10">
        <Avatar loadout={loadout} size="xl" alt={name} mirror={mirror} pose="battleReady" />
      </div>
      <p className="mt-2 truncate t-title">{name}</p>
      <p className="truncate t-caption">{title}</p>
    </div>
  );
}

function InfoPill({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border-soft bg-tint-1 px-2 py-3 text-center">
      <Icon icon={icon} size={16} className="mx-auto text-[var(--accent-green)]" />
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
  return previous ? `Derrote ${previous.name} para liberar ${opponent.name}.` : 'Rival bloqueado na trilha.';
}

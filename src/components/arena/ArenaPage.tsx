'use client';

import { useCallback, useMemo, useState } from 'react';
import { Brain, Shield, ShieldCheck, Sparkles, Swords, Target } from 'lucide-react';
import { ARENA_OPPONENTS, GEAR_ITEMS, GEAR_SETS, getGearSet } from '@/data';
import type { BattleAction, BattleResult } from '@/types';
import { useArenaStore } from '@/store/arenaStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useHydrated } from '@/hooks/useHydrated';
import {
  createPlayerFighter,
  opponentToFighter,
  simulateBattle,
} from '@/lib/battle/rules';
import { unlockBadge } from '@/lib/gameActions';
import { hapticTap } from '@/lib/haptic';
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
  const [selectedOpponentId, setSelectedOpponentId] = useState(ARENA_OPPONENTS[0]?.id ?? '');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [completedBattleId, setCompletedBattleId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<BattleAction>('attack');

  const name = useUserStore((s) => s.name);
  const level = useUserStore((s) => s.level);
  const tribe = useUserStore((s) => s.tribe);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const wins = useArenaStore((s) => s.wins);
  const losses = useArenaStore((s) => s.losses);
  const defeatedOpponents = useArenaStore((s) => s.defeatedOpponents);
  const history = useArenaStore((s) => s.history);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  const selectedOpponent =
    ARENA_OPPONENTS.find((opponent) => opponent.id === selectedOpponentId) ?? ARENA_OPPONENTS[0];
  const activeSet = getGearSet(avatarLoadout.activeSetId);

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

  const simulate = () => {
    if (!selectedOpponent) return;
    hapticTap();
    const opponent = opponentToFighter(selectedOpponent);
    const result = simulateBattle({
      player: playerFighter,
      opponent,
      opponentId: selectedOpponent.id,
      seed: `${Date.now()}:${selectedOpponent.id}:${wins}:${losses}`,
      playerPlan: buildTacticalPlan(selectedAction),
    });
    setCompletedBattleId(null);
    setBattleResult(result);
  };

  const handleBattleComplete = useCallback(
    (result: BattleResult) => {
      if (completedBattleId === result.id) return;
      setCompletedBattleId(result.id);

      const arena = useArenaStore.getState();
      const nextWins = arena.wins + (result.outcome === 'win' ? 1 : 0);
      arena.recordBattle(result);

      if (result.outcome === 'win') {
        unlockBadge('arena-first');
        if (nextWins >= 3) unlockBadge('arena-trio');
        fireConfetti();
        showToast(`Vitória contra ${result.opponent.name}`, 'reward');
      } else if (result.outcome === 'loss') {
        showToast(`${result.opponent.name} venceu esta simulação`, 'info');
      } else {
        showToast('Empate técnico na Arena', 'info');
      }
    },
    [completedBattleId, fireConfetti, showToast]
  );

  if (!hydrated) {
    return (
      <PageShell spacing={5}>
        <Skeleton className="h-28 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
      </PageShell>
    );
  }

  return (
    <PageShell spacing={6} className="w-[min(100%,calc(100vw-40px))] max-w-full overflow-hidden">
      <header className="pt-2">
        <p className="t-eyebrow">Arena Simulada</p>
        <h1 className="t-display mt-1.5 leading-[0.95]">
          Batalhas de <span className="t-italic-soft">impacto</span>
        </h1>
        <p className="mt-3 t-body-sm">
          Combates de IA sem aposta nem perda de tokens. O loadout vestível define seus atributos.
        </p>
      </header>

      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--bg-primary)]">
            <Avatar
              loadout={avatarLoadout}
              size="lg"
              alt={name}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Seu loadout</p>
            <h2 className="t-headline mt-1 truncate">{playerFighter.title}</h2>
            <p className="mt-1 t-caption">Nível {level} · stats calculados localmente</p>
            <BattleStatChips stats={playerFighter.stats} compact className="mt-3 max-w-[calc(100vw-152px)]" />
          </div>
        </div>
      </Card>

      <Card tone="solid" padded={false} className="border-soft px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="t-eyebrow">Plano tático</p>
            <h2 className="t-title mt-1">Escolha a postura da simulação</h2>
          </div>
          <span className="hidden t-caption min-[420px]:inline">local · 0 tokens</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {TACTICAL_ACTIONS.map((action) => {
            const IconCmp = action.icon;
            const active = selectedAction === action.value;
            return (
              <button
                key={action.value}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedAction(action.value)}
                className={cn(
                  'min-h-[84px] rounded-[var(--radius-md)] border px-2.5 py-3 text-center transition-colors',
                  active ? 'border-active bg-tint-green-2' : 'border-soft bg-tint-1 hover:bg-tint-2'
                )}
              >
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[var(--accent-green)]">
                  <Icon icon={IconCmp} size={16} />
                </span>
                <span className="mt-2 block t-body-sm font-semibold">{action.label}</span>
                <span className="mt-1 block t-caption">{action.hint}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {battleResult ? (
        <BattleStage key={battleResult.id} result={battleResult} onComplete={handleBattleComplete} />
      ) : (
        <Card tone="soft" padded={false} className="px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint-green-3 text-[var(--accent-green)]">
              <Icon icon={Sparkles} size={18} />
            </span>
            <div>
              <h2 className="t-title">Pronto para a primeira simulação</h2>
              <p className="mt-1 t-body-sm">
                Escolha um rival, toque em simular e a luta roda sozinha em turnos.
              </p>
            </div>
          </div>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="t-title">Rivais de IA</h2>
          <span className="hidden t-caption min-[420px]:inline">{ARENA_OPPONENTS.length} simulados</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ARENA_OPPONENTS.map((opponent) => (
            <OpponentCard
              key={opponent.id}
              opponent={opponent}
              selected={opponent.id === selectedOpponent.id}
              defeated={defeatedOpponents.includes(opponent.id)}
              onSelect={() => setSelectedOpponentId(opponent.id)}
            />
          ))}
        </div>
      </section>

      {selectedOpponent ? (
        <Card tone="solid" padded={false} className="border-soft px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint-2 text-[var(--accent-gold)]">
              <Icon icon={Shield} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="t-eyebrow">Próximo combate</p>
              <h2 className="t-title mt-1 truncate">{selectedOpponent.name}</h2>
              <p className="mt-1 t-body-sm">&ldquo;{selectedOpponent.quote}&rdquo;</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-5"
            onClick={simulate}
            leftIcon={<Icon icon={Swords} size={16} />}
          >
            Simular batalha
          </Button>
          <p className="mt-3 text-center t-caption">Custo: 0 tokens · recompensa: progresso de Arena</p>
        </Card>
      ) : null}

      <ArenaProgressPanel
        wins={wins}
        losses={losses}
        defeatedCount={defeatedOpponents.length}
        totalOpponents={ARENA_OPPONENTS.length}
        history={history}
      />
    </PageShell>
  );
}

const TACTICAL_ACTIONS: Array<{
  value: BattleAction;
  label: string;
  hint: string;
  icon: typeof Target;
}> = [
  { value: 'attack', label: 'Atacar', hint: 'dano e energia', icon: Target },
  { value: 'defend', label: 'Defender', hint: 'reduz impacto', icon: ShieldCheck },
  { value: 'focus', label: 'Focar', hint: 'crítico/especial', icon: Brain },
];

function buildTacticalPlan(action: BattleAction): BattleAction[] {
  if (action === 'defend') {
    return ['defend', 'attack', 'defend', 'focus', 'attack', 'defend', 'attack', 'attack'];
  }
  if (action === 'focus') {
    return ['focus', 'attack', 'focus', 'attack', 'attack', 'defend', 'focus', 'attack'];
  }
  return ['attack', 'attack', 'focus', 'attack', 'attack', 'defend', 'attack', 'attack'];
}

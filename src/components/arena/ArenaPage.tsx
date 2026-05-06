'use client';

import { useCallback, useMemo, useState } from 'react';
import { Shield, Sparkles, Swords } from 'lucide-react';
import { ARENA_OPPONENTS, AVATAR_OUTFITS, SKIN_PACKS } from '@/data';
import type { BattleResult } from '@/types';
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

  const name = useUserStore((s) => s.name);
  const level = useUserStore((s) => s.level);
  const tribe = useUserStore((s) => s.tribe);
  const avatarBase = useUserStore((s) => s.avatarBase);
  const avatarOutfits = useUserStore((s) => s.avatarOutfits);
  const equippedSkinPack = useUserStore((s) => s.equippedSkinPack);
  const wins = useArenaStore((s) => s.wins);
  const losses = useArenaStore((s) => s.losses);
  const defeatedOpponents = useArenaStore((s) => s.defeatedOpponents);
  const history = useArenaStore((s) => s.history);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  const selectedOpponent =
    ARENA_OPPONENTS.find((opponent) => opponent.id === selectedOpponentId) ?? ARENA_OPPONENTS[0];
  const equippedSkin = SKIN_PACKS.find((skin) => skin.id === equippedSkinPack);

  const playerFighter = useMemo(
    () =>
      createPlayerFighter({
        name,
        title: equippedSkin ? equippedSkin.name : tribe === 'guardioes' ? 'Guardião em Modo Livre' : 'EcoWarrior em Modo Livre',
        level,
        skinPackId: equippedSkinPack,
        avatarBase,
        avatarOutfits,
        skinPacks: SKIN_PACKS,
        outfits: AVATAR_OUTFITS,
      }),
    [avatarBase, avatarOutfits, equippedSkin, equippedSkinPack, level, name, tribe]
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
    <PageShell spacing={6}>
      <header className="pt-2">
        <p className="t-eyebrow">Arena Simulada</p>
        <h1 className="t-display mt-1.5 leading-[0.95]">
          Batalhas de <span className="t-italic-soft">impacto</span>
        </h1>
        <p className="mt-3 t-body-sm">
          Combates de IA, sem aposta e sem perder Eco-Tokens. Equipamentos e personagens mudam os atributos.
        </p>
      </header>

      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--bg-primary)]">
            <Avatar
              baseId={avatarBase}
              outfits={avatarOutfits}
              skinPackId={equippedSkinPack}
              size="lg"
              alt={name}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Seu loadout</p>
            <h2 className="t-headline mt-1 truncate">{playerFighter.title}</h2>
            <p className="mt-1 t-caption">Nível {level} · stats calculados localmente</p>
            <BattleStatChips stats={playerFighter.stats} className="mt-3" />
          </div>
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
          <span className="t-caption">{ARENA_OPPONENTS.length} simulados</span>
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

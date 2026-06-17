'use client';

import { Coins, Lock } from 'lucide-react';
import {
  defaultLoadoutForSet,
  GEAR_ITEMS,
  GEAR_SETS,
  GEAR_SLOT_LABELS,
  gearItemsForSet,
} from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/shared/Avatar';
import { BattleStatChips } from '@/components/shared/BattleStatChips';
import { buyGearSet, unlockHint } from '@/lib/skinUnlocks';
import { meetsSkinUnlock } from '@/lib/game/rules';
import { isGearSetComplete } from '@/lib/gear/rules';
import { ModalShell } from './ModalShell';

interface Props {
  id: string;
}

const TIER_LABEL: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

export function GearSetModal({ id }: Props) {
  const setItem = GEAR_SETS.find((item) => item.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const tokens = useUserStore((s) => s.tokens);
  const owned = useUserStore((s) => s.ownedGearSets.includes(id));
  const equipGearSet = useUserStore((s) => s.equipGearSet);
  const ownedGearSets = useUserStore((s) => s.ownedGearSets);
  const level = useUserStore((s) => s.level);
  const badges = useGameStore((s) => s.badges);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const visitedCount = useGameStore((s) => s.visitedPoints.length);
  const completedChallengesCount = useGameStore((s) => s.completedChallenges.length);
  const completedTutorialsCount = useGameStore((s) => s.completedTutorials.length);

  if (!setItem) return null;

  const pieces = gearItemsForSet(id);
  const previewLoadout = defaultLoadoutForSet(id, avatarLoadout.baseId);
  const equipped = isGearSetComplete(
    setItem,
    avatarLoadout,
    new Map(GEAR_ITEMS.map((item) => [item.id, item])),
  );
  const meets = meetsSkinUnlock(setItem.unlock, {
    level,
    tokens,
    badges,
    ownedSkinPacks: ownedGearSets,
    ownedGearSets,
    scannedProductsCount: scannedCount,
    visitedPointsCount: visitedCount,
    completedChallengesCount,
    completedTutorialsCount,
  });
  const locked = !owned && !meets && setItem.unlock.kind !== 'paid';

  const handleEquip = () => {
    equipGearSet(id);
    closeModal();
  };

  const handleBuy = () => {
    if (buyGearSet(id)) {
      useUserStore.getState().equipGearSet(id);
      closeModal();
    }
  };

  return (
    <ModalShell eyebrow="Conjunto" title={setItem.name}>
      <div className="space-y-5">
        <div className="border-soft flex h-56 items-end justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[radial-gradient(circle_at_50%_10%,rgba(126,230,178,0.16),transparent_50%),var(--tint-1)]">
          <Avatar loadout={previewLoadout} size="stage" alt={setItem.name} pose="builder" />
        </div>

        <div className="space-y-2">
          <p className="t-eyebrow text-[var(--accent-gold)]">
            {TIER_LABEL[setItem.tier]} · {setItem.theme}
          </p>
          <p className="t-body">{setItem.tagline}</p>
          <BattleStatChips stats={setItem.setBonusStats} />
        </div>

        <div className="border-soft bg-tint-1 rounded-[var(--radius-md)] px-4 py-3">
          <p className="t-eyebrow">Peças</p>
          <ul className="mt-3 space-y-2">
            {pieces.map((piece) => (
              <li key={piece.id} className="flex items-center gap-3">
                <span className="bg-tint-2 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)]">
                  <Avatar
                    loadout={previewLoadout}
                    size="md"
                    alt={piece.name}
                    pose="builder"
                    highlightSlot={piece.slot}
                    showAura={piece.slot === 'aura'}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-body-sm font-semibold">{piece.name}</p>
                  <p className="t-caption">{GEAR_SLOT_LABELS[piece.slot]}</p>
                </div>
                <BattleStatChips stats={piece.battleStats} compact className="justify-end" />
              </li>
            ))}
          </ul>
        </div>

        {equipped ? (
          <div className="border-active bg-tint-green-2 t-body-sm rounded-[var(--radius-md)] px-4 py-3 text-[var(--primary)]">
            Equipado agora
          </div>
        ) : owned ? (
          <div className="border-soft bg-tint-1 t-body-sm rounded-[var(--radius-md)] px-4 py-3">
            Desbloqueado.
          </div>
        ) : locked ? (
          <div className="border-soft bg-tint-1 t-body-sm flex items-start gap-3 rounded-[var(--radius-md)] px-4 py-3">
            <Icon icon={Lock} size={16} className="mt-0.5 text-[var(--muted-foreground)]" />
            <div>
              <p className="font-semibold text-[var(--foreground)]">Bloqueado</p>
              <p>
                {unlockHint(setItem)} · {setItem.priceTokens} tokens
              </p>
            </div>
          </div>
        ) : (
          <div className="border-active bg-tint-green-1 t-body-sm rounded-[var(--radius-md)] px-4 py-3 text-[var(--primary)]">
            Pronto para liberar.
          </div>
        )}

        {equipped ? (
          <Button variant="secondary" size="lg" fullWidth onClick={closeModal}>
            Fechar
          </Button>
        ) : owned ? (
          <Button variant="primary" size="lg" fullWidth onClick={handleEquip}>
            Aplicar conjunto
          </Button>
        ) : (
          <Button
            variant={locked ? 'secondary' : 'reward'}
            size="lg"
            fullWidth
            onClick={handleBuy}
            disabled={tokens < setItem.priceTokens}
            leftIcon={<Icon icon={Coins} size={16} />}
          >
            {tokens < setItem.priceTokens
              ? 'Tokens insuficientes'
              : locked
                ? `Comprar agora · ${setItem.priceTokens}`
                : `Adquirir · ${setItem.priceTokens}`}
          </Button>
        )}
      </div>
    </ModalShell>
  );
}

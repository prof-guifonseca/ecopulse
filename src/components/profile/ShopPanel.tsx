'use client';

import { Coins } from 'lucide-react';
import {
  EMPTY_GEAR,
  defaultLoadoutForSet,
  GEAR_ITEMS,
  GEAR_SETS,
  GEAR_SLOT_LABELS,
  SHOP_ITEMS,
} from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { Avatar } from '@/components/shared/Avatar';
import { BattleStatChips } from '@/components/shared/BattleStatChips';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ListCard } from '@/components/ui/ListCard';
import { unlockHint } from '@/lib/skinUnlocks';
import { meetsSkinUnlock } from '@/lib/game/rules';
import { cn } from '@/lib/cn';

export function ShopPanel({ tokens }: { tokens: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const openAvatarBuilder = useUIStore((s) => s.openAvatarBuilder);
  const ownedItems = useGameStore((s) => s.ownedShopItems);
  const ownedGearSets = useUserStore((s) => s.ownedGearSets);
  const ownedGearItems = useUserStore((s) => s.ownedGearItems);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const activeSetId = avatarLoadout.activeSetId;
  const level = useUserStore((s) => s.level);
  const badges = useGameStore((s) => s.badges);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const visitedCount = useGameStore((s) => s.visitedPoints.length);
  const completedChallengesCount = useGameStore((s) => s.completedChallenges.length);
  const completedTutorialsCount = useGameStore((s) => s.completedTutorials.length);
  const ruleSnapshot = {
    level,
    tokens,
    badges,
    ownedSkinPacks: ownedGearSets,
    ownedGearSets,
    scannedProductsCount: scannedCount,
    visitedPointsCount: visitedCount,
    completedChallengesCount,
    completedTutorialsCount,
  };

  return (
    <div className="space-y-6">
      <Card tone="solid" padded={false} className="px-5 py-4">
        <div>
          <p className="t-eyebrow">Carteira</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <AnimatedNumber
              value={tokens}
              className="t-headline leading-[1] text-[var(--accent-green)]"
            />
            <span className="t-body-sm">tokens</span>
          </div>
          <p className="mt-2 t-caption">Ganhos no app.</p>
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Conjuntos</h2>
          <span className="t-caption">{ownedGearSets.length}/{GEAR_SETS.length} desbloqueados</span>
        </div>
        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GEAR_SETS.map((setItem) => {
            const owned = ownedGearSets.includes(setItem.id);
            const equipped = activeSetId === setItem.id;
            const meets = meetsSkinUnlock(setItem.unlock, ruleSnapshot);
            const locked = !owned && !meets && setItem.unlock.kind !== 'paid';
            const previewLoadout = defaultLoadoutForSet(setItem.id, avatarLoadout.baseId);
            return (
              <button
                key={setItem.id}
                onClick={() => openModal({ kind: 'gearSet', id: setItem.id })}
                className="group flex w-[168px] shrink-0 flex-col rounded-[var(--radius-md)] border bg-tint-1 text-left transition-colors hover:border-[var(--line-strong)] focus:outline-none"
                style={{
                  borderColor: equipped ? 'var(--line-active)' : 'var(--line-soft)',
                  backgroundColor: equipped ? 'var(--tint-green-2)' : undefined,
                }}
              >
                <div
                  className={cn(
                    'flex h-[148px] items-end justify-center overflow-hidden rounded-t-[var(--radius-md)] bg-[radial-gradient(circle_at_50%_10%,rgba(126,230,178,0.14),transparent_48%),var(--tint-2)]',
                    locked && 'opacity-40 grayscale'
                  )}
                >
                  <Avatar loadout={previewLoadout} size="stage" alt={setItem.name} pose="builder" />
                </div>
                <div className="space-y-1 px-3 py-3">
                  <h3 className="t-title truncate">{setItem.name}</h3>
                  <p className="t-caption truncate">
                    {equipped ? (
                      <span className="text-[var(--accent-green)]">Equipado</span>
                    ) : owned ? (
                      'Possuído'
                    ) : locked ? (
                      `Bloq. ${unlockHint(setItem)}`
                    ) : (
                      <span className="text-[var(--accent-gold)]">{setItem.priceTokens} tokens</span>
                    )}
                  </p>
                  <BattleStatChips stats={setItem.setBonusStats} compact className="mt-2" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Equipamentos</h2>
          <span className="t-caption">Peças</span>
        </div>
        <ListCard>
          {GEAR_ITEMS.map((item) => {
            const owned = ownedGearItems.includes(item.id);
            const equippedHere = avatarLoadout.equippedGear[item.slot] === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={openAvatarBuilder}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-tint-2"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border-soft bg-[radial-gradient(circle_at_50%_12%,rgba(126,230,178,0.12),transparent_50%),var(--tint-2)]">
                    <Avatar
                      loadout={previewLoadoutForGear(avatarLoadout.baseId, item)}
                      size="lg"
                      alt={item.name}
                      highlightSlot={item.slot}
                      showAura={item.slot === 'aura'}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="t-title truncate">{item.name}</div>
                    <p className="mt-0.5 t-caption">{GEAR_SLOT_LABELS[item.slot]} · {item.tier}</p>
                    <BattleStatChips stats={item.battleStats} compact className="mt-1.5" />
                  </div>
                  <span
                    className={cn(
                      'shrink-0 t-caption font-semibold',
                      equippedHere
                        ? 'text-[var(--accent-green)]'
                        : owned
                          ? 'text-[var(--text-secondary)]'
                          : 'text-[var(--accent-gold)]'
                    )}
                  >
                    {equippedHere ? 'Equipado' : owned ? 'Possuído' : `${item.priceTokens}t`}
                  </span>
                </button>
              </li>
            );
          })}
        </ListCard>
      </section>

      <section>
        <h2 className="mb-3 t-title">Outros</h2>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            return (
              <button key={item.id} onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="text-left">
                <Card tone="solid" padded={false} className="flex h-full flex-col gap-2 px-4 py-4">
                  <span className="text-3xl leading-none">{item.emoji}</span>
                  <div className="t-title">{item.name}</div>
                  <p className="t-caption">{item.desc}</p>
                  <div
                    className={cn(
                      'mt-auto inline-flex items-center gap-1 t-body-sm font-semibold',
                      isOwned ? 'text-[var(--accent-green)]' : 'text-[var(--accent-gold)]'
                    )}
                  >
                    {isOwned ? (
                      'Adquirido'
                    ) : (
                      <>
                        <Icon icon={Coins} size={12} />
                        {item.price}
                      </>
                    )}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function previewLoadoutForGear(baseId: string | null, item: (typeof GEAR_ITEMS)[number]) {
  return {
    baseId,
    equippedGear: { ...EMPTY_GEAR, [item.slot]: item.id },
    activeSetId: null,
  };
}

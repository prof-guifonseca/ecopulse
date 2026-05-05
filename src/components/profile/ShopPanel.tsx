'use client';

import { ChevronRight, Coins } from 'lucide-react';
import {
  AVATAR_OUTFITS,
  SHOP_ITEMS,
  SKIN_PACKS,
  TOKEN_PACKS,
} from '@/data';
import type { OutfitSlot, SkinUnlock } from '@/types';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { SkinPackArt } from '@/components/skins/SkinPackArt';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { unlockHint } from '@/lib/skinUnlocks';
import { formatCurrencyCents } from '@/lib/format';
import { cn } from '@/lib/cn';

const SLOT_LABELS: Record<OutfitSlot, string> = {
  hat: 'chapéu',
  glasses: 'óculos',
  shirt: 'roupa',
  accessory: 'acessório',
  background: 'fundo',
  weapon: 'arma',
  hairstyle: 'cabelo',
};

/** Mirrors checkSkinUnlocks logic for the locked-state visual cue. */
function unlockMet(unlock: SkinUnlock): boolean {
  const user = useUserStore.getState();
  const game = useGameStore.getState();
  switch (unlock.kind) {
    case 'paid':
      return false;
    case 'level':
      return user.level >= unlock.value;
    case 'badge':
      return game.badges.includes(unlock.id);
    case 'count':
      switch (unlock.metric) {
        case 'scans':
          return game.scannedProducts.length >= unlock.value;
        case 'visits':
          return game.visitedPoints.length >= unlock.value;
        case 'challenges':
          return game.completedChallenges.length >= unlock.value;
        case 'tutorials':
          return game.completedTutorials.length >= unlock.value;
      }
      return false;
  }
}

export function ShopPanel({ tokens }: { tokens: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const openAvatarBuilder = useUIStore((s) => s.openAvatarBuilder);
  const ownedItems = useGameStore((s) => s.ownedShopItems);
  const ownedSkinPacks = useUserStore((s) => s.ownedSkinPacks);
  const equippedSkinPack = useUserStore((s) => s.equippedSkinPack);
  const ownedOutfits = useUserStore((s) => s.ownedOutfits);
  const outfitsEquipped = useUserStore((s) => s.avatarOutfits);

  return (
    <div className="space-y-6">
      {/* Carteira */}
      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="t-eyebrow">Carteira</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="t-display leading-[1] text-[var(--accent-green)]">{tokens}</span>
              <span className="t-body-sm">Eco-Tokens</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => openModal({ kind: 'greenMarketInfo' })}>
            Como funciona
          </Button>
        </div>
      </Card>

      {/* Personagens — SkinPacks como cards ilustrados em carousel horizontal */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Personagens</h2>
          <span className="t-caption">{ownedSkinPacks.length}/{SKIN_PACKS.length} desbloqueados</span>
        </div>
        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKIN_PACKS.map((skin) => {
            const owned = ownedSkinPacks.includes(skin.id);
            const equipped = equippedSkinPack === skin.id;
            const meets = unlockMet(skin.unlock);
            const locked = !owned && !meets && skin.unlock.kind !== 'paid';
            return (
              <button
                key={skin.id}
                onClick={() => openModal({ kind: 'skinPack', id: skin.id })}
                className="group flex w-[140px] shrink-0 flex-col rounded-[var(--radius-md)] border bg-[var(--tint-1)] text-left transition-colors hover:border-[var(--line-strong)] focus:outline-none"
                style={{
                  borderColor: equipped ? 'var(--line-active)' : 'var(--line-soft)',
                  backgroundColor: equipped ? 'var(--tint-green-2)' : undefined,
                }}
              >
                <div
                  className={cn(
                    'flex h-[120px] items-center justify-center overflow-hidden rounded-t-[var(--radius-md)]',
                    locked && 'opacity-40 grayscale'
                  )}
                >
                  <SkinPackArt id={skin.id} size="lg" />
                </div>
                <div className="space-y-1 px-3 py-3">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="t-title truncate">{skin.name}</h3>
                  </div>
                  <p className="t-caption">
                    {equipped
                      ? <span className="text-[var(--accent-green)]">Equipado</span>
                      : owned
                      ? 'Possuído · toque pra equipar'
                      : locked
                      ? `🔒 ${unlockHint(skin)}`
                      : <span className="text-[var(--accent-gold)]">{skin.priceTokens} tokens</span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Acessórios — peças soltas para modo composite */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Acessórios</h2>
          <span className="t-caption">Modo livre</span>
        </div>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {AVATAR_OUTFITS.map((item) => {
            const owned = ownedOutfits.includes(item.id);
            const equippedHere = outfitsEquipped[item.slot] === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={openAvatarBuilder}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line-soft)] bg-[var(--tint-2)] text-lg">
                    {item.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="t-title truncate">{item.name}</div>
                    <p className="mt-0.5 t-caption">{SLOT_LABELS[item.slot]} · {item.tier}</p>
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
                    {equippedHere ? 'Equipado' : owned ? 'Possuído' : `${item.price}t`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Eco-Tokens — packs pagos */}
      <section>
        <h2 className="mb-3 t-title">Eco-Tokens</h2>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {TOKEN_PACKS.map((pack) => (
            <li key={pack.id}>
              <button
                onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="t-title truncate">{pack.name}</h3>
                    {pack.featured ? (
                      <Chip asStatic active className="text-[var(--accent-gold)]">{pack.badge}</Chip>
                    ) : null}
                  </div>
                  <p className="mt-0.5 t-caption">
                    {pack.tokens} tokens · {formatCurrencyCents(pack.priceInCents)}
                  </p>
                </div>
                <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Outros — SHOP_ITEMS originais */}
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


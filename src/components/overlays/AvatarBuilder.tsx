'use client';

import { useState, type ReactNode } from 'react';
import { Check, Coins, Lock, X } from 'lucide-react';
import { AVATAR_BASES, AVATAR_OUTFITS, SKIN_PACKS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { unlockBadge } from '@/lib/gameActions';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { BattleStatChips } from '@/components/shared/BattleStatChips';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Tabs } from '@/components/ui/Tabs';
import { SkinPackArt } from '@/components/skins/SkinPackArt';
import { unlockHint } from '@/lib/skinUnlocks';
import { cn } from '@/lib/cn';
import type { OutfitSlot } from '@/types';

/**
 * Small selectable tile, inlined here because AvatarBuilder
 * is its only consumer.
 */
function PickerTile({
  selected,
  onClick,
  disabled,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-4 py-4 text-center transition-all duration-150 active:scale-[0.99]',
        selected
          ? 'border-[var(--line-active)] bg-tint-green-2 shadow-[var(--shadow-glow)]'
          : 'border-[var(--line-soft)] bg-tint-1 hover:border-[var(--line-strong)]',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

const SLOT_LABELS: Record<OutfitSlot, string> = {
  hat: 'Chapéu',
  glasses: 'Óculos',
  shirt: 'Camisa',
  accessory: 'Acessório',
  background: 'Fundo',
  weapon: 'Arma',
  hairstyle: 'Cabelo',
};

const TAB_ITEMS = [
  { value: 'persona', label: 'Personagem' },
  { value: 'base', label: 'Base' },
  { value: 'hairstyle', label: SLOT_LABELS.hairstyle },
  { value: 'hat', label: SLOT_LABELS.hat },
  { value: 'glasses', label: SLOT_LABELS.glasses },
  { value: 'shirt', label: SLOT_LABELS.shirt },
  { value: 'weapon', label: SLOT_LABELS.weapon },
  { value: 'accessory', label: SLOT_LABELS.accessory },
  { value: 'background', label: SLOT_LABELS.background },
] as const;

type TabValue = (typeof TAB_ITEMS)[number]['value'];

export function AvatarBuilder() {
  const close = useUIStore((s) => s.closeAvatarBuilder);
  const showToast = useUIStore((s) => s.showToast);
  const openModal = useUIStore((s) => s.openModal);

  const user = useUserStore();
  const [baseId, setBaseId] = useState(user.avatarBase ?? AVATAR_BASES[0].id);
  const [outfits, setOutfits] = useState(user.avatarOutfits);
  const [skinPackId, setSkinPackId] = useState<string | null>(user.equippedSkinPack);
  const [tab, setTab] = useState<TabValue>('persona');

  const composite = skinPackId === null;

  const save = () => {
    user.setProfile({ avatarBase: baseId, avatarOutfits: outfits });
    user.equipSkinPack(skinPackId);
    if (composite) {
      const equippedCount = Object.values(outfits).filter(Boolean).length;
      if (equippedCount >= 3) unlockBadge('fashionista');
    }
    showToast('Avatar atualizado', 'success');
    close();
  };

  const toggleOutfit = (slot: OutfitSlot, id: string) => {
    setOutfits((prev) => ({ ...prev, [slot]: prev[slot] === id ? null : id }));
  };

  const buyOutfit = (id: string) => {
    if (user.ownedOutfits.includes(id)) return true;
    const outfit = AVATAR_OUTFITS.find((o) => o.id === id);
    if (!outfit) return false;
    if (!user.spendTokens(outfit.price)) {
      showToast('Eco-Tokens insuficientes', 'info');
      return false;
    }
    user.addOwnedOutfit(id);
    showToast(`${outfit.name} adquirido`, 'reward');
    return true;
  };

  const handleSelectSkin = (id: string | null) => {
    if (id === null) {
      setSkinPackId(null);
      return;
    }
    if (!user.ownedSkinPacks.includes(id)) {
      // Open the SkinPack detail modal so the user can see details and buy/unlock.
      openModal({ kind: 'skinPack', id });
      return;
    }
    setSkinPackId(id);
  };

  return (
    <div className="animate-fade-in bg-scrim-strong fixed inset-0 z-[700] flex justify-center">
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[var(--bg-primary)]">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line-soft)] bg-[var(--glass-bg)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4 backdrop-blur-md">
          <IconButton
            onClick={close}
            aria-label="Fechar"
            icon={<Icon icon={X} size={18} />}
          />
          <div className="flex-1 text-center">
            <div className="t-eyebrow">Avatar</div>
            <h2 className="t-title">Personalizar</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={save}>
            Salvar
          </Button>
        </header>

        {/* Live preview */}
        <div className="flex flex-col items-center px-4 py-6">
          <div className="rounded-[var(--radius-lg)] border-soft bg-tint-1 p-6">
            <Avatar
              baseId={baseId}
              outfits={outfits}
              skinPackId={skinPackId}
              size="xl"
            />
          </div>
          {!composite ? (
            <p className="mt-3 max-w-[28ch] text-center t-caption">
              Personagem equipado bloqueia as peças soltas. Volte ao{' '}
              <button
                className="font-semibold text-[var(--accent-green)] underline-offset-2 hover:underline"
                onClick={() => setSkinPackId(null)}
              >
                Modo Livre
              </button>{' '}
              pra customizar.
            </p>
          ) : null}
        </div>

        <div className="px-3">
          <Tabs<TabValue> items={TAB_ITEMS} value={tab} onChange={setTab} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {tab === 'persona' ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Modo Livre option */}
              <PickerTile
                selected={composite}
                onClick={() => handleSelectSkin(null)}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-soft bg-tint-2">
                  <Avatar baseId={baseId} outfits={outfits} size="sm" />
                </div>
                <span className="t-title">Modo Livre</span>
                <span className="t-caption">Misture peças</span>
              </PickerTile>

              {SKIN_PACKS.map((skin) => {
                const owned = user.ownedSkinPacks.includes(skin.id);
                const selected = skinPackId === skin.id;
                const locked = !owned;
                return (
                  <PickerTile
                    key={skin.id}
                    selected={selected}
                    onClick={() => handleSelectSkin(skin.id)}
                  >
                    <div
                      className={cn(
                        'flex h-16 w-16 items-center justify-center rounded-full',
                        locked && 'opacity-50 grayscale'
                      )}
                    >
                      <SkinPackArt id={skin.id} size="md" />
                    </div>
                    <span className="t-title">{skin.name}</span>
                    <BattleStatChips stats={skin.battleStats} compact className="justify-center" />
                    {owned ? (
                      <span className="t-caption">{selected ? 'Equipado' : 'Toque pra equipar'}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 t-caption">
                        <Icon icon={Lock} size={11} />
                        {unlockHint(skin)}
                      </span>
                    )}
                  </PickerTile>
                );
              })}
            </div>
          ) : !composite ? (
            // Other tabs are visible but disabled when a SkinPack is equipped.
            <div className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-6 text-center">
              <p className="t-body-sm">
                Você está usando um personagem completo. Peças soltas ficam ocultas até você
                voltar ao Modo Livre.
              </p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSkinPackId(null)}>
                Ir pro Modo Livre
              </Button>
            </div>
          ) : tab === 'base' ? (
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_BASES.map((b) => {
                const active = baseId === b.id;
                return (
                  <PickerTile
                    key={b.id}
                    selected={active}
                    onClick={() => setBaseId(b.id)}
                  >
                    <Avatar baseId={b.id} size="md" />
                    <span className="t-caption font-semibold text-[var(--text-primary)]">{b.name}</span>
                  </PickerTile>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {AVATAR_OUTFITS.filter((o) => o.slot === tab).length === 0 ? (
                <p className="col-span-2 t-caption text-center">Sem peças nesse slot ainda.</p>
              ) : null}
              {AVATAR_OUTFITS.filter((o) => o.slot === tab).map((o) => {
                const owned = user.ownedOutfits.includes(o.id);
                const equipped = outfits[o.slot] === o.id;
                const act = () => {
                  if (!owned) {
                    if (buyOutfit(o.id)) toggleOutfit(tab as OutfitSlot, o.id);
                  } else {
                    toggleOutfit(tab as OutfitSlot, o.id);
                  }
                };
                return (
                  <PickerTile
                    key={o.id}
                    selected={equipped}
                    onClick={act}
                    className="relative"
                  >
                    {equipped ? (
                      <span className="gradient-primary absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--on-primary)]">
                        <Icon icon={Check} size={12} strokeWidth={2.4} />
                      </span>
                    ) : null}
                    <span className="text-4xl leading-none">{o.emoji}</span>
                    <span className="t-title">{o.name}</span>
                    <BattleStatChips stats={o.battleStats} compact className="justify-center" />
                    {owned ? (
                      <span className="t-caption">
                        {equipped ? 'Equipado' : 'Toque para equipar'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 t-body-sm font-semibold text-[var(--accent-gold)]">
                        <Icon icon={Coins} size={12} />
                        {o.price}
                      </span>
                    )}
                  </PickerTile>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

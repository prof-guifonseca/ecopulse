'use client';

import { useState } from 'react';
import { AVATAR_BASES, AVATAR_OUTFITS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { unlockBadge } from '@/lib/gameActions';
import { Avatar } from '@/components/shared/Avatar';
import { cn } from '@/lib/cn';
import type { OutfitSlot } from '@/types';

const SLOT_LABELS: Record<OutfitSlot, string> = {
  hat: 'Chapéu',
  glasses: 'Óculos',
  shirt: 'Camisa',
  accessory: 'Acessório',
  background: 'Fundo',
};

export function AvatarBuilder() {
  const close = useUIStore((s) => s.closeAvatarBuilder);
  const showToast = useUIStore((s) => s.showToast);

  const user = useUserStore();
  const [baseId, setBaseId] = useState(user.avatarBase ?? AVATAR_BASES[0].id);
  const [outfits, setOutfits] = useState(user.avatarOutfits);
  const [tab, setTab] = useState<'base' | OutfitSlot>('base');

  const save = () => {
    user.setProfile({ avatarBase: baseId, avatarOutfits: outfits });
    const equipped = Object.values(outfits).filter(Boolean).length;
    if (equipped >= 3) unlockBadge('fashionista');
    showToast('Avatar atualizado! ✨', 'success');
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
      showToast('Tokens insuficientes', 'info');
      return false;
    }
    user.addOwnedOutfit(id);
    showToast(`${outfit.name} adquirido! ${outfit.emoji}`, 'reward');
    return true;
  };

  return (
    <div className="fixed inset-0 z-[700] flex flex-col bg-bg-primary" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="glass flex items-center justify-between border-b px-4 py-3">
        <button onClick={close} className="text-xl" aria-label="Fechar">✕</button>
        <h2 className="font-display text-base font-bold">Personalizar Avatar</h2>
        <button onClick={save} className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>
          Salvar
        </button>
      </div>

      <div className="flex flex-col items-center py-6">
        <Avatar baseId={baseId} outfits={outfits} size="xl" />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 pb-0">
        {(['base', 'hat', 'glasses', 'shirt', 'accessory', 'background'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
              tab === t ? 'border-accent-green text-text-primary' : 'border-transparent text-text-secondary'
            )}
          >
            {t === 'base' ? 'Base' : SLOT_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'base' ? (
          <div className="grid grid-cols-3 gap-3">
            {AVATAR_BASES.map((b) => (
              <button
                key={b.id}
                onClick={() => setBaseId(b.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md border-2 p-2 transition-colors',
                  baseId === b.id ? 'border-accent-green bg-accent-green/10' : 'border-transparent bg-bg-tertiary'
                )}
              >
                <Avatar baseId={b.id} size="md" />
                <span className="text-[10px] font-medium">{b.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {AVATAR_OUTFITS.filter((o) => o.slot === tab).map((o) => {
              const owned = user.ownedOutfits.includes(o.id);
              const equipped = outfits[o.slot] === o.id;
              const act = () => {
                if (!owned) {
                  if (buyOutfit(o.id)) toggleOutfit(tab, o.id);
                } else {
                  toggleOutfit(tab, o.id);
                }
              };
              return (
                <button
                  key={o.id}
                  onClick={act}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-md border-2 p-3 transition-colors',
                    equipped
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-transparent bg-bg-tertiary'
                  )}
                >
                  <span className="text-3xl">{o.emoji}</span>
                  <span className="text-xs font-semibold">{o.name}</span>
                  {owned ? (
                    <span className="text-[10px] text-text-secondary">
                      {equipped ? 'Equipado' : 'Toque para equipar'}
                    </span>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'var(--accent-gold)' }}>
                      🪙 {o.price}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

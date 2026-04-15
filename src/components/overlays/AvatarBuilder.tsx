'use client';

import { useState } from 'react';
import { Check, Coins, X } from 'lucide-react';
import { AVATAR_BASES, AVATAR_OUTFITS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { unlockBadge } from '@/lib/gameActions';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/cn';
import type { OutfitSlot } from '@/types';

const SLOT_LABELS: Record<OutfitSlot, string> = {
  hat: 'Chapéu',
  glasses: 'Óculos',
  shirt: 'Camisa',
  accessory: 'Acessório',
  background: 'Fundo',
};

const TAB_ITEMS = [
  { value: 'base', label: 'Base' },
  { value: 'hat', label: SLOT_LABELS.hat },
  { value: 'glasses', label: SLOT_LABELS.glasses },
  { value: 'shirt', label: SLOT_LABELS.shirt },
  { value: 'accessory', label: SLOT_LABELS.accessory },
  { value: 'background', label: SLOT_LABELS.background },
] as const;

type TabValue = (typeof TAB_ITEMS)[number]['value'];

export function AvatarBuilder() {
  const close = useUIStore((s) => s.closeAvatarBuilder);
  const showToast = useUIStore((s) => s.showToast);

  const user = useUserStore();
  const [baseId, setBaseId] = useState(user.avatarBase ?? AVATAR_BASES[0].id);
  const [outfits, setOutfits] = useState(user.avatarOutfits);
  const [tab, setTab] = useState<TabValue>('base');

  const save = () => {
    user.setProfile({ avatarBase: baseId, avatarOutfits: outfits });
    const equipped = Object.values(outfits).filter(Boolean).length;
    if (equipped >= 3) unlockBadge('fashionista');
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

  return (
    <div
      className="fixed inset-0 z-[700] flex justify-center bg-[rgba(5,10,8,0.92)]"
      style={{ animation: 'fadeIn 0.3s ease' }}
    >
      <div
        className="flex h-full w-full max-w-[var(--shell-width)] flex-col"
        style={{ background: 'var(--bg-primary)' }}
      >
        <header
          className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line-soft)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4"
          style={{ background: 'rgba(10,18,13,0.94)', backdropFilter: 'blur(14px)' }}
        >
          <button
            onClick={close}
            aria-label="Fechar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/6 hover:text-text-primary"
          >
            <Icon icon={X} size={18} />
          </button>
          <div className="flex-1 text-center">
            <div className="display-eyebrow">Avatar</div>
            <h2 className="text-[1rem] font-semibold leading-tight text-text-primary">Personalizar</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={save}>
            Salvar
          </Button>
        </header>

        <div className="flex flex-col items-center px-4 py-6">
          <div
            className="rounded-[28px] border border-[var(--line-soft)] p-6"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <Avatar baseId={baseId} outfits={outfits} size="xl" />
          </div>
        </div>

        <div className="px-3">
          <Tabs<TabValue> items={TAB_ITEMS} value={tab} onChange={setTab} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {tab === 'base' ? (
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_BASES.map((b) => {
                const active = baseId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBaseId(b.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-[var(--radius-md)] border p-3 transition-colors',
                      active
                        ? 'border-[rgba(141,219,152,0.55)] bg-[rgba(141,219,152,0.08)]'
                        : 'border-[var(--line-soft)] bg-white/[0.02] hover:bg-white/[0.04]'
                    )}
                  >
                    <Avatar baseId={b.id} size="md" />
                    <span className="text-[0.78rem] font-semibold text-text-primary">{b.name}</span>
                  </button>
                );
              })}
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
                      'relative flex flex-col items-center gap-2 rounded-[var(--radius-md)] border p-4 transition-colors',
                      equipped
                        ? 'border-[rgba(141,219,152,0.55)] bg-[rgba(141,219,152,0.08)]'
                        : 'border-[var(--line-soft)] bg-white/[0.02] hover:bg-white/[0.04]'
                    )}
                  >
                    {equipped ? (
                      <span
                        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: 'var(--gradient-primary)', color: '#0a140e' }}
                      >
                        <Icon icon={Check} size={12} strokeWidth={2.4} />
                      </span>
                    ) : null}
                    <span className="text-4xl leading-none">{o.emoji}</span>
                    <span className="text-[0.85rem] font-semibold text-text-primary">{o.name}</span>
                    {owned ? (
                      <span className="text-[0.72rem] text-text-muted">
                        {equipped ? 'Equipado' : 'Toque para equipar'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-accent-gold">
                        <Icon icon={Coins} size={12} />
                        {o.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

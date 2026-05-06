'use client';

import { Coins } from 'lucide-react';
import { SHOP_ITEMS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';

interface Props {
  id: string;
}

export function ShopItemModal({ id }: Props) {
  const item = SHOP_ITEMS.find((s) => s.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);
  const owned = useGameStore((s) => s.ownedShopItems.includes(id));
  const addOwned = useGameStore((s) => s.addOwnedShopItem);
  const tokens = useUserStore((s) => s.tokens);
  const spend = useUserStore((s) => s.spendTokens);

  if (!item) return null;

  const buy = () => {
    if (owned) return;
    if (!spend(item.price)) {
      showToast('Tokens insuficientes', 'info');
      return;
    }
    addOwned(id);
    showToast(`${item.name} adquirido!`, 'reward');
    fireConfetti();
    closeModal();
  };

  const disabled = owned || tokens < item.price;

  return (
    <ModalShell eyebrow="Loja" title={item.name}>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-soft bg-tint-2 text-5xl">
          {item.emoji}
        </div>
        <p className="t-body-sm mt-3 max-w-[32ch]">{item.desc}</p>

        <div className="t-headline mt-5 inline-flex items-center gap-1.5 text-[var(--accent-gold)]">
          <Icon icon={Coins} size={22} />
          {item.price}
        </div>
        <p className="t-caption mt-1">{tokens} tokens disponíveis</p>

        <Button
          variant="reward"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={buy}
          disabled={disabled}
        >
          {owned ? 'Já adquirido' : tokens < item.price ? 'Tokens insuficientes' : 'Comprar'}
        </Button>
      </div>
    </ModalShell>
  );
}

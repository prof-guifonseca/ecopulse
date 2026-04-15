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
      showToast('Eco-Tokens insuficientes', 'info');
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
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/[0.04] text-5xl">
          {item.emoji}
        </div>
        <p className="mt-3 max-w-[32ch] text-[0.88rem] leading-5 text-text-muted">{item.desc}</p>

        <div className="mt-5 inline-flex items-center gap-1.5 text-[1.6rem] font-semibold text-accent-gold">
          <Icon icon={Coins} size={22} />
          {item.price}
        </div>
        <p className="mt-1 text-[0.78rem] text-text-muted">Você tem {tokens} Eco-Tokens</p>

        <Button
          variant="reward"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={buy}
          disabled={disabled}
        >
          {owned ? 'Já adquirido' : tokens < item.price ? 'Eco-Tokens insuficientes' : 'Comprar'}
        </Button>
      </div>
    </ModalShell>
  );
}

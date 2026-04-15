'use client';

import { SHOP_ITEMS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Modal } from './Modal';

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
      showToast('Tokens insuficientes 😢', 'info');
      return;
    }
    addOwned(id);
    showToast(`${item.name} adquirido! ${item.emoji}`, 'reward');
    fireConfetti();
    closeModal();
  };

  return (
    <Modal onClose={closeModal}>
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bg-tertiary text-5xl">
          {item.emoji}
        </div>
        <h3 className="mt-3 text-lg font-semibold">{item.name}</h3>
        <p className="mt-1 text-xs text-text-secondary">{item.desc}</p>

        <div className="mt-4 text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>
          🪙 {item.price}
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          Você tem {tokens} Eco-Tokens
        </p>

        <button
          type="button"
          onClick={buy}
          disabled={owned || tokens < item.price}
          className="mt-5 w-full rounded-full py-3 text-sm font-bold text-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--gradient-gold)' }}
        >
          {owned ? '✅ Já adquirido' : tokens < item.price ? 'Tokens insuficientes' : 'Comprar'}
        </button>
      </div>
    </Modal>
  );
}

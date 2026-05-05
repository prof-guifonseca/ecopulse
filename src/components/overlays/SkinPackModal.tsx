'use client';

import { Coins, Lock } from 'lucide-react';
import { SKIN_PACKS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SkinPackArt } from '@/components/skins/SkinPackArt';
import { buySkinPack, unlockHint } from '@/lib/skinUnlocks';
import { ModalShell } from './ModalShell';
import type { SkinUnlock } from '@/types';

interface Props {
  id: string;
}

const TIER_LABEL: Record<string, string> = {
  starter: 'Starter',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
};

export function SkinPackModal({ id }: Props) {
  const skin = SKIN_PACKS.find((s) => s.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  const owned = useUserStore((s) => s.ownedSkinPacks.includes(id));
  const equipped = useUserStore((s) => s.equippedSkinPack === id);
  const equipSkinPack = useUserStore((s) => s.equipSkinPack);

  if (!skin) return null;

  const meets = checkUnlock(skin.unlock);
  const locked = !owned && !meets && skin.unlock.kind !== 'paid';

  const handleEquip = () => {
    equipSkinPack(id);
    closeModal();
  };
  const handleUnequip = () => {
    equipSkinPack(null);
    closeModal();
  };
  const handleBuy = () => {
    if (buySkinPack(id)) {
      // Auto-equip on purchase as a small reward.
      useUserStore.getState().equipSkinPack(id);
      closeModal();
    }
  };

  return (
    <ModalShell eyebrow="Personagem" title={skin.name}>
      <div className="space-y-5">
        {/* Hero illustration */}
        <div className="flex h-44 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          <SkinPackArt id={skin.id} size="xl" />
        </div>

        <div className="space-y-2">
          <p className="t-eyebrow text-[var(--accent-gold)]">{TIER_LABEL[skin.tier]} · {skin.theme}</p>
          <p className="t-body">{skin.tagline}</p>
        </div>

        {/* Status / unlock hint */}
        {equipped ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--line-active)] bg-[var(--tint-green-2)] px-4 py-3 t-body-sm text-[var(--accent-green)]">
            ✓ Equipado agora
          </div>
        ) : owned ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-4 py-3 t-body-sm">
            Você já desbloqueou. Toque pra equipar.
          </div>
        ) : locked ? (
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-4 py-3 t-body-sm">
            <Icon icon={Lock} size={16} className="mt-0.5 text-[var(--text-muted)]" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Bloqueada</p>
              <p>Para desbloquear: {unlockHint(skin)} · ou compre direto por {skin.priceTokens} tokens.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-[var(--line-active)] bg-[var(--tint-green-1)] px-4 py-3 t-body-sm text-[var(--accent-green)]">
            Critério atingido. Pronto para comprar.
          </div>
        )}

        {/* Primary CTA */}
        {equipped ? (
          <Button variant="secondary" size="lg" fullWidth onClick={handleUnequip}>
            Tirar
          </Button>
        ) : owned ? (
          <Button variant="primary" size="lg" fullWidth onClick={handleEquip}>
            Equipar
          </Button>
        ) : (
          <Button
            variant={locked ? 'secondary' : 'reward'}
            size="lg"
            fullWidth
            onClick={handleBuy}
            leftIcon={<Icon icon={Coins} size={16} />}
          >
            {locked ? `Comprar agora · ${skin.priceTokens}` : `Adquirir · ${skin.priceTokens}`}
          </Button>
        )}
      </div>
    </ModalShell>
  );
}

function checkUnlock(unlock: SkinUnlock): boolean {
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

'use client';

import { useUIStore } from '@/store/uiStore';
import { Toasts } from './Toasts';
import { Confetti } from './Confetti';
import { ProductDetailModal } from './ProductDetailModal';
import { MapPointModal } from './MapPointModal';
import { TutorialModal } from './TutorialModal';
import { ShopItemModal } from './ShopItemModal';
import { SkinPackModal } from './SkinPackModal';
import { CommentsModal } from './CommentsModal';
import { AvatarBuilder } from './AvatarBuilder';

/**
 * Single mount that renders any currently-active overlay based on UI store state.
 */
export function Overlays() {
  const modal = useUIStore((s) => s.modal);
  const avatarOpen = useUIStore((s) => s.avatarBuilderOpen);

  return (
    <>
      <Toasts />
      <Confetti />
      {modal?.kind === 'product' && <ProductDetailModal id={modal.id} />}
      {modal?.kind === 'mapPoint' && <MapPointModal id={modal.id} />}
      {modal?.kind === 'tutorial' && <TutorialModal id={modal.id} />}
      {modal?.kind === 'shopItem' && <ShopItemModal id={modal.id} />}
      {modal?.kind === 'skinPack' && <SkinPackModal id={modal.id} />}
      {modal?.kind === 'postComments' && <CommentsModal id={modal.id} />}
      {avatarOpen && <AvatarBuilder />}
    </>
  );
}

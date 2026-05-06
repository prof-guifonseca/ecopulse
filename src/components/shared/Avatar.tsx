'use client';

import type { AvatarLoadout, AvatarOutfits, AvatarPose, GearSlot } from '@/types';
import { loadoutFromLegacy } from '@/data';
import { AvatarRenderer } from './AvatarRenderer';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'stage' | 'duel';
const SIZE_MAP: Record<Size, number> = { sm: 36, md: 56, lg: 80, xl: 120, stage: 124, duel: 152 };

interface Props {
  baseId?: string | null;
  outfits?: AvatarOutfits;
  size?: Size;
  className?: string;
  /** Legacy fallback. SkinPack ids are converted into wearable GearSet loadouts. */
  skinPackId?: string | null;
  /** Canonical wearable avatar snapshot. */
  loadout?: AvatarLoadout | null;
  /** Optional accessible label. When provided, the avatar renders as role="img"
   *  with the label; when omitted, it stays decorative (aria-hidden). */
  alt?: string;
  mirror?: boolean;
  pose?: AvatarPose;
  highlightSlot?: GearSlot;
  showAura?: boolean;
}

export function Avatar({
  baseId,
  outfits,
  size = 'md',
  className,
  skinPackId,
  loadout,
  alt,
  mirror,
  pose,
  highlightSlot,
  showAura,
}: Props) {
  const sz = SIZE_MAP[size];

  if (!loadout && !baseId && !skinPackId) {
    const a11y = alt ? { role: 'img' as const, 'aria-label': alt } : { 'aria-hidden': true };
    return (
      <div
        className={className}
        {...a11y}
        style={{
          width: sz,
          height: sz,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
        }}
      />
    );
  }

  const resolvedLoadout = loadout ?? loadoutFromLegacy(baseId ?? null, outfits ?? {}, skinPackId);
  return (
    <AvatarRenderer
      loadout={resolvedLoadout}
      size={size}
      className={className}
      alt={alt}
      mirror={mirror}
      pose={pose}
      highlightSlot={highlightSlot}
      showAura={showAura}
    />
  );
}

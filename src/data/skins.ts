import type { SkinPack } from '@/types';

/**
 * SkinPacks are full illustrated character looks (Quizizz-style).
 * Each entry references an artId resolved by src/components/skins/SkinPackArt.tsx.
 *
 * Earnability mix:
 * - `unlock` describes the progression path (level / scans / badge / etc.)
 * - `priceTokens` is always set as an alternative paid path.
 *   Use `unlock.kind: 'paid'` when there's no progression path (rare here).
 */
export const SKIN_PACKS: SkinPack[] = [];

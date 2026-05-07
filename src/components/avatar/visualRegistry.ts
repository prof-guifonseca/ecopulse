import type { GearItem, GearSlot } from '@/types';
import { themeFromVisualKey } from './palettes';
import { SLOT_RENDERERS } from './slotVisuals';
import {
  FAMILY_THEME,
  VISUAL_FAMILIES,
  VISUAL_SLOTS,
  hasGearVisual,
  parseGearVisualKey,
} from './visualHelpers';
import type { GearVisualDefinition } from './visualTypes';

export const visualRegistry = Object.fromEntries(
  VISUAL_FAMILIES.flatMap((family) =>
    VISUAL_SLOTS.map((slot) => {
      const key = `${family}.${slot}.standard`;
      return [key, createVisualDefinition(key, family, slot)];
    })
  )
) as Record<string, GearVisualDefinition>;

export function resolveGearVisual(item: GearItem): GearVisualDefinition {
  const meta = parseGearVisualKey(item.visualKey) ?? parseGearVisualKey(item.visualLayerId);
  if (meta && hasGearVisual(`${meta.family}.${meta.slot}.${meta.variant}`)) {
    return createVisualDefinition(item.visualKey, meta.family, meta.slot);
  }

  const [legacyFamily, legacySlot] = item.visualLayerId.split(':');
  const slot = VISUAL_SLOTS.includes(legacySlot as GearSlot) ? (legacySlot as GearSlot) : item.slot;
  return createVisualDefinition(`nature.${slot}.fallback`, legacyFamily || 'nature', slot);
}

function createVisualDefinition(key: string, family: string, slot: GearSlot): GearVisualDefinition {
  return {
    key,
    slot,
    theme: FAMILY_THEME[family] ?? themeFromVisualKey(family),
    render: SLOT_RENDERERS[slot],
  };
}

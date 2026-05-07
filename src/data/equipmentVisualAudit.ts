import type { EquipmentVisualStatus } from '@/components/avatar/gearVisuals';
import { SIGNATURE_FAMILIES, familyOf, hasGearVisual, parseGearVisualKey } from '@/components/avatar/gearVisuals';
import type { GearItem } from '@/types';

export type EquipmentVisualAuditRow = {
  itemId: string;
  itemName: string;
  setId: string | null;
  slot: GearItem['slot'];
  visualKey: string;
  stats: GearItem['battleStats'];
  status: EquipmentVisualStatus;
};

export function equipmentVisualStatus(item: GearItem): EquipmentVisualStatus {
  const visual = parseGearVisualKey(item.visualKey);
  if (!visual || !hasGearVisual(item.visualKey)) return 'fallback';
  if (item.visualKey.includes(':')) return 'fallback';
  if (item.setId && SIGNATURE_FAMILIES.includes(familyOf(item) as (typeof SIGNATURE_FAMILIES)[number])) {
    return 'signature';
  }
  if (item.setId) return 'variant';
  return 'legacy-polished';
}

export function buildEquipmentVisualAudit(items: GearItem[]): EquipmentVisualAuditRow[] {
  return items.map((item) => ({
    itemId: item.id,
    itemName: item.name,
    setId: item.setId ?? null,
    slot: item.slot,
    visualKey: item.visualKey,
    stats: item.battleStats,
    status: equipmentVisualStatus(item),
  }));
}

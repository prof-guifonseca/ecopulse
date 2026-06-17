import type { AvatarLoadout, GearSlot } from '@/types';
import { EMPTY_GEAR, GEAR_SETS, defaultLoadoutForSet, getGearItem } from './gear';

export interface DemoLoadoutPreset {
  id: string;
  name: string;
  kind: 'set' | 'mix';
  loadout: AvatarLoadout;
  featuredSlots: GearSlot[];
}

export const DEMO_GEAR_SET_IDS = [
  'cyber-reciclador',
  'samurai-verde',
  'ninja-eco',
  'mago-da-floresta',
  'guardiao-da-floresta',
] as const;

const MIX_GEAR: AvatarLoadout['equippedGear'] = {
  ...EMPTY_GEAR,
  head: 'samurai-verde-head',
  face: 'cyber-reciclador-face',
  torso: 'guardiao-da-floresta-torso',
  legs: 'ninja-eco-legs',
  feet: 'cyber-reciclador-feet',
  back: 'cyber-reciclador-back',
  mainHand: 'mago-da-floresta-mainHand',
  aura: 'guardiao-da-floresta-aura',
};

const FEATURED_SLOTS: GearSlot[] = ['head', 'face', 'torso', 'back', 'mainHand', 'aura'];

export function arthurDemoLoadout(baseId: string | null): AvatarLoadout {
  return {
    baseId,
    equippedGear: { ...EMPTY_GEAR, ...MIX_GEAR },
    activeSetId: null,
  };
}

export function createAvatarLoadoutPresets(baseId: string | null): DemoLoadoutPreset[] {
  const setPresets = DEMO_GEAR_SET_IDS.map((setId) => {
    const set = GEAR_SETS.find((item) => item.id === setId);
    return {
      id: setId,
      name: set?.name ?? setId,
      kind: 'set' as const,
      loadout: defaultLoadoutForSet(setId, baseId),
      featuredSlots: FEATURED_SLOTS,
    };
  });

  return [
    {
      id: 'arthur-mix',
      name: 'Arthur Mix',
      kind: 'mix',
      loadout: arthurDemoLoadout(baseId),
      featuredSlots: FEATURED_SLOTS,
    },
    ...setPresets,
  ];
}

export const AVATAR_LOADOUT_PRESETS = createAvatarLoadoutPresets('base2');

export function presetItemIds(preset: DemoLoadoutPreset): string[] {
  return Object.values(preset.loadout.equippedGear).filter((id): id is string =>
    Boolean(id && getGearItem(id)),
  );
}

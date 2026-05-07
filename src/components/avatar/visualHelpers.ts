import type { GearFxLevel, GearHandPose, GearItem, GearSlot, GearTheme } from '@/types';
import { themeFromVisualKey } from './palettes';
import type { SlotAnchor, VisualMeta } from './visualTypes';

export const VISUAL_THEMES: GearTheme[] = [
  'anime',
  'samurai',
  'ninja',
  'fantasy',
  'cyber',
  'explorer',
  'utility',
  'nature',
];

export const VISUAL_SLOTS: GearSlot[] = [
  'hair',
  'head',
  'face',
  'torso',
  'legs',
  'feet',
  'back',
  'mainHand',
  'offHand',
  'aura',
];

export const SLOT_ANCHORS: Record<GearSlot, SlotAnchor> = {
  hair: { cx: 120, cy: 66, rx: 54, ry: 38 },
  head: { cx: 120, cy: 78, rx: 60, ry: 42 },
  face: { cx: 120, cy: 121, rx: 52, ry: 25 },
  torso: { cx: 120, cy: 188, rx: 60, ry: 62 },
  legs: { cx: 120, cy: 250, rx: 49, ry: 47 },
  feet: { cx: 120, cy: 294, rx: 58, ry: 16 },
  back: { cx: 120, cy: 202, rx: 82, ry: 104 },
  mainHand: { cx: 184, cy: 229, rx: 36, ry: 64 },
  offHand: { cx: 58, cy: 229, rx: 34, ry: 56 },
  aura: { cx: 120, cy: 170, rx: 105, ry: 138 },
};

export const FAMILY_THEME: Record<string, GearTheme> = {
  anime: 'anime',
  samurai: 'samurai',
  ninja: 'ninja',
  fantasy: 'fantasy',
  cyber: 'cyber',
  explorer: 'explorer',
  utility: 'utility',
  nature: 'nature',
  akashi: 'anime',
  'samurai-verde': 'samurai',
  'ninja-eco': 'ninja',
  'mago-da-floresta': 'fantasy',
  'cyber-reciclador': 'cyber',
  aventureiro: 'explorer',
  'pirata-recicla': 'explorer',
  'cientista-eco': 'fantasy',
  'ciclista-verde': 'explorer',
  capoeirista: 'samurai',
  'guardiao-da-floresta': 'fantasy',
};

export const SIGNATURE_FAMILIES = [
  'cyber-reciclador',
  'samurai-verde',
  'ninja-eco',
  'mago-da-floresta',
  'guardiao-da-floresta',
] as const;

export const PREMIUM_FAMILIES = [
  'akashi',
  ...SIGNATURE_FAMILIES,
  'aventureiro',
  'pirata-recicla',
  'cientista-eco',
  'ciclista-verde',
  'capoeirista',
] as const;

export const VISUAL_FAMILIES = [...VISUAL_THEMES, ...PREMIUM_FAMILIES];

export function gearVisualKey(theme: GearTheme, slot: GearSlot) {
  return `${theme}.${slot}.standard`;
}

export function hasGearVisual(key: string | null | undefined) {
  const meta = parseGearVisualKey(key);
  return Boolean(meta && FAMILY_THEME[meta.family] && VISUAL_SLOTS.includes(meta.slot));
}

export function parseGearVisualKey(key: string | null | undefined): VisualMeta | null {
  if (!key) return null;
  const parts = key.includes('.') ? key.split('.') : key.split(':');
  const family = parts[0] || 'nature';
  const slot = parts[1] as GearSlot | undefined;
  if (!slot || !VISUAL_SLOTS.includes(slot)) return null;
  return {
    family,
    slot,
    variant: parts.slice(2).join('-') || 'standard',
  };
}

export function familyFromVisualKey(key: string | null | undefined) {
  return parseGearVisualKey(key)?.family ?? 'nature';
}

export function familyOf(item: GearItem) {
  return familyFromVisualKey(item.visualKey);
}

export function isFamily(item: GearItem, ...families: string[]) {
  return families.includes(familyOf(item));
}

export function isTheme(item: GearItem, theme: GearTheme) {
  return themeFromVisualKey(item.visualKey) === theme;
}

export function gearVisibilityRules(item: GearItem) {
  return {
    hidesHair: itemHidesHair(item),
    hidesFace: itemHidesFace(item),
    handPose: itemHandPose(item),
    fxLevel: itemFxLevel(item),
  };
}

export function itemHidesHair(item: GearItem) {
  if (item.hidesHair !== undefined) return item.hidesHair;
  const family = familyOf(item);
  const name = item.name.toLowerCase();
  return (
    item.slot === 'head' &&
    (family === 'ninja-eco' ||
      family === 'mago-da-floresta' ||
      name.includes('capuz') ||
      name.includes('capacete'))
  );
}

export function itemHidesFace(item: GearItem) {
  if (item.hidesFace !== undefined) return item.hidesFace;
  const family = familyOf(item);
  const name = item.name.toLowerCase();
  return item.slot === 'face' && (family === 'ninja-eco' || name.includes('mascara') || name.includes('máscara'));
}

export function itemHandPose(item: GearItem): GearHandPose | undefined {
  if (item.handPose) return item.handPose;
  const name = item.name.toLowerCase();
  if (name.includes('cajado') || name.includes('bo') || name.includes('berimbau')) return 'staff';
  if (name.includes('escudo')) return 'shield';
  if (item.slot === 'mainHand') return 'weapon';
  if (item.slot === 'offHand') return 'object';
  return undefined;
}

export function itemFxLevel(item: GearItem): GearFxLevel {
  if (item.fxLevel !== undefined) return item.fxLevel;
  if (item.slot === 'aura') return item.tier === 'legendary' ? 3 : item.tier === 'epic' ? 2 : 1;
  return item.tier === 'legendary' ? 2 : item.tier === 'epic' ? 1 : 0;
}

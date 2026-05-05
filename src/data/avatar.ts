import type { AvatarBase, AvatarOutfit } from '@/types';

/**
 * Editorial palette: each base is a sober, sustainable-lifestyle tone.
 * No primary rainbow. Skin tones span warm neutrals; hair is muted earth.
 */
export const AVATAR_BASES: AvatarBase[] = [
  // Eco green
  { id: 'base1', name: 'Folha', color: '#8ddb98', skin: '#f0d2b3', hair: '#3a2a18' },
  // Deep moss
  { id: 'base2', name: 'Musgo', color: '#5fb36f', skin: '#d4a986', hair: '#2c1810' },
  // Warm gold
  { id: 'base3', name: 'Cobre', color: '#e0c27a', skin: '#e8b88a', hair: '#7a4318' },
  // Slate / cool
  { id: 'base4', name: 'Bruma', color: '#9fc5b6', skin: '#cf9f7c', hair: '#1a1a1a' },
  // Clay / terracotta
  { id: 'base5', name: 'Argila', color: '#c2876f', skin: '#f0d2b3', hair: '#4a2a18' },
  // Charcoal
  { id: 'base6', name: 'Carvão', color: '#5a6b62', skin: '#a37456', hair: '#0a0a0a' },
];

/**
 * Outfits keep the same gameplay slots; visual styling restrained
 * to the editorial palette. Hat colors, glasses tints and shirts
 * coordinate with the brand greens / golds / earths.
 */
export const AVATAR_OUTFITS: AvatarOutfit[] = [
  { id: 'hat1', name: 'Chapéu de Folhas', slot: 'hat', price: 40, emoji: '🍃', tier: 'common' },
  { id: 'hat2', name: 'Coroa de Flores', slot: 'hat', price: 80, emoji: '🌸', tier: 'rare' },
  { id: 'hat3', name: 'Gorro Reciclado', slot: 'hat', price: 60, emoji: '🧶', tier: 'common' },
  { id: 'glass1', name: 'Óculos Solar', slot: 'glasses', price: 30, emoji: '🕶️', tier: 'common' },
  { id: 'glass2', name: 'Óculos Eco-Tech', slot: 'glasses', price: 100, emoji: '🥽', tier: 'rare' },
  { id: 'shirt1', name: 'Camiseta Reciclada', slot: 'shirt', price: 50, emoji: '👕', tier: 'common' },
  { id: 'shirt2', name: 'Colete Nature', slot: 'shirt', price: 90, emoji: '🦺', tier: 'rare' },
  { id: 'acc1', name: 'Mochila Eco', slot: 'accessory', price: 70, emoji: '🎒', tier: 'common' },
  { id: 'acc2', name: 'Colar de Sementes', slot: 'accessory', price: 45, emoji: '📿', tier: 'common' },
  { id: 'bg1', name: 'Aura Verde', slot: 'background', price: 120, emoji: '💚', tier: 'epic' },
  { id: 'bg2', name: 'Aura Dourada', slot: 'background', price: 200, emoji: '✨', tier: 'epic' },
];

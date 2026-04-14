import type { AvatarBase, AvatarOutfit } from '@/types';

export const AVATAR_BASES: AvatarBase[] = [
  { id: 'base1', name: 'Eco Explorer', color: '#52b788', skin: '#F4C7A3', hair: '#5B3A1A' },
  { id: 'base2', name: 'Urban Green', color: '#00B4D8', skin: '#D4A76A', hair: '#2C1810' },
  { id: 'base3', name: 'Nature Kid', color: '#FFD166', skin: '#E8B88A', hair: '#8B4513' },
  { id: 'base4', name: 'Ocean Soul', color: '#3a86ff', skin: '#C68E5B', hair: '#1A1A2E' },
  { id: 'base5', name: 'Fire Spirit', color: '#FF6B6B', skin: '#F5D5B8', hair: '#D4380D' },
  { id: 'base6', name: 'Forest Sage', color: '#A78BFA', skin: '#8D5524', hair: '#0D0D0D' },
];

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

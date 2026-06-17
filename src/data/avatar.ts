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
 * Outfit slots:
 *  hat / glasses / shirt / accessory / background — original 5
 *  weapon / hairstyle — added with the SkinPack expansion to support
 *    composite anime/samurai looks.
 *
 * Visual styling stays restrained to the editorial palette so a
 * composite avatar (without a SkinPack) still reads as part of the brand.
 */
export const AVATAR_OUTFITS: AvatarOutfit[] = [
  // ----- Original 11 -----
  {
    id: 'hat1',
    name: 'Chapéu de Folhas',
    slot: 'hat',
    price: 40,
    emoji: '🍃',
    tier: 'common',
    battleStats: { defense: 1 },
  },
  {
    id: 'hat2',
    name: 'Coroa de Flores',
    slot: 'hat',
    price: 80,
    emoji: '🌸',
    tier: 'rare',
    battleStats: { hp: 4, focus: 2 },
  },
  {
    id: 'hat3',
    name: 'Gorro Reciclado',
    slot: 'hat',
    price: 60,
    emoji: '🧶',
    tier: 'common',
    battleStats: { hp: 3 },
  },
  {
    id: 'glass1',
    name: 'Óculos Solar',
    slot: 'glasses',
    price: 30,
    emoji: '🕶️',
    tier: 'common',
    battleStats: { focus: 1 },
  },
  {
    id: 'glass2',
    name: 'Óculos Eco-Tech',
    slot: 'glasses',
    price: 100,
    emoji: '🥽',
    tier: 'rare',
    battleStats: { focus: 3, speed: 1 },
  },
  {
    id: 'shirt1',
    name: 'Camiseta Reciclada',
    slot: 'shirt',
    price: 50,
    emoji: '👕',
    tier: 'common',
    battleStats: { defense: 2 },
  },
  {
    id: 'shirt2',
    name: 'Colete Nature',
    slot: 'shirt',
    price: 90,
    emoji: '🦺',
    tier: 'rare',
    battleStats: { hp: 5, defense: 3 },
  },
  {
    id: 'acc1',
    name: 'Mochila Eco',
    slot: 'accessory',
    price: 70,
    emoji: '🎒',
    tier: 'common',
    battleStats: { hp: 4 },
  },
  {
    id: 'acc2',
    name: 'Colar de Sementes',
    slot: 'accessory',
    price: 45,
    emoji: '📿',
    tier: 'common',
    battleStats: { focus: 2 },
  },
  {
    id: 'bg1',
    name: 'Aura Verde',
    slot: 'background',
    price: 120,
    emoji: '💚',
    tier: 'epic',
    battleStats: { hp: 6, defense: 2 },
  },
  {
    id: 'bg2',
    name: 'Aura Dourada',
    slot: 'background',
    price: 200,
    emoji: '✨',
    tier: 'epic',
    battleStats: { attack: 2, focus: 4 },
  },

  // ----- New (anime / samurai expansion) -----
  // Weapons
  {
    id: 'weap-katana-bambu',
    name: 'Katana de Bambu',
    slot: 'weapon',
    price: 80,
    emoji: '🗡️',
    tier: 'common',
    battleStats: { attack: 3 },
  },
  {
    id: 'weap-cajado-folha',
    name: 'Cajado de Folha',
    slot: 'weapon',
    price: 70,
    emoji: '🪄',
    tier: 'common',
    battleStats: { attack: 1, focus: 2 },
  },
  {
    id: 'weap-bo-madeira',
    name: 'Bo de Madeira',
    slot: 'weapon',
    price: 60,
    emoji: '🥢',
    tier: 'common',
    battleStats: { attack: 2, defense: 1 },
  },
  {
    id: 'weap-shuriken',
    name: 'Shuriken Reciclada',
    slot: 'weapon',
    price: 110,
    emoji: '✴️',
    tier: 'rare',
    battleStats: { attack: 3, speed: 3 },
  },

  // Hairstyles
  {
    id: 'hair-topknot',
    name: 'Topknot Samurai',
    slot: 'hairstyle',
    price: 90,
    emoji: '🎎',
    tier: 'rare',
    battleStats: { focus: 2, defense: 1 },
  },
  {
    id: 'hair-spike',
    name: 'Cabelo Anime',
    slot: 'hairstyle',
    price: 70,
    emoji: '💢',
    tier: 'common',
    battleStats: { speed: 2 },
  },

  // Hats / masks (anime themed)
  {
    id: 'hat-headband-eco',
    name: 'Headband Eco',
    slot: 'hat',
    price: 40,
    emoji: '🟢',
    tier: 'common',
    battleStats: { speed: 1 },
  },
  {
    id: 'glass-mascara-ninja',
    name: 'Máscara Ninja',
    slot: 'glasses',
    price: 50,
    emoji: '🥷',
    tier: 'common',
    battleStats: { speed: 1, focus: 1 },
  },

  // Shirt / accessory
  {
    id: 'shirt-capa-curta',
    name: 'Capa Curta',
    slot: 'shirt',
    price: 80,
    emoji: '🧥',
    tier: 'rare',
    battleStats: { attack: 2, speed: 1 },
  },
  {
    id: 'acc-tabis',
    name: 'Tabis',
    slot: 'accessory',
    price: 30,
    emoji: '🥿',
    tier: 'common',
    battleStats: { speed: 1 },
  },
];

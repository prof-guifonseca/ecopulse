import type { GearItem, GearTheme } from '@/types';

export interface AvatarPalette {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  glow: string;
}

const THEME_PALETTES: Record<GearTheme, AvatarPalette> = {
  anime: {
    primary: '#22314a',
    secondary: '#101722',
    accent: '#93c5fd',
    dark: '#060b12',
    light: '#dbeafe',
    glow: '#60a5fa',
  },
  samurai: {
    primary: '#315f3f',
    secondary: '#1f3428',
    accent: '#d8b24b',
    dark: '#101812',
    light: '#e8d27a',
    glow: '#9bcf7d',
  },
  ninja: {
    primary: '#1b2322',
    secondary: '#0d1111',
    accent: '#78c6a3',
    dark: '#050706',
    light: '#c9f0df',
    glow: '#7dd3a7',
  },
  fantasy: {
    primary: '#567844',
    secondary: '#273d2d',
    accent: '#e6c76f',
    dark: '#122017',
    light: '#f3e4ad',
    glow: '#aad576',
  },
  cyber: {
    primary: '#21b981',
    secondary: '#123f3a',
    accent: '#7dd3fc',
    dark: '#071917',
    light: '#a7f3d0',
    glow: '#34d399',
  },
  explorer: {
    primary: '#9b6a3a',
    secondary: '#4b3320',
    accent: '#e0c27a',
    dark: '#21160d',
    light: '#f2d89a',
    glow: '#d6a84f',
  },
  utility: {
    primary: '#60736a',
    secondary: '#2b3a33',
    accent: '#c9d8cf',
    dark: '#151f1b',
    light: '#e3ece5',
    glow: '#9fb6ab',
  },
  nature: {
    primary: '#5fb36f',
    secondary: '#2d6b3d',
    accent: '#c7e77d',
    dark: '#102116',
    light: '#def8c3',
    glow: '#8ddb98',
  },
};

const SET_PALETTES: Record<string, AvatarPalette> = {
  akashi: {
    primary: '#1f2937',
    secondary: '#111827',
    accent: '#f87171',
    dark: '#090b12',
    light: '#ffd1d1',
    glow: '#ef4444',
  },
  'samurai-verde': THEME_PALETTES.samurai,
  'ninja-eco': THEME_PALETTES.ninja,
  'mago-da-floresta': THEME_PALETTES.fantasy,
  'cyber-reciclador': THEME_PALETTES.cyber,
  aventureiro: THEME_PALETTES.explorer,
  'pirata-recicla': {
    primary: '#8a3f32',
    secondary: '#2d1915',
    accent: '#e8c36e',
    dark: '#160b09',
    light: '#ffdca3',
    glow: '#ef7d57',
  },
  'cientista-eco': {
    primary: '#dfeee7',
    secondary: '#5c8f7d',
    accent: '#7dd3fc',
    dark: '#12322a',
    light: '#ffffff',
    glow: '#67e8f9',
  },
  'ciclista-verde': {
    primary: '#7ed957',
    secondary: '#1f4d2a',
    accent: '#e7ff74',
    dark: '#102116',
    light: '#dbffba',
    glow: '#a3e635',
  },
  capoeirista: {
    primary: '#f3f6ee',
    secondary: '#2d6b3d',
    accent: '#e0c27a',
    dark: '#102116',
    light: '#ffffff',
    glow: '#8ddb98',
  },
  'guardiao-da-floresta': {
    primary: '#4d7c3a',
    secondary: '#24351d',
    accent: '#d6a84f',
    dark: '#0b140b',
    light: '#e7d891',
    glow: '#d6a84f',
  },
};

export function paletteForGear(item: GearItem): AvatarPalette {
  return (
    SET_PALETTES[item.paletteId ?? item.setId ?? ''] ??
    THEME_PALETTES[themeFromVisualKey(item.visualKey)] ??
    THEME_PALETTES.nature
  );
}

export function themeFromVisualKey(key: string): GearTheme {
  const [family] = key.includes('.') ? key.split('.') : key.split(':');
  const familyThemes: Record<string, GearTheme> = {
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
  return familyThemes[family] ?? ((family || 'nature') as GearTheme);
}

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
export const SKIN_PACKS: SkinPack[] = [
  {
    id: 'akashi',
    name: 'Akashi',
    theme: 'anime',
    tagline: 'Capa preta, nuvens vermelhas. Sombra que carrega missão.',
    tier: 'epic',
    unlock: { kind: 'level', value: 8 },
    priceTokens: 300,
    artId: 'akashi',
  },
  {
    id: 'samurai-verde',
    name: 'Samurai Verde',
    theme: 'samurai',
    tagline: 'Gi de musgo, katana cruzada. Honra que vem da floresta.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'scans', value: 50 },
    priceTokens: 250,
    artId: 'samurai-verde',
  },
  {
    id: 'ninja-eco',
    name: 'Ninja Eco',
    theme: 'ninja',
    tagline: 'Sombra silenciosa que recicla com o vento.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'challenges', value: 5 },
    priceTokens: 200,
    artId: 'ninja-eco',
  },
  {
    id: 'mago-da-floresta',
    name: 'Mago da Floresta',
    theme: 'fantasy',
    tagline: 'Cajado florido, magia antiga, raízes profundas.',
    tier: 'epic',
    unlock: { kind: 'level', value: 10 },
    priceTokens: 350,
    artId: 'mago-da-floresta',
  },
  {
    id: 'cyber-reciclador',
    name: 'Cyber Reciclador',
    theme: 'cyber',
    tagline: 'Solarpunk de circuitos verdes. Reciclagem com firmware.',
    tier: 'epic',
    unlock: { kind: 'badge', id: 'token-100' },
    priceTokens: 280,
    artId: 'cyber-reciclador',
  },
  {
    id: 'aventureiro',
    name: 'Aventureiro',
    theme: 'explorer',
    tagline: 'Mochila pesada, mapa na mão. Cada caminho tem destino.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'visits', value: 10 },
    priceTokens: 220,
    artId: 'aventureiro',
  },
  {
    id: 'pirata-recicla',
    name: 'Pirata Recicla',
    theme: 'explorer',
    tagline: 'Caça ao plástico em alto-mar. Tesouro é oceano limpo.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'visits', value: 8 },
    priceTokens: 240,
    artId: 'pirata-recicla',
  },
  {
    id: 'cientista-eco',
    name: 'Cientista Eco',
    theme: 'fantasy',
    tagline: 'Béquer borbulhando. Ciência que cuida do planeta.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'tutorials', value: 3 },
    priceTokens: 230,
    artId: 'cientista-eco',
  },
  {
    id: 'ciclista-verde',
    name: 'Ciclista Verde',
    theme: 'explorer',
    tagline: 'Capacete na cabeça, leveza no caminho. Mobilidade limpa.',
    tier: 'rare',
    unlock: { kind: 'level', value: 6 },
    priceTokens: 210,
    artId: 'ciclista-verde',
  },
  {
    id: 'capoeirista',
    name: 'Capoeirista',
    theme: 'samurai',
    tagline: 'Berimbau cantando, ginga no corpo. Arte que vira impacto.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'scans', value: 30 },
    priceTokens: 200,
    artId: 'capoeirista',
  },
  {
    id: 'guardiao-da-floresta',
    name: 'Guardião da Floresta',
    theme: 'fantasy',
    tagline: 'A coroa de galhos, a aura verde. Fim de linha do caminho longo.',
    tier: 'legendary',
    unlock: { kind: 'level', value: 15 },
    priceTokens: 600,
    artId: 'guardiao-da-floresta',
  },
];

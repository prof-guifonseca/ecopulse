import type {
  AvatarLoadout,
  AvatarOutfits,
  BattleStats,
  GearItem,
  GearSet,
  GearSlot,
  GearTheme,
  SkinUnlock,
} from '@/types';

export const GEAR_SLOT_LABELS: Record<GearSlot, string> = {
  hair: 'Cabelo',
  head: 'Cabeça',
  face: 'Rosto',
  torso: 'Torso',
  legs: 'Calça',
  feet: 'Pés',
  back: 'Costas',
  mainHand: 'Mão principal',
  offHand: 'Mão secundária',
  aura: 'Aura',
};

export const EMPTY_GEAR: AvatarLoadout['equippedGear'] = {
  hair: null,
  head: null,
  face: null,
  torso: null,
  legs: null,
  feet: null,
  back: null,
  mainHand: null,
  offHand: null,
  aura: null,
};

interface SetSpec {
  id: string;
  name: string;
  theme: GearTheme;
  tagline: string;
  tier: GearSet['tier'];
  unlock: SkinUnlock;
  priceTokens: number;
  pieces: Array<{
    slot: GearSlot;
    name: string;
    emoji: string;
    stats: Partial<BattleStats>;
    price: number;
    tier?: GearItem['tier'];
    tags?: string[];
  }>;
  setBonusStats: Partial<BattleStats>;
}

const SET_SPECS: SetSpec[] = [
  {
    id: 'akashi',
    name: 'Akashi',
    theme: 'anime',
    tagline: 'Peças de sombra, foco e velocidade para combates rápidos.',
    tier: 'epic',
    unlock: { kind: 'level', value: 8 },
    priceTokens: 300,
    setBonusStats: { attack: 2, speed: 2, focus: 1 },
    pieces: [
      { slot: 'torso', name: 'Capa Akashi', emoji: '🧥', stats: { attack: 2, defense: 1 }, price: 70 },
      { slot: 'head', name: 'Faixa Akashi', emoji: '🎗️', stats: { focus: 2 }, price: 45 },
      { slot: 'face', name: 'Olhar Sombrio', emoji: '👁️', stats: { focus: 2, speed: 1 }, price: 45 },
      { slot: 'mainHand', name: 'Lâmina de Bambu Negro', emoji: '🗡️', stats: { attack: 4 }, price: 90 },
      { slot: 'aura', name: 'Aura das Nuvens', emoji: '☁️', stats: { speed: 2 }, price: 80, tier: 'epic' },
    ],
  },
  {
    id: 'samurai-verde',
    name: 'Samurai Verde',
    theme: 'samurai',
    tagline: 'Armadura leve, honra e defesa firme.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'scans', value: 50 },
    priceTokens: 250,
    setBonusStats: { hp: 4, defense: 2 },
    pieces: [
      { slot: 'head', name: 'Kabuto de Folhas', emoji: '🎋', stats: { defense: 2 }, price: 55 },
      { slot: 'torso', name: 'Do Verde', emoji: '🥋', stats: { hp: 5, defense: 3 }, price: 75 },
      { slot: 'mainHand', name: 'Katana de Bambu', emoji: '🗡️', stats: { attack: 4 }, price: 80 },
      { slot: 'feet', name: 'Sandálias de Campo', emoji: '🥿', stats: { speed: 2 }, price: 40 },
    ],
  },
  {
    id: 'ninja-eco',
    name: 'Ninja Eco',
    theme: 'ninja',
    tagline: 'Equipamento silencioso para agir antes do rival.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'challenges', value: 5 },
    priceTokens: 200,
    setBonusStats: { speed: 3 },
    pieces: [
      { slot: 'face', name: 'Máscara Ninja', emoji: '🥷', stats: { focus: 1, speed: 2 }, price: 50 },
      { slot: 'torso', name: 'Traje de Sombra', emoji: '🥋', stats: { defense: 1, speed: 2 }, price: 65 },
      { slot: 'mainHand', name: 'Shuriken Reciclada', emoji: '✴️', stats: { attack: 3, speed: 2 }, price: 70 },
      { slot: 'feet', name: 'Tabis Silenciosos', emoji: '🥿', stats: { speed: 2 }, price: 35 },
    ],
  },
  {
    id: 'mago-da-floresta',
    name: 'Mago da Floresta',
    theme: 'fantasy',
    tagline: 'Cajado, foco e energia antiga da mata.',
    tier: 'epic',
    unlock: { kind: 'level', value: 10 },
    priceTokens: 350,
    setBonusStats: { focus: 4, hp: 3 },
    pieces: [
      { slot: 'head', name: 'Capuz de Musgo', emoji: '🧙', stats: { focus: 2 }, price: 70 },
      { slot: 'torso', name: 'Manto da Floresta', emoji: '🟩', stats: { hp: 5, focus: 2 }, price: 85 },
      { slot: 'mainHand', name: 'Cajado de Folha', emoji: '🪄', stats: { attack: 2, focus: 3 }, price: 85 },
      { slot: 'aura', name: 'Círculo das Raízes', emoji: '🌿', stats: { defense: 2, focus: 2 }, price: 110, tier: 'epic' },
    ],
  },
  {
    id: 'cyber-reciclador',
    name: 'Cyber Reciclador',
    theme: 'cyber',
    tagline: 'Tecnologia solarpunk, visor e mochila de coleta.',
    tier: 'epic',
    unlock: { kind: 'badge', id: 'token-100' },
    priceTokens: 280,
    setBonusStats: { focus: 3, attack: 1 },
    pieces: [
      { slot: 'face', name: 'Visor Eco-Tech', emoji: '🥽', stats: { focus: 3, speed: 1 }, price: 65 },
      { slot: 'torso', name: 'Jaqueta Solar', emoji: '🦺', stats: { defense: 3, focus: 1 }, price: 75 },
      { slot: 'back', name: 'Mochila Recicladora', emoji: '🎒', stats: { hp: 5 }, price: 60 },
      { slot: 'mainHand', name: 'Coletor de Circuitos', emoji: '🔧', stats: { attack: 3, focus: 2 }, price: 80 },
      { slot: 'aura', name: 'Pulso Verde', emoji: '💚', stats: { focus: 2 }, price: 70, tier: 'epic' },
    ],
  },
  {
    id: 'aventureiro',
    name: 'Aventureiro',
    theme: 'explorer',
    tagline: 'Carga extra, mapa e resistência para jornadas longas.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'visits', value: 10 },
    priceTokens: 220,
    setBonusStats: { hp: 5, defense: 1 },
    pieces: [
      { slot: 'head', name: 'Boné de Trilha', emoji: '🧢', stats: { defense: 1 }, price: 40 },
      { slot: 'torso', name: 'Colete de Exploração', emoji: '🦺', stats: { hp: 4, defense: 2 }, price: 70 },
      { slot: 'back', name: 'Mochila de Campo', emoji: '🎒', stats: { hp: 5 }, price: 65 },
      { slot: 'offHand', name: 'Mapa Dobrado', emoji: '🗺️', stats: { focus: 2 }, price: 45 },
    ],
  },
  {
    id: 'pirata-recicla',
    name: 'Pirata Recicla',
    theme: 'explorer',
    tagline: 'Tesouro bom é oceano limpo.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'visits', value: 8 },
    priceTokens: 240,
    setBonusStats: { attack: 2, hp: 3 },
    pieces: [
      { slot: 'head', name: 'Bandana dos Mares', emoji: '🏴‍☠️', stats: { speed: 1, focus: 1 }, price: 45 },
      { slot: 'torso', name: 'Casaco de Reuso', emoji: '🧥', stats: { hp: 4, defense: 1 }, price: 70 },
      { slot: 'mainHand', name: 'Gancho de Coleta', emoji: '🪝', stats: { attack: 4 }, price: 80 },
      { slot: 'offHand', name: 'Garrafa Mensageira', emoji: '🍾', stats: { focus: 2 }, price: 45 },
    ],
  },
  {
    id: 'cientista-eco',
    name: 'Cientista Eco',
    theme: 'fantasy',
    tagline: 'Precisão, método e foco para vencer com ciência.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'tutorials', value: 3 },
    priceTokens: 230,
    setBonusStats: { focus: 3, defense: 1 },
    pieces: [
      { slot: 'face', name: 'Óculos de Laboratório', emoji: '🥽', stats: { focus: 3 }, price: 55 },
      { slot: 'torso', name: 'Jaleco Verde', emoji: '🥼', stats: { defense: 2, focus: 1 }, price: 70 },
      { slot: 'offHand', name: 'Béquer Vivo', emoji: '🧪', stats: { focus: 2 }, price: 50 },
      { slot: 'mainHand', name: 'Scanner Manual', emoji: '📟', stats: { attack: 2, speed: 1 }, price: 55 },
    ],
  },
  {
    id: 'ciclista-verde',
    name: 'Ciclista Verde',
    theme: 'explorer',
    tagline: 'Mobilidade limpa, agilidade e proteção leve.',
    tier: 'rare',
    unlock: { kind: 'level', value: 6 },
    priceTokens: 210,
    setBonusStats: { speed: 3, defense: 1 },
    pieces: [
      { slot: 'head', name: 'Capacete Verde', emoji: '🚴', stats: { defense: 2 }, price: 55 },
      { slot: 'torso', name: 'Jaqueta Refletiva', emoji: '🦺', stats: { defense: 1, speed: 2 }, price: 65 },
      { slot: 'feet', name: 'Tênis de Pedal', emoji: '👟', stats: { speed: 3 }, price: 55 },
      { slot: 'back', name: 'Sinalizador Solar', emoji: '🔆', stats: { focus: 1, speed: 1 }, price: 45 },
    ],
  },
  {
    id: 'capoeirista',
    name: 'Capoeirista',
    theme: 'samurai',
    tagline: 'Ginga, ritmo e movimento como defesa.',
    tier: 'rare',
    unlock: { kind: 'count', metric: 'scans', value: 30 },
    priceTokens: 200,
    setBonusStats: { speed: 2, attack: 1 },
    pieces: [
      { slot: 'torso', name: 'Abadá Verde', emoji: '🥋', stats: { speed: 2, defense: 1 }, price: 60 },
      { slot: 'feet', name: 'Passo Leve', emoji: '🦶', stats: { speed: 3 }, price: 45 },
      { slot: 'offHand', name: 'Berimbau Mini', emoji: '🎵', stats: { focus: 2 }, price: 45 },
      { slot: 'mainHand', name: 'Ginga Circular', emoji: '🌀', stats: { attack: 3 }, price: 65 },
    ],
  },
  {
    id: 'guardiao-da-floresta',
    name: 'Guardião da Floresta',
    theme: 'fantasy',
    tagline: 'O conjunto lendário de proteção das raízes.',
    tier: 'legendary',
    unlock: { kind: 'level', value: 15 },
    priceTokens: 600,
    setBonusStats: { hp: 8, attack: 2, defense: 3, focus: 2 },
    pieces: [
      { slot: 'head', name: 'Coroa de Galhos', emoji: '🌿', stats: { defense: 3, focus: 2 }, price: 120, tier: 'epic' },
      { slot: 'torso', name: 'Armadura de Casca', emoji: '🛡️', stats: { hp: 8, defense: 4 }, price: 150, tier: 'epic' },
      { slot: 'back', name: 'Manto das Raízes', emoji: '🍂', stats: { hp: 6, defense: 2 }, price: 110, tier: 'epic' },
      { slot: 'mainHand', name: 'Machado de Semente', emoji: '🪓', stats: { attack: 5 }, price: 120, tier: 'epic' },
      { slot: 'aura', name: 'Aura Ancestral', emoji: '🌳', stats: { focus: 4 }, price: 130, tier: 'legendary' },
    ],
  },
];

const LEGACY_GEAR_ITEMS: GearItem[] = [
  legacyItem('hat1', 'Chapéu de Folhas', 'head', 40, '🍃', 'common', { defense: 1 }, 'nature:head:leaf-hat'),
  legacyItem('hat2', 'Coroa de Flores', 'head', 80, '🌸', 'rare', { hp: 4, focus: 2 }, 'nature:head:flower-crown'),
  legacyItem('hat3', 'Gorro Reciclado', 'head', 60, '🧶', 'common', { hp: 3 }, 'utility:head:beanie'),
  legacyItem('glass1', 'Óculos Solar', 'face', 30, '🕶️', 'common', { focus: 1 }, 'utility:face:sunglasses'),
  legacyItem('glass2', 'Óculos Eco-Tech', 'face', 100, '🥽', 'rare', { focus: 3, speed: 1 }, 'cyber:face:visor'),
  legacyItem('shirt1', 'Camiseta Reciclada', 'torso', 50, '👕', 'common', { defense: 2 }, 'nature:torso:shirt'),
  legacyItem('shirt2', 'Colete Nature', 'torso', 90, '🦺', 'rare', { hp: 5, defense: 3 }, 'explorer:torso:vest'),
  legacyItem('acc1', 'Mochila Eco', 'back', 70, '🎒', 'common', { hp: 4 }, 'explorer:back:pack'),
  legacyItem('acc2', 'Colar de Sementes', 'face', 45, '📿', 'common', { focus: 2 }, 'nature:face:necklace'),
  legacyItem('bg1', 'Aura Verde', 'aura', 120, '💚', 'epic', { hp: 6, defense: 2 }, 'nature:aura:green'),
  legacyItem('bg2', 'Aura Dourada', 'aura', 200, '✨', 'epic', { attack: 2, focus: 4 }, 'fantasy:aura:gold'),
  legacyItem('weap-katana-bambu', 'Katana de Bambu', 'mainHand', 80, '🗡️', 'common', { attack: 3 }, 'samurai:mainHand:katana'),
  legacyItem('weap-cajado-folha', 'Cajado de Folha', 'mainHand', 70, '🪄', 'common', { attack: 1, focus: 2 }, 'fantasy:mainHand:staff'),
  legacyItem('weap-bo-madeira', 'Bo de Madeira', 'mainHand', 60, '🥢', 'common', { attack: 2, defense: 1 }, 'samurai:mainHand:bo'),
  legacyItem('weap-shuriken', 'Shuriken Reciclada', 'mainHand', 110, '✴️', 'rare', { attack: 3, speed: 3 }, 'ninja:mainHand:shuriken'),
  legacyItem('hair-topknot', 'Topknot Samurai', 'hair', 90, '🎎', 'rare', { focus: 2, defense: 1 }, 'samurai:hair:topknot'),
  legacyItem('hair-spike', 'Cabelo Anime', 'hair', 70, '💢', 'common', { speed: 2 }, 'anime:hair:spike'),
  legacyItem('hat-headband-eco', 'Headband Eco', 'head', 40, '🟢', 'common', { speed: 1 }, 'ninja:head:headband'),
  legacyItem('glass-mascara-ninja', 'Máscara Ninja', 'face', 50, '🥷', 'common', { speed: 1, focus: 1 }, 'ninja:face:mask'),
  legacyItem('shirt-capa-curta', 'Capa Curta', 'torso', 80, '🧥', 'rare', { attack: 2, speed: 1 }, 'anime:torso:cape'),
  legacyItem('acc-tabis', 'Tabis', 'feet', 30, '🥿', 'common', { speed: 1 }, 'ninja:feet:tabi'),
  legacyItem('legs-calca-campo', 'Calça de Campo', 'legs', 45, '👖', 'common', { hp: 2, speed: 1 }, 'explorer:legs:field-pants'),
  legacyItem('legs-calca-tech', 'Calça Eco-Tech', 'legs', 85, '🦿', 'rare', { defense: 1, speed: 2 }, 'cyber:legs:tech-pants'),
];

const SET_GEAR_ITEMS = SET_SPECS.flatMap((set) =>
  set.pieces.map((piece) => ({
    id: `${set.id}-${piece.slot}`,
    name: piece.name,
    slot: piece.slot,
    tier: piece.tier ?? set.tier,
    priceTokens: piece.price,
    unlock: set.unlock,
    battleStats: piece.stats,
    visualLayerId: `${set.theme}:${piece.slot}:${set.id}`,
    setId: set.id,
    emoji: piece.emoji,
    tags: [set.theme, set.id, ...(piece.tags ?? [])],
  }) satisfies GearItem)
);

export const GEAR_ITEMS: GearItem[] = [...LEGACY_GEAR_ITEMS, ...SET_GEAR_ITEMS];

export const GEAR_SETS: GearSet[] = SET_SPECS.map((set) => {
  const itemIds = set.pieces.map((piece) => `${set.id}-${piece.slot}`);
  const defaultLoadout = Object.fromEntries(
    set.pieces.map((piece) => [piece.slot, `${set.id}-${piece.slot}`])
  ) as Partial<Record<GearSlot, string>>;

  return {
    id: set.id,
    name: set.name,
    theme: set.theme,
    tagline: set.tagline,
    tier: set.tier,
    unlock: set.unlock,
    priceTokens: set.priceTokens,
    itemIds,
    defaultLoadout,
    requiredItemIds: itemIds,
    setBonusStats: set.setBonusStats,
  };
});

export function getGearItem(id: string | null | undefined) {
  if (!id) return undefined;
  return GEAR_ITEMS.find((item) => item.id === id);
}

export function getGearSet(id: string | null | undefined) {
  if (!id) return undefined;
  return GEAR_SETS.find((set) => set.id === id);
}

export function gearItemsForSet(setId: string): GearItem[] {
  const set = getGearSet(setId);
  if (!set) return [];
  return set.itemIds.map(getGearItem).filter(Boolean) as GearItem[];
}

export function defaultLoadoutForSet(setId: string, baseId: string | null): AvatarLoadout {
  const set = getGearSet(setId);
  return {
    baseId,
    equippedGear: { ...EMPTY_GEAR, ...(set?.defaultLoadout ?? {}) },
    activeSetId: set?.id ?? null,
  };
}

export function loadoutFromLegacy(
  baseId: string | null,
  legacyOutfits: AvatarOutfits,
  equippedSkinPack?: string | null
): AvatarLoadout {
  if (equippedSkinPack && getGearSet(equippedSkinPack)) {
    return defaultLoadoutForSet(equippedSkinPack, baseId);
  }

  const equippedGear: AvatarLoadout['equippedGear'] = { ...EMPTY_GEAR };
  for (const legacyId of Object.values(legacyOutfits)) {
    if (!legacyId) continue;
    const gear = getGearItem(legacyId);
    if (gear) equippedGear[gear.slot] = gear.id;
  }

  return { baseId, equippedGear, activeSetId: null };
}

export function gearItemIdsFromLegacySkinPacks(ids: string[]): string[] {
  return unique(ids.flatMap((id) => getGearSet(id)?.itemIds ?? []));
}

export function legacyItemIdsStillGear(ids: string[]): string[] {
  return ids.filter((id) => Boolean(getGearItem(id)));
}

export function unique(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

function legacyItem(
  id: string,
  name: string,
  slot: GearSlot,
  priceTokens: number,
  emoji: string,
  tier: GearItem['tier'],
  battleStats: Partial<BattleStats>,
  visualLayerId: string
): GearItem {
  return {
    id,
    name,
    slot,
    priceTokens,
    emoji,
    tier,
    unlock: { kind: 'paid' },
    battleStats,
    visualLayerId,
    tags: ['legacy', slot],
  };
}

import type { ReactNode } from 'react';
import type { AvatarPose, GearFxLevel, GearHandPose, GearItem, GearSlot, GearTheme } from '@/types';
import type { AvatarPalette } from './palettes';
import { themeFromVisualKey } from './palettes';

export interface GearVisualRenderProps {
  item: GearItem;
  palette: AvatarPalette;
  idPrefix: string;
  highlighted: boolean;
  pose: AvatarPose;
}

export interface GearVisualDefinition {
  key: string;
  slot: GearSlot;
  theme: GearTheme;
  render: (props: GearVisualRenderProps) => ReactNode;
  hidesHair?: boolean;
  hidesFace?: boolean;
  handPose?: GearHandPose;
  fxLevel?: GearFxLevel;
}

type VisualMeta = {
  family: string;
  slot: GearSlot;
  variant: string;
};

type SlotAnchor = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

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

const FAMILY_THEME: Record<string, GearTheme> = {
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

const PREMIUM_FAMILIES = [
  'akashi',
  'samurai-verde',
  'ninja-eco',
  'mago-da-floresta',
  'cyber-reciclador',
  'aventureiro',
  'pirata-recicla',
  'cientista-eco',
  'ciclista-verde',
  'capoeirista',
  'guardiao-da-floresta',
];

const VISUAL_FAMILIES = [...VISUAL_THEMES, ...PREMIUM_FAMILIES];

const SLOT_RENDERERS: Record<GearSlot, (props: GearVisualRenderProps) => ReactNode> = {
  hair: HairVisual,
  head: HeadVisual,
  face: FaceVisual,
  torso: TorsoVisual,
  legs: LegsVisual,
  feet: FeetVisual,
  back: BackVisual,
  mainHand: HandVisual,
  offHand: HandVisual,
  aura: AuraVisual,
};

export const visualRegistry = Object.fromEntries(
  VISUAL_FAMILIES.flatMap((family) =>
    VISUAL_SLOTS.map((slot) => {
      const key = `${family}.${slot}.standard`;
      return [key, createVisualDefinition(key, family, slot)];
    })
  )
) as Record<string, GearVisualDefinition>;

export function gearVisualKey(theme: GearTheme, slot: GearSlot) {
  return `${theme}.${slot}.standard`;
}

export function hasGearVisual(key: string | null | undefined) {
  const meta = parseGearVisualKey(key);
  return Boolean(meta && FAMILY_THEME[meta.family] && VISUAL_SLOTS.includes(meta.slot));
}

export function resolveGearVisual(item: GearItem): GearVisualDefinition {
  const meta = parseGearVisualKey(item.visualKey) ?? parseGearVisualKey(item.visualLayerId);
  if (meta && hasGearVisual(`${meta.family}.${meta.slot}.${meta.variant}`)) {
    return createVisualDefinition(item.visualKey, meta.family, meta.slot);
  }

  const [legacyFamily, legacySlot] = item.visualLayerId.split(':');
  const slot = VISUAL_SLOTS.includes(legacySlot as GearSlot) ? (legacySlot as GearSlot) : item.slot;
  return createVisualDefinition(`nature.${slot}.fallback`, legacyFamily || 'nature', slot);
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
  const family = familyFromVisualKey(item.visualKey);
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
  const family = familyFromVisualKey(item.visualKey);
  const name = item.name.toLowerCase();
  return item.slot === 'face' && (family === 'ninja-eco' || name.includes('máscara') || name.includes('mascara'));
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

function createVisualDefinition(key: string, family: string, slot: GearSlot): GearVisualDefinition {
  return {
    key,
    slot,
    theme: FAMILY_THEME[family] ?? themeFromVisualKey(family),
    render: SLOT_RENDERERS[slot],
  };
}

function parseGearVisualKey(key: string | null | undefined): VisualMeta | null {
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

function familyFromVisualKey(key: string) {
  return parseGearVisualKey(key)?.family ?? 'nature';
}

function familyOf(item: GearItem) {
  return familyFromVisualKey(item.visualKey);
}

function isFamily(item: GearItem, ...families: string[]) {
  return families.includes(familyOf(item));
}

function isTheme(item: GearItem, theme: GearTheme) {
  return themeFromVisualKey(item.visualKey) === theme;
}

function wrapVisual(children: ReactNode, props: GearVisualRenderProps) {
  return (
    <g
      data-gear-family={familyOf(props.item)}
      data-gear-key={props.item.visualKey}
      filter={props.highlighted ? 'url(#avatar-slot-glow)' : 'url(#avatar-gear-shadow)'}
    >
      {props.highlighted ? <SlotHighlight slot={props.item.slot} /> : null}
      {children}
    </g>
  );
}

function SlotHighlight({ slot }: { slot: GearSlot }) {
  const anchor = SLOT_ANCHORS[slot];
  return (
    <ellipse
      cx={anchor.cx}
      cy={anchor.cy}
      rx={anchor.rx}
      ry={anchor.ry}
      fill="none"
      stroke="#b9f7c7"
      strokeWidth="3"
      strokeDasharray="7 8"
      opacity="0.7"
    />
  );
}

function HairVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);

  if (family === 'samurai-verde' || item.name.toLowerCase().includes('topknot')) {
    return wrapVisual(
      <g>
        <path d="M80 102 C82 64, 102 47, 122 47 C145 47, 163 65, 163 103 C146 88, 103 87, 80 102 Z" fill={palette.dark} />
        <ellipse cx="121" cy="43" rx="16" ry="13" fill={palette.dark} />
        <path d="M104 48 C112 38, 129 37, 138 49" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
      </g>,
      props
    );
  }

  if (family === 'akashi' || isTheme(item, 'anime')) {
    return wrapVisual(
      <g>
        <path d="M73 103 C76 74, 93 52, 119 46 C148 39, 169 64, 166 105 C146 86, 105 84, 73 103 Z" fill={palette.dark} />
        <path d="M77 95 L91 50 L105 91 L122 36 L137 92 L157 54 L165 102 C139 77, 102 80, 77 95 Z" fill={palette.primary} />
        <path d="M91 75 L105 92 M135 73 L125 93" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
      </g>,
      props
    );
  }

  return wrapVisual(
    <g>
      <path d="M74 101 C78 62, 105 43, 130 47 C157 52, 173 75, 166 109 C145 88, 103 84, 74 101 Z" fill={palette.dark} />
      <path d="M88 63 C106 47, 137 49, 155 72" fill="none" stroke={palette.primary} strokeWidth="8" strokeLinecap="round" opacity="0.76" />
    </g>,
    props
  );
}

function HeadVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);
  const name = item.name.toLowerCase();

  if (family === 'cyber-reciclador' || isTheme(item, 'cyber')) {
    return wrapVisual(
      <g>
        <path d="M78 91 C82 61, 103 45, 124 45 C147 46, 165 63, 168 91" fill="none" stroke={palette.dark} strokeWidth="10" strokeLinecap="round" />
        <rect x="61" y="83" width="25" height="34" rx="11" fill={palette.secondary} stroke={palette.accent} strokeWidth="4" />
        <rect x="154" y="83" width="25" height="34" rx="11" fill={palette.secondary} stroke={palette.accent} strokeWidth="4" />
        <path d="M82 75 C101 60, 139 60, 158 75" fill="none" stroke={palette.glow} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      </g>,
      props
    );
  }

  if (family === 'samurai-verde' || name.includes('kabuto')) {
    return wrapVisual(
      <g>
        <path d="M72 96 C76 56, 99 37, 121 37 C145 37, 166 57, 169 96 Z" fill={palette.primary} />
        <path d="M77 88 C92 75, 148 75, 164 88 L160 101 L81 101 Z" fill={palette.secondary} opacity="0.62" />
        <path d="M66 97 L175 97" stroke={palette.accent} strokeWidth="9" strokeLinecap="round" />
        <path d="M85 61 C61 51, 53 37, 52 26 C70 43, 88 45, 102 47" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
        <path d="M157 61 C181 51, 189 37, 190 26 C172 43, 154 45, 140 47" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
      </g>,
      props
    );
  }

  if (family === 'ninja-eco' || name.includes('capuz')) {
    return wrapVisual(
      <g>
        <path d="M65 122 C66 70, 89 38, 121 36 C154 38, 175 70, 177 122 C152 100, 91 100, 65 122 Z" fill={palette.primary} />
        <path d="M79 117 C86 80, 103 61, 121 60 C142 61, 156 80, 162 117 C140 101, 101 101, 79 117 Z" fill={palette.dark} opacity="0.62" />
        <path d="M77 89 C95 73, 145 73, 163 89" fill="none" stroke={palette.accent} strokeWidth="4" opacity="0.55" />
      </g>,
      props
    );
  }

  if (family === 'mago-da-floresta') {
    return wrapVisual(
      <g>
        <path d="M64 123 C71 70, 93 38, 120 34 C150 39, 171 72, 178 123 C151 99, 94 99, 64 123 Z" fill={palette.primary} />
        <path d="M101 45 C111 29, 130 29, 139 45" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
        <circle cx="121" cy="55" r="6" fill={palette.glow} />
      </g>,
      props
    );
  }

  if (family === 'guardiao-da-floresta' || name.includes('coroa')) {
    return wrapVisual(
      <g>
        <path d="M76 87 L89 60 L102 82 L120 47 L137 82 L151 60 L165 87 Z" fill={palette.accent} />
        <rect x="78" y="86" width="84" height="13" rx="6.5" fill={palette.secondary} />
        <path d="M91 62 C88 48, 95 39, 104 33 M151 62 C155 47, 148 38, 138 31" fill="none" stroke={palette.dark} strokeWidth="5" strokeLinecap="round" />
        <circle cx="104" cy="33" r="5" fill={palette.glow} />
        <circle cx="138" cy="31" r="5" fill={palette.glow} />
      </g>,
      props
    );
  }

  if (family === 'pirata-recicla') {
    return wrapVisual(
      <g>
        <path d="M76 86 C91 61, 145 59, 166 86 L160 98 C136 88, 105 88, 80 98 Z" fill={palette.primary} />
        <path d="M83 88 L165 80" stroke={palette.accent} strokeWidth="8" strokeLinecap="round" />
        <path d="M154 83 L175 69 L168 92 Z" fill={palette.accent} />
      </g>,
      props
    );
  }

  if (family === 'ciclista-verde' || name.includes('capacete')) {
    return wrapVisual(
      <g>
        <path d="M74 91 C77 55, 100 39, 124 40 C149 41, 166 60, 169 91 Z" fill={palette.primary} />
        <path d="M82 71 H160" stroke={palette.dark} strokeWidth="5" opacity="0.35" />
        <path d="M94 51 L117 90 M137 51 L119 90" stroke={palette.light} strokeWidth="4" opacity="0.55" />
      </g>,
      props
    );
  }

  return wrapVisual(
    <g>
      <path d="M75 88 C78 58, 99 43, 122 43 C146 43, 164 60, 166 88 Z" fill={palette.primary} />
      <rect x="82" y="84" width="78" height="12" rx="6" fill={palette.accent} />
    </g>,
    props
  );
}

function FaceVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);
  const name = item.name.toLowerCase();

  if (family === 'cyber-reciclador' || isTheme(item, 'cyber') || name.includes('visor')) {
    return wrapVisual(
      <g>
        <path d="M76 113 C91 103, 149 103, 164 113 L160 135 C141 144, 99 144, 81 135 Z" fill={palette.dark} opacity="0.9" />
        <rect x="84" y="114" width="32" height="18" rx="7" fill={palette.accent} opacity="0.82" />
        <rect x="125" y="114" width="32" height="18" rx="7" fill={palette.accent} opacity="0.82" />
        <path d="M88 126 L111 118 M130 126 L153 118" stroke={palette.light} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <circle cx="120" cy="123" r="3" fill={palette.glow} />
      </g>,
      props
    );
  }

  if (family === 'ninja-eco' || name.includes('máscara') || name.includes('mascara')) {
    return wrapVisual(
      <g>
        <path d="M77 113 C98 102, 143 102, 164 113 L160 143 C141 154, 102 154, 81 143 Z" fill={palette.dark} opacity="0.95" />
        <path d="M90 121 Q105 116, 116 122" stroke={palette.light} strokeWidth="4" strokeLinecap="round" />
        <path d="M125 122 Q139 116, 152 121" stroke={palette.light} strokeWidth="4" strokeLinecap="round" />
        <path d="M91 136 C109 142, 132 142, 150 136" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      </g>,
      props
    );
  }

  if (family === 'guardiao-da-floresta') {
    return wrapVisual(
      <g>
        <path d="M93 119 C103 109, 112 110, 119 121 C110 124, 101 126, 93 119 Z" fill={palette.accent} opacity="0.8" />
        <path d="M147 119 C137 109, 128 110, 121 121 C130 124, 139 126, 147 119 Z" fill={palette.accent} opacity="0.8" />
        <path d="M120 128 C115 138, 108 145, 99 150" stroke={palette.secondary} strokeWidth="4" strokeLinecap="round" />
        <path d="M120 128 C125 138, 132 145, 141 150" stroke={palette.secondary} strokeWidth="4" strokeLinecap="round" />
      </g>,
      props
    );
  }

  if (name.includes('colar')) {
    return wrapVisual(
      <g>
        <path d="M93 151 Q121 166, 149 151" fill="none" stroke={palette.dark} strokeWidth="4" strokeLinecap="round" />
        <circle cx="121" cy="164" r="7" fill={palette.accent} />
      </g>,
      props
    );
  }

  return wrapVisual(
    <g>
      <rect x="82" y="111" width="33" height="20" rx="8" fill="rgba(15,25,20,0.52)" stroke={palette.accent} strokeWidth="4" />
      <rect x="126" y="111" width="33" height="20" rx="8" fill="rgba(15,25,20,0.52)" stroke={palette.accent} strokeWidth="4" />
      <path d="M115 121 L126 121" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
    </g>,
    props
  );
}

function TorsoVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);

  if (family === 'cyber-reciclador' || isTheme(item, 'cyber')) {
    return wrapVisual(
      <g>
        <path d="M66 175 C74 141, 94 127, 120 127 C148 127, 168 141, 176 175 L166 239 C139 254, 101 254, 74 239 Z" fill={palette.primary} />
        <path d="M82 145 L101 136 L120 179 L139 136 L158 145 L162 223 L78 223 Z" fill={palette.secondary} opacity="0.9" />
        <path d="M99 153 L120 179 L141 153" fill="none" stroke={palette.accent} strokeWidth="6" strokeLinecap="round" />
        <circle cx="120" cy="190" r="11" fill={palette.dark} />
        <circle cx="120" cy="190" r="7" fill={palette.glow} />
        <rect x="75" y="165" width="18" height="35" rx="7" fill={palette.accent} opacity="0.7" />
        <rect x="147" y="165" width="18" height="35" rx="7" fill={palette.accent} opacity="0.7" />
      </g>,
      props
    );
  }

  if (family === 'samurai-verde' || isTheme(item, 'samurai')) {
    return wrapVisual(
      <g>
        <path d="M65 174 C74 141, 94 128, 120 128 C147 128, 166 141, 175 174 L166 238 C139 253, 101 253, 75 238 Z" fill={palette.primary} />
        <path d="M58 159 C75 145, 91 144, 104 154 L98 174 C82 168, 70 169, 57 180 Z" fill={palette.secondary} />
        <path d="M182 159 C165 145, 149 144, 136 154 L142 174 C158 168, 170 169, 183 180 Z" fill={palette.secondary} />
        <path d="M78 166 L162 166 M80 186 L160 186 M84 207 L156 207" stroke={palette.accent} strokeWidth="7" opacity="0.78" />
        <path d="M92 137 L120 177 L148 137" fill="none" stroke={palette.light} strokeWidth="5" opacity="0.42" />
      </g>,
      props
    );
  }

  if (family === 'ninja-eco') {
    return wrapVisual(
      <g>
        <path d="M68 176 C78 142, 96 128, 120 128 C145 128, 163 142, 173 176 L164 239 C138 252, 102 252, 76 239 Z" fill={palette.primary} />
        <path d="M84 143 L156 143 L147 224 L93 224 Z" fill={palette.dark} opacity="0.72" />
        <path d="M88 164 C105 154, 136 154, 153 164" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
        <path d="M98 223 L142 143" stroke={palette.accent} strokeWidth="6" opacity="0.62" />
        <path d="M84 201 C101 209, 139 209, 156 201" stroke={palette.light} strokeWidth="4" opacity="0.38" />
      </g>,
      props
    );
  }

  if (family === 'mago-da-floresta') {
    return wrapVisual(
      <g>
        <path d="M66 172 C77 138, 94 127, 120 127 C148 127, 165 138, 176 172 L171 250 C145 266, 96 266, 70 250 Z" fill={palette.primary} />
        <path d="M95 131 C104 166, 110 207, 108 258 L132 258 C130 207, 137 166, 146 131" fill={palette.secondary} opacity="0.72" />
        <path d="M86 162 C102 172, 138 172, 154 162" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <circle cx="120" cy="181" r="11" fill={palette.accent} />
        <path d="M120 168 L120 194 M107 181 L133 181" stroke={palette.dark} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      </g>,
      props
    );
  }

  if (family === 'guardiao-da-floresta') {
    return wrapVisual(
      <g>
        <path d="M64 174 C74 140, 94 127, 120 127 C148 127, 168 140, 178 174 L166 240 C139 256, 101 256, 74 240 Z" fill={palette.secondary} />
        <path d="M83 145 C102 134, 139 134, 158 145 L150 224 C132 238, 108 238, 90 224 Z" fill={palette.primary} />
        <path d="M87 157 C66 151, 56 139, 51 123 C70 132, 84 135, 100 137" fill={palette.accent} opacity="0.88" />
        <path d="M153 157 C174 151, 184 139, 189 123 C170 132, 156 135, 140 137" fill={palette.accent} opacity="0.88" />
        <path d="M96 156 C106 184, 103 209, 91 230 M144 156 C134 184, 137 209, 149 230" stroke={palette.dark} strokeWidth="5" strokeLinecap="round" opacity="0.62" />
      </g>,
      props
    );
  }

  if (family === 'cientista-eco') {
    return wrapVisual(
      <g>
        <path d="M66 174 C76 142, 95 128, 120 128 C146 128, 165 142, 174 174 L167 244 C141 258, 99 258, 73 244 Z" fill={palette.primary} />
        <path d="M96 133 L120 179 L144 133 L154 244 L86 244 Z" fill={palette.light} opacity="0.92" />
        <path d="M99 154 L119 180 L141 154" stroke={palette.secondary} strokeWidth="5" strokeLinecap="round" />
        <rect x="132" y="180" width="18" height="20" rx="5" fill={palette.accent} opacity="0.7" />
      </g>,
      props
    );
  }

  if (family === 'pirata-recicla') {
    return wrapVisual(
      <g>
        <path d="M66 174 C75 142, 95 128, 120 128 C146 128, 166 142, 175 174 L166 240 C139 254, 101 254, 74 240 Z" fill={palette.primary} />
        <path d="M84 139 C101 159, 109 191, 103 240 L137 240 C131 191, 139 159, 156 139" fill={palette.secondary} />
        <path d="M78 162 C93 172, 109 174, 120 170 C131 174, 147 172, 162 162" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
      </g>,
      props
    );
  }

  if (family === 'capoeirista') {
    return wrapVisual(
      <g>
        <path d="M67 174 C76 143, 96 128, 120 128 C145 128, 164 143, 173 174 L165 239 C139 252, 102 252, 75 239 Z" fill={palette.primary} />
        <path d="M88 149 C106 160, 133 160, 152 149" stroke={palette.secondary} strokeWidth="8" strokeLinecap="round" />
        <path d="M96 177 C109 186, 132 186, 145 177" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
      </g>,
      props
    );
  }

  return wrapVisual(
    <g>
      <path d="M68 174 C76 143, 95 128, 120 128 C145 128, 164 143, 172 174 L165 240 C139 253, 102 253, 76 240 Z" fill={palette.primary} />
      <path d="M92 137 L120 180 L148 137" fill="none" stroke={palette.accent} strokeWidth="6" strokeLinecap="round" />
    </g>,
    props
  );
}

function LegsVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);

  if (family === 'samurai-verde') {
    return wrapVisual(
      <g>
        <path d="M75 224 L116 224 L109 293 L78 293 Z" fill={palette.secondary} />
        <path d="M124 224 L166 224 L162 293 L131 293 Z" fill={palette.secondary} />
        <path d="M81 241 L112 241 M128 241 L160 241 M84 262 L110 262 M130 262 L158 262" stroke={palette.accent} strokeWidth="4" opacity="0.42" />
      </g>,
      props
    );
  }

  if (family === 'ninja-eco' || family === 'cyber-reciclador') {
    return wrapVisual(
      <g>
        <path d="M83 224 L113 224 L108 292 L84 292 Z" fill={palette.secondary} />
        <path d="M127 224 L158 224 L156 292 L132 292 Z" fill={palette.secondary} />
        <path d="M90 247 L106 247 M134 247 L152 247" stroke={palette.accent} strokeWidth="4" opacity="0.62" />
        {family === 'cyber-reciclador' ? <path d="M94 229 L103 286 M146 229 L137 286" stroke={palette.glow} strokeWidth="3" opacity="0.48" /> : null}
      </g>,
      props
    );
  }

  if (family === 'mago-da-floresta') {
    return wrapVisual(
      <path d="M78 222 C94 236, 146 236, 163 222 L156 294 L84 294 Z" fill={palette.secondary} opacity="0.92" />,
      props
    );
  }

  if (family === 'guardiao-da-floresta') {
    return wrapVisual(
      <g>
        <path d="M78 224 L115 224 L108 292 L78 292 Z" fill={palette.secondary} />
        <path d="M125 224 L163 224 L162 292 L132 292 Z" fill={palette.secondary} />
        <path d="M89 237 C100 248, 100 266, 86 288 M151 237 C140 248, 140 266, 154 288" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
      </g>,
      props
    );
  }

  return wrapVisual(
    <g>
      <path d="M78 224 L114 224 L108 292 L82 292 Z" fill={palette.secondary} />
      <path d="M126 224 L162 224 L158 292 L132 292 Z" fill={palette.secondary} />
      <path d="M86 248 L108 248 M132 248 L154 248" stroke={palette.accent} strokeWidth="4" opacity="0.45" />
    </g>,
    props
  );
}

function FeetVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);
  const boot = isFamily(item, 'mago-da-floresta', 'guardiao-da-floresta', 'aventureiro', 'pirata-recicla', 'cientista-eco');
  const sandal = family === 'samurai-verde' || family === 'capoeirista';

  return wrapVisual(
    <g>
      <path
        d={boot ? 'M71 284 C88 278, 107 283, 115 295 C102 307, 76 307, 63 299 C63 292, 66 288, 71 284 Z' : 'M75 291 C92 286, 107 289, 116 298 C105 307, 78 307, 65 300 C66 296, 70 293, 75 291 Z'}
        fill={sandal ? palette.primary : palette.dark}
      />
      <path
        d={boot ? 'M125 295 C134 283, 152 278, 169 284 C174 288, 178 292, 177 299 C164 307, 138 307, 125 295 Z' : 'M124 298 C133 289, 148 286, 165 291 C170 293, 174 296, 175 300 C162 307, 135 307, 124 298 Z'}
        fill={sandal ? palette.primary : palette.dark}
      />
      <path d="M77 295 L107 295 M133 295 L163 295" stroke={palette.light} strokeWidth="3" opacity="0.62" />
      {family === 'cyber-reciclador' ? <path d="M82 300 H110 M132 300 H160" stroke={palette.glow} strokeWidth="4" strokeLinecap="round" opacity="0.8" /> : null}
    </g>,
    props
  );
}

function BackVisual(props: GearVisualRenderProps) {
  const { item, palette } = props;
  const family = familyOf(item);

  if (family === 'cyber-reciclador') {
    return wrapVisual(
      <g>
        <rect x="151" y="137" width="45" height="100" rx="16" fill={palette.secondary} />
        <rect x="162" y="153" width="23" height="39" rx="8" fill={palette.accent} opacity="0.72" />
        <circle cx="174" cy="216" r="10" fill={palette.glow} />
        <path d="M155 170 C133 154, 108 154, 85 171" fill="none" stroke={palette.dark} strokeWidth="7" opacity="0.48" />
      </g>,
      props
    );
  }

  if (family === 'mago-da-floresta' || family === 'guardiao-da-floresta') {
    return wrapVisual(
      <g>
        <path d="M63 126 C41 169, 42 254, 75 299 C94 278, 146 278, 166 299 C199 254, 199 169, 177 126 Z" fill={palette.secondary} opacity="0.88" />
        <path d="M82 146 C73 194, 79 244, 99 282 M158 146 C167 194, 161 244, 141 282" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      </g>,
      props
    );
  }

  if (family === 'ciclista-verde') {
    return wrapVisual(
      <g>
        <rect x="156" y="143" width="39" height="72" rx="14" fill={palette.secondary} />
        <circle cx="176" cy="132" r="14" fill={palette.accent} opacity="0.78" />
        <path d="M176 113 V151 M157 132 H195" stroke={palette.light} strokeWidth="4" strokeLinecap="round" />
      </g>,
      props
    );
  }

  return wrapVisual(
    <g>
      <rect x="156" y="145" width="38" height="90" rx="15" fill={palette.primary} />
      <rect x="164" y="160" width="22" height="32" rx="7" fill={palette.light} opacity="0.32" />
      <path d="M158 170 C133 155, 107 155, 82 170" fill="none" stroke={palette.dark} strokeWidth="7" opacity="0.55" />
    </g>,
    props
  );
}

function HandVisual(props: GearVisualRenderProps) {
  const { item, palette, pose } = props;
  const family = familyOf(item);
  const right = item.slot === 'mainHand';
  const dir = right ? 1 : -1;
  const x = right ? (pose === 'attack' ? 213 : 181) : pose === 'defend' ? 53 : 60;
  const y = right ? (pose === 'attack' ? 127 : 235) : pose === 'defend' ? 214 : 235;
  const name = item.name.toLowerCase();

  if (name.includes('katana') || name.includes('lâmina') || name.includes('lamina')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${pose === 'attack' ? dir * -42 : dir * -22})`}>
        <path d="M0 18 L0 -76" stroke={palette.light} strokeWidth="5" strokeLinecap="round" />
        <path d="M0 -76 L8 -88 L4 -72 Z" fill={palette.accent} />
        <rect x="-14" y="7" width="28" height="8" rx="3" fill={palette.accent} />
        <rect x="-6" y="14" width="12" height="28" rx="5" fill={palette.dark} />
      </g>,
      props
    );
  }

  if (name.includes('machado')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * -20})`}>
        <path d="M0 25 L0 -72" stroke="#7a4318" strokeWidth="7" strokeLinecap="round" />
        <path d="M-3 -73 C24 -85, 33 -56, 3 -44 Z" fill={palette.accent} />
        <path d="M-1 -73 C-26 -82,-31 -57,-2 -43 Z" fill={palette.light} opacity="0.55" />
      </g>,
      props
    );
  }

  if (name.includes('gancho')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * -20})`}>
        <path d="M0 20 L0 -56" stroke={palette.light} strokeWidth="6" strokeLinecap="round" />
        <path d="M0 -58 C28 -58, 27 -25, 4 -24" fill="none" stroke={palette.accent} strokeWidth="7" strokeLinecap="round" />
      </g>,
      props
    );
  }

  if (name.includes('cajado') || name.includes('bo') || name.includes('berimbau')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y + 2}) rotate(${dir * 8})`}>
        <path d="M0 45 L0 -89" stroke={name.includes('berimbau') ? palette.accent : '#7a4318'} strokeWidth="7" strokeLinecap="round" />
        {name.includes('berimbau') ? (
          <path d="M0 -89 C38 -50, 36 8, 0 45" fill="none" stroke={palette.light} strokeWidth="4" />
        ) : (
          <>
            <circle cx="0" cy="-92" r="14" fill={palette.accent} />
            <path d="M-10 -92 H10 M0 -102 V-82" stroke={palette.light} strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </g>,
      props
    );
  }

  if (family === 'cyber-reciclador' || name.includes('scanner') || name.includes('coletor')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * 9})`}>
        <rect x="-15" y="-36" width="30" height="61" rx="11" fill={palette.secondary} />
        <rect x="-9" y="-29" width="18" height="23" rx="5" fill={palette.accent} opacity="0.8" />
        <circle cx="0" cy="13" r="8" fill={palette.glow} />
        <path d="M-21 -12 H21" stroke={palette.light} strokeWidth="4" strokeLinecap="round" opacity="0.62" />
      </g>,
      props
    );
  }

  if (name.includes('mapa') || name.includes('béquer') || name.includes('bequer') || name.includes('garrafa')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * -8})`}>
        {name.includes('mapa') ? (
          <path d="M-20 -24 L19 -32 L22 22 L-18 30 Z" fill={palette.light} stroke={palette.accent} strokeWidth="4" />
        ) : (
          <path d="M-12 -36 L12 -36 L8 22 C5 34,-5 34,-8 22 Z" fill={palette.accent} opacity="0.84" stroke={palette.light} strokeWidth="4" />
        )}
      </g>,
      props
    );
  }

  return wrapVisual(
    <g transform={`translate(${x} ${y}) rotate(${dir * 12})`}>
      <path d="M0,-25 L10,-5 L30,0 L10,5 L0,25 L-10,5 L-30,0 L-10,-5 Z" fill={palette.accent} />
      <circle cx="0" cy="0" r="6" fill={palette.dark} />
    </g>,
    props
  );
}

function AuraVisual(props: GearVisualRenderProps) {
  const { item, palette, idPrefix } = props;
  const level = itemFxLevel(item);
  const family = familyOf(item);
  const ringId = `${idPrefix}-${item.id}-aura`;
  const isCircuit = family === 'cyber-reciclador' || isTheme(item, 'cyber');
  const isForest = family === 'guardiao-da-floresta' || family === 'mago-da-floresta';

  return wrapVisual(
    <g opacity={level >= 3 ? 0.95 : 0.8}>
      <radialGradient id={ringId}>
        <stop offset="0%" stopColor={palette.glow} stopOpacity="0.34" />
        <stop offset="70%" stopColor={palette.glow} stopOpacity="0.08" />
        <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
      </radialGradient>
      <ellipse cx="120" cy="170" rx={level >= 3 ? 106 : 92} ry={level >= 3 ? 140 : 124} fill={`url(#${ringId})`} />
      <ellipse
        cx="120"
        cy="170"
        rx={level >= 3 ? 98 : 86}
        ry={level >= 3 ? 128 : 112}
        fill="none"
        stroke={palette.glow}
        strokeWidth={level >= 3 ? 5 : 3}
        strokeDasharray={isCircuit ? '10 11' : isForest ? '3 12' : undefined}
        opacity="0.72"
      />
      {level >= 2 ? (
        <>
          <circle cx="64" cy="92" r="7" fill={palette.accent} />
          <circle cx="181" cy="128" r="5" fill={palette.light} />
          <circle cx="86" cy="250" r="5" fill={palette.glow} />
          {isForest ? (
            <>
              <path d="M54 132 C66 122, 77 124, 83 136 C70 138, 61 139, 54 132 Z" fill={palette.accent} opacity="0.75" />
              <path d="M178 237 C190 226, 202 230, 207 242 C194 243, 185 244, 178 237 Z" fill={palette.accent} opacity="0.75" />
            </>
          ) : null}
        </>
      ) : null}
    </g>,
    props
  );
}

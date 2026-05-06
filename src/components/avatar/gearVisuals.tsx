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

const GENERATED_VISUALS = Object.fromEntries(
  VISUAL_THEMES.flatMap((theme) =>
    VISUAL_SLOTS.map((slot) => {
      const key = `${theme}:${slot}`;
      return [
        key,
        {
          key,
          slot,
          theme,
          render: SLOT_RENDERERS[slot],
        } satisfies GearVisualDefinition,
      ];
    })
  )
) as Record<string, GearVisualDefinition>;

export function gearVisualKey(theme: GearTheme, slot: GearSlot) {
  return `${theme}:${slot}`;
}

export function hasGearVisual(key: string | null | undefined) {
  return Boolean(key && GENERATED_VISUALS[key]);
}

export function resolveGearVisual(item: GearItem): GearVisualDefinition {
  const exact = GENERATED_VISUALS[item.visualKey];
  if (exact) return exact;
  const [theme, slot] = item.visualLayerId.split(':');
  const fallback = GENERATED_VISUALS[`${theme}:${slot}`] ?? GENERATED_VISUALS[`nature:${item.slot}`];
  return fallback;
}

export function itemHidesHair(item: GearItem) {
  if (item.hidesHair !== undefined) return item.hidesHair;
  const theme = themeFromVisualKey(item.visualKey);
  const name = item.name.toLowerCase();
  return item.slot === 'head' && (theme === 'fantasy' || name.includes('capuz') || name.includes('capacete'));
}

export function itemHidesFace(item: GearItem) {
  if (item.hidesFace !== undefined) return item.hidesFace;
  const name = item.name.toLowerCase();
  return item.slot === 'face' && (name.includes('máscara') || name.includes('mascara'));
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

function wrapVisual(children: ReactNode, highlighted: boolean) {
  return (
    <g filter={highlighted ? 'url(#avatar-slot-glow)' : undefined}>
      {children}
    </g>
  );
}

function HairVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const spiky = theme === 'anime' || item.name.toLowerCase().includes('anime');
  const topknot = item.name.toLowerCase().includes('topknot');
  return wrapVisual(
    <g fill={palette.dark}>
      {topknot ? (
        <>
          <ellipse cx="120" cy="46" rx="16" ry="14" />
          <path d="M100 56 C104 34, 134 34, 140 58 C128 50, 113 50, 100 56 Z" />
          <path d="M108 46 L132 46" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : spiky ? (
        <>
          <path d="M76 98 L87 45 L105 88 Z" />
          <path d="M95 86 L120 31 L134 88 Z" />
          <path d="M128 88 L154 45 L163 102 Z" />
          <path d="M82 105 C88 66, 153 62, 164 106 C140 84, 107 83, 82 105 Z" />
        </>
      ) : (
        <path d="M76 101 C80 62, 105 44, 129 47 C154 51, 170 74, 164 108 C146 86, 105 83, 76 101 Z" />
      )}
    </g>,
    highlighted
  );
}

function HeadVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const name = item.name.toLowerCase();
  if (theme === 'fantasy' || name.includes('capuz')) {
    return wrapVisual(
      <g>
        <path d="M67 119 C70 65, 93 38, 121 36 C151 38, 173 67, 176 119 C151 95, 95 95, 67 119 Z" fill={palette.primary} />
        <path d="M83 113 C88 78, 104 60, 121 59 C141 60, 155 79, 160 113 C141 96, 101 96, 83 113 Z" fill={palette.dark} opacity="0.45" />
      </g>,
      highlighted
    );
  }
  if (theme === 'samurai' || name.includes('kabuto')) {
    return wrapVisual(
      <g>
        <path d="M77 93 C80 54, 101 38, 121 38 C143 38, 162 55, 165 93 Z" fill={palette.primary} />
        <path d="M70 94 L171 94" stroke={palette.accent} strokeWidth="9" strokeLinecap="round" />
        <path d="M83 61 C58 52, 51 36, 52 28 C70 45, 88 46, 100 47" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
        <path d="M158 61 C184 52, 190 36, 189 28 C171 45, 153 46, 141 47" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
      </g>,
      highlighted
    );
  }
  if (name.includes('coroa')) {
    return wrapVisual(
      <g fill={palette.accent}>
        <path d="M78 82 L91 52 L106 80 L121 46 L136 80 L151 52 L164 82 Z" />
        <rect x="80" y="81" width="82" height="12" rx="6" />
      </g>,
      highlighted
    );
  }
  if (theme === 'explorer' || name.includes('boné') || name.includes('bone') || name.includes('capacete')) {
    return wrapVisual(
      <g>
        <path d="M76 88 C80 55, 101 42, 123 43 C145 44, 163 60, 165 88 Z" fill={palette.primary} />
        <path d="M96 86 C119 76, 155 77, 182 90 C154 97, 120 98, 86 91 Z" fill={palette.accent} />
        <path d="M92 56 L150 84" stroke={palette.light} strokeWidth="4" opacity="0.32" />
      </g>,
      highlighted
    );
  }
  return wrapVisual(
    <g>
      <path d="M75 88 C78 58, 99 43, 122 43 C146 43, 164 60, 166 88 Z" fill={palette.primary} />
      <rect x="82" y="84" width="78" height="12" rx="6" fill={palette.accent} />
    </g>,
    highlighted
  );
}

function FaceVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const name = item.name.toLowerCase();
  if (name.includes('colar')) {
    return wrapVisual(
      <g>
        <path d="M93 151 Q121 166, 149 151" fill="none" stroke={palette.dark} strokeWidth="4" strokeLinecap="round" />
        <circle cx="121" cy="164" r="7" fill={palette.accent} />
      </g>,
      highlighted
    );
  }
  if (name.includes('máscara') || name.includes('mascara') || theme === 'ninja') {
    return wrapVisual(
      <g>
        <path d="M78 113 C97 102, 143 102, 164 113 L160 139 C142 151, 102 151, 82 139 Z" fill={palette.dark} opacity="0.9" />
        <path d="M91 121 Q105 116, 116 121" stroke={palette.light} strokeWidth="4" strokeLinecap="round" />
        <path d="M126 121 Q139 116, 151 121" stroke={palette.light} strokeWidth="4" strokeLinecap="round" />
      </g>,
      highlighted
    );
  }
  if (theme === 'cyber' || name.includes('visor') || name.includes('óculos') || name.includes('oculos')) {
    return wrapVisual(
      <g>
        <rect x="78" y="108" width="84" height="27" rx="10" fill={palette.dark} opacity="0.86" />
        <rect x="84" y="113" width="31" height="16" rx="6" fill={palette.accent} opacity="0.72" />
        <rect x="126" y="113" width="31" height="16" rx="6" fill={palette.accent} opacity="0.72" />
        <path d="M115 122 L126 122" stroke={palette.light} strokeWidth="3" strokeLinecap="round" />
      </g>,
      highlighted
    );
  }
  return wrapVisual(
    <g>
      <rect x="83" y="111" width="32" height="20" rx="8" fill="rgba(15,25,20,0.50)" stroke={palette.accent} strokeWidth="4" />
      <rect x="126" y="111" width="32" height="20" rx="8" fill="rgba(15,25,20,0.50)" stroke={palette.accent} strokeWidth="4" />
      <path d="M115 121 L126 121" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
    </g>,
    highlighted
  );
}

function TorsoVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const name = item.name.toLowerCase();
  if (theme === 'samurai' || name.includes('armadura')) {
    return wrapVisual(
      <g>
        <path d="M69 177 C76 143, 94 128, 120 128 C147 128, 165 143, 172 177 L164 239 C138 253, 102 253, 76 239 Z" fill={palette.primary} />
        <path d="M78 166 L162 166 M80 186 L160 186 M84 207 L156 207" stroke={palette.accent} strokeWidth="7" opacity="0.75" />
        <path d="M91 137 L120 176 L149 137" fill="none" stroke={palette.light} strokeWidth="5" opacity="0.4" />
      </g>,
      highlighted
    );
  }
  if (theme === 'fantasy') {
    return wrapVisual(
      <g>
        <path d="M67 172 C78 138, 94 128, 120 128 C147 128, 164 138, 174 172 L168 246 C143 261, 96 261, 72 246 Z" fill={palette.primary} />
        <path d="M96 131 C104 165, 110 205, 108 253 L132 253 C130 205, 137 165, 145 131" fill={palette.secondary} opacity="0.7" />
        <circle cx="120" cy="177" r="10" fill={palette.accent} />
      </g>,
      highlighted
    );
  }
  if (theme === 'cyber') {
    return wrapVisual(
      <g>
        <path d="M67 175 C75 141, 94 128, 120 128 C147 128, 166 141, 174 175 L164 239 C139 252, 101 252, 76 239 Z" fill={palette.primary} />
        <path d="M90 143 L150 143 L160 222 L80 222 Z" fill={palette.secondary} opacity="0.78" />
        <path d="M104 153 L120 178 L136 153" fill="none" stroke={palette.accent} strokeWidth="6" strokeLinecap="round" />
        <circle cx="120" cy="190" r="9" fill={palette.accent} />
      </g>,
      highlighted
    );
  }
  if (theme === 'explorer') {
    return wrapVisual(
      <g>
        <path d="M68 174 C76 143, 95 128, 120 128 C145 128, 164 143, 172 174 L165 240 C139 253, 102 253, 76 240 Z" fill={palette.primary} />
        <path d="M82 139 L103 238 M158 139 L137 238" stroke={palette.secondary} strokeWidth="13" strokeLinecap="round" />
        <rect x="91" y="166" width="22" height="24" rx="6" fill={palette.accent} opacity="0.9" />
        <rect x="128" y="166" width="22" height="24" rx="6" fill={palette.accent} opacity="0.9" />
      </g>,
      highlighted
    );
  }
  return wrapVisual(
    <g>
      <path d="M68 174 C76 143, 95 128, 120 128 C145 128, 164 143, 172 174 L165 240 C139 253, 102 253, 76 240 Z" fill={palette.primary} />
      <path d="M92 137 L120 180 L148 137" fill="none" stroke={palette.accent} strokeWidth="6" strokeLinecap="round" />
    </g>,
    highlighted
  );
}

function LegsVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const slim = theme === 'cyber' || theme === 'ninja';
  return wrapVisual(
    <g>
      <path d={slim ? 'M82 224 L113 224 L108 292 L84 292 Z' : 'M77 224 L113 224 L107 292 L82 292 Z'} fill={palette.secondary} />
      <path d={slim ? 'M127 224 L158 224 L156 292 L132 292 Z' : 'M127 224 L163 224 L158 292 L133 292 Z'} fill={palette.secondary} />
      <path d="M86 248 L108 248 M132 248 L154 248" stroke={palette.accent} strokeWidth="4" opacity="0.45" />
    </g>,
    highlighted
  );
}

function FeetVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const boot = theme === 'fantasy' || theme === 'explorer' || theme === 'samurai';
  return wrapVisual(
    <g>
      <path d={boot ? 'M72 285 C87 279, 105 283, 113 295 C101 307, 76 307, 64 299 C64 293, 67 289, 72 285 Z' : 'M75 291 C92 286, 107 289, 116 298 C105 307, 78 307, 65 300 C66 296, 70 293, 75 291 Z'} fill={palette.dark} />
      <path d={boot ? 'M128 295 C137 283, 155 279, 170 285 C175 289, 178 293, 177 299 C165 307, 140 307, 128 295 Z' : 'M124 298 C133 289, 148 286, 165 291 C170 293, 174 296, 175 300 C162 307, 135 307, 124 298 Z'} fill={palette.dark} />
      <path d="M77 295 L107 295 M133 295 L163 295" stroke={palette.light} strokeWidth="3" opacity="0.6" />
    </g>,
    highlighted
  );
}

function BackVisual({ item, palette, highlighted }: GearVisualRenderProps) {
  const theme = themeFromVisualKey(item.visualKey);
  const name = item.name.toLowerCase();
  if (theme === 'fantasy' || name.includes('manto') || name.includes('capa')) {
    return wrapVisual(
      <path d="M65 128 C42 168, 43 254, 75 299 C93 278, 147 278, 166 299 C198 254, 198 168, 175 128 Z" fill={palette.secondary} opacity="0.84" />,
      highlighted
    );
  }
  if (theme === 'cyber') {
    return wrapVisual(
      <g>
        <rect x="158" y="143" width="36" height="88" rx="14" fill={palette.secondary} />
        <rect x="166" y="158" width="20" height="33" rx="7" fill={palette.accent} opacity="0.7" />
        <circle cx="176" cy="215" r="9" fill={palette.glow} />
      </g>,
      highlighted
    );
  }
  return wrapVisual(
    <g>
      <rect x="156" y="145" width="38" height="90" rx="15" fill={palette.primary} />
      <rect x="164" y="160" width="22" height="32" rx="7" fill={palette.light} opacity="0.32" />
      <path d="M158 170 C133 155, 107 155, 82 170" fill="none" stroke={palette.dark} strokeWidth="7" opacity="0.55" />
    </g>,
    highlighted
  );
}

function HandVisual(props: GearVisualRenderProps) {
  const { item, palette, highlighted, pose } = props;
  const theme = themeFromVisualKey(item.visualKey);
  const right = item.slot === 'mainHand';
  const x = right ? 180 : 60;
  const y = pose === 'attack' && right ? 181 : 199;
  const dir = right ? 1 : -1;
  const name = item.name.toLowerCase();

  if (name.includes('katana') || name.includes('lâmina') || name.includes('lamina') || name.includes('machado') || name.includes('gancho')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * -24})`}>
        <path d="M0 20 L0 -62" stroke={name.includes('machado') ? '#7a4318' : palette.light} strokeWidth={name.includes('machado') ? 7 : 5} strokeLinecap="round" />
        {name.includes('machado') ? <path d="M-3 -62 C20 -73, 27 -50, 3 -40 Z" fill={palette.accent} /> : null}
        {name.includes('gancho') ? <path d="M0 -62 C24 -64, 24 -31, 2 -29" fill="none" stroke={palette.accent} strokeWidth="6" strokeLinecap="round" /> : null}
        <rect x="-13" y="8" width="26" height="8" rx="3" fill={palette.accent} />
        <rect x="-6" y="15" width="12" height="28" rx="5" fill={palette.dark} />
      </g>,
      highlighted
    );
  }
  if (name.includes('cajado') || name.includes('bo') || name.includes('berimbau')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y + 3}) rotate(${dir * 8})`}>
        <path d="M0 48 L0 -82" stroke={name.includes('berimbau') ? palette.accent : '#7a4318'} strokeWidth="7" strokeLinecap="round" />
        {name.includes('berimbau') ? <path d="M0 -82 C35 -45, 34 8, 0 47" fill="none" stroke={palette.light} strokeWidth="4" /> : <circle cx="0" cy="-87" r="14" fill={palette.accent} />}
      </g>,
      highlighted
    );
  }
  if (theme === 'cyber' || name.includes('scanner') || name.includes('coletor')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * 9})`}>
        <rect x="-13" y="-34" width="26" height="58" rx="10" fill={palette.secondary} />
        <rect x="-8" y="-27" width="16" height="22" rx="5" fill={palette.accent} opacity="0.75" />
        <circle cx="0" cy="12" r="7" fill={palette.glow} />
      </g>,
      highlighted
    );
  }
  if (name.includes('mapa') || name.includes('béquer') || name.includes('bequer') || name.includes('garrafa')) {
    return wrapVisual(
      <g transform={`translate(${x} ${y}) rotate(${dir * -8})`}>
        {name.includes('mapa') ? (
          <path d="M-20 -24 L19 -32 L22 22 L-18 30 Z" fill={palette.light} stroke={palette.accent} strokeWidth="4" />
        ) : (
          <path d="M-12 -36 L12 -36 L8 22 C5 34,-5 34,-8 22 Z" fill={palette.accent} opacity="0.8" stroke={palette.light} strokeWidth="4" />
        )}
      </g>,
      highlighted
    );
  }
  return wrapVisual(
    <g transform={`translate(${x} ${y}) rotate(${dir * 12})`}>
      <path d="M0,-25 L10,-5 L30,0 L10,5 L0,25 L-10,5 L-30,0 L-10,-5 Z" fill={palette.accent} />
      <circle cx="0" cy="0" r="6" fill={palette.dark} />
    </g>,
    highlighted
  );
}

function AuraVisual({ item, palette, idPrefix, highlighted }: GearVisualRenderProps) {
  const level = itemFxLevel(item);
  const theme = themeFromVisualKey(item.visualKey);
  const ringId = `${idPrefix}-${item.id}-aura`;
  return wrapVisual(
    <g opacity={level >= 3 ? 0.95 : 0.78}>
      <radialGradient id={ringId}>
        <stop offset="0%" stopColor={palette.glow} stopOpacity="0.32" />
        <stop offset="70%" stopColor={palette.glow} stopOpacity="0.08" />
        <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
      </radialGradient>
      <ellipse cx="120" cy="170" rx={level >= 3 ? 104 : 92} ry={level >= 3 ? 138 : 124} fill={`url(#${ringId})`} />
      <ellipse cx="120" cy="170" rx={level >= 3 ? 98 : 86} ry={level >= 3 ? 128 : 112} fill="none" stroke={palette.glow} strokeWidth={level >= 3 ? 5 : 3} strokeDasharray={theme === 'cyber' ? '10 11' : undefined} opacity="0.72" />
      {level >= 2 ? (
        <>
          <circle cx="64" cy="92" r="7" fill={palette.accent} />
          <circle cx="181" cy="128" r="5" fill={palette.light} />
          <circle cx="86" cy="250" r="5" fill={palette.glow} />
        </>
      ) : null}
    </g>,
    highlighted
  );
}

'use client';

import { useId, useMemo } from 'react';
import type { AvatarLoadout, AvatarPose, GearItem, GearSlot } from '@/types';
import { AVATAR_BASES, GEAR_ITEMS } from '@/data';
import {
  itemHidesFace,
  itemHidesHair,
  resolveGearVisual,
} from '@/components/avatar/gearVisuals';
import { paletteForGear } from '@/components/avatar/palettes';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'stage' | 'duel';

const SIZE_MAP: Record<Size, number> = { sm: 38, md: 58, lg: 86, xl: 140, stage: 158, duel: 196 };

const SLOT_ORDER: GearSlot[] = [
  'aura',
  'back',
  'legs',
  'feet',
  'torso',
  'hair',
  'head',
  'face',
  'offHand',
  'mainHand',
];

interface Props {
  loadout: AvatarLoadout;
  size?: Size;
  className?: string;
  alt?: string;
  mirror?: boolean;
  pose?: AvatarPose;
  highlightSlot?: GearSlot;
  showAura?: boolean;
}

export function AvatarRenderer({
  loadout,
  size = 'md',
  className,
  alt,
  mirror,
  pose = 'idle',
  highlightSlot,
  showAura = true,
}: Props) {
  const reactId = useId().replace(/:/g, '');
  const sz = SIZE_MAP[size];
  const base = AVATAR_BASES.find((item) => item.id === loadout.baseId) ?? AVATAR_BASES[0];
  const gearBySlot = useMemo(() => resolveGearBySlot(loadout), [loadout]);
  const headHidesHair = Boolean(gearBySlot.head && itemHidesHair(gearBySlot.head));
  const hiddenBaseHair = Boolean(gearBySlot.hair || headHidesHair);
  const hiddenFace = Boolean(gearBySlot.face && itemHidesFace(gearBySlot.face));
  const baseSkinId = `avatar-skin-${base.id}-${reactId}`;
  const baseShirtId = `avatar-shirt-${base.id}-${reactId}`;
  const a11y = alt ? { role: 'img' as const, 'aria-label': alt } : { 'aria-hidden': true };
  const poseTransform = POSE_TRANSFORM[pose] ?? POSE_TRANSFORM.idle;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      {...a11y}
      style={{ width: sz, height: sz }}
    >
      <svg
        viewBox="0 0 240 320"
        xmlns="http://www.w3.org/2000/svg"
        width={sz}
        height={sz}
        className={cn(mirror && '-scale-x-100')}
      >
        <defs>
          <linearGradient id={baseSkinId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={base.skin} />
            <stop offset="100%" stopColor={base.skin} stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id={baseShirtId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={base.color} />
            <stop offset="100%" stopColor="#163528" />
          </linearGradient>
          <radialGradient id={`avatar-cheek-${reactId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2a995" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#f2a995" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`avatar-eye-${reactId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#21453e" />
            <stop offset="54%" stopColor="#07120f" />
            <stop offset="100%" stopColor="#030605" />
          </linearGradient>
          <filter id="avatar-slot-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8ddb98" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#8ddb98" floodOpacity="0.34" />
          </filter>
          <filter id={`avatar-soft-shadow-${reactId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#020705" floodOpacity="0.34" />
          </filter>
          <filter id="avatar-gear-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#020705" floodOpacity="0.32" />
          </filter>
        </defs>

        <ellipse cx="120" cy="303" rx="66" ry="9" fill="rgba(3,8,5,0.34)" />

        <g transform={poseTransform}>
          {showAura ? renderSlot(gearBySlot.aura, 'aura', reactId, pose, highlightSlot) : null}
          {renderSlot(gearBySlot.back, 'back', reactId, pose, highlightSlot)}

          <BaseBody
            skinId={baseSkinId}
            shirtId={baseShirtId}
            hairColor={base.hair}
            hiddenHair={hiddenBaseHair}
            shadowId={`avatar-soft-shadow-${reactId}`}
          />

          {renderSlot(gearBySlot.legs, 'legs', reactId, pose, highlightSlot)}
          {renderSlot(gearBySlot.feet, 'feet', reactId, pose, highlightSlot)}
          <BaseArms skinId={baseSkinId} pose={pose} />
          {renderSlot(gearBySlot.torso, 'torso', reactId, pose, highlightSlot)}
          {!headHidesHair ? renderSlot(gearBySlot.hair, 'hair', reactId, pose, highlightSlot) : null}
          {renderSlot(gearBySlot.head, 'head', reactId, pose, highlightSlot)}
          {!hiddenFace ? <BaseFace eyeId={`avatar-eye-${reactId}`} cheekId={`avatar-cheek-${reactId}`} /> : null}
          {renderSlot(gearBySlot.face, 'face', reactId, pose, highlightSlot)}
          <BaseHands skinId={baseSkinId} pose={pose} />
          {renderSlot(gearBySlot.offHand, 'offHand', reactId, pose, highlightSlot)}
          {renderSlot(gearBySlot.mainHand, 'mainHand', reactId, pose, highlightSlot)}
          {showAura ? <AuraForeground item={gearBySlot.aura} idPrefix={reactId} /> : null}
          <PoseEffect pose={pose} />
        </g>
      </svg>
    </div>
  );
}

function resolveGearBySlot(loadout: AvatarLoadout): Partial<Record<GearSlot, GearItem>> {
  const itemsById = new Map(GEAR_ITEMS.map((item) => [item.id, item]));
  const out: Partial<Record<GearSlot, GearItem>> = {};
  for (const slot of SLOT_ORDER) {
    const id = loadout.equippedGear?.[slot];
    const item = id ? itemsById.get(id) : undefined;
    if (item) out[slot] = item;
  }
  return out;
}

function renderSlot(
  item: GearItem | undefined,
  slot: GearSlot,
  idPrefix: string,
  pose: AvatarPose,
  highlightSlot?: GearSlot
) {
  if (!item) return null;
  const visual = resolveGearVisual(item);
  const highlighted = highlightSlot === slot;
  return (
    <g key={slot} data-avatar-slot={slot}>
      {visual.render({
        item,
        palette: paletteForGear(item),
        idPrefix,
        highlighted,
        pose,
      })}
    </g>
  );
}

function BaseBody({
  skinId,
  shirtId,
  hairColor,
  hiddenHair,
  shadowId,
}: {
  skinId: string;
  shirtId: string;
  hairColor: string;
  hiddenHair: boolean;
  shadowId: string;
}) {
  return (
    <g filter={`url(#${shadowId})`}>
      <path d="M80 222 L113 222 L108 294 L82 294 Z" fill="#24352f" />
      <path d="M127 222 L160 222 L158 294 L132 294 Z" fill="#24352f" />
      <path d="M70 174 C78 141, 96 127, 120 127 C145 127, 163 141, 171 174 L164 238 C139 252, 101 252, 76 238 Z" fill={`url(#${shirtId})`} />
      <path d="M75 153 C63 169, 57 194, 58 217" fill="none" stroke="#10231c" strokeWidth="15" strokeLinecap="round" opacity="0.7" />
      <path d="M165 153 C177 169, 183 194, 182 217" fill="none" stroke="#10231c" strokeWidth="15" strokeLinecap="round" opacity="0.7" />
      <path d="M70 177 C51 189, 48 219, 58 239" fill="none" stroke={`url(#${skinId})`} strokeWidth="17" strokeLinecap="round" />
      <path d="M170 177 C189 189, 192 219, 182 239" fill="none" stroke={`url(#${skinId})`} strokeWidth="17" strokeLinecap="round" />
      <ellipse cx="73" cy="105" rx="8" ry="12" fill={`url(#${skinId})`} />
      <ellipse cx="167" cy="105" rx="8" ry="12" fill={`url(#${skinId})`} />
      <path d="M70 104 C70 70, 91 45, 120 45 C150 45, 171 70, 170 104 C169 135, 149 153, 120 153 C91 153, 71 135, 70 104 Z" fill={`url(#${skinId})`} />
      <path d="M77 97 C82 66, 101 51, 123 51 C147 52, 162 69, 164 98 C145 86, 104 85, 77 97 Z" fill="rgba(255,255,255,0.06)" />
      {!hiddenHair ? (
        <g>
          <path d="M72 102 C74 69, 93 47, 121 42 C151 38, 172 62, 169 106 C148 86, 103 84, 72 102 Z" fill={hairColor} />
          <path d="M77 96 L93 51 L108 88 L123 40 L139 89 L158 55 L167 106 C143 82, 104 82, 77 96 Z" fill={hairColor} opacity="0.92" />
          <path d="M93 60 C108 50, 135 50, 151 66" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
}

function BaseFace({ eyeId, cheekId }: { eyeId: string; cheekId: string }) {
  return (
    <g>
      <ellipse cx="100" cy="110" rx="10" ry="13" fill={`url(#${eyeId})`} />
      <ellipse cx="140" cy="110" rx="10" ry="13" fill={`url(#${eyeId})`} />
      <circle cx="96" cy="105" r="3.2" fill="#ffffff" opacity="0.92" />
      <circle cx="136" cy="105" r="3.2" fill="#ffffff" opacity="0.92" />
      <circle cx="104" cy="116" r="2" fill="#7ee6b2" opacity="0.78" />
      <circle cx="144" cy="116" r="2" fill="#7ee6b2" opacity="0.78" />
      <path d="M105 132 Q120 142, 136 132" fill="none" stroke="#875740" strokeWidth="4" strokeLinecap="round" opacity="0.78" />
      <ellipse cx="88" cy="122" rx="13" ry="9" fill={`url(#${cheekId})`} />
      <ellipse cx="152" cy="122" rx="13" ry="9" fill={`url(#${cheekId})`} />
    </g>
  );
}

function BaseArms({ skinId, pose }: { skinId: string; pose: AvatarPose }) {
  const left = pose === 'defend' ? 'M70 177 C54 184, 46 200, 52 215' : 'M70 178 C52 190, 50 220, 60 240';
  const right =
    pose === 'attack'
      ? 'M170 176 C190 161, 205 146, 213 127'
      : pose === 'focus'
        ? 'M170 176 C184 187, 188 205, 181 224'
        : 'M170 178 C188 190, 190 220, 180 240';
  return (
    <g>
      <path d={left} fill="none" stroke="#162b24" strokeWidth="22" strokeLinecap="round" opacity="0.46" />
      <path d={right} fill="none" stroke="#162b24" strokeWidth="22" strokeLinecap="round" opacity="0.46" />
      <path d={left} fill="none" stroke={`url(#${skinId})`} strokeWidth="15" strokeLinecap="round" />
      <path d={right} fill="none" stroke={`url(#${skinId})`} strokeWidth="15" strokeLinecap="round" />
    </g>
  );
}

function BaseHands({ skinId, pose }: { skinId: string; pose: AvatarPose }) {
  const right = pose === 'attack' ? { cx: 213, cy: 127 } : { cx: 180, cy: 240 };
  const left = pose === 'defend' ? { cx: 52, cy: 215 } : { cx: 60, cy: 240 };
  return (
    <g>
      <circle cx={left.cx} cy={left.cy} r="11.5" fill={`url(#${skinId})`} />
      <circle cx={right.cx} cy={right.cy} r="11.5" fill={`url(#${skinId})`} />
      <circle cx={left.cx - 3} cy={left.cy - 4} r="3" fill="#ffffff" opacity="0.12" />
      <circle cx={right.cx - 3} cy={right.cy - 4} r="3" fill="#ffffff" opacity="0.12" />
    </g>
  );
}

function AuraForeground({ item, idPrefix }: { item?: GearItem; idPrefix: string }) {
  if (!item) return null;
  const palette = paletteForGear(item);
  return (
    <g opacity="0.76">
      <circle cx="55" cy="82" r="4" fill={palette.glow} />
      <circle cx="188" cy="133" r="3" fill={palette.light} />
      <circle cx="174" cy="257" r="4" fill={palette.accent} />
      <path d={`M43 270 C71 299, 168 299, 197 270`} fill="none" stroke={palette.glow} strokeWidth="3" strokeLinecap="round" opacity="0.45" id={`${idPrefix}-aura-front`} />
    </g>
  );
}

function PoseEffect({ pose }: { pose: AvatarPose }) {
  if (pose === 'attack') {
    return (
      <g opacity="0.72">
        <path d="M167 82 C196 100, 210 126, 209 158" fill="none" stroke="#d8fbe1" strokeWidth="5" strokeLinecap="round" />
        <path d="M177 103 C196 119, 203 137, 200 158" fill="none" stroke="#7ee6b2" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  if (pose === 'defend') {
    return (
      <g opacity="0.62">
        <path d="M47 156 C63 132, 91 124, 113 139 C107 179, 86 204, 54 214 C44 194, 40 174, 47 156 Z" fill="none" stroke="#b9f7c7" strokeWidth="5" />
        <path d="M62 158 C77 147, 92 146, 105 155" fill="none" stroke="#7ee6b2" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  if (pose === 'focus') {
    return (
      <g opacity="0.74">
        <circle cx="120" cy="49" r="5" fill="#b9f7c7" />
        <circle cx="92" cy="74" r="3" fill="#7ee6b2" />
        <circle cx="150" cy="73" r="3" fill="#d7c46a" />
        <path d="M98 271 C110 282, 131 282, 143 271" fill="none" stroke="#7ee6b2" strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  }
  if (pose === 'victory') {
    return (
      <g opacity="0.72">
        <path d="M73 68 L79 80 L92 82 L82 91 L84 104 L73 97 L61 104 L64 91 L54 82 L67 80 Z" fill="#d7c46a" />
        <path d="M168 83 L173 92 L184 93 L176 101 L178 112 L168 107 L158 112 L160 101 L152 93 L163 92 Z" fill="#b9f7c7" />
      </g>
    );
  }
  return null;
}

const POSE_TRANSFORM: Record<AvatarPose, string> = {
  idle: 'translate(0 0)',
  builder: 'translate(0 -2)',
  battleReady: 'translate(0 -4) rotate(-1 120 180)',
  attack: 'translate(4 -5) rotate(-3 120 180)',
  defend: 'translate(-2 0) scale(0.99 1)',
  focus: 'translate(0 -7)',
  victory: 'translate(0 -10) rotate(2 120 180)',
  defeat: 'translate(0 8) rotate(-4 120 250)',
};

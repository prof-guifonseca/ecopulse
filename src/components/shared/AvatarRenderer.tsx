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

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'stage';

const SIZE_MAP: Record<Size, number> = { sm: 36, md: 56, lg: 80, xl: 120, stage: 124 };

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
  const hiddenHair = Boolean(gearBySlot.head && itemHidesHair(gearBySlot.head));
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
          <filter id="avatar-slot-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8ddb98" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#8ddb98" floodOpacity="0.34" />
          </filter>
        </defs>

        <ellipse cx="120" cy="303" rx="66" ry="9" fill="rgba(3,8,5,0.34)" />

        <g transform={poseTransform}>
          {showAura ? renderSlot(gearBySlot.aura, 'aura', reactId, pose, highlightSlot) : null}
          {renderSlot(gearBySlot.back, 'back', reactId, pose, highlightSlot)}

          <BaseBody skinId={baseSkinId} shirtId={baseShirtId} hairColor={base.hair} hiddenHair={hiddenHair} />

          {renderSlot(gearBySlot.legs, 'legs', reactId, pose, highlightSlot)}
          {renderSlot(gearBySlot.feet, 'feet', reactId, pose, highlightSlot)}
          <BaseArms skinId={baseSkinId} pose={pose} />
          {renderSlot(gearBySlot.torso, 'torso', reactId, pose, highlightSlot)}
          {!hiddenHair ? renderSlot(gearBySlot.hair, 'hair', reactId, pose, highlightSlot) : null}
          {renderSlot(gearBySlot.head, 'head', reactId, pose, highlightSlot)}
          {!hiddenFace ? <BaseFace /> : null}
          {renderSlot(gearBySlot.face, 'face', reactId, pose, highlightSlot)}
          <BaseHands skinId={baseSkinId} pose={pose} />
          {renderSlot(gearBySlot.offHand, 'offHand', reactId, pose, highlightSlot)}
          {renderSlot(gearBySlot.mainHand, 'mainHand', reactId, pose, highlightSlot)}
          {showAura ? <AuraForeground item={gearBySlot.aura} idPrefix={reactId} /> : null}
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
}: {
  skinId: string;
  shirtId: string;
  hairColor: string;
  hiddenHair: boolean;
}) {
  return (
    <g>
      <path d="M78 224 L112 224 L107 292 L82 292 Z" fill="#34443b" />
      <path d="M128 224 L162 224 L158 292 L133 292 Z" fill="#34443b" />
      <path d="M70 174 C78 142, 96 129, 120 129 C145 129, 163 142, 171 174 L164 238 C139 252, 101 252, 76 238 Z" fill={`url(#${shirtId})`} />
      <path d="M70 178 C50 190, 46 219, 56 238" fill="none" stroke={`url(#${skinId})`} strokeWidth="17" strokeLinecap="round" />
      <path d="M170 178 C190 190, 194 219, 184 238" fill="none" stroke={`url(#${skinId})`} strokeWidth="17" strokeLinecap="round" />
      <circle cx="120" cy="101" r="51" fill={`url(#${skinId})`} />
      {!hiddenHair ? (
        <path d="M73 101 C77 62, 104 44, 130 47 C157 50, 174 72, 166 108 C146 88, 103 86, 73 101 Z" fill={hairColor} />
      ) : null}
    </g>
  );
}

function BaseFace() {
  return (
    <g>
      <ellipse cx="102" cy="108" rx="5.5" ry="7" fill="#1b2420" />
      <ellipse cx="138" cy="108" rx="5.5" ry="7" fill="#1b2420" />
      <path d="M104 131 Q120 143, 137 131" fill="none" stroke="#875740" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      <circle cx="89" cy="120" r="8" fill="#f0a996" opacity="0.18" />
      <circle cx="151" cy="120" r="8" fill="#f0a996" opacity="0.18" />
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
      <circle cx={left.cx} cy={left.cy} r="11" fill={`url(#${skinId})`} />
      <circle cx={right.cx} cy={right.cy} r="11" fill={`url(#${skinId})`} />
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

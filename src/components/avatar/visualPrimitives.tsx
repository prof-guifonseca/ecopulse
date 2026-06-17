import type { ReactNode } from 'react';
import type { GearSlot } from '@/types';
import type { AvatarPalette } from './palettes';
import { familyOf, SLOT_ANCHORS } from './visualHelpers';
import type { GearVisualRenderProps } from './visualTypes';

export function wrapVisual(children: ReactNode, props: GearVisualRenderProps) {
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

export function SlotHighlight({ slot }: { slot: GearSlot }) {
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
      opacity="0.72"
    />
  );
}

export function GlassSheen({
  x,
  y,
  width,
  opacity = 0.55,
}: {
  x: number;
  y: number;
  width: number;
  opacity?: number;
}) {
  return (
    <path
      d={`M${x} ${y + 12} L${x + width * 0.42} ${y} M${x + width * 0.58} ${y + 18} L${x + width} ${y + 5}`}
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

export function Leaf({
  x,
  y,
  rotate = 0,
  scale = 1,
  palette,
}: {
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  palette: AvatarPalette;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0 C13 -12, 28 -8, 33 7 C18 10, 8 8, 0 0 Z" fill={palette.accent} opacity="0.88" />
      <path
        d="M2 1 C12 2, 22 5, 31 7"
        fill="none"
        stroke={palette.dark}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </g>
  );
}

export function CircuitLines({
  palette,
  dense = false,
}: {
  palette: AvatarPalette;
  dense?: boolean;
}) {
  return (
    <g fill="none" stroke={palette.glow} strokeLinecap="round" opacity={dense ? 0.72 : 0.5}>
      <path d="M90 158 H110 V174 H130 V158 H151" strokeWidth="3" />
      <path d="M95 204 H112 V218 H145" strokeWidth="3" />
      <circle cx="90" cy="158" r="3" fill={palette.glow} stroke="none" />
      <circle cx="151" cy="158" r="3" fill={palette.glow} stroke="none" />
      {dense ? (
        <>
          <path d="M82 181 H101 M139 181 H158" strokeWidth="2.5" />
          <circle cx="101" cy="181" r="2.5" fill={palette.light} stroke="none" />
          <circle cx="139" cy="181" r="2.5" fill={palette.light} stroke="none" />
        </>
      ) : null}
    </g>
  );
}

export function StitchLines({
  palette,
  path = 'M87 150 C103 159, 137 159, 153 150',
}: {
  palette: AvatarPalette;
  path?: string;
}) {
  return (
    <g opacity="0.55">
      <path d={path} stroke={palette.light} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path
        d="M91 151 L88 158 M106 156 L103 163 M121 158 L119 165 M136 156 L139 163 M150 151 L153 158"
        stroke={palette.light}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

export function ArmorRivets({ palette, y = 167 }: { palette: AvatarPalette; y?: number }) {
  return (
    <g fill={palette.light} opacity="0.62">
      <circle cx="88" cy={y} r="3" />
      <circle cx="105" cy={y + 2} r="3" />
      <circle cx="135" cy={y + 2} r="3" />
      <circle cx="152" cy={y} r="3" />
    </g>
  );
}

export function EnergyDots({ palette, level = 2 }: { palette: AvatarPalette; level?: number }) {
  return (
    <g>
      <circle cx="64" cy="92" r={level >= 3 ? 7 : 5} fill={palette.accent} opacity="0.88" />
      <circle cx="181" cy="128" r="5" fill={palette.light} opacity="0.84" />
      <circle cx="86" cy="250" r="5" fill={palette.glow} opacity="0.82" />
      {level >= 3 ? (
        <>
          <circle cx="194" cy="219" r="4" fill={palette.glow} />
          <circle cx="51" cy="184" r="3.5" fill={palette.light} />
        </>
      ) : null}
    </g>
  );
}

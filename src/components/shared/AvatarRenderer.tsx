'use client';

import { useId } from 'react';
import type { AvatarLoadout, GearItem, GearSlot, GearTheme } from '@/types';
import { AVATAR_BASES, GEAR_ITEMS } from '@/data';
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
}

export function AvatarRenderer({ loadout, size = 'md', className, alt, mirror }: Props) {
  const reactId = useId().replace(/:/g, '');
  const sz = SIZE_MAP[size];
  const base = AVATAR_BASES.find((item) => item.id === loadout.baseId) ?? AVATAR_BASES[0];
  const gearBySlot = resolveGearBySlot(loadout);
  const gradId = `avatar-base-${base.id}-${reactId}`;
  const shirtId = `avatar-shirt-${base.id}-${reactId}`;
  const a11y = alt ? { role: 'img' as const, 'aria-label': alt } : { 'aria-hidden': true };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      {...a11y}
      style={{ width: sz, height: sz }}
    >
      <svg
        viewBox="0 0 100 112"
        xmlns="http://www.w3.org/2000/svg"
        width={sz}
        height={sz}
        className={cn(mirror && '-scale-x-100')}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={base.color} />
            <stop offset="100%" stopColor={base.color} stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id={shirtId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={base.color} />
            <stop offset="100%" stopColor="#163528" />
          </linearGradient>
        </defs>

        <ellipse cx="50" cy="105" rx="24" ry="4.5" fill="rgba(10,20,14,0.18)" />

        {SLOT_ORDER.map((slot) => {
          const item = gearBySlot[slot];
          if (slot === 'aura') return <AuraLayer key={slot} item={item} />;
          if (slot === 'back') return <BackLayer key={slot} item={item} />;
          return null;
        })}

        <BodyBase shirtId={shirtId} baseSkin={base.skin} baseHair={base.hair} />

        <LegLayer item={gearBySlot.legs} />
        <FeetLayer item={gearBySlot.feet} />
        <TorsoLayer item={gearBySlot.torso} fallbackColor={base.color} />
        <HairLayer item={gearBySlot.hair} fallbackHair={base.hair} />
        <HeadLayer item={gearBySlot.head} />
        <FaceLayer item={gearBySlot.face} />
        <HandLayer item={gearBySlot.offHand} slot="offHand" />
        <HandLayer item={gearBySlot.mainHand} slot="mainHand" />
        <ForegroundLayer aura={gearBySlot.aura} mainHand={gearBySlot.mainHand} />
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

function BodyBase({
  shirtId,
  baseSkin,
  baseHair,
}: {
  shirtId: string;
  baseSkin: string;
  baseHair: string;
}) {
  return (
    <>
      <path d="M35 72 C31 83, 34 97, 42 101 L46 101 C44 90, 45 81, 48 72 Z" fill="#3f4b43" />
      <path d="M65 72 C69 83, 66 97, 58 101 L54 101 C56 90, 55 81, 52 72 Z" fill="#3f4b43" />
      <path d="M32 67 C34 57, 40 52, 50 52 C60 52, 66 57, 68 67 L66 90 C58 95, 42 95, 34 90 Z" fill={`url(#${shirtId})`} />
      <path d="M31 68 C25 74, 23 82, 25 88" fill="none" stroke={baseSkin} strokeWidth="6" strokeLinecap="round" />
      <path d="M69 68 C75 74, 77 82, 75 88" fill="none" stroke={baseSkin} strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="35" r="17" fill={baseSkin} />
      <path d="M35 35 C36 22, 45 17, 55 20 C63 22, 66 28, 64 36 C58 29, 47 29, 35 35 Z" fill={baseHair} opacity="0.94" />
      <circle cx="44" cy="36" r="1.35" fill="#1c2520" />
      <circle cx="56" cy="36" r="1.35" fill="#1c2520" />
      <path d="M45 43 Q50 46, 55 43" fill="none" stroke="#8b5a46" strokeWidth="1.3" strokeLinecap="round" opacity="0.72" />
    </>
  );
}

function AuraLayer({ item }: { item?: GearItem }) {
  if (!item) return null;
  const color = colorFor(item);
  const theme = themeFor(item);
  if (theme === 'cyber') {
    return (
      <g opacity="0.72">
        <circle cx="50" cy="52" r="45" fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 7" />
        <circle cx="50" cy="52" r="34" fill="none" stroke="#9fe8cf" strokeWidth="1" opacity="0.7" />
      </g>
    );
  }
  if (theme === 'fantasy') {
    return (
      <g opacity="0.76">
        <path d="M18 89 C32 74, 34 48, 50 21 C66 48, 68 74, 82 89" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
        <circle cx="50" cy="19" r="3" fill={color} />
      </g>
    );
  }
  return (
    <g opacity="0.68">
      <circle cx="50" cy="52" r="44" fill={color} opacity="0.16" />
      <circle cx="50" cy="52" r="37" fill="none" stroke={color} strokeWidth="2" />
    </g>
  );
}

function BackLayer({ item }: { item?: GearItem }) {
  if (!item) return null;
  const color = colorFor(item);
  const theme = themeFor(item);
  if (theme === 'fantasy' || item.id.includes('capa') || item.name.toLowerCase().includes('manto')) {
    return <path d="M32 54 C21 68, 23 95, 35 102 C42 94, 58 94, 65 102 C77 95, 79 68, 68 54 Z" fill={color} opacity="0.86" />;
  }
  return (
    <g>
      <rect x="67" y="55" width="14" height="31" rx="5" fill={color} />
      <rect x="70" y="60" width="8" height="12" rx="2" fill="rgba(255,255,255,0.28)" />
    </g>
  );
}

function LegLayer({ item }: { item?: GearItem }) {
  const color = item ? colorFor(item) : '#30463d';
  return (
    <g>
      <path d="M36 81 L47 81 L45 101 L38 101 Z" fill={color} />
      <path d="M53 81 L64 81 L62 101 L55 101 Z" fill={color} />
      {item ? <path d="M37 88 L46 88 M54 88 L63 88" stroke="#f2f4ef" strokeWidth="1" opacity="0.35" /> : null}
    </g>
  );
}

function FeetLayer({ item }: { item?: GearItem }) {
  const color = item ? colorFor(item) : '#1f2b26';
  return (
    <g>
      <ellipse cx="40" cy="102" rx="8" ry="3" fill={color} />
      <ellipse cx="60" cy="102" rx="8" ry="3" fill={color} />
      {item ? (
        <>
          <path d="M35 101 L45 101" stroke="#f2f4ef" strokeWidth="0.8" opacity="0.45" />
          <path d="M55 101 L65 101" stroke="#f2f4ef" strokeWidth="0.8" opacity="0.45" />
        </>
      ) : null}
    </g>
  );
}

function TorsoLayer({ item, fallbackColor }: { item?: GearItem; fallbackColor: string }) {
  const color = item ? colorFor(item) : fallbackColor;
  const accent = item ? accentFor(item) : '#f2f4ef';
  const theme = item ? themeFor(item) : 'nature';
  if (theme === 'samurai' || item?.name.toLowerCase().includes('armadura')) {
    return (
      <g>
        <path d="M32 65 C35 56, 41 52, 50 52 C59 52, 65 56, 68 65 L65 88 C58 92, 42 92, 35 88 Z" fill={color} />
        <path d="M36 64 L64 64 M37 72 L63 72 M38 80 L62 80" stroke={accent} strokeWidth="2" opacity="0.65" />
      </g>
    );
  }
  if (theme === 'cyber') {
    return (
      <g>
        <path d="M32 65 C35 56, 41 52, 50 52 C59 52, 65 56, 68 65 L65 88 C58 92, 42 92, 35 88 Z" fill={color} />
        <path d="M42 58 L57 58 L62 83 L38 83 Z" fill="rgba(255,255,255,0.14)" />
        <circle cx="50" cy="69" r="3" fill={accent} />
      </g>
    );
  }
  return (
    <g>
      <path d="M32 65 C35 56, 41 52, 50 52 C59 52, 65 56, 68 65 L65 88 C58 92, 42 92, 35 88 Z" fill={color} />
      <path d="M42 56 L50 69 L58 56" fill="none" stroke={accent} strokeWidth="1.8" opacity="0.65" />
    </g>
  );
}

function HairLayer({ item, fallbackHair }: { item?: GearItem; fallbackHair: string }) {
  if (!item) return null;
  const color = themeFor(item) === 'anime' ? '#1d2537' : fallbackHair;
  if (item.id.includes('topknot') || item.name.toLowerCase().includes('topknot')) {
    return (
      <g>
        <circle cx="50" cy="15" r="5" fill={color} />
        <path d="M46 17 L54 17" stroke="#d9b95d" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g fill={color}>
      <path d="M36 30 L41 14 L46 30 Z" />
      <path d="M45 28 L50 12 L55 28 Z" />
      <path d="M54 30 L59 14 L64 30 Z" />
    </g>
  );
}

function HeadLayer({ item }: { item?: GearItem }) {
  if (!item) return null;
  const color = colorFor(item);
  const theme = themeFor(item);
  if (theme === 'samurai' || item.name.toLowerCase().includes('kabuto')) {
    return (
      <g>
        <path d="M34 28 C36 18, 45 14, 50 14 C55 14, 64 18, 66 28 Z" fill={color} />
        <ellipse cx="50" cy="28" rx="20" ry="4" fill={accentFor(item)} />
      </g>
    );
  }
  if (theme === 'fantasy' || item.name.toLowerCase().includes('capuz')) {
    return <path d="M31 36 C32 20, 41 13, 50 13 C59 13, 68 20, 69 36 C60 30, 40 30, 31 36 Z" fill={color} />;
  }
  if (item.name.toLowerCase().includes('coroa')) {
    return (
      <g fill={color}>
        <path d="M35 27 L40 18 L45 27 L50 17 L55 27 L60 18 L65 27 Z" />
        <rect x="36" y="27" width="28" height="4" rx="2" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="50" cy="27" rx="18" ry="4.5" fill={accentFor(item)} />
      <path d="M36 27 C37 18, 44 15, 50 15 C56 15, 63 18, 64 27 Z" fill={color} />
    </g>
  );
}

function FaceLayer({ item }: { item?: GearItem }) {
  if (!item) return null;
  const color = colorFor(item);
  if (item.name.toLowerCase().includes('máscara') || item.name.toLowerCase().includes('mascara')) {
    return (
      <g>
        <rect x="32" y="33" width="36" height="10" rx="2" fill={color} />
        <ellipse cx="44" cy="35" rx="2.2" ry="1.3" fill="#f2f4ef" />
        <ellipse cx="56" cy="35" rx="2.2" ry="1.3" fill="#f2f4ef" />
      </g>
    );
  }
  if (item.name.toLowerCase().includes('colar')) {
    return (
      <g>
        <path d="M40 52 Q50 58, 60 52" fill="none" stroke="#7a4318" strokeWidth="1.2" />
        <circle cx="50" cy="56" r="2.2" fill={color} />
      </g>
    );
  }
  return (
    <g>
      <rect x="33" y="33" width="14" height="8" rx="3" fill="rgba(22,35,30,0.55)" stroke={color} strokeWidth="1.6" />
      <rect x="53" y="33" width="14" height="8" rx="3" fill="rgba(22,35,30,0.55)" stroke={color} strokeWidth="1.6" />
      <line x1="47" y1="37" x2="53" y2="37" stroke={color} strokeWidth="1.3" />
    </g>
  );
}

function HandLayer({ item, slot }: { item?: GearItem; slot: 'mainHand' | 'offHand' }) {
  if (!item) return null;
  const x = slot === 'mainHand' ? 77 : 23;
  const direction = slot === 'mainHand' ? 1 : -1;
  const color = colorFor(item);
  const name = item.name.toLowerCase();
  if (name.includes('katana') || name.includes('lâmina') || name.includes('lamina')) {
    return (
      <g transform={`translate(${x} 73) rotate(${direction * -28})`}>
        <rect x="-1.5" y="-30" width="3" height="38" rx="1" fill="#dfe9e0" />
        <rect x="-6" y="5" width="12" height="3" rx="1" fill={color} />
        <rect x="-2" y="8" width="4" height="12" rx="1" fill="#7a4318" />
      </g>
    );
  }
  if (name.includes('cajado') || name.includes('bo') || name.includes('scanner') || name.includes('coletor')) {
    return (
      <g transform={`translate(${x} 72) rotate(${direction * 8})`}>
        <rect x="-2" y="-32" width="4" height="48" rx="2" fill={name.includes('scanner') ? color : '#7a4318'} />
        <circle cx="0" cy="-34" r="5" fill={color} />
      </g>
    );
  }
  if (name.includes('shuriken') || name.includes('ginga')) {
    return (
      <g transform={`translate(${x} 68) rotate(18)`} fill={color}>
        <polygon points="0,-8 3,-3 8,0 3,3 0,8 -3,3 -8,0 -3,-3" />
        <circle cx="0" cy="0" r="1.5" fill="#0a140e" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} 74)`}>
      <rect x="-5" y="-10" width="10" height="18" rx="4" fill={color} />
      <path d="M-4 -4 L4 4" stroke="#f2f4ef" strokeWidth="1" opacity="0.5" />
    </g>
  );
}

function ForegroundLayer({ aura, mainHand }: { aura?: GearItem; mainHand?: GearItem }) {
  if (!aura && !mainHand) return null;
  const color = aura ? colorFor(aura) : mainHand ? accentFor(mainHand) : '#8ddb98';
  return (
    <g opacity="0.62">
      <circle cx="24" cy="28" r="1.7" fill={color} />
      <circle cx="78" cy="43" r="1.2" fill={color} />
      <circle cx="70" cy="91" r="1.4" fill={color} />
    </g>
  );
}

function themeFor(item: GearItem): GearTheme {
  const [theme] = item.visualLayerId.split(':');
  return (theme || item.tags[0] || 'nature') as GearTheme;
}

function colorFor(item: GearItem) {
  const theme = themeFor(item);
  const colors: Record<GearTheme, string> = {
    anime: '#2d3142',
    samurai: '#386641',
    ninja: '#1e2322',
    fantasy: '#5c7c4f',
    cyber: '#34d399',
    explorer: '#9c6a3c',
    utility: '#5a6b62',
    nature: '#5fb36f',
  };
  if (item.tier === 'legendary') return '#d6a84f';
  if (item.tier === 'epic' && theme !== 'cyber') return '#6b8f71';
  return colors[theme] ?? '#5fb36f';
}

function accentFor(item: GearItem) {
  const theme = themeFor(item);
  const accents: Record<GearTheme, string> = {
    anime: '#c8d5ff',
    samurai: '#d9b95d',
    ninja: '#9fc5b6',
    fantasy: '#e0c27a',
    cyber: '#a7f3d0',
    explorer: '#e0c27a',
    utility: '#c9d8cf',
    nature: '#8ddb98',
  };
  return accents[theme] ?? '#f2f4ef';
}

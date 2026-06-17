import { useId } from 'react';

/**
 * Stylized SVG backdrop of central Londrina. No external assets — every
 * stroke is hand-placed. Designed to read as a dark-theme GPS view from a
 * distance: warm beige roads on near-black, a pale lake to the west
 * representing Lago Igapó, soft park polygons, and a north-arrow.
 *
 * Coordinates are in a 200x200 viewport that aligns with src/lib/map/londrina.ts
 * via percent-based projection. Anything overlaid in MapPage uses the
 * same percent space.
 */
export function LondrinaBackdrop() {
  const id = useId();
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e1814" />
          <stop offset="100%" stopColor="#070d0a" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(141,219,152,0.06)" />
          <stop offset="100%" stopColor="rgba(141,219,152,0)" />
        </radialGradient>
        <pattern id={`${id}-dots`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="0.6" cy="0.6" r="0.35" fill="rgba(255,255,255,0.04)" />
        </pattern>
      </defs>

      {/* Base */}
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <rect width="200" height="200" fill={`url(#${id}-dots)`} />
      <rect width="200" height="200" fill={`url(#${id}-glow)`} />

      {/* Lago Igapó — water body to the west of Centro */}
      <g fill="rgba(95,145,165,0.22)" stroke="rgba(150,200,220,0.18)" strokeWidth="0.4">
        <path d="M -4 78 Q 8 70 22 78 Q 32 86 28 102 Q 32 118 22 130 Q 8 138 -4 130 Z" />
      </g>

      {/* Parks — tiny green polygons scattered for organic feel */}
      <g fill="rgba(110,170,120,0.12)" stroke="rgba(130,200,140,0.18)" strokeWidth="0.3">
        {/* Bosque Marechal Cândido Rondon (west of center) */}
        <path d="M 38 92 Q 46 88 54 92 Q 56 100 50 106 Q 42 108 38 102 Z" />
        {/* Park east */}
        <path d="M 138 116 Q 148 114 154 122 Q 152 130 144 132 Q 138 128 138 122 Z" />
        {/* Park north */}
        <path d="M 105 24 Q 115 22 122 28 Q 122 36 116 38 Q 108 36 105 32 Z" />
      </g>

      {/* Major arteries — Av. Higienópolis (NW-SE diagonal across center),
          Av. Bandeirantes (NE-SW diagonal), Av. Tiradentes (vertical),
          Av. Saul Elkind (NW-SE far north). Heavier strokes than streets. */}
      <g stroke="rgba(225,210,180,0.22)" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M 4 64 L 196 144" />
        <path d="M 4 156 L 196 38" />
        <path d="M 96 0 L 104 200" />
        <path d="M -4 18 L 200 8" />
      </g>

      {/* Secondary streets — denser grid following Londrina's NW-SE pattern */}
      <g stroke="rgba(180,165,140,0.10)" strokeWidth="0.7" fill="none">
        {Array.from({ length: 14 }).map((_, i) => {
          const offset = i * 14 - 30;
          return (
            <g key={`s-${i}`}>
              <path d={`M ${offset} 0 L ${offset + 100} 200`} />
              <path d={`M ${offset + 100} 0 L ${offset} 200`} />
            </g>
          );
        })}
      </g>

      {/* A handful of street block highlights — slightly brighter shapes */}
      <g fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3">
        <rect x="86" y="86" width="28" height="28" transform="rotate(45 100 100)" />
        <rect x="58" y="46" width="22" height="22" transform="rotate(45 69 57)" />
        <rect x="118" y="124" width="20" height="20" transform="rotate(45 128 134)" />
      </g>

      {/* Subtle named-street labels — only the most recognizable */}
      <g
        fill="rgba(225,210,180,0.30)"
        fontFamily="var(--font-sans, Inter, sans-serif)"
        fontSize="3.2"
        letterSpacing="0.3"
      >
        <text x="58" y="84" transform="rotate(-32 58 84)">
          AV. HIGIENÓPOLIS
        </text>
        <text x="60" y="142" transform="rotate(32 60 142)">
          AV. BANDEIRANTES
        </text>
        <text x="98" y="190" transform="rotate(-90 98 190)">
          AV. TIRADENTES
        </text>
      </g>

      {/* Compass rose top-right */}
      <g transform="translate(178 18)" fill="rgba(225,225,225,0.55)">
        <circle r="9" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
        <path d="M 0 -6 L 1.4 0 L 0 6 L -1.4 0 Z" fill="rgba(141,219,152,0.85)" />
        <text x="0" y="-9.6" fontSize="3" textAnchor="middle" fill="rgba(255,255,255,0.7)">
          N
        </text>
      </g>

      {/* Scale bar bottom-left — represents ~500 m at this zoom */}
      <g transform="translate(8 188)">
        <rect
          x="0"
          y="0"
          width="28"
          height="2.4"
          fill="rgba(0,0,0,0.45)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.3"
        />
        <rect x="0" y="0" width="14" height="2.4" fill="rgba(225,210,180,0.55)" />
        <text x="0" y="-2" fontSize="3" fill="rgba(255,255,255,0.55)">
          500 m
        </text>
      </g>
    </svg>
  );
}

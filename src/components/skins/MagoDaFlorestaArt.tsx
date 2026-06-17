interface Props {
  size: number;
  className?: string;
}

/**
 * Mago da Floresta — wizard in a moss-green robe with a tall pointed hat
 * and a wooden staff topped by a sprouting leaf charm.
 */
export function MagoDaFlorestaArt({ size, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="mf-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fb36f" />
          <stop offset="100%" stopColor="#2a4d33" />
        </linearGradient>
        <radialGradient id="mf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9fe0ad" />
          <stop offset="100%" stopColor="#9fe0ad" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Staff (drawn behind body) */}
      <line
        x1="78"
        y1="20"
        x2="72"
        y2="92"
        stroke="#7a4318"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Staff charm — leaf bud */}
      <ellipse cx="78" cy="18" rx="6" ry="6" fill="url(#mf-glow)" />
      <path d="M 78 12 Q 82 16, 78 22 Q 74 16, 78 12 Z" fill="#5fb36f" />
      <line x1="78" y1="14" x2="78" y2="22" stroke="#3a8a4a" strokeWidth="0.6" />

      {/* Robe — wide A-shape */}
      <path
        d="M50 36
           C 36 36, 28 46, 26 56
           L 20 92
           L 80 92
           L 74 56
           C 72 46, 64 36, 50 36 Z"
        fill="url(#mf-robe)"
      />

      {/* Belt rope */}
      <ellipse cx="50" cy="68" rx="22" ry="2" fill="#7a4318" />
      <circle cx="42" cy="71" r="1.6" fill="#7a4318" />
      <line
        x1="42"
        y1="72"
        x2="40"
        y2="80"
        stroke="#7a4318"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Head */}
      <circle cx="50" cy="28" r="9" fill="#e8d2a8" />
      {/* Beard */}
      <path d="M 42 32 Q 50 44, 58 32 Q 56 38, 50 40 Q 44 38, 42 32 Z" fill="#f0f0e8" />
      <ellipse cx="50" cy="36" rx="6" ry="3" fill="#f8f8f2" />

      {/* Eyes */}
      <circle cx="46" cy="28" r="1" fill="#1a0e08" />
      <circle cx="54" cy="28" r="1" fill="#1a0e08" />
      {/* Brow tufts */}
      <ellipse cx="46" cy="25" rx="2" ry="0.8" fill="#f0f0e8" />
      <ellipse cx="54" cy="25" rx="2" ry="0.8" fill="#f0f0e8" />

      {/* Wizard hat — pointed cone with brim */}
      <path d="M 38 22 L 50 4 L 62 22 Z" fill="#3a6d4a" />
      <ellipse cx="50" cy="22" rx="14" ry="2.6" fill="#2a5034" />
      {/* Hat star */}
      <polygon
        points="50,12 51,15 54,15 51.5,17 52.5,20 50,18 47.5,20 48.5,17 46,15 49,15"
        fill="#e0c27a"
      />
    </svg>
  );
}

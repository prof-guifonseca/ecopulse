interface Props {
  size: number;
  className?: string;
}

/**
 * Pirata Recicla — pirate captain who collects ocean plastic instead of
 * gold. Tricorn hat with leaf insignia, eye patch, jacket with crossed
 * straps, parrot peeking on the shoulder.
 */
export function PirataReciclaArt({ size, className }: Props) {
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
        <linearGradient id="pr-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3924" />
          <stop offset="100%" stopColor="#3a2418" />
        </linearGradient>
        <linearGradient id="pr-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0e8d6" />
          <stop offset="100%" stopColor="#cfc4ac" />
        </linearGradient>
      </defs>

      {/* Coat / body */}
      <path
        d="M50 38
           C 36 38, 30 46, 30 56
           L 26 92
           L 74 92
           L 70 56
           C 70 46, 64 38, 50 38 Z"
        fill="url(#pr-coat)"
      />
      {/* Shirt V-neck panel */}
      <path d="M 42 40 L 50 60 L 58 40" fill="url(#pr-shirt)" />
      <line x1="50" y1="40" x2="50" y2="60" stroke="#a8a08c" strokeWidth="0.6" />

      {/* Coat lapel buttons */}
      <circle cx="44" cy="58" r="1.2" fill="#e0c27a" />
      <circle cx="56" cy="58" r="1.2" fill="#e0c27a" />
      <circle cx="44" cy="68" r="1.2" fill="#e0c27a" />
      <circle cx="56" cy="68" r="1.2" fill="#e0c27a" />

      {/* Crossed shoulder belt */}
      <path d="M 30 50 L 70 60" stroke="#2a1810" strokeWidth="2" />
      <path d="M 70 50 L 30 60" stroke="#2a1810" strokeWidth="2" />

      {/* Sash (red waist scarf) */}
      <rect x="28" y="68" width="44" height="5" fill="#a83232" />
      <rect x="28" y="71" width="44" height="0.6" fill="#7a2424" />

      {/* Parrot — green eco parrot perched on right shoulder */}
      <ellipse cx="76" cy="42" rx="6" ry="7" fill="#5fb36f" />
      <ellipse cx="78" cy="40" rx="3" ry="2.5" fill="#8ddb98" />
      <circle cx="79" cy="39" r="0.7" fill="#0a140e" />
      <path d="M 80 42 L 83 43 L 80 44 Z" fill="#e0c27a" />
      <ellipse cx="73" cy="46" rx="3" ry="4" fill="#3f8a4f" opacity="0.7" />

      {/* Head */}
      <circle cx="50" cy="28" r="11" fill="#e8b88a" />

      {/* Eye + eye patch */}
      <circle cx="46" cy="28" r="1.2" fill="#1a0e08" />
      {/* Patch */}
      <ellipse cx="55" cy="28" rx="3.5" ry="2.6" fill="#0a0a0a" />
      <line x1="40" y1="22" x2="62" y2="32" stroke="#0a0a0a" strokeWidth="0.6" />

      {/* Smirk */}
      <path
        d="M 47 33 Q 50 35, 53 33"
        fill="none"
        stroke="#5a3924"
        strokeWidth="0.7"
        strokeLinecap="round"
      />

      {/* Tricorn hat */}
      <path d="M 32 18 L 50 6 L 68 18 L 64 22 L 50 18 L 36 22 Z" fill="#1a0e08" />
      {/* Hat leaf insignia */}
      <path d="M 50 14 Q 54 11, 50 7 Q 46 11, 50 14 Z" fill="#5fb36f" />
      <line x1="50" y1="9" x2="50" y2="13" stroke="#3a8a4a" strokeWidth="0.5" />

      {/* Hair tied — peeking from sides */}
      <path
        d="M 39 22 Q 36 30, 38 38"
        stroke="#1a0e08"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 61 22 Q 64 30, 62 38"
        stroke="#1a0e08"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

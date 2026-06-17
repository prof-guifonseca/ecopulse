interface Props {
  size: number;
  className?: string;
}

/**
 * Ciclista Verde — urban cycling enthusiast. Aerodynamic helmet with
 * leaf decal, mirrored riding glasses, jersey with bib straps, and a
 * water bottle clipped to the side.
 */
export function CiclistaVerdeArt({ size, className }: Props) {
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
        <linearGradient id="cv-jersey" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fb36f" />
          <stop offset="100%" stopColor="#2a4d33" />
        </linearGradient>
        <linearGradient id="cv-helmet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0c27a" />
          <stop offset="100%" stopColor="#a87d3a" />
        </linearGradient>
      </defs>

      {/* Jersey body */}
      <path
        d="M50 38
           C 38 38, 32 46, 32 54
           L 28 92
           L 72 92
           L 68 54
           C 68 46, 62 38, 50 38 Z"
        fill="url(#cv-jersey)"
      />
      {/* Bib straps */}
      <line x1="42" y1="38" x2="44" y2="68" stroke="#0a140e" strokeWidth="2" />
      <line x1="58" y1="38" x2="56" y2="68" stroke="#0a140e" strokeWidth="2" />
      {/* Number on jersey */}
      <rect x="44" y="62" width="12" height="10" rx="0.6" fill="#f8f8f2" />
      <text x="50" y="70" textAnchor="middle" fontSize="7" fill="#0a140e" fontWeight="700">
        07
      </text>

      {/* Water bottle clipped to right hip */}
      <rect x="68" y="74" width="5" height="11" rx="1" fill="#5fb36f" />
      <rect x="68" y="73" width="5" height="2" fill="#0a140e" />
      <line x1="68" y1="78" x2="73" y2="78" stroke="#0a140e" strokeWidth="0.4" />

      {/* Head */}
      <circle cx="50" cy="28" r="10" fill="#d4a986" />

      {/* Aerodynamic helmet */}
      <path
        d="M 38 22
           C 38 14, 44 8, 50 8
           C 56 8, 62 14, 62 22
           L 62 24
           Q 50 22, 38 24 Z"
        fill="url(#cv-helmet)"
      />
      {/* Helmet vents */}
      <line
        x1="44"
        y1="14"
        x2="46"
        y2="20"
        stroke="#a87d3a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="12"
        x2="50"
        y2="20"
        stroke="#a87d3a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="56"
        y1="14"
        x2="54"
        y2="20"
        stroke="#a87d3a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Leaf decal */}
      <path d="M 50 18 Q 53 16, 50 13 Q 47 16, 50 18 Z" fill="#5fb36f" />

      {/* Mirrored riding glasses — wraparound */}
      <path d="M 38 28 Q 50 26, 62 28 L 60 32 Q 50 31, 40 32 Z" fill="#1c2520" />
      <path d="M 39 28.6 Q 49 27.2, 60 28.6" stroke="#5fb36f" strokeWidth="0.6" fill="none" />

      {/* Chin strap */}
      <line x1="42" y1="22" x2="44" y2="36" stroke="#0a0a0a" strokeWidth="0.9" />
      <line x1="58" y1="22" x2="56" y2="36" stroke="#0a0a0a" strokeWidth="0.9" />

      {/* Determined mouth */}
      <line
        x1="46"
        y1="34"
        x2="54"
        y2="34"
        stroke="#1a0e08"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

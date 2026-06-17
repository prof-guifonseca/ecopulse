interface Props {
  size: number;
  className?: string;
}

/**
 * Capoeirista — Brazilian martial artist in white abadá pants and tied
 * shirt, green corda (belt), bandana on the forehead. A berimbau bow
 * crosses behind the body.
 */
export function CapoeiristaArt({ size, className }: Props) {
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
        <linearGradient id="cp-abada" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f8f2" />
          <stop offset="100%" stopColor="#cfc4ac" />
        </linearGradient>
      </defs>

      {/* Berimbau — wooden bow with gourd, drawn behind body */}
      <path
        d="M 78 14 Q 90 50, 76 92"
        fill="none"
        stroke="#7a4318"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bow string */}
      <line x1="78" y1="14" x2="76" y2="92" stroke="#cfc4ac" strokeWidth="0.6" />
      {/* Cabaça / gourd */}
      <ellipse cx="83" cy="50" rx="4" ry="5" fill="#9c6a3c" />
      <ellipse cx="84" cy="49" rx="2.5" ry="3" fill="#7a4318" />
      {/* Coin */}
      <circle cx="78" cy="38" r="1.6" fill="#e0c27a" />

      {/* Abadá top — open, tied at waist */}
      <path
        d="M50 38
           C 38 38, 32 46, 32 54
           L 28 92
           L 72 92
           L 68 54
           C 68 46, 62 38, 50 38 Z"
        fill="url(#cp-abada)"
      />

      {/* Open V-neck */}
      <path d="M 44 38 L 50 56 L 56 38" fill="#d4a986" />

      {/* Corda (green belt) tied at waist */}
      <rect x="28" y="68" width="44" height="4" fill="#5fb36f" />
      <rect x="28" y="70" width="44" height="0.8" fill="#3f8a4f" />
      {/* Knot — small loop on left */}
      <circle cx="34" cy="73" r="2" fill="#5fb36f" />
      <line
        x1="34"
        y1="74"
        x2="32"
        y2="80"
        stroke="#5fb36f"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="34"
        y1="74"
        x2="36"
        y2="80"
        stroke="#5fb36f"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Head */}
      <circle cx="50" cy="28" r="11" fill="#9c6a3c" />

      {/* Bandana — green cloth across forehead */}
      <rect x="38" y="20" width="24" height="4.5" rx="0.6" fill="#5fb36f" />
      <rect x="38" y="22" width="24" height="0.6" fill="#3f8a4f" />
      {/* Bandana tail flapping back */}
      <path d="M 62 22 Q 70 20, 72 26 Q 66 28, 62 25 Z" fill="#5fb36f" />

      {/* Hair tufts visible */}
      <path
        d="M 39 26 Q 36 32, 39 38"
        stroke="#1a0e08"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 61 26 Q 64 32, 61 38"
        stroke="#1a0e08"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="46" cy="28" r="1.1" fill="#1a0e08" />
      <circle cx="54" cy="28" r="1.1" fill="#1a0e08" />
      {/* Wide grin (energy of capoeira) */}
      <path
        d="M 45 33 Q 50 36, 55 33"
        fill="none"
        stroke="#1a0e08"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

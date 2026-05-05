interface Props {
  size: number;
  className?: string;
}

/**
 * Guardião da Floresta — legendary tier endgame skin. Ethereal forest
 * guardian: glowing green aura, antlers crowned with leaves, hooded
 * cloak woven with vines, eyes glowing softly amber.
 */
export function GuardiaoDaFlorestaArt({ size, className }: Props) {
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
        <radialGradient id="gf-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9fe0ad" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#5fb36f" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#5fb36f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gf-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a4d33" />
          <stop offset="100%" stopColor="#0e2520" />
        </linearGradient>
        <linearGradient id="gf-antler" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a878" />
          <stop offset="100%" stopColor="#7a5a3a" />
        </linearGradient>
      </defs>

      {/* Outer aura — soft green halo */}
      <circle cx="50" cy="50" r="48" fill="url(#gf-aura)" />

      {/* Cloak body */}
      <path
        d="M50 22
           C 36 22, 28 32, 28 42
           L 22 92
           L 78 92
           L 72 42
           C 72 32, 64 22, 50 22 Z"
        fill="url(#gf-cloak)"
      />

      {/* Vines woven into cloak */}
      <path
        d="M 32 50 Q 38 62, 34 78 Q 40 80, 38 90"
        fill="none"
        stroke="#5fb36f"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 68 48 Q 62 58, 66 72 Q 60 76, 64 88"
        fill="none"
        stroke="#5fb36f"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Tiny leaves on the vines */}
      <ellipse cx="36" cy="56" rx="1.4" ry="0.8" fill="#9fe0ad" transform="rotate(40 36 56)" />
      <ellipse cx="36" cy="74" rx="1.4" ry="0.8" fill="#9fe0ad" transform="rotate(-30 36 74)" />
      <ellipse cx="64" cy="54" rx="1.4" ry="0.8" fill="#9fe0ad" transform="rotate(-40 64 54)" />
      <ellipse cx="66" cy="68" rx="1.4" ry="0.8" fill="#9fe0ad" transform="rotate(35 66 68)" />

      {/* Hood opening */}
      <ellipse cx="50" cy="36" rx="11" ry="13" fill="#0a140e" />

      {/* Glowing eyes */}
      <circle cx="46" cy="36" r="1.8" fill="#e0c27a" />
      <circle cx="46" cy="36" r="0.8" fill="#fff5c8" />
      <circle cx="54" cy="36" r="1.8" fill="#e0c27a" />
      <circle cx="54" cy="36" r="0.8" fill="#fff5c8" />

      {/* Antler crown — branching shapes coming out of the hood */}
      <path
        d="M 38 22 L 32 12 L 28 14 L 30 8 L 26 6"
        fill="none"
        stroke="url(#gf-antler)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 62 22 L 68 12 L 72 14 L 70 8 L 74 6"
        fill="none"
        stroke="url(#gf-antler)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Leaves on antlers */}
      <ellipse cx="30" cy="9" rx="2" ry="1.2" fill="#5fb36f" transform="rotate(-30 30 9)" />
      <ellipse cx="70" cy="9" rx="2" ry="1.2" fill="#5fb36f" transform="rotate(30 70 9)" />

      {/* Small floating motes */}
      <circle cx="20" cy="40" r="1.2" fill="#9fe0ad" opacity="0.7" />
      <circle cx="82" cy="46" r="1.2" fill="#9fe0ad" opacity="0.7" />
      <circle cx="14" cy="62" r="0.9" fill="#e0c27a" opacity="0.6" />
      <circle cx="84" cy="68" r="0.9" fill="#e0c27a" opacity="0.6" />
    </svg>
  );
}

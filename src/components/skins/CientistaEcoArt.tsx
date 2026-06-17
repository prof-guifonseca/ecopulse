interface Props {
  size: number;
  className?: string;
}

/**
 * Cientista Eco — research scientist studying sustainable solutions.
 * White lab coat over a green inner shirt, safety goggles, hair
 * slightly chaotic, holding a beaker with bubbling green liquid.
 */
export function CientistaEcoArt({ size, className }: Props) {
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
        <linearGradient id="ce-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f8f2" />
          <stop offset="100%" stopColor="#d4cfb8" />
        </linearGradient>
        <radialGradient id="ce-bubble" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9fe0ad" />
          <stop offset="100%" stopColor="#5fb36f" />
        </radialGradient>
      </defs>

      {/* Lab coat */}
      <path
        d="M50 38
           C 38 38, 30 46, 30 54
           L 26 92
           L 74 92
           L 70 54
           C 70 46, 62 38, 50 38 Z"
        fill="url(#ce-coat)"
      />
      {/* Inner shirt */}
      <path d="M 44 42 L 50 60 L 56 42 Z" fill="#5fb36f" />
      {/* Coat seams */}
      <line x1="50" y1="38" x2="50" y2="60" stroke="#a8a08c" strokeWidth="0.5" />
      {/* Pocket */}
      <rect
        x="36"
        y="68"
        width="10"
        height="7"
        rx="0.6"
        fill="#e8e2cc"
        stroke="#a8a08c"
        strokeWidth="0.5"
      />
      {/* Pen in pocket */}
      <line x1="40" y1="66" x2="40" y2="74" stroke="#5fb36f" strokeWidth="1.4" />
      {/* Notebook in pocket */}
      <rect x="43" y="65" width="2" height="4" fill="#3a2418" />

      {/* Beaker held in right hand */}
      <rect
        x="62"
        y="62"
        width="10"
        height="14"
        rx="0.6"
        fill="rgba(159,224,173,0.4)"
        stroke="#5fb36f"
        strokeWidth="1"
      />
      <ellipse cx="67" cy="62" rx="5" ry="1" fill="#5fb36f" />
      {/* Liquid */}
      <rect x="63" y="68" width="8" height="7" fill="url(#ce-bubble)" />
      {/* Bubbles */}
      <circle cx="65" cy="71" r="0.8" fill="#f8f8f2" opacity="0.8" />
      <circle cx="69" cy="69" r="0.6" fill="#f8f8f2" opacity="0.7" />
      <circle cx="67" cy="73" r="0.5" fill="#f8f8f2" opacity="0.6" />

      {/* Head */}
      <circle cx="50" cy="28" r="11" fill="#e8d2a8" />
      {/* Hair — slightly tousled */}
      <path
        d="M 40 22 Q 36 16, 40 14 Q 46 11, 50 14 Q 54 11, 60 14 Q 64 16, 60 22 Z"
        fill="#5a3924"
      />
      <ellipse cx="50" cy="22" rx="11" ry="6" fill="#5a3924" />
      {/* Stray hair tufts */}
      <path d="M 38 16 L 36 12 L 40 14 Z" fill="#5a3924" />
      <path d="M 62 16 L 64 12 L 60 14 Z" fill="#5a3924" />

      {/* Safety goggles */}
      <rect
        x="40"
        y="25"
        width="20"
        height="6"
        rx="2"
        fill="rgba(95,179,111,0.15)"
        stroke="#5fb36f"
        strokeWidth="1.4"
      />
      <line x1="50" y1="25" x2="50" y2="31" stroke="#5fb36f" strokeWidth="1" />
      {/* Eyes seen through goggles */}
      <circle cx="45" cy="28" r="0.9" fill="#1a0e08" />
      <circle cx="55" cy="28" r="0.9" fill="#1a0e08" />

      {/* Hint of a smile */}
      <path
        d="M 46 34 Q 50 36, 54 34"
        fill="none"
        stroke="#5a3924"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Props {
  size: number;
  className?: string;
}

/**
 * Samurai Verde — feudal warrior in a forest-green gi with a katana
 * crossed on the back, white obi sash, and a topknot.
 */
export function SamuraiVerdeArt({ size, className }: Props) {
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
        <linearGradient id="sv-gi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f6d5a" />
          <stop offset="100%" stopColor="#1f3d31" />
        </linearGradient>
      </defs>

      {/* Katana — drawn first so it sits behind the body, peeking from the back */}
      {/* Sheath */}
      <rect
        x="62"
        y="38"
        width="3.5"
        height="48"
        rx="1.5"
        fill="#2a2a2a"
        transform="rotate(28 64 62)"
      />
      {/* Hilt wrap */}
      <rect
        x="58"
        y="32"
        width="3"
        height="10"
        rx="1"
        fill="#5a3924"
        transform="rotate(28 60 36)"
      />
      <rect
        x="56"
        y="30"
        width="6"
        height="2"
        rx="0.8"
        fill="#e0c27a"
        transform="rotate(28 60 31)"
      />

      {/* Body — gi torso */}
      <path
        d="M50 38
           C 38 38, 32 46, 32 56
           L 28 92
           L 72 92
           L 68 56
           C 68 46, 62 38, 50 38 Z"
        fill="url(#sv-gi)"
      />

      {/* Lapel V-cross */}
      <path d="M50 38 L 42 60 L 50 66 L 58 60 Z" fill="#1f3d31" opacity="0.7" />
      <path d="M50 38 L 50 66" stroke="#0e2520" strokeWidth="0.8" />

      {/* Obi (white sash) */}
      <rect x="29" y="68" width="42" height="6" fill="#f0e8d6" />
      <rect x="29" y="71" width="42" height="0.8" fill="#a8a08c" />

      {/* Head */}
      <circle cx="50" cy="28" r="11" fill="#d4a986" />

      {/* Topknot — small bun above head */}
      <ellipse cx="50" cy="17" rx="4" ry="3" fill="#1a0e08" />
      <rect x="48" y="14" width="4" height="4" rx="1" fill="#1a0e08" />
      {/* Hairband (gold) */}
      <ellipse cx="50" cy="17" rx="4" ry="1" fill="#e0c27a" />

      {/* Brow + face */}
      <path d="M 44 22 L 47 22" stroke="#1a0e08" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 53 22 L 56 22" stroke="#1a0e08" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="46" cy="28" r="1.1" fill="#1a0e08" />
      <circle cx="54" cy="28" r="1.1" fill="#1a0e08" />

      {/* Hair — sides */}
      <path
        d="M 39 22 Q 38 30, 41 36"
        stroke="#1a0e08"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 61 22 Q 62 30, 59 36"
        stroke="#1a0e08"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Props {
  size: number;
  className?: string;
}

/**
 * Ninja Eco — black-clad shinobi with a green eco headband, full mask
 * (only eyes visible), and a recycled shuriken on the chest.
 */
export function NinjaEcoArt({ size, className }: Props) {
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
        <linearGradient id="ne-suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1d1c" />
          <stop offset="100%" stopColor="#0a0d0c" />
        </linearGradient>
      </defs>

      {/* Suit body */}
      <path
        d="M50 36
           C 38 36, 32 44, 32 54
           L 28 92
           L 72 92
           L 68 54
           C 68 44, 62 36, 50 36 Z"
        fill="url(#ne-suit)"
      />

      {/* Crossed shoulder strap with shuriken */}
      <path d="M 32 50 L 68 60" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" />
      {/* Shuriken — 4-pointed star on chest */}
      <g transform="translate(50 56) rotate(15)">
        <polygon points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" fill="#8ddb98" />
        <circle cx="0" cy="0" r="0.8" fill="#0a140e" />
      </g>

      {/* Head — full mask covering chin and nose */}
      <circle cx="50" cy="26" r="11" fill="#1a1d1c" />

      {/* Eye band — light strip across the eyes */}
      <rect x="38" y="22" width="24" height="6" rx="1.2" fill="#0a0d0c" />
      <ellipse cx="45" cy="25" rx="2" ry="1.4" fill="#f2f4ef" />
      <ellipse cx="55" cy="25" rx="2" ry="1.4" fill="#f2f4ef" />
      <circle cx="45" cy="25" r="0.9" fill="#1a1d1c" />
      <circle cx="55" cy="25" r="0.9" fill="#1a1d1c" />

      {/* Headband — eco green with leaf insignia */}
      <rect x="38" y="17" width="24" height="4.5" rx="0.6" fill="#5fb36f" />
      <rect x="38" y="19" width="24" height="0.6" fill="#3f8a4f" />
      {/* Headband tail flapping behind */}
      <path d="M 62 19 Q 70 17, 72 22 Q 67 24, 62 22 Z" fill="#5fb36f" />
      {/* Leaf insignia */}
      <ellipse cx="50" cy="19.4" rx="2.6" ry="1.4" fill="#0a140e" />
      <path d="M 50 18.4 L 50 20.4" stroke="#5fb36f" strokeWidth="0.5" />
    </svg>
  );
}

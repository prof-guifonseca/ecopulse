interface Props {
  size: number;
  className?: string;
}

/**
 * Aventureiro — outdoor explorer with a wide-brim hat, a stuffed
 * backpack peeking over the shoulder (rolled map and a leaf sticking
 * out), and a sturdy jacket.
 */
export function AventureiroArt({ size, className }: Props) {
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
        <linearGradient id="av-jacket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9c6a3c" />
          <stop offset="100%" stopColor="#5a3924" />
        </linearGradient>
        <linearGradient id="av-pack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3924" />
          <stop offset="100%" stopColor="#3a2418" />
        </linearGradient>
      </defs>

      {/* Backpack — peeking over right shoulder */}
      <rect x="58" y="38" width="20" height="32" rx="3" fill="url(#av-pack)" />
      <rect x="60" y="42" width="16" height="3" fill="#3a2418" />
      <rect x="60" y="58" width="16" height="3" fill="#3a2418" />
      {/* Rolled map sticking out */}
      <rect x="70" y="32" width="2.5" height="10" fill="#f0e8d6" transform="rotate(20 71 36)" />
      <rect x="69.4" y="32" width="3.6" height="2.5" fill="#9c6a3c" transform="rotate(20 71 33)" />
      {/* Leaf bouncing out top */}
      <path d="M 64 36 Q 68 30, 64 24 Q 60 30, 64 36 Z" fill="#5fb36f" />

      {/* Body — jacket */}
      <path
        d="M50 38
           C 38 38, 32 46, 32 56
           L 30 92
           L 70 92
           L 68 56
           C 68 46, 62 38, 50 38 Z"
        fill="url(#av-jacket)"
      />
      {/* Jacket vertical seam */}
      <line x1="50" y1="42" x2="50" y2="92" stroke="#3a2418" strokeWidth="0.7" />
      {/* Pocket flaps */}
      <rect x="38" y="62" width="9" height="6" rx="1" fill="#3a2418" />
      <rect x="53" y="62" width="9" height="6" rx="1" fill="#3a2418" />

      {/* Belt */}
      <rect x="32" y="76" width="38" height="3" fill="#2a1810" />
      <rect x="48" y="75" width="4" height="5" fill="#e0c27a" />

      {/* Head */}
      <circle cx="50" cy="28" r="9" fill="#e8b88a" />
      {/* Brow + eyes */}
      <ellipse cx="46" cy="26" rx="1.6" ry="0.6" fill="#3a2418" />
      <ellipse cx="54" cy="26" rx="1.6" ry="0.6" fill="#3a2418" />
      <circle cx="46" cy="29" r="1" fill="#1a0e08" />
      <circle cx="54" cy="29" r="1" fill="#1a0e08" />
      {/* Smile hint */}
      <path
        d="M 47 33 Q 50 35, 53 33"
        fill="none"
        stroke="#5a3924"
        strokeWidth="0.7"
        strokeLinecap="round"
      />

      {/* Wide-brim hat */}
      <ellipse cx="50" cy="22" rx="18" ry="3" fill="#5a3924" />
      <path d="M 40 22 L 42 12 Q 50 8, 58 12 L 60 22 Z" fill="#7a4318" />
      {/* Hat band */}
      <rect x="40" y="19" width="20" height="2" fill="#3a2418" />
      {/* Hat leaf charm */}
      <path d="M 56 17 Q 60 14, 56 11 Q 52 14, 56 17 Z" fill="#5fb36f" />
    </svg>
  );
}

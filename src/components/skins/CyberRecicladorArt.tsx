interface Props {
  size: number;
  className?: string;
}

/**
 * Cyber Reciclador — solarpunk robot with a green LED chest panel,
 * antennae, recycle insignia, and metallic plating.
 */
export function CyberRecicladorArt({ size, className }: Props) {
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
        <linearGradient id="cr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6b62" />
          <stop offset="100%" stopColor="#2a3b32" />
        </linearGradient>
        <linearGradient id="cr-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a8b80" />
          <stop offset="100%" stopColor="#4a5b50" />
        </linearGradient>
        <radialGradient id="cr-led" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9fe0ad" />
          <stop offset="100%" stopColor="#5fb36f" />
        </radialGradient>
      </defs>

      {/* Body torso */}
      <rect x="30" y="40" width="40" height="48" rx="4" fill="url(#cr-body)" />
      {/* Chest plate */}
      <rect x="34" y="44" width="32" height="32" rx="3" fill="url(#cr-plate)" />
      {/* Recycle circle */}
      <circle cx="50" cy="60" r="9" fill="none" stroke="#0a140e" strokeWidth="1.4" />
      <path
        d="M 44 56 L 50 50 L 56 56"
        fill="none"
        stroke="#5fb36f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 56 64 L 56 60 M 56 64 L 52 64"
        fill="none"
        stroke="#5fb36f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 44 64 L 44 60 M 44 64 L 48 64"
        fill="none"
        stroke="#5fb36f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* LED status row */}
      <circle cx="38" cy="80" r="1.4" fill="#9fe0ad" />
      <circle cx="44" cy="80" r="1.4" fill="#9fe0ad" />
      <circle cx="50" cy="80" r="1.4" fill="#e0c27a" />
      <circle cx="56" cy="80" r="1.4" fill="url(#cr-led)" />
      <circle cx="62" cy="80" r="1.4" fill="#5a6b62" />

      {/* Head — squarish */}
      <rect x="36" y="14" width="28" height="22" rx="3" fill="url(#cr-body)" />
      {/* Visor */}
      <rect x="40" y="20" width="20" height="6" rx="2" fill="#0a140e" />
      <rect x="42" y="22" width="4" height="2" rx="1" fill="#9fe0ad" />
      <rect x="54" y="22" width="4" height="2" rx="1" fill="#9fe0ad" />
      {/* Mouth grille */}
      <rect x="45" y="29" width="10" height="2" rx="0.6" fill="#0a140e" />
      <line x1="47" y1="29" x2="47" y2="31" stroke="#5a6b62" strokeWidth="0.4" />
      <line x1="50" y1="29" x2="50" y2="31" stroke="#5a6b62" strokeWidth="0.4" />
      <line x1="53" y1="29" x2="53" y2="31" stroke="#5a6b62" strokeWidth="0.4" />

      {/* Antennae */}
      <line
        x1="42"
        y1="14"
        x2="40"
        y2="6"
        stroke="#5a6b62"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="5" r="1.4" fill="#9fe0ad" />
      <line
        x1="58"
        y1="14"
        x2="60"
        y2="6"
        stroke="#5a6b62"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="5" r="1.4" fill="#e0c27a" />

      {/* Shoulder bolts */}
      <circle cx="32" cy="44" r="1.5" fill="#0a140e" />
      <circle cx="68" cy="44" r="1.5" fill="#0a140e" />
    </svg>
  );
}

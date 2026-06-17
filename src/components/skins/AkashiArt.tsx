interface Props {
  size: number;
  className?: string;
}

/**
 * Akashi — anime-inspired hooded figure in a long black cloak with red
 * cloud blobs scattered across it. Half the face is shadowed under the
 * hood; only the eyes catch a thin amber rim. Reapproaches the
 * "shadowy organization" trope without using IP-protected branding.
 */
export function AkashiArt({ size, className }: Props) {
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
        <linearGradient id="akashi-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1414" />
          <stop offset="100%" stopColor="#0a0707" />
        </linearGradient>
        <radialGradient id="akashi-cloud" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e84545" />
          <stop offset="100%" stopColor="#a31f1f" />
        </radialGradient>
      </defs>

      {/* Cloak body — wide trapezoidal shape, hood narrow at top */}
      <path
        d="M50 18
           C 38 18, 30 26, 30 34
           L 24 92
           L 76 92
           L 70 34
           C 70 26, 62 18, 50 18 Z"
        fill="url(#akashi-cloak)"
      />

      {/* Hood opening — darker oval inside */}
      <ellipse cx="50" cy="36" rx="11" ry="13" fill="#0a0a0a" />

      {/* Faint face shadow — only eyes glow */}
      <circle cx="46" cy="36" r="1.4" fill="#e0c27a" opacity="0.85" />
      <circle cx="54" cy="36" r="1.4" fill="#e0c27a" opacity="0.85" />

      {/* Red cloud blobs — scattered cloud-like shapes (not IP-branded) */}
      <ellipse cx="38" cy="55" rx="5" ry="3.5" fill="url(#akashi-cloud)" />
      <ellipse cx="36" cy="53" rx="2.5" ry="2" fill="url(#akashi-cloud)" />
      <ellipse cx="62" cy="50" rx="6" ry="4" fill="url(#akashi-cloud)" />
      <ellipse cx="60" cy="48" rx="2" ry="1.6" fill="url(#akashi-cloud)" />
      <ellipse cx="44" cy="74" rx="5.5" ry="3.8" fill="url(#akashi-cloud)" />
      <ellipse cx="42" cy="72" rx="2.4" ry="1.8" fill="url(#akashi-cloud)" />
      <ellipse cx="64" cy="78" rx="4.5" ry="3" fill="url(#akashi-cloud)" />

      {/* Cloak fold seam down the middle — subtle */}
      <line x1="50" y1="48" x2="50" y2="92" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
    </svg>
  );
}

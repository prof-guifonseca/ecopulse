'use client';

import type { AvatarOutfits } from '@/types';
import { AVATAR_BASES } from '@/data/avatar';

type Size = 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<Size, number> = { sm: 36, md: 56, lg: 80, xl: 120 };

interface Props {
  baseId?: string | null;
  outfits?: AvatarOutfits;
  emoji?: string;
  size?: Size;
  className?: string;
}

/**
 * Editorial avatar: soft gradient body, simplified facial features
 * (no harsh black eyes, no smile). Outfit elements layer on top using
 * brand-aligned palettes — no rainbow, no neon.
 */
export function Avatar({ baseId, outfits, emoji, size = 'md', className }: Props) {
  const sz = SIZE_MAP[size];

  if (!baseId) {
    const fallback = emoji ?? '🌿';
    return (
      <div
        className={className}
        style={{
          width: sz,
          height: sz,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(sz * 0.55),
        }}
      >
        {fallback}
      </div>
    );
  }

  const base = AVATAR_BASES.find((b) => b.id === baseId) ?? AVATAR_BASES[0];
  const o = outfits ?? {};
  const gradId = `av-grad-${baseId}`;
  const auraId = `av-aura-${baseId}`;

  // Eye color: soft slate, not pure black, so it doesn't punch on tiny avatars
  const EYE = '#1c2520';
  // Mouth blush: muted warm tone
  const BLUSH = 'rgba(220, 160, 130, 0.55)';

  return (
    <div className={className} style={{ width: sz, height: sz }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={sz} height={sz}>
        <defs>
          {/* Soft body gradient — same hue as base.color but with depth */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={base.color} />
            <stop offset="100%" stopColor={base.color} stopOpacity="0.7" />
          </linearGradient>
          {/* Aura gradient for premium backgrounds */}
          <radialGradient id={auraId} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(141,219,152,0.45)" />
            <stop offset="100%" stopColor="rgba(141,219,152,0)" />
          </radialGradient>
        </defs>

        {/* Background aura */}
        {o.background === 'bg1' && (
          <circle cx="50" cy="50" r="48" fill={`url(#${auraId})`} />
        )}
        {o.background === 'bg2' && (
          <>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#e0c27a" strokeWidth="2.4" opacity="0.45">
              <animate attributeName="r" values="46;48;46" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#c9995b" strokeWidth="1.2" opacity="0.3" />
          </>
        )}

        {/* Body shape — single gradient ellipse, no harsh seams */}
        <ellipse cx="50" cy="80" rx="22" ry="18" fill={`url(#${gradId})`} />
        {/* Head */}
        <circle cx="50" cy="42" r="18" fill={base.skin} />
        {/* Hair — softened */}
        <ellipse cx="50" cy="32" rx="14" ry="7" fill={base.hair} opacity="0.92" />
        <circle cx="50" cy="36" r="11" fill={base.hair} opacity="0.85" />
        {/* Face — minimal, lighter weight */}
        <circle cx="44" cy="42" r="1.4" fill={EYE} />
        <circle cx="56" cy="42" r="1.4" fill={EYE} />
        <ellipse cx="50" cy="48" rx="2.6" ry="1" fill={BLUSH} />

        {/* Shirt — brand-aligned overlays */}
        {o.shirt === 'shirt1' && (
          <>
            <ellipse cx="50" cy="80" rx="22" ry="18" fill="#5fb36f" />
            <text x="50" y="84" textAnchor="middle" fontSize="9" fill="#0a140e" fontWeight="700">ECO</text>
          </>
        )}
        {o.shirt === 'shirt2' && (
          <>
            <ellipse cx="50" cy="80" rx="22" ry="18" fill="#3f6d5a" />
            <rect x="42" y="68" width="16" height="3" rx="1.5" fill="#e0c27a" />
          </>
        )}

        {/* Glasses — subtle, no neon */}
        {o.glasses === 'glass1' && (
          <>
            <rect x="36" y="39" width="12" height="7" rx="3" fill="rgba(28,37,32,0.55)" stroke={EYE} strokeWidth="1.2" />
            <rect x="52" y="39" width="12" height="7" rx="3" fill="rgba(28,37,32,0.55)" stroke={EYE} strokeWidth="1.2" />
            <line x1="48" y1="42.5" x2="52" y2="42.5" stroke={EYE} strokeWidth="1" />
          </>
        )}
        {o.glasses === 'glass2' && (
          <>
            <rect x="34" y="38" width="14" height="9" rx="3.5" fill="rgba(141,219,152,0.22)" stroke="#8ddb98" strokeWidth="1.2" />
            <rect x="52" y="38" width="14" height="9" rx="3.5" fill="rgba(141,219,152,0.22)" stroke="#8ddb98" strokeWidth="1.2" />
            <line x1="48" y1="42" x2="52" y2="42" stroke="#8ddb98" strokeWidth="1" />
          </>
        )}

        {/* Hat — earth and brand tones only */}
        {o.hat === 'hat1' && (
          <>
            <ellipse cx="50" cy="26" rx="16" ry="4.5" fill="#3f6d5a" />
            <ellipse cx="50" cy="22" rx="11" ry="7.5" fill="#5fb36f" />
            <circle cx="55" cy="20" r="2.4" fill="#8ddb98" />
          </>
        )}
        {o.hat === 'hat2' && (
          <>
            <circle cx="42" cy="22" r="3.2" fill="#c2876f" />
            <circle cx="50" cy="19" r="3.2" fill="#e0c27a" />
            <circle cx="58" cy="22" r="3.2" fill="#9fc5b6" />
            <circle cx="46" cy="17" r="2.2" fill="#e9cd86" />
            <circle cx="54" cy="17" r="2.2" fill="#5fb36f" />
          </>
        )}
        {o.hat === 'hat3' && (
          <>
            <ellipse cx="50" cy="28" rx="15" ry="3.6" fill="#4a3526" />
            <ellipse cx="50" cy="22" rx="11" ry="8" fill="#7a4318" />
            <rect x="44" y="16" width="12" height="3.5" rx="1.5" fill="#a8654a" />
          </>
        )}

        {/* Accessory */}
        {o.accessory === 'acc1' && (
          <>
            <rect x="68" y="65" width="11" height="13" rx="2.5" fill="#c2876f" />
            <rect x="70" y="62" width="7" height="3.6" rx="1.5" fill="#7a4318" />
          </>
        )}
        {o.accessory === 'acc2' && (
          <>
            <ellipse cx="50" cy="56" rx="11" ry="0.8" fill="none" stroke="#7a4318" strokeWidth="0.6" />
            <circle cx="42" cy="58" r="2" fill="#7a4318" />
            <circle cx="50" cy="59.5" r="2" fill="#5fb36f" />
            <circle cx="58" cy="58" r="2" fill="#7a4318" />
          </>
        )}
      </svg>
    </div>
  );
}

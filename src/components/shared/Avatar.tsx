'use client';

import type { AvatarOutfits } from '@/types';
import { AVATAR_BASES } from '@/data/avatar';
import { SkinPackArt, type SkinArtSize } from '@/components/skins/SkinPackArt';

type Size = 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<Size, number> = { sm: 36, md: 56, lg: 80, xl: 120 };

interface Props {
  baseId?: string | null;
  outfits?: AvatarOutfits;
  size?: Size;
  className?: string;
  /** When set, renders a full SkinPack illustration and ignores base + outfits. */
  skinPackId?: string | null;
}

/**
 * Editorial avatar.
 *
 * Three modes, in priority order:
 * 1. SkinPackId set → render the full illustrated character (Quizizz-style).
 *    Slots are ignored; the SkinPack owns the entire look.
 * 2. baseId set → composite mode: SVG body + outfit overlays. Original
 *    behavior, now augmented with weapon / hairstyle slots.
 * 3. Neither → quiet circular placeholder.
 */
export function Avatar({ baseId, outfits, size = 'md', className, skinPackId }: Props) {
  const sz = SIZE_MAP[size];

  if (skinPackId) {
    return <SkinPackArt id={skinPackId} size={size as SkinArtSize} className={className} />;
  }

  if (!baseId) {
    return (
      <div
        className={className}
        style={{
          width: sz,
          height: sz,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
        }}
      />
    );
  }

  const base = AVATAR_BASES.find((b) => b.id === baseId) ?? AVATAR_BASES[0];
  const o = outfits ?? {};
  const gradId = `av-grad-${baseId}`;
  const auraId = `av-aura-${baseId}`;

  // Eye color: soft slate, not pure black, so it doesn't punch on tiny avatars
  const EYE = '#1c2520';
  const BLUSH = 'rgba(220, 160, 130, 0.55)';

  return (
    <div className={className} style={{ width: sz, height: sz }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={sz} height={sz}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={base.color} />
            <stop offset="100%" stopColor={base.color} stopOpacity="0.7" />
          </linearGradient>
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

        {/* Weapon — drawn behind body so it peeks out from behind the back */}
        {o.weapon === 'weap-katana-bambu' && (
          <>
            <rect x="62" y="38" width="3" height="42" rx="1" fill="#7a5a2a" transform="rotate(28 64 60)" />
            <rect x="58" y="32" width="2.6" height="9" rx="0.8" fill="#5fb36f" transform="rotate(28 60 36)" />
          </>
        )}
        {o.weapon === 'weap-cajado-folha' && (
          <>
            <line x1="76" y1="20" x2="72" y2="92" stroke="#7a4318" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 76 16 Q 80 20, 76 26 Q 72 20, 76 16 Z" fill="#5fb36f" />
          </>
        )}
        {o.weapon === 'weap-bo-madeira' && (
          <line x1="74" y1="14" x2="74" y2="92" stroke="#9c6a3c" strokeWidth="2.6" strokeLinecap="round" />
        )}
        {o.weapon === 'weap-shuriken' && (
          <g transform="translate(72 50) rotate(20)">
            <polygon
              points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5"
              fill="#9fc5b6"
            />
            <circle cx="0" cy="0" r="0.8" fill="#0a140e" />
          </g>
        )}

        {/* Body shape — single gradient ellipse, no harsh seams */}
        <ellipse cx="50" cy="80" rx="22" ry="18" fill={`url(#${gradId})`} />
        {/* Head */}
        <circle cx="50" cy="42" r="18" fill={base.skin} />
        {/* Hair — softened */}
        <ellipse cx="50" cy="32" rx="14" ry="7" fill={base.hair} opacity="0.92" />
        <circle cx="50" cy="36" r="11" fill={base.hair} opacity="0.85" />

        {/* Hairstyle overlays (drawn over base hair) */}
        {o.hairstyle === 'hair-topknot' && (
          <>
            <ellipse cx="50" cy="20" rx="4.2" ry="3.2" fill={base.hair} />
            <ellipse cx="50" cy="20" rx="4.2" ry="1" fill="#e0c27a" />
          </>
        )}
        {o.hairstyle === 'hair-spike' && (
          <>
            <path d="M 38 28 L 42 16 L 46 28 Z" fill={base.hair} />
            <path d="M 46 26 L 50 14 L 54 26 Z" fill={base.hair} />
            <path d="M 54 28 L 58 16 L 62 28 Z" fill={base.hair} />
          </>
        )}

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
        {o.shirt === 'shirt-capa-curta' && (
          <>
            <path d="M 28 72 Q 50 66, 72 72 L 70 90 Q 50 86, 30 90 Z" fill="#1a1414" />
            <path d="M 50 66 L 50 88" stroke="#0a0707" strokeWidth="0.6" />
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
        {o.glasses === 'glass-mascara-ninja' && (
          <>
            <rect x="32" y="44" width="36" height="8" rx="1.5" fill="#1a1d1c" />
            <ellipse cx="44" cy="42" rx="2" ry="1.4" fill="#f2f4ef" />
            <ellipse cx="56" cy="42" rx="2" ry="1.4" fill="#f2f4ef" />
            <circle cx="44" cy="42" r="0.9" fill="#1a1d1c" />
            <circle cx="56" cy="42" r="0.9" fill="#1a1d1c" />
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
        {o.hat === 'hat-headband-eco' && (
          <>
            <rect x="34" y="32" width="32" height="4.5" rx="0.8" fill="#5fb36f" />
            <rect x="34" y="34" width="32" height="0.6" fill="#3f8a4f" />
            <ellipse cx="50" cy="34.4" rx="3" ry="1.5" fill="#0a140e" />
            <path d="M 64 34 Q 72 32, 74 38 Q 68 40, 64 38 Z" fill="#5fb36f" />
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
        {o.accessory === 'acc-tabis' && (
          <>
            <ellipse cx="44" cy="94" rx="4" ry="1.6" fill="#1a1d1c" />
            <ellipse cx="56" cy="94" rx="4" ry="1.6" fill="#1a1d1c" />
            <line x1="44" y1="92.4" x2="44" y2="95.6" stroke="#f2f4ef" strokeWidth="0.5" />
            <line x1="56" y1="92.4" x2="56" y2="95.6" stroke="#f2f4ef" strokeWidth="0.5" />
          </>
        )}
      </svg>
    </div>
  );
}

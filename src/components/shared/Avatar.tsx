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

  return (
    <div className={className} style={{ width: sz, height: sz }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={sz} height={sz}>
        {/* Background aura */}
        {o.background === 'bg1' && (
          <circle cx="50" cy="50" r="48" fill="none" stroke="#52b788" strokeWidth="3" opacity="0.5">
            <animate attributeName="r" values="46;48;46" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        {o.background === 'bg2' && (
          <>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#FFD166" strokeWidth="3" opacity="0.5">
              <animate attributeName="r" values="46;48;46" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#FFA94D" strokeWidth="1.5" opacity="0.3" />
          </>
        )}
        {/* Body */}
        <circle cx="50" cy="42" r="18" fill={base.skin} />
        <ellipse cx="50" cy="80" rx="22" ry="18" fill={base.color} />
        <circle cx="50" cy="36" r="10" fill={base.hair} opacity="0.9" />
        <ellipse cx="50" cy="30" rx="12" ry="6" fill={base.hair} />
        <circle cx="44" cy="42" r="2" fill="#1a1a2e" />
        <circle cx="56" cy="42" r="2" fill="#1a1a2e" />
        <ellipse cx="50" cy="48" rx="3" ry="1.5" fill="#e8a87c" opacity="0.6" />
        {/* Shirt */}
        {o.shirt === 'shirt1' && (
          <>
            <ellipse cx="50" cy="80" rx="22" ry="18" fill="#52b788" />
            <text x="50" y="84" textAnchor="middle" fontSize="10" fill="white">ECO</text>
          </>
        )}
        {o.shirt === 'shirt2' && (
          <>
            <ellipse cx="50" cy="80" rx="22" ry="18" fill="#e76f51" />
            <rect x="42" y="68" width="16" height="4" rx="2" fill="#FFD166" />
          </>
        )}
        {/* Glasses */}
        {o.glasses === 'glass1' && (
          <>
            <rect x="36" y="39" width="12" height="8" rx="4" fill="none" stroke="#1a1a2e" strokeWidth="2" />
            <rect x="52" y="39" width="12" height="8" rx="4" fill="none" stroke="#1a1a2e" strokeWidth="2" />
            <line x1="48" y1="43" x2="52" y2="43" stroke="#1a1a2e" strokeWidth="1.5" />
          </>
        )}
        {o.glasses === 'glass2' && (
          <>
            <rect x="34" y="38" width="14" height="9" rx="4" fill="rgba(0,180,216,0.3)" stroke="#00B4D8" strokeWidth="1.5" />
            <rect x="52" y="38" width="14" height="9" rx="4" fill="rgba(0,180,216,0.3)" stroke="#00B4D8" strokeWidth="1.5" />
            <line x1="48" y1="42" x2="52" y2="42" stroke="#00B4D8" strokeWidth="1.5" />
          </>
        )}
        {/* Hat */}
        {o.hat === 'hat1' && (
          <>
            <ellipse cx="50" cy="26" rx="16" ry="5" fill="#2d6a4f" />
            <ellipse cx="50" cy="24" rx="12" ry="8" fill="#40916c" />
            <circle cx="55" cy="20" r="3" fill="#52b788" />
          </>
        )}
        {o.hat === 'hat2' && (
          <>
            <circle cx="40" cy="24" r="4" fill="#FF6B6B" />
            <circle cx="50" cy="20" r="4" fill="#F472B6" />
            <circle cx="60" cy="24" r="4" fill="#FFD166" />
            <circle cx="45" cy="18" r="3" fill="#A78BFA" />
            <circle cx="55" cy="18" r="3" fill="#FF6B6B" />
          </>
        )}
        {o.hat === 'hat3' && (
          <>
            <ellipse cx="50" cy="28" rx="15" ry="4" fill="#8B6914" />
            <ellipse cx="50" cy="22" rx="12" ry="9" fill="#c77dff" />
            <rect x="44" y="16" width="12" height="4" rx="2" fill="#c77dff" />
          </>
        )}
        {/* Accessory */}
        {o.accessory === 'acc1' && (
          <>
            <rect x="68" y="65" width="12" height="14" rx="3" fill="#e76f51" />
            <rect x="70" y="62" width="8" height="4" rx="2" fill="#8B6914" />
          </>
        )}
        {o.accessory === 'acc2' && (
          <>
            <circle cx="42" cy="58" r="2.5" fill="#8B6914" />
            <circle cx="50" cy="60" r="2.5" fill="#52b788" />
            <circle cx="58" cy="58" r="2.5" fill="#8B6914" />
            <ellipse cx="50" cy="56" rx="12" ry="1" fill="none" stroke="#8B6914" strokeWidth="0.8" />
          </>
        )}
      </svg>
    </div>
  );
}

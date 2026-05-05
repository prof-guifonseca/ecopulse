'use client';

import { useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';

// Brand palette only — no rainbow.
const COLORS = ['#8ddb98', '#6fc581', '#9fe0ad', '#e0c27a', '#e9cd86', '#c9995b'];

interface Piece {
  id: string;
  color: string;
  left: string;
  width: string;
  height: string;
  duration: string;
  delay: string;
  drift: string;
  spin: string;
  opacity: string;
  rounded: string;
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function Confetti() {
  const key = useUIStore((s) => s.confettiKey);
  const pieces = useMemo<Piece[]>(() => {
    if (key === 0) return [];
    // Fewer pieces, longer fall, gentler spin and drift, varied opacity/size.
    const COUNT = 24;
    return Array.from({ length: COUNT }, (_, i) => {
      const isCircle = seededUnit(key * 91 + i * 7) > 0.65;
      const w = 6 + seededUnit(key * 31 + i * 11) * 6; // 6..12
      const h = isCircle ? w : 8 + seededUnit(key * 43 + i * 13) * 6; // 8..14
      return {
        id: `${key}-${i}`,
        color: COLORS[i % COLORS.length],
        left: `${seededUnit(key * 41 + i * 17) * 100}%`,
        width: `${w}px`,
        height: `${h}px`,
        // Slower, with bigger spread of durations for parallax depth
        duration: `${2.6 + seededUnit(key * 67 + i * 23) * 2}s`,
        delay: `${seededUnit(key * 19 + i * 29) * 1.1}s`,
        // Reduced lateral drift — was ±60, now ±30
        drift: `${seededUnit(key * 53 + i * 13) * 60 - 30}px`,
        // Less aggressive spin — was up to 1080deg, now up to 540deg
        spin: `${seededUnit(key * 73 + i * 11) * 540 - 90}deg`,
        // Varied opacity for depth
        opacity: `${0.65 + seededUnit(key * 97 + i * 5) * 0.35}`,
        rounded: isCircle ? '999px' : '2px',
      };
    });
  }, [key]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1200] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: p.left,
              width: p.width,
              height: p.height,
              background: p.color,
              opacity: p.opacity,
              borderRadius: p.rounded,
              '--fall-duration': p.duration,
              '--delay': p.delay,
              '--drift': p.drift,
              '--spin': p.spin,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

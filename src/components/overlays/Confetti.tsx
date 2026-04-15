'use client';

import { useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';

const COLORS = ['#00C896', '#00B4D8', '#FFD166', '#FF6B6B', '#A78BFA', '#FFA94D'];

interface Piece {
  id: string;
  color: string;
  left: string;
  duration: string;
  delay: string;
  drift: string;
  spin: string;
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function Confetti() {
  const key = useUIStore((s) => s.confettiKey);
  const pieces = useMemo<Piece[]>(
    () =>
      key === 0
        ? []
        : Array.from({ length: 35 }, (_, i) => ({
            id: `${key}-${i}`,
            color: COLORS[i % COLORS.length],
            left: `${seededUnit(key * 41 + i * 17) * 100}%`,
            duration: `${1.5 + seededUnit(key * 67 + i * 23) * 1.5}s`,
            delay: `${seededUnit(key * 19 + i * 29) * 0.5}s`,
            drift: `${seededUnit(key * 53 + i * 13) * 120 - 60}px`,
            spin: `${seededUnit(key * 73 + i * 11) * 1080}deg`,
          })),
    [key]
  );

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
              background: p.color,
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

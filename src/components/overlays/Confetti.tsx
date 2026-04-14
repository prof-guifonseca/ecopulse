'use client';

import { useEffect, useState } from 'react';
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

export function Confetti() {
  const key = useUIStore((s) => s.confettiKey);
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (key === 0) return;
    const next: Piece[] = Array.from({ length: 35 }, (_, i) => ({
      id: `${key}-${i}`,
      color: COLORS[i % COLORS.length],
      left: `${Math.random() * 100}%`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      delay: `${Math.random() * 0.5}s`,
      drift: `${Math.random() * 120 - 60}px`,
      spin: `${Math.random() * 1080}deg`,
    }));
    setPieces(next);
    const timer = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(timer);
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

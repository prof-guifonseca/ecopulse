'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Renders a number that pulses (scale + brightness) whenever the value
 * goes up, and tweens between consecutive integers over a short duration.
 *
 * Used by the Carteira card (tokens) so awarding +10 reads as a satisfying
 * count-up instead of a silent integer swap.
 *
 * Decreases (e.g. spendTokens) jump immediately — no celebration when the
 * number drops.
 */
export function AnimatedNumber({
  value,
  durationMs = 600,
  className,
  format = (n) => n.toLocaleString('pt-BR'),
}: {
  value: number;
  durationMs?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const [pulse, setPulse] = useState(0);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any in-flight tween.
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    if (value < fromRef.current) {
      // Drops are silent and instant — don't celebrate spend.
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    if (value === fromRef.current) return;

    const from = fromRef.current;
    const delta = value - from;
    startedAtRef.current = null;

    const step = (now: number) => {
      if (startedAtRef.current === null) startedAtRef.current = now;
      const t = Math.min(1, (now - startedAtRef.current) / durationMs);
      // ease-out cubic — fast start, gentle finish
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + delta * eased);
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(step);

    // Trigger the pulse animation by bumping a key.
    setPulse((p) => p + 1);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return (
    <span
      key={pulse}
      className={cn('inline-block', className)}
      style={{
        animation: pulse > 0 ? 'tokenPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
        transformOrigin: 'center',
      }}
    >
      {format(display)}
    </span>
  );
}

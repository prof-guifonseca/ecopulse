'use client';

import { Locate } from 'lucide-react';
import { LONDRINA_CENTER, latLngToPercent } from '@/lib/map/londrina';
import { LondrinaBackdrop } from './LondrinaBackdrop';

/**
 * Fixed-viewport "GPS" view of central Londrina. Renders the stylized
 * SVG backdrop, a pulsing 'you are here' marker at the simulated home
 * coordinate, and any children (pins, badges) on top.
 *
 * No pan/zoom on purpose — see plan v3, F1.3: a single curated viewport
 * keeps the demo predictable and removes the need for tile streaming.
 */
export function LondrinaMap({ children }: { children?: React.ReactNode }) {
  const center = latLngToPercent(LONDRINA_CENTER);

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-md)] border-soft"
      style={{ aspectRatio: '1 / 1' }}
      role="img"
      aria-label="Mapa de Londrina · 24 pontos sustentáveis no centro"
    >
      <LondrinaBackdrop />

      {/* You-are-here marker — pulsing GPS dot */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${center.x}%`,
          top: `${center.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        aria-label="Sua localização"
      >
        <span
          className="gps-halo animate-pin-pulse absolute inset-[-14px] rounded-full"
        />
        <span className="gps-dot relative block h-3 w-3 rounded-full" />
      </div>

      {/* Top-left status pill — adds GPS legitimacy */}
      <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-soft bg-scrim-card px-2.5 py-1 backdrop-blur-md">
        <Locate size={11} className="text-[var(--accent-gps)]" strokeWidth={2.4} />
        <span className="t-micro tracking-[0.08em] text-[var(--text-secondary)]">
          LONDRINA · CENTRO
        </span>
      </div>

      {children}
    </div>
  );
}

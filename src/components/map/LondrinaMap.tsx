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
      className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-soft)]"
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
          className="absolute inset-[-14px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(80,150,255,0.35), transparent 70%)',
            animation: 'pinPulse 2s ease-in-out infinite',
          }}
        />
        <span
          className="relative block h-3 w-3 rounded-full"
          style={{
            background: '#5aa9ff',
            boxShadow: '0 0 0 2px #0a120e, 0 0 12px rgba(90,170,255,0.6)',
          }}
        />
      </div>

      {/* Top-left status pill — adds GPS legitimacy */}
      <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--line-soft)] bg-[rgba(0,0,0,0.55)] px-2.5 py-1 backdrop-blur-md">
        <Locate size={11} className="text-[#5aa9ff]" strokeWidth={2.4} />
        <span className="text-[0.66rem] font-semibold tracking-[0.08em] text-[var(--text-secondary)]">
          LONDRINA · CENTRO
        </span>
      </div>

      {children}
    </div>
  );
}

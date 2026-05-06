'use client';

import { Locate } from 'lucide-react';
import type { Region } from '@/lib/region/types';
import { latLngToPercent } from '@/lib/region';

/**
 * Fixed-viewport "GPS" view of a region. Renders the stylized SVG backdrop,
 * a pulsing 'you are here' marker at the region center, and any children
 * (pins, badges) on top. Generic over the Region abstraction; the legacy
 * name is kept for back-compat — see RegionMap below for the same component
 * under a more accurate name.
 *
 * No pan/zoom on purpose — see plan v3, F1.3: a single curated viewport
 * keeps the demo predictable and removes the need for tile streaming.
 */
export function RegionMap({ region, children }: { region: Region; children?: React.ReactNode }) {
  const center = latLngToPercent(region.bbox, region.center);
  const Backdrop = region.Backdrop;

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-md)] border-soft"
      style={{ aspectRatio: '1 / 1' }}
      role="img"
      aria-label={`Mapa de ${region.name} · ${region.mapPoints.length} pontos sustentáveis`}
    >
      <Backdrop />

      <div
        className="pointer-events-none absolute"
        style={{
          left: `${center.x}%`,
          top: `${center.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        aria-label="Sua localização"
      >
        <span className="gps-halo animate-pin-pulse absolute inset-[-14px] rounded-full" />
        <span className="gps-dot relative block h-3 w-3 rounded-full" />
      </div>

      <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-soft bg-scrim-card px-2.5 py-1 backdrop-blur-md">
        <Locate size={11} className="text-[var(--accent-gps)]" strokeWidth={2.4} />
        <span className="t-micro tracking-normal text-[var(--text-secondary)]">
          {`${region.name.toUpperCase()} · ${region.state}`}
        </span>
      </div>

      {children}
    </div>
  );
}

/** Back-compat alias. New callers should use `<RegionMap region={...} />`. */
export const LondrinaMap = RegionMap;

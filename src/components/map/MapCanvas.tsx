'use client';

import dynamic from 'next/dynamic';
import type { Region } from '@/lib/region/types';
import type { EnvironmentalPoint } from '@/lib/esg';

export interface MapCanvasProps {
  region: Region;
  points: EnvironmentalPoint[];
  visitedPointIds: string[];
  focusCenter?: { lat: number; lng: number };
  onSelectPoint: (point: EnvironmentalPoint) => void;
}

const MapCanvasClient = dynamic(
  () => import('./MapCanvasClient').then((mod) => mod.MapCanvasClient),
  {
    ssr: false,
    loading: () => <MapCanvasLoading />,
  },
);

export function MapCanvas(props: MapCanvasProps) {
  return <MapCanvasClient {...props} />;
}

function MapCanvasLoading() {
  return (
    <div
      className="border-soft relative grid place-items-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-secondary)]"
      style={{ aspectRatio: '1 / 1' }}
      role="status"
      aria-label="Carregando mapa"
    >
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent-green)] border-t-transparent" />
    </div>
  );
}

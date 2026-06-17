'use client';

import dynamic from 'next/dynamic';
import type { MapCanvasProps } from './mapCanvas.types';

export type { MapCanvasProps };

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
      className="border-soft relative grid place-items-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--card)]"
      style={{ aspectRatio: '1 / 1' }}
      role="status"
      aria-label="Carregando mapa"
    >
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
    </div>
  );
}

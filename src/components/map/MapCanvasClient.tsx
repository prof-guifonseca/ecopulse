'use client';

import { useMemo, useState } from 'react';
import { Locate, MapPin } from 'lucide-react';
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import { ENVIRONMENTAL_CATEGORY_ICON } from '@/lib/esg';
import { latLngToPercent } from '@/lib/region';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/iconRegistry';
import { cn } from '@/lib/cn';
import type { MapCanvasProps } from './mapCanvas.types';
import { getMapStyle } from './mapStyle';

const DEFAULT_ZOOM = 13;

export function MapCanvasClient({
  region,
  points,
  visitedPointIds,
  focusCenter,
  onSelectPoint,
}: MapCanvasProps) {
  const visited = useMemo(() => new Set(visitedPointIds), [visitedPointIds]);
  const [mapError, setMapError] = useState(false);
  const center = focusCenter ?? region.center;
  const visualPins = useMemo(
    () =>
      points.map((point) => ({
        point,
        position: latLngToPercent(region.bbox, { lat: point.lat, lng: point.lng }),
      })),
    [points, region.bbox],
  );

  return (
    <div
      className="border-soft relative overflow-hidden rounded-[var(--radius-md)] bg-[var(--card)]"
      style={{ aspectRatio: '1 / 1' }}
      data-testid="maplibre-surface"
    >
      <Map
        key={`${center.lat.toFixed(5)}:${center.lng.toFixed(5)}`}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={getMapStyle()}
        minZoom={11}
        maxZoom={18}
        attributionControl={{ compact: true }}
        cooperativeGestures
        onError={() => setMapError(true)}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <ScaleControl position="bottom-left" unit="metric" />
      </Map>

      <div className="pointer-events-none absolute inset-0 z-10">
        {visualPins.map(({ point, position }) => {
          const isVisited = visited.has(point.id);
          const Lucide = resolveIcon(ENVIRONMENTAL_CATEGORY_ICON[point.category]) ?? MapPin;
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => onSelectPoint(point)}
              className={cn(
                'border-strong pointer-events-auto absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95',
                isVisited
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[rgba(15,23,19,0.88)] text-[var(--primary)]',
              )}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                boxShadow: isVisited
                  ? '0 0 0 3px var(--tint-green-3), 0 10px 20px rgba(0,0,0,0.4)'
                  : '0 8px 18px rgba(0,0,0,0.45)',
              }}
              aria-label={`Selecionar ${point.name}`}
            >
              <Icon icon={Lucide} size={16} />
            </button>
          );
        })}
      </div>

      <div className="border-soft bg-scrim-card pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md">
        <Locate size={11} className="text-[var(--accent-gps)]" strokeWidth={2.4} />
        <span className="t-micro tracking-normal text-[var(--text-secondary)]">
          {`${region.name.toUpperCase()} · ${region.state}`}
        </span>
      </div>

      {mapError ? (
        <div className="border-soft bg-scrim-card pointer-events-none absolute right-3 bottom-3 rounded-full px-2.5 py-1 backdrop-blur-md">
          <span className="t-micro tracking-normal text-[var(--text-secondary)]">
            Base indisponível
          </span>
        </div>
      ) : null}
    </div>
  );
}

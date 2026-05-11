'use client';

import { useMemo, useState } from 'react';
import { Locate, MapPin } from 'lucide-react';
import Map, { Marker, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import { ENVIRONMENTAL_CATEGORY_ICON } from '@/lib/esg';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/iconRegistry';
import { cn } from '@/lib/cn';
import type { MapCanvasProps } from './MapCanvas';
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

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-md)] border-soft bg-[var(--bg-secondary)]"
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
        {points.map((point) => {
          const isVisited = visited.has(point.id);
          const Lucide = resolveIcon(ENVIRONMENTAL_CATEGORY_ICON[point.category]) ?? MapPin;
          return (
            <Marker key={point.id} longitude={point.lng} latitude={point.lat} anchor="center">
              <button
                type="button"
                onClick={() => onSelectPoint(point)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-strong backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95',
                  isVisited
                    ? 'bg-[var(--accent-green)] text-[var(--on-primary)]'
                    : 'bg-[rgba(15,23,19,0.82)] text-[var(--accent-green)]'
                )}
                style={{
                  boxShadow: isVisited
                    ? '0 0 0 3px var(--tint-green-3), 0 10px 20px rgba(0,0,0,0.4)'
                    : '0 8px 18px rgba(0,0,0,0.45)',
                }}
                aria-label={point.name}
              >
                <Icon icon={Lucide} size={16} />
              </button>
            </Marker>
          );
        })}
      </Map>

      <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-soft bg-scrim-card px-2.5 py-1 backdrop-blur-md">
        <Locate size={11} className="text-[var(--accent-gps)]" strokeWidth={2.4} />
        <span className="t-micro tracking-normal text-[var(--text-secondary)]">
          {`${region.name.toUpperCase()} · ${region.state}`}
        </span>
      </div>

      {mapError ? (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border-soft bg-scrim-card px-2.5 py-1 backdrop-blur-md">
          <span className="t-micro tracking-normal text-[var(--text-secondary)]">
            Base indisponível
          </span>
        </div>
      ) : null}
    </div>
  );
}

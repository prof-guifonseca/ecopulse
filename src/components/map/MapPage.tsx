'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { MAP_TYPE_LABELS, MAP_TYPE_ICON } from '@/data';
import { useCurrentRegion, latLngToPercent, distanceFromCenter } from '@/lib/region';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { ListCard } from '@/components/ui/ListCard';
import { PageShell } from '@/components/ui/PageShell';
import { resolveIcon } from '@/lib/iconRegistry';
import { RegionMap } from './LondrinaMap';
import { cn } from '@/lib/cn';
import type { MapPointType } from '@/types';

const FILTERS: Array<'todos' | MapPointType> = [
  'todos',
  'baterias',
  'eletronicos',
  'oleo',
  'trocas',
  'granel',
  'reparo',
];

export function MapPage() {
  const region = useCurrentRegion();
  const points = region.mapPoints;
  const events = region.events;
  const [filter, setFilter] = useState<'todos' | MapPointType>('todos');
  const [panel, setPanel] = useState<'places' | 'events'>('places');
  const openModal = useUIStore((s) => s.openModal);
  const visited = useGameStore((s) => s.visitedPoints);

  const pins = useMemo(
    () => (filter === 'todos' ? points : points.filter((point) => point.type === filter)),
    [filter, points]
  );

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <h1 className="t-headline">Mapa</h1>
        <p className="mt-1 t-caption">{region.blurb}</p>
      </header>

      <RegionMap region={region}>
        {pins.map((point) => {
          const isVisited = visited.includes(point.id);
          const Lucide = resolveIcon(MAP_TYPE_ICON[point.type]) ?? MapPin;
          const { x, y } = latLngToPercent(region.bbox, { lat: point.lat, lng: point.lng });
          return (
            <button
              key={point.id}
              onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
              className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-strong backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: isVisited ? 'var(--accent-green)' : 'rgba(15,23,19,0.78)',
                boxShadow: isVisited
                  ? '0 0 0 3px var(--tint-green-3), 0 10px 20px rgba(0,0,0,0.4)'
                  : '0 8px 18px rgba(0,0,0,0.45)',
                color: isVisited ? 'var(--on-primary)' : 'var(--accent-green)',
              }}
              aria-label={point.name}
            >
              <Icon icon={Lucide} size={16} />
            </button>
          );
        })}
      </RegionMap>

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((currentFilter) => {
          const iconName =
            currentFilter === 'todos' ? 'mapPin' : MAP_TYPE_ICON[currentFilter as MapPointType];
          const Lucide = resolveIcon(iconName);
          return (
            <Chip
              key={currentFilter}
              active={filter === currentFilter}
              onClick={() => setFilter(currentFilter)}
              leftIcon={Lucide ? <Icon icon={Lucide} size={13} /> : null}
              className="shrink-0 whitespace-nowrap"
            >
              {MAP_TYPE_LABELS[currentFilter]}
            </Chip>
          );
        })}
      </div>

      <div className="flex gap-1 rounded-full border-soft bg-tint-1 p-1">
        {([
          { v: 'places' as const, label: `Locais (${pins.length})` },
          { v: 'events' as const, label: `Agenda (${events.length})` },
        ]).map((opt) => (
          <button
            key={opt.v}
            onClick={() => setPanel(opt.v)}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              panel === opt.v
                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-[var(--shadow-card)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {panel === 'places' ? (
        <ListCard className="stagger">
          {pins.map((point) => {
            const Lucide = resolveIcon(MAP_TYPE_ICON[point.type]) ?? MapPin;
            const isVisited = visited.includes(point.id);
            return (
              <li key={point.id}>
                <button
                  onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-tint-2"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
                      isVisited
                        ? 'border-active bg-tint-green-2 text-[var(--accent-green)]'
                        : 'border-soft bg-tint-2 text-[var(--text-secondary)]'
                    )}
                  >
                    <Icon icon={Lucide} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{point.name}</h3>
                    <p className="t-caption truncate">
                      {distanceFromCenter(region, { lat: point.lat, lng: point.lng })} · {point.address}
                    </p>
                  </div>
                  <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
                </button>
              </li>
            );
          })}
        </ListCard>
      ) : (
        <ListCard>
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] border-soft bg-tint-2">
                <span className="text-sm font-semibold leading-none text-[var(--text-primary)]">{event.day}</span>
                <span className="t-caption mt-0.5 leading-none">{event.month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="t-title">{event.title}</h3>
                <p className="t-caption">{event.time} · {event.rsvp} confirmados</p>
              </div>
            </li>
          ))}
        </ListCard>
      )}
    </PageShell>
  );
}

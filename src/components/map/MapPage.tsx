'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { MAP_POINTS, MAP_TYPE_LABELS, MAP_TYPE_ICON, EVENTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { PageShell } from '@/components/ui/PageShell';
import { resolveIcon } from '@/lib/iconRegistry';
import { TopoMap } from './TopoMap';
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
  const [filter, setFilter] = useState<'todos' | MapPointType>('todos');
  const [panel, setPanel] = useState<'places' | 'events'>('places');
  const openModal = useUIStore((s) => s.openModal);
  const visited = useGameStore((s) => s.visitedPoints);

  const pins = useMemo(
    () => (filter === 'todos' ? MAP_POINTS : MAP_POINTS.filter((point) => point.type === filter)),
    [filter]
  );

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <p className="t-eyebrow">Mapa local</p>
        <h1 className="t-display mt-1.5 leading-[0.95]">
          Onde a sua rua <span className="t-italic-soft">recicla</span>
        </h1>
      </header>

      <TopoMap>
        {/* User position */}
        <div
          className="absolute h-3 w-3 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--accent-green)',
            boxShadow: '0 0 0 5px var(--tint-green-3), 0 0 16px var(--tint-green-4)',
            animation: 'pinPulse 1.8s ease-in-out infinite',
          }}
          title="Você está aqui"
        />

        {pins.map((point) => {
          const isVisited = visited.includes(point.id);
          const Lucide = resolveIcon(point.iconName as never);
          return (
            <button
              key={point.id}
              onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
              className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line-strong)] backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                background: isVisited ? 'var(--accent-green)' : 'rgba(15,23,19,0.78)',
                boxShadow: isVisited
                  ? '0 0 0 3px var(--tint-green-3), 0 10px 20px rgba(0,0,0,0.4)'
                  : '0 8px 18px rgba(0,0,0,0.45)',
                color: isVisited ? 'var(--on-primary)' : 'var(--accent-green)',
              }}
              aria-label={point.name}
            >
              {Lucide ? <Icon icon={Lucide} size={16} /> : <Icon icon={MapPin} size={16} />}
            </button>
          );
        })}
      </TopoMap>

      {/* Filter chips */}
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((currentFilter) => {
          const iconName =
            currentFilter === 'todos' ? 'mapPin' : MAP_TYPE_ICON[currentFilter as MapPointType];
          const Lucide = resolveIcon(iconName as never);
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

      {/* Lightweight panel toggle (Locais ⇄ Agenda) */}
      <div className="flex gap-1 rounded-full border border-[var(--line-soft)] bg-[var(--tint-1)] p-1">
        {([
          { v: 'places' as const, label: `Locais (${pins.length})` },
          { v: 'events' as const, label: `Agenda (${EVENTS.length})` },
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
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {pins.map((point) => {
            const Lucide = resolveIcon(point.iconName as never);
            const isVisited = visited.includes(point.id);
            return (
              <li key={point.id}>
                <button
                  onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
                      isVisited
                        ? 'border border-[var(--line-active)] bg-[var(--tint-green-2)] text-[var(--accent-green)]'
                        : 'border border-[var(--line-soft)] bg-[var(--tint-2)] text-[var(--text-secondary)]'
                    )}
                  >
                    {Lucide ? <Icon icon={Lucide} size={16} /> : <span>{point.emoji}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{point.name}</h3>
                    <p className="t-caption truncate">{point.distance} · {point.address}</p>
                  </div>
                  <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {EVENTS.map((event) => (
            <li key={event.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line-soft)] bg-[var(--tint-2)]">
                <span className="text-sm font-semibold leading-none text-[var(--text-primary)]">{event.day}</span>
                <span className="t-caption mt-0.5 leading-none">{event.month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="t-title">{event.title}</h3>
                <p className="t-caption">{event.time} · {event.rsvp} confirmados</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

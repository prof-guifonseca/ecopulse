'use client';

import { useMemo, useState } from 'react';
import { Battery, Cpu, Droplet, Hammer, Leaf, MapPin, Shirt, type LucideIcon } from 'lucide-react';
import { MAP_POINTS, MAP_TYPE_LABELS, EVENTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Stat } from '@/components/ui/Stat';
import { Tabs } from '@/components/ui/Tabs';
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

const FILTER_ICON: Record<'todos' | MapPointType, LucideIcon> = {
  todos: MapPin,
  baterias: Battery,
  eletronicos: Cpu,
  oleo: Droplet,
  trocas: Shirt,
  granel: Leaf,
  reparo: Hammer,
};

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
    <div className="space-y-6" style={{ animation: 'fadeIn 0.35s ease' }}>
      <Card tone="hero" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Perto de você"
          subtitle="Filtre por tipo e escolha só o próximo lugar que faz sentido visitar."
        />

        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto pb-1 pl-1 pr-1">
          {FILTERS.map((currentFilter) => (
            <button
              key={currentFilter}
              onClick={() => setFilter(currentFilter)}
              className="command-pill shrink-0 whitespace-nowrap"
              data-active={filter === currentFilter ? 'true' : undefined}
            >
              <Icon icon={FILTER_ICON[currentFilter]} size={13} />
              {MAP_TYPE_LABELS[currentFilter]}
            </button>
          ))}
        </div>

        <div className="scan-frame p-4">
          <div
            className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-soft)]"
            style={{
              aspectRatio: '1 / 1',
              background:
                'radial-gradient(circle at 24% 24%, rgba(141,219,152,0.12), transparent 30%), linear-gradient(180deg, #162320, #0c1410)',
            }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {Array.from({ length: 9 }).map((_, index) => {
                const value = 10 + index * 10;
                return (
                  <g key={value}>
                    <line x1={value} y1="0" x2={value} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
                    <line x1="0" y1={value} x2="100" y2={value} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
                  </g>
                );
              })}
            </svg>

            <div
              className="absolute h-4 w-4 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--accent-green)',
                boxShadow: '0 0 0 6px rgba(141,219,152,0.18), 0 0 16px rgba(141,219,152,0.3)',
                animation: 'pinPulse 1.8s ease-in-out infinite',
              }}
              title="Você está aqui"
            />

            {pins.map((point) => {
              const isVisited = visited.includes(point.id);

              return (
                <button
                  key={point.id}
                  onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                  className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-base transition-transform duration-200 hover:scale-110 active:scale-95"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    background: isVisited ? 'rgba(141,219,152,0.9)' : 'rgba(15,23,19,0.92)',
                    boxShadow: isVisited
                      ? '0 0 0 3px rgba(141,219,152,0.2), 0 10px 20px rgba(0,0,0,0.4)'
                      : '0 10px 20px rgba(0,0,0,0.4)',
                  }}
                  aria-label={point.name}
                >
                  {point.emoji}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Locais" value={pins.length} />
            <Stat label="Visitados" value={visited.length} />
            <Stat label="Filtro" value={<span className="truncate">{MAP_TYPE_LABELS[filter]}</span>} />
          </div>
        </div>
      </Card>

      <Tabs
        items={[
          { value: 'places', label: 'Locais' },
          { value: 'events', label: 'Agenda' },
        ]}
        value={panel}
        onChange={setPanel}
      />

      {panel === 'places' ? (
        <section>
          <SectionHeader
            title="Locais para sua próxima visita"
            subtitle={`${pins.length} ponto${pins.length === 1 ? '' : 's'} combinando com o filtro atual.`}
          />
          <div className="space-y-3">
            {pins.map((point) => (
              <button
                key={point.id}
                onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                className="block w-full text-left transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Card tone="solid" padded={false} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-xl"
                      style={{ background: 'rgba(141,219,152,0.12)' }}
                    >
                      {point.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-[0.98rem] font-semibold text-text-primary">{point.name}</h3>
                          <p className="mt-0.5 truncate text-[0.8rem] text-text-muted">{point.address}</p>
                        </div>
                        <span className="command-pill shrink-0">{point.distance}</span>
                      </div>
                      <div className="mt-2 text-[0.78rem] text-text-muted">{point.hours}</div>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <SectionHeader
            title="Agenda próxima"
            subtitle="Encontros presenciais para ampliar sua rotina fora do app."
          />
          <div className="space-y-3">
            {EVENTS.map((event) => (
              <Card key={event.id} tone="solid" padded={false} className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-[14px] border border-[var(--line-soft)] bg-white/[0.03] text-text-primary">
                    <span className="text-base font-semibold leading-none">{event.day}</span>
                    <span className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-text-muted">
                      {event.month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.95rem] font-semibold text-text-primary">
                      {event.emoji} {event.title}
                    </div>
                    <div className="mt-0.5 text-[0.78rem] text-text-muted">
                      {event.time} · {event.rsvp} confirmados
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

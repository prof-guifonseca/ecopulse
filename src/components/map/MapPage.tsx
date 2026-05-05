'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { MAP_POINTS, MAP_TYPE_LABELS, MAP_TYPE_ICON, EVENTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Tile } from '@/components/ui/Tile';
import { IconTile } from '@/components/ui/IconTile';
import { Chip } from '@/components/ui/Chip';
import { Tabs } from '@/components/ui/Tabs';
import { PageShell } from '@/components/ui/PageShell';
import { resolveIcon } from '@/lib/iconRegistry';
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
    <PageShell>
      <Card tone="hero" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Perto de você"
          subtitle="Filtre por tipo e escolha o próximo lugar que faz sentido visitar."
        />

        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto pb-1 pl-1 pr-1">
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

        <div className="scan-frame p-4">
          <div
            className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-soft)]"
            style={{
              aspectRatio: '1 / 1',
              background:
                'radial-gradient(circle at 24% 24%, var(--tint-green-2), transparent 30%), linear-gradient(180deg, var(--bg-elevated), #0c1410)',
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
                  className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line-strong)] transition-transform duration-200 hover:scale-110 active:scale-95"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    background: isVisited ? 'var(--accent-green)' : 'rgba(15,23,19,0.92)',
                    boxShadow: isVisited
                      ? '0 0 0 3px var(--tint-green-3), 0 10px 20px rgba(0,0,0,0.4)'
                      : '0 10px 20px rgba(0,0,0,0.4)',
                    color: isVisited ? 'var(--on-primary)' : 'var(--accent-green)',
                  }}
                  aria-label={point.name}
                >
                  {Lucide ? <Icon icon={Lucide} size={16} /> : <Icon icon={MapPin} size={16} />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Tile size="sm" label="Locais" value={pins.length} />
            <Tile size="sm" label="Visitados" value={visited.length} />
            <Tile size="sm" label="Filtro" value={<span className="truncate">{MAP_TYPE_LABELS[filter]}</span>} />
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
            {pins.map((point) => {
              const Lucide = resolveIcon(point.iconName as never);

              return (
                <button
                  key={point.id}
                  onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                  className="block w-full text-left transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Card tone="solid" padded={false} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <IconTile
                        size="md"
                        tone="brand"
                        icon={Lucide ? <Icon icon={Lucide} size={20} /> : <span>{point.emoji}</span>}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="t-title truncate">{point.name}</h3>
                            <p className="t-caption mt-0.5 truncate">{point.address}</p>
                          </div>
                          <Chip asStatic className="shrink-0">{point.distance}</Chip>
                        </div>
                        <div className="t-caption mt-2">{point.hours}</div>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
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
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line-soft)] bg-[var(--tint-2)] text-[var(--text-primary)]">
                    <span className="text-base font-semibold leading-none">{event.day}</span>
                    <span className="t-caption mt-0.5 leading-none">{event.month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="t-title">{event.title}</div>
                    <div className="t-caption mt-0.5">
                      {event.time} · {event.rsvp} confirmados
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}

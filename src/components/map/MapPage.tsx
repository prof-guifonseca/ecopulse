'use client';

import { useMemo, useState } from 'react';
import { MAP_POINTS, MAP_TYPE_LABELS, EVENTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { GlassCard } from '@/components/shared/GlassCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
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
  const openModal = useUIStore((s) => s.openModal);
  const visited = useGameStore((s) => s.visitedPoints);

  const pins = useMemo(
    () => (filter === 'todos' ? MAP_POINTS : MAP_POINTS.filter((point) => point.type === filter)),
    [filter]
  );

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <GlassCard variant="hud" accent="mint" className="px-5 py-5">
        <SectionHeader
          eyebrow="Mapa"
          title="O que está perto de você"
          subtitle="Encontre ecopontos, reparos, trocas e compras conscientes sem sair do fluxo do app."
        />

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((currentFilter) => (
            <button
              key={currentFilter}
              onClick={() => setFilter(currentFilter)}
              className="command-pill whitespace-nowrap"
              data-active={filter === currentFilter ? 'true' : undefined}
            >
              {MAP_TYPE_LABELS[currentFilter]}
            </button>
          ))}
        </div>

        <div className="scan-frame p-4">
          <div
            className="relative overflow-hidden rounded-[26px] border border-white/8"
            style={{
              aspectRatio: '1 / 1',
              background:
                'radial-gradient(circle at 24% 24%, rgba(145,216,159,0.14), transparent 30%), radial-gradient(circle at 72% 70%, rgba(213,187,123,0.12), transparent 32%), linear-gradient(180deg, rgba(18,29,23,0.96), rgba(11,18,14,0.98))',
            }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {Array.from({ length: 9 }).map((_, index) => {
                const value = 10 + index * 10;

                return (
                  <g key={value}>
                    <line x1={value} y1="0" x2={value} y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
                    <line x1="0" y1={value} x2="100" y2={value} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
                  </g>
                );
              })}
            </svg>

            <div
              className="absolute h-5 w-5 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--accent-green)',
                boxShadow: '0 0 0 8px rgba(145,216,159,0.12), 0 0 20px rgba(145,216,159,0.2)',
              }}
              title="Você está aqui"
            />

            {pins.map((point) => {
              const isVisited = visited.includes(point.id);

              return (
                <button
                  key={point.id}
                  onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                  className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/8 text-lg transition-transform duration-200 hover:scale-105 active:scale-95"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    background: point.color,
                    boxShadow: isVisited
                      ? '0 0 0 3px rgba(145,216,159,0.24), 0 14px 28px rgba(1,8,5,0.28)'
                      : '0 14px 28px rgba(1,8,5,0.28)',
                  }}
                  aria-label={point.name}
                >
                  {point.emoji}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <InfoPill label="Locais" value={pins.length} />
            <InfoPill label="Visitados" value={visited.length} />
            <InfoPill label="Filtro" value={MAP_TYPE_LABELS[filter]} />
          </div>
        </div>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Próximos pontos"
          title="Locais que merecem sua próxima visita"
          subtitle="Abra cada ponto para ver detalhes, distância e como gerar recompensas no mapa."
        />
        <div className="space-y-3">
          {pins.map((point, index) => (
            <button
              key={point.id}
              onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
              className="block w-full text-left"
            >
              <GlassCard
                variant="tile"
                accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
                className="px-4 py-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
                    style={{ background: point.color }}
                  >
                    {point.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">{point.name}</h3>
                        <p className="mt-1 text-sm text-text-secondary">{point.address}</p>
                      </div>
                      <span className="command-pill">{point.distance}</span>
                    </div>
                    <div className="mt-3 text-sm text-text-secondary">{point.hours}</div>
                  </div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Agenda"
          title="Eventos próximos"
          subtitle="Experiências presenciais para reforçar a comunidade e ampliar seu alcance local."
        />
        <div className="space-y-3">
          {EVENTS.map((event, index) => (
            <GlassCard
              key={event.id}
              variant="tile"
              accent={index % 2 === 0 ? 'mint' : 'amber'}
              className="px-4 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-[24px] bg-white/7 text-text-primary">
                  <span className="text-lg font-semibold leading-none">{event.day}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                    {event.month}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-text-primary">
                    {event.emoji} {event.title}
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {event.time} · {event.rsvp} confirmados
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface surface-ghost rounded-[20px] px-3 py-3 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}

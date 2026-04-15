'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { EVENTS, MAP_POINTS, MAP_TYPE_LABELS } from '@/data';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { buildDemoHref, isDemoMode } from '@/lib/demoMode';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
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
  const searchParams = useSearchParams();
  const demoMode = isDemoMode(searchParams);
  const openModal = useUIStore((s) => s.openModal);
  const visited = useGameStore((s) => s.visitedPoints);
  const currentFilter = parseFilter(searchParams.get('filter'));
  const currentView = searchParams.get('view') === 'events' ? 'events' : 'places';

  const pins = useMemo(
    () => (currentFilter === 'todos' ? MAP_POINTS : MAP_POINTS.filter((point) => point.type === currentFilter)),
    [currentFilter]
  );

  const spotlightPoint = pins[0] ?? MAP_POINTS[0];
  const spotlightEvent = EVENTS[0];

  return (
    <div className="space-y-6 pb-3" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,25,21,0.98),rgba(8,13,11,0.96))] px-5 py-5 shadow-[0_30px_80px_rgba(1,8,5,0.34)]">
        <div className="flex items-start justify-between gap-3">
          <div className="max-w-[18ch]">
            <div className="text-[0.76rem] font-medium text-text-secondary">Fluxo hero</div>
            <h1 className="mt-3 text-[2.45rem] font-semibold leading-[0.92] tracking-[-0.06em] text-text-primary">
              Descubra a próxima parada.
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              O mapa vira um palco de decisão: um filtro por vez, uma vista dominante e uma próxima ação clara.
            </p>
          </div>

          <div className="flex gap-2 rounded-full border border-white/8 bg-white/5 p-1">
            <Link
              href={buildDemoHref('/map', demoMode, { view: 'places', filter: currentFilter })}
              className="rounded-full px-3 py-1.5 text-[0.75rem] font-medium text-text-secondary data-[active=true]:bg-white/8 data-[active=true]:text-text-primary"
              data-active={currentView === 'places' ? 'true' : undefined}
            >
              Locais
            </Link>
            <Link
              href={buildDemoHref('/map', demoMode, { view: 'events', filter: currentFilter })}
              className="rounded-full px-3 py-1.5 text-[0.75rem] font-medium text-text-secondary data-[active=true]:bg-white/8 data-[active=true]:text-text-primary"
              data-active={currentView === 'events' ? 'true' : undefined}
            >
              Agenda
            </Link>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <Link
              key={filter}
              href={buildDemoHref('/map', demoMode, { view: currentView, filter })}
              className="command-pill whitespace-nowrap"
              data-active={currentFilter === filter ? 'true' : undefined}
            >
              {MAP_TYPE_LABELS[filter]}
            </Link>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,24,20,0.98),rgba(10,15,13,0.96))]">
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '0.88 / 1',
              background:
                'radial-gradient(circle at 24% 24%, rgba(145,216,159,0.14), transparent 30%), radial-gradient(circle at 72% 70%, rgba(213,187,123,0.12), transparent 32%), linear-gradient(180deg, rgba(18,29,23,0.98), rgba(11,18,14,0.98))',
            }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {Array.from({ length: 9 }).map((_, index) => {
                const value = 10 + index * 10;

                return (
                  <g key={value}>
                    <line x1={value} y1="0" x2={value} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
                    <line x1="0" y1={value} x2="100" y2={value} stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
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
                boxShadow: '0 0 0 8px rgba(145,216,159,0.12), 0 0 20px rgba(145,216,159,0.18)',
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
                      ? '0 0 0 3px rgba(145,216,159,0.18), 0 14px 28px rgba(1,8,5,0.24)'
                      : '0 14px 28px rgba(1,8,5,0.24)',
                  }}
                  aria-label={point.name}
                >
                  {point.emoji}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/6 px-4 py-4">
            {currentView === 'places' && spotlightPoint ? (
              <button
                onClick={() => openModal({ kind: 'mapPoint', id: spotlightPoint.id })}
                className="block w-full text-left"
              >
                <div className="text-[0.76rem] font-medium text-text-secondary">Ponto recomendado agora</div>
                <div className="mt-2 flex items-start gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] text-2xl"
                    style={{ background: spotlightPoint.color }}
                  >
                    {spotlightPoint.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[1.02rem] font-semibold text-text-primary">{spotlightPoint.name}</h2>
                        <p className="mt-1 text-sm text-text-secondary">{spotlightPoint.address}</p>
                      </div>
                      <span className="command-pill">{spotlightPoint.distance}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{spotlightPoint.hours}</p>
                  </div>
                </div>
              </button>
            ) : (
              <div>
                <div className="text-[0.76rem] font-medium text-text-secondary">Evento para apresentar</div>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-col items-center justify-center rounded-[24px] border border-white/8 bg-white/6 text-text-primary">
                    <span className="text-lg font-semibold leading-none">{spotlightEvent.day}</span>
                    <span className="text-[0.72rem] font-medium text-text-secondary">{spotlightEvent.month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[1.02rem] font-semibold text-text-primary">
                      {spotlightEvent.emoji} {spotlightEvent.title}
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      {spotlightEvent.time} · {spotlightEvent.rsvp} confirmados
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title={currentView === 'places' ? 'Mais pontos da rota' : 'Agenda ampliada'}
          subtitle={
            currentView === 'places'
              ? 'Uma lista enxuta para continuar a conversa depois do mapa principal.'
              : 'Os próximos encontros aparecem como extensão da narrativa local.'
          }
        />
        <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] shadow-[0_20px_56px_rgba(1,8,5,0.22)]">
          {currentView === 'places'
            ? pins.map((point, index) => (
                <button
                  key={point.id}
                  onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                  className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-white/[0.03]"
                  style={index !== pins.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] text-xl"
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
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{point.hours}</p>
                  </div>
                </button>
              ))
            : EVENTS.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 px-4 py-4"
                  style={index !== EVENTS.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
                >
                  <div className="flex h-16 w-16 flex-col items-center justify-center rounded-[22px] border border-white/8 bg-white/6 text-text-primary">
                    <span className="text-lg font-semibold leading-none">{event.day}</span>
                    <span className="text-[0.72rem] font-medium text-text-secondary">{event.month}</span>
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
              ))}
        </div>
      </section>
    </div>
  );
}

function parseFilter(value: string | null): 'todos' | MapPointType {
  if (!value) return 'todos';
  return FILTERS.includes(value as 'todos' | MapPointType) ? (value as 'todos' | MapPointType) : 'todos';
}

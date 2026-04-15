'use client';

import { useState } from 'react';
import { MAP_POINTS, MAP_TYPE_LABELS, EVENTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { GlassCard } from '@/components/shared/GlassCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
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
  const openModal = useUIStore((s) => s.openModal);
  const visited = useGameStore((s) => s.visitedPoints);

  const pins = filter === 'todos' ? MAP_POINTS : MAP_POINTS.filter((point) => point.type === filter);

  return (
    <div className="space-y-6 lg:space-y-8" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <GlassCard variant="hud" accent="cyan" className="px-5 py-5 sm:px-6 sm:py-6">
          <SectionHeader
            eyebrow="tactical field"
            title="Mapa Sustentavel"
            subtitle="EcoPontos, reparo, trocas e eventos em uma leitura mais tática do territorio."
          />

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((currentFilter) => (
              <button
                key={currentFilter}
                onClick={() => setFilter(currentFilter)}
                className="command-pill"
                data-active={filter === currentFilter ? 'true' : undefined}
              >
                {MAP_TYPE_LABELS[currentFilter]}
              </button>
            ))}
          </div>

          <div className="scan-frame p-4 sm:p-5">
            <div
              className="relative overflow-hidden rounded-[24px] border border-white/8"
              style={{
                aspectRatio: '1.2 / 1',
                background:
                  'radial-gradient(circle at 24% 24%, rgba(70,247,194,0.18), transparent 32%), radial-gradient(circle at 72% 70%, rgba(54,215,255,0.16), transparent 36%), linear-gradient(180deg, rgba(13,25,39,0.96), rgba(9,15,26,0.98))',
              }}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                {Array.from({ length: 9 }).map((_, index) => {
                  const value = 10 + index * 10;

                  return (
                    <g key={value}>
                      <line x1={value} y1="0" x2={value} y2="100" stroke="rgba(147,180,215,0.08)" strokeWidth="0.4" />
                      <line x1="0" y1={value} x2="100" y2={value} stroke="rgba(147,180,215,0.08)" strokeWidth="0.4" />
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(70,247,194,0.12)" strokeWidth="0.7" />
                <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(54,215,255,0.08)" strokeWidth="0.7" />
              </svg>

              <div
                className="absolute h-5 w-5 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--accent-cyan)',
                  boxShadow: '0 0 0 8px rgba(54,215,255,0.14), 0 0 20px rgba(54,215,255,0.32)',
                }}
                title="Você está aqui"
              />

              {pins.map((point) => {
                const isVisited = visited.includes(point.id);

                return (
                  <button
                    key={point.id}
                    onClick={() => openModal({ kind: 'mapPoint', id: point.id })}
                    className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 text-lg transition-transform duration-200 hover:scale-110 active:scale-95"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      background: point.color,
                      boxShadow: isVisited
                        ? '0 0 0 3px rgba(70,247,194,0.4), 0 10px 24px rgba(3,10,20,0.38)'
                        : '0 10px 24px rgba(3,10,20,0.38)',
                    }}
                    aria-label={point.name}
                  >
                    {point.emoji}
                  </button>
                );
              })}

              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                <span className="command-pill" data-active="true">{pins.length} ativos</span>
                <span className="command-pill">+15 tokens por visita</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="panel" accent="mint" className="px-5 py-5">
          <div className="hud-label">field telemetry</div>
          <div className="mt-3 font-display text-2xl font-bold">Status de campo</div>
          <div className="mt-5 grid gap-3">
            <MetricRow label="Pontos rastreados" value={pins.length} icon="🛰️" accent="cyan" />
            <MetricRow label="Locais visitados" value={visited.length} icon="✅" accent="mint" />
            <MetricRow label="Filtro ativo" value={MAP_TYPE_LABELS[filter]} icon="🧭" accent="amber" />
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionHeader
          eyebrow="live agenda"
          title="Eventos Proximos"
          subtitle="Participe de operacoes locais para ganhar tokens extras e ampliar alcance da tribo."
        />
        <ul className="grid gap-4 xl:grid-cols-2">
          {EVENTS.map((event, index) => (
            <li key={event.id}>
              <GlassCard
                variant="tile"
                accent={index % 2 === 0 ? 'mint' : 'cyan'}
                className="flex items-center gap-4 px-5 py-5"
              >
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-[24px] border border-white/10 bg-[var(--gradient-primary)] text-bg-primary shadow-[0_0_32px_rgba(54,215,255,0.18)]">
                  <span className="font-display text-xl font-bold leading-none">{event.day}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em]">{event.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-2xl font-bold leading-tight">
                    {event.emoji} {event.title}
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {event.time} · 👥 {event.rsvp} confirmados
                  </div>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MetricRow({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: 'mint' | 'cyan' | 'amber';
}) {
  return (
    <div className={cn('surface surface-ghost flex items-center gap-3 px-4 py-4', accent !== 'mint' && 'surface-accent-none')}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="hud-label">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

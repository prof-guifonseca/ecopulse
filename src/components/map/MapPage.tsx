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

  const pins = filter === 'todos' ? MAP_POINTS : MAP_POINTS.filter((p) => p.type === filter);

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section>
        <SectionHeader title="Mapa Sustentável" subtitle="EcoPontos, trocas e reparo perto de você" />
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                filter === f ? 'text-bg-primary' : 'bg-bg-tertiary text-text-secondary'
              )}
              style={filter === f ? { background: 'var(--gradient-primary)' } : undefined}
            >
              {MAP_TYPE_LABELS[f]}
            </button>
          ))}
        </div>

        <div
          className="relative overflow-hidden rounded-lg border border-white/5"
          style={{
            aspectRatio: '1 / 1',
            background:
              'radial-gradient(circle at 30% 30%, rgba(82,183,136,0.15), transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,180,216,0.12), transparent 55%), var(--bg-secondary)',
          }}
        >
          {/* Schematic streets */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="25" y1="0" x2="25" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </svg>

          {/* "You are here" */}
          <div
            className="absolute h-4 w-4 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--accent-cyan)',
              boxShadow: '0 0 0 6px rgba(0,180,216,0.25), 0 0 14px var(--accent-cyan)',
            }}
            title="Você está aqui"
          />

          {/* Pins */}
          {pins.map((p) => {
            const isVisited = visited.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => openModal({ kind: 'mapPoint', id: p.id })}
                className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-base transition-transform hover:scale-110 active:scale-95"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  background: p.color,
                  boxShadow: isVisited
                    ? '0 0 0 3px var(--accent-green), 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.4)',
                }}
                aria-label={p.name}
              >
                {p.emoji}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-center text-[11px] text-text-secondary">
          {pins.length} ponto{pins.length === 1 ? '' : 's'} · +15 tokens por visita
        </p>
      </section>

      <section>
        <SectionHeader title="Eventos Próximos" subtitle="Participe e ganhe tokens extras" />
        <ul className="space-y-2">
          {EVENTS.map((e) => (
            <li key={e.id}>
              <GlassCard className="flex items-center gap-3 p-3">
                <div
                  className="flex h-14 w-14 flex-col items-center justify-center rounded-md"
                  style={{ background: 'var(--gradient-primary)', color: 'var(--bg-primary)' }}
                >
                  <span className="font-display text-lg font-bold leading-none">{e.day}</span>
                  <span className="text-[10px] font-bold">{e.month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {e.emoji} {e.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-secondary">
                    {e.time} · 👥 {e.rsvp} confirmados
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

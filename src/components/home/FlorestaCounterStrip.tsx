'use client';

import { BatteryCharging, Droplet, Hammer, Shirt, TreePine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '@/components/ui/Icon';

interface MetricItem {
  icon: LucideIcon;
  value: string;
  label: string;
}

function fmtKg(v: number): string {
  if (v < 1) return `${(v * 1000).toFixed(0)} g`;
  return `${v.toFixed(v % 1 === 0 ? 0 : 1)} kg`;
}

function fmtL(v: number): string {
  return `${v.toFixed(v % 1 === 0 ? 0 : 1)} L`;
}

export function FlorestaCounterStrip() {
  const realImpact = useGameStore((s) => s.realImpact);

  const metrics: MetricItem[] = [
    { icon: TreePine, value: String(realImpact.treesPlanted), label: 'árvores' },
    { icon: BatteryCharging, value: fmtKg(realImpact.batteriesKgEstimated), label: 'pilhas' },
    { icon: Droplet, value: fmtL(realImpact.oilLitersEstimated), label: 'óleo' },
    { icon: Hammer, value: String(realImpact.repairsCount), label: 'reparos' },
    { icon: Shirt, value: String(realImpact.exchangesCount), label: 'trocas' },
  ];

  return (
    <section
      aria-label="Floresta EcoPulse · suas ações registradas"
      className="border-soft bg-tint-1 rounded-[var(--radius-md)] p-3"
    >
      <header className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="t-eyebrow">Floresta EcoPulse</h2>
        <span className="t-micro text-[var(--text-muted)]">Suas ações</span>
      </header>
      <ul className="grid grid-cols-5 gap-2">
        {metrics.map((m) => (
          <li
            key={m.label}
            className="border-soft flex flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] px-1.5 py-2"
          >
            <span className="text-[var(--accent-green)]">
              <Icon icon={m.icon} size={16} />
            </span>
            <span className="t-title leading-none">{m.value}</span>
            <span className="t-micro leading-none text-[var(--text-muted)]">{m.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

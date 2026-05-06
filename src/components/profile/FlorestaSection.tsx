'use client';

import { BatteryCharging, Droplet, Hammer, Shirt, TreePine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';

interface MetricItem {
  icon: LucideIcon;
  value: string;
  label: string;
  hint: string;
}

function fmtKg(v: number): string {
  if (v < 1) return `${(v * 1000).toFixed(0)} g`;
  return `${v.toFixed(v % 1 === 0 ? 0 : 1)} kg`;
}

function fmtL(v: number): string {
  return `${v.toFixed(v % 1 === 0 ? 0 : 1)} L`;
}

export function FlorestaSection() {
  const realImpact = useGameStore((s) => s.realImpact);

  const metrics: MetricItem[] = [
    {
      icon: TreePine,
      value: String(realImpact.treesPlanted),
      label: 'árvores plantadas',
      hint: 'Doações simuladas + ritual de capítulo Floresta.',
    },
    {
      icon: BatteryCharging,
      value: fmtKg(realImpact.batteriesKgEstimated),
      label: 'pilhas entregues',
      hint: '0,5 kg por visita a EcoPonto Pilhas.',
    },
    {
      icon: Droplet,
      value: fmtL(realImpact.oilLitersEstimated),
      label: 'óleo de cozinha',
      hint: '1 L por visita a coleta de óleo.',
    },
    {
      icon: Hammer,
      value: String(realImpact.repairsCount),
      label: 'reparos registrados',
      hint: '1 por visita a um reparador.',
    },
    {
      icon: Shirt,
      value: String(realImpact.exchangesCount),
      label: 'trocas / brechó',
      hint: '1 por visita a brechó ou feira de trocas.',
    },
  ];

  return (
    <Card className="p-4">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="t-title">Floresta EcoPulse</h2>
        <span className="t-micro text-[var(--text-muted)]">Soma simulada · prototype</span>
      </header>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {metrics.map((m) => (
          <li
            key={m.label}
            className="flex items-center gap-3 rounded-[var(--radius-sm)] border-soft bg-tint-1 px-3 py-2.5"
          >
            <IconTile size="sm" tone="brand" icon={<Icon icon={m.icon} size={16} />} />
            <div className="min-w-0 flex-1">
              <p className="t-title leading-tight">{m.value}</p>
              <p className="t-caption truncate">{m.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

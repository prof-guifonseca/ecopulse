'use client';

import { BatteryCharging, Droplet, Hammer, Shirt, TreePine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ConfidenceTag, type Confidence } from '@/components/shared/ConfidenceTag';
import { ShareButton } from '@/components/share/ShareButton';

interface MetricItem {
  icon: LucideIcon;
  value: string;
  label: string;
  hint: string;
  confidence: Confidence;
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
  const hasImpact =
    realImpact.treesPlanted +
      realImpact.batteriesKgEstimated +
      realImpact.oilLitersEstimated +
      realImpact.repairsCount +
      realImpact.exchangesCount >
    0;

  const metrics: MetricItem[] = [
    {
      icon: TreePine,
      value: String(realImpact.treesPlanted),
      label: 'árvores plantadas',
      hint: 'Doações e rituais registrados no app.',
      confidence: 'verified',
    },
    {
      icon: BatteryCharging,
      value: fmtKg(realImpact.batteriesKgEstimated),
      label: 'pilhas entregues',
      hint: 'Visita registrada; massa estimada em 0,5 kg/visita.',
      confidence: 'estimated',
    },
    {
      icon: Droplet,
      value: fmtL(realImpact.oilLitersEstimated),
      label: 'óleo de cozinha',
      hint: 'Visita registrada; volume estimado em 1 L/visita.',
      confidence: 'estimated',
    },
    {
      icon: Hammer,
      value: String(realImpact.repairsCount),
      label: 'reparos registrados',
      hint: '1 por visita registrada a um reparador.',
      confidence: 'verified',
    },
    {
      icon: Shirt,
      value: String(realImpact.exchangesCount),
      label: 'trocas / brechó',
      hint: '1 por visita registrada a brechó ou feira de trocas.',
      confidence: 'verified',
    },
  ];

  return (
    <Card className="p-4">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="t-title">Floresta EcoPulse</h2>
        <span className="t-micro text-[var(--text-muted)]">Suas ações</span>
      </header>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {metrics.map((m) => (
          <li
            key={m.label}
            className="border-soft bg-tint-1 flex items-start gap-3 rounded-[var(--radius-sm)] px-3 py-2.5"
          >
            <IconTile size="sm" tone="brand" icon={<Icon icon={m.icon} size={16} />} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="t-title leading-tight">{m.value}</p>
                <ConfidenceTag kind={m.confidence} />
              </div>
              <p className="t-caption truncate">{m.label}</p>
              <p className="t-micro mt-0.5 text-[var(--text-muted)]">{m.hint}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="t-micro mt-3 text-[var(--text-muted)]">
        Contagens vêm das suas visitas registradas no mapa; massas (kg/L) são estimativas por
        visita, não medições.
      </p>
      {hasImpact && (
        <div className="mt-3 flex justify-end">
          <ShareButton
            data={{
              eyebrow: 'Floresta EcoPulse',
              title: 'Meu impacto real',
              stats: [
                { value: String(realImpact.treesPlanted), label: 'árvores' },
                { value: fmtKg(realImpact.batteriesKgEstimated), label: 'pilhas' },
                { value: fmtL(realImpact.oilLitersEstimated), label: 'óleo' },
              ],
              caption: 'Cada visita registrada vira impacto.',
              accent: 'green',
            }}
            fileName="ecopulse-impacto.png"
            shareText="Meu impacto real no EcoPulse 🌱"
          />
        </div>
      )}
    </Card>
  );
}

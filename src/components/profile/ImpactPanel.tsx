import { Droplets, Leaf, Recycle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { LucideIcon } from 'lucide-react';

export function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <Card tone="solid" padded={false} className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="t-title">Seu impacto</h2>
        <span className="rounded-[var(--radius-sm)] border-soft bg-tint-1 px-2 py-1 t-caption">
          {scannedCount} scans
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[var(--line-soft)] overflow-hidden rounded-[var(--radius-md)] border-soft bg-tint-1">
        <ImpactMetric icon={Leaf} value={`${co2}kg`} label="CO₂" />
        <ImpactMetric icon={Recycle} value={`${waste}kg`} label="Resíduo" />
        <ImpactMetric icon={Droplets} value={`${water}L`} label="Água" reward />
      </div>
    </Card>
  );
}

function ImpactMetric({
  icon,
  value,
  label,
  reward,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  reward?: boolean;
}) {
  return (
    <div className="min-w-0 px-2 py-4 text-center">
      <Icon icon={icon} size={18} className={reward ? 'mx-auto text-[var(--accent-gold)]' : 'mx-auto text-[var(--accent-green)]'} />
      <p className="mt-2 truncate text-lg font-extrabold leading-none text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 truncate t-caption">{label}</p>
    </div>
  );
}

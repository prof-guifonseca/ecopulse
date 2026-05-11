import { Leaf, Recycle, SearchCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { LucideIcon } from 'lucide-react';
import type { ScanRecord } from '@/store/scanHistoryStore';

export function ImpactPanel({ history }: { history: ScanRecord[] }) {
  const scannedCount = history.length;
  const withEvidence = history.filter((item) => (item.evidence?.fields.length ?? 0) >= 3).length;
  const confidence =
    scannedCount > 0
      ? Math.round(history.reduce((sum, item) => sum + (item.confidence ?? 0), 0) / scannedCount)
      : 0;

  return (
    <Card tone="solid" padded={false} className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="t-title">Seu impacto</h2>
        <span className="rounded-[var(--radius-sm)] border-soft bg-tint-1 px-2 py-1 t-caption">
          Open Food Facts
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[var(--line-soft)] overflow-hidden rounded-[var(--radius-md)] border-soft bg-tint-1">
        <ImpactMetric icon={SearchCheck} value={String(scannedCount)} label="avaliados" />
        <ImpactMetric icon={Recycle} value={String(withEvidence)} label="com evidência" />
        <ImpactMetric icon={Leaf} value={`${confidence}%`} label="confiança" reward />
      </div>
      <p className="mt-3 t-caption text-[var(--text-muted)]">
        Métricas baseadas em barcodes reais, snapshot/cache Open Food Facts e campos de evidência disponíveis.
      </p>
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

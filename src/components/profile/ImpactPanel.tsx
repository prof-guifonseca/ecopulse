import { Leaf, Recycle, SearchCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ConfidenceTag } from '@/components/shared/ConfidenceTag';
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
        <span className="border-soft bg-tint-1 t-caption rounded-[var(--radius-sm)] px-2 py-1">
          Open Food Facts
        </span>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <ConfidenceTag kind="estimated" />
        <span className="t-micro text-[var(--muted-foreground)]">
          impacto estimado por evidências dos produtos
        </span>
      </div>
      <div className="border-soft bg-tint-1 grid grid-cols-3 divide-x divide-[var(--border)] overflow-hidden rounded-[var(--radius-md)]">
        <ImpactMetric icon={SearchCheck} value={String(scannedCount)} label="avaliados" />
        <ImpactMetric icon={Recycle} value={String(withEvidence)} label="com evidência" />
        <ImpactMetric icon={Leaf} value={`${confidence}%`} label="confiança" reward />
      </div>
      <p className="t-caption mt-3 text-[var(--muted-foreground)]">
        <span className="text-[var(--text-secondary)]">Avaliados</span> e{' '}
        <span className="text-[var(--text-secondary)]">com evidência</span> são contagens reais dos
        seus scans (barcodes Open Food Facts/cache); a{' '}
        <span className="text-[var(--text-secondary)]">confiança</span> é uma estimativa agregada
        dos campos de evidência disponíveis.
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
      <Icon
        icon={icon}
        size={18}
        className={reward ? 'mx-auto text-[var(--accent-gold)]' : 'mx-auto text-[var(--primary)]'}
      />
      <p className="mt-2 truncate text-lg leading-none font-extrabold text-[var(--foreground)]">
        {value}
      </p>
      <p className="t-caption mt-1 truncate">{label}</p>
    </div>
  );
}

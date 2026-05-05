'use client';

import { ChevronRight } from 'lucide-react';
import { IMPACT_FUND_SNAPSHOT } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { ImpactRing } from '@/components/shared/ImpactRing';
import { Icon } from '@/components/ui/Icon';
import { formatCurrencyCents } from '@/lib/format';

export function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <ImpactRing pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO₂" value={`${co2}kg`} />
        <ImpactRing pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
        <ImpactRing pct={Math.min(100, scannedCount * 12)} color="var(--accent-green)" label="Resíduo" value={`${waste}kg`} />
      </div>

      <button
        onClick={() => openModal({ kind: 'greenMarketInfo' })}
        className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-4 text-left transition-colors hover:bg-[var(--tint-2)]"
      >
        <div className="min-w-0">
          <p className="t-eyebrow">Fundo EcoPulse</p>
          <p className="mt-1 t-body-sm">
            {formatCurrencyCents(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)} arrecadados ·{' '}
            {IMPACT_FUND_SNAPSHOT.supportedOrgs} OSCs apoiadas
          </p>
        </div>
        <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
      </button>
    </div>
  );
}

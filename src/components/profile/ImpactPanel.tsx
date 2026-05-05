import { ImpactRing } from '@/components/shared/ImpactRing';

export function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <ImpactRing pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO₂" value={`${co2}kg`} />
        <ImpactRing pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
        <ImpactRing pct={Math.min(100, scannedCount * 12)} color="var(--accent-green)" label="Resíduo" value={`${waste}kg`} />
      </div>
      <p className="t-caption">
        Estimativa derivada do número de scans. Será substituída por cálculo
        por categoria quando a base real de produtos entrar.
      </p>
    </div>
  );
}

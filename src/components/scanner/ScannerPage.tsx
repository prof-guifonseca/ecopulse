'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Search, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useScanHistoryStore, type ScanRecord } from '@/store/scanHistoryStore';
import { performSimulatedScan } from '@/lib/simulatedScan';
import { hapticTap } from '@/lib/haptic';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ListCard } from '@/components/ui/ListCard';
import { PageShell } from '@/components/ui/PageShell';
import { cn } from '@/lib/cn';

/**
 * Scan ritual timing — feels deliberate, not rushed. The result resolves
 * before the scanLine keyframe loop ends (the line keeps looping behind
 * the product modal until it closes).
 */
const SCAN_RITUAL_MS = 1600;

export function ScannerPage() {
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';

  const openModal = useUIStore((s) => s.openModal);
  const modal = useUIStore((s) => s.modal);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);
  const markMission = useGameStore((s) => s.markMission);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);
  const firstScanCompleted = useUserStore((s) => s.firstScanCompleted);
  const markFirstScanCompleted = useUserStore((s) => s.markFirstScanCompleted);
  const recordScan = useScanHistoryStore((s) => s.recordScan);
  const history = useScanHistoryStore((s) => s.history);

  const firstRun = welcome && !firstScanCompleted;
  const awaitingFirstClose = useRef(false);

  // After the first-run product modal closes, send the user home.
  useEffect(() => {
    if (awaitingFirstClose.current && modal === null) {
      awaitingFirstClose.current = false;
      showToast('Home liberada', 'reward');
      router.push('/home');
    }
  }, [modal, router, showToast]);

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) return PRODUCTS;
    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.barcode.includes(normalizedQuery)
    );
  }, [deferredQuery]);

  const triggerScan = () => {
    if (scanning) return;
    hapticTap();
    setScanning(true);
    setLastBarcode(null);

    setTimeout(() => {
      const record = performSimulatedScan(history.map((h) => h.productId));
      setLastBarcode(record.barcode);
      recordScan(record);
      awardTokens(10);
      if (!missionScan) markMission('scan', true);
      const totalScans = useScanHistoryStore.getState().history.length;
      if (totalScans === 1) unlockBadge('first-scan');
      if (totalScans >= 5) unlockBadge('scanner-5');
      if (firstRun) {
        markFirstScanCompleted();
        awaitingFirstClose.current = true;
      }
      fireConfetti();
      openModal({ kind: 'product', id: record.id });
      setScanning(false);
    }, SCAN_RITUAL_MS);
  };

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <h1 className="t-headline">Scanner</h1>
      </header>

      {/* Scan instrument — the ritual lives here */}
      <div className="scan-frame relative overflow-hidden px-6 py-7" data-scanning={scanning}>
        <div className="relative flex h-[260px] items-center justify-center">
          {/* Pulsing radial halo behind the target */}
          <span aria-hidden className="scan-target-halo" />

          {/* Dual rotating rings frame the reticle */}
          <span aria-hidden className="scan-ring-outer" />
          <span aria-hidden className="scan-ring-inner" />

          {/* Reticle: a thin square that pulses while scanning */}
          <div
            className="relative h-32 w-32 rounded-[var(--radius-lg)] border-active bg-tint-green-3"
            style={{
              boxShadow: scanning ? '0 0 0 3px var(--tint-green-2)' : 'var(--shadow-glow)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-[var(--accent-green)]">
              <Icon icon={Camera} size={44} strokeWidth={1.4} />
            </div>
            {/* Corner brackets — Apple Wallet scanner style */}
            <span className="absolute left-[-2px] top-[-2px] h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-[var(--accent-green)]" />
            <span className="absolute right-[-2px] top-[-2px] h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-[var(--accent-green)]" />
            <span className="absolute bottom-[-2px] left-[-2px] h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-[var(--accent-green)]" />
            <span className="absolute bottom-[-2px] right-[-2px] h-4 w-4 rounded-br-md border-b-2 border-r-2 border-[var(--accent-green)]" />
          </div>

          {/* Scan line — runs only while the ritual is in flight (1.4s here is
              an intentional override of the 2.4s --animate-scan-line keyframe). */}
          <div
            className={cn(
              'pointer-events-none absolute inset-x-12 top-1/2 h-[2px] origin-left transition-opacity duration-200',
              scanning ? 'opacity-95' : 'opacity-0'
            )}
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--accent-green) 35%, var(--accent-green) 65%, transparent)',
              animation: scanning ? 'scanLine 1.4s linear infinite' : 'none',
              filter: 'blur(0.5px)',
            }}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={triggerScan}
          disabled={scanning}
          loading={scanning}
          leftIcon={!scanning ? <Icon icon={Camera} size={16} /> : undefined}
        >
          {scanning ? 'Lendo…' : 'Simular scan'}
        </Button>

        <p className="mt-3 text-center t-caption">
          {history.length} scan{history.length === 1 ? '' : 's'} · {missionScan ? 'missão ok' : 'pendente'}
        </p>

        {lastBarcode ? (
          <p className="mt-1 text-center t-caption text-[var(--accent-green)]">
            Lido: {lastBarcode}
          </p>
        ) : null}
      </div>

      {firstRun ? (
        <p className="rounded-[var(--radius-md)] border-active bg-tint-green-1 px-4 py-3 t-body-sm text-[var(--accent-green)]">
          <Icon icon={Sparkles} size={14} className="mr-1.5 inline align-[-2px]" />
          Faça um scan para liberar a Home.
        </p>
      ) : null}

      {/* Recent scans (persisted, simulated) */}
      {history.length > 0 ? (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="t-title">Scans recentes</h2>
            <span className="t-caption">
              {history.length} item{history.length === 1 ? '' : 's'}
            </span>
          </div>
          <ListCard tone="flat">
            {history.slice(0, 5).map((scan) => (
              <li key={`${scan.id}-${scan.scannedAt}`}>
                <button
                  onClick={() => openModal({ kind: 'product', id: scan.id })}
                  className="flex w-full items-center gap-4 py-4 text-left transition-opacity hover:opacity-80"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-tint-2 text-2xl">
                    {scan.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{scan.name}</h3>
                    <p className="mt-0.5 truncate t-caption">
                      {scan.brand} · {scan.category}
                    </p>
                  </div>
                  <ScoreBadge score={scan.score} className="h-9 w-9 shrink-0" />
                </button>
              </li>
            ))}
          </ListCard>
        </section>
      ) : null}

      {/* Catalog browse */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="t-title">Catálogo</h2>
          <span className="t-caption">{PRODUCTS.length} produtos</span>
        </div>
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <Icon icon={Search} size={18} className="text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto"
            aria-label="Buscar produtos"
            className="t-body w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-center t-body-sm">
            Nada encontrado para &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <ListCard tone="flat" className="stagger mt-4">
            {filtered.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => openModal({ kind: 'product', id: product.id })}
                  className="flex w-full items-center gap-4 py-4 text-left transition-opacity hover:opacity-80"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-tint-2 text-2xl">
                    {product.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{product.name}</h3>
                    <p data-score={product.score} className="text-score mt-0.5 truncate t-caption">
                      {product.brand} · {product.tip}
                    </p>
                  </div>
                  <ScoreBadge score={product.score} size="sm" className="shrink-0" />
                </button>
              </li>
            ))}
          </ListCard>
        )}
      </section>
    </PageShell>
  );
}

// Re-export so the unused-import warning doesn't trigger if a future hook
// rearranges the consumer; the symbol is referenced via ScanRecord above.
export type { ScanRecord };


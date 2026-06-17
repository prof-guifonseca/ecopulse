'use client';

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Keyboard, Search, Sparkles, Video } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useScanHistoryStore, type ScanRecord } from '@/store/scanHistoryStore';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useAsync } from '@/hooks/useAsync';
import { fetchWithRetry } from '@/lib/net/fetchRetry';
import { hapticTap } from '@/lib/haptic';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import type { ProductLookupResult } from '@/domain';
import { syncScan } from '@/lib/client/mvpSync';
import { listProductCatalog, pickRealSampleProduct } from '@/lib/products/catalog';
import { scanRecordFromLookup } from '@/lib/products/scanRecord';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/AsyncState';
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
const DEMO_DATA_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === 'true';

export function ScannerPage() {
  const [query, setQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [demoScanning, setDemoScanning] = useState(false);
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
  const products = useMemo(() => listProductCatalog(), []);
  const sampleProduct = useMemo(() => pickRealSampleProduct(), []);

  // The barcode lookup runs through useAsync (P4): cancellable + retried on a
  // transient network blip, with one place for the error toast.
  const lookup = useAsync(
    async (signal: AbortSignal, barcode: string) => {
      const response = await fetchWithRetry(
        fetch,
        `/api/products/lookup?barcode=${encodeURIComponent(barcode)}`,
        { signal },
      );
      if (!response.ok) throw new Error('lookup-failed');
      return (await response.json()) as ProductLookupResult;
    },
    { onError: () => showToast('Consulta indisponível', 'info') },
  );
  const runLookup = lookup.run;
  const scanning = lookup.isLoading || demoScanning;
  const lookupError = lookup.error ? 'Não foi possível consultar o barcode agora.' : null;

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
    if (!normalizedQuery) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.barcode.includes(normalizedQuery),
    );
  }, [deferredQuery, products]);

  const completeScan = useCallback(
    (record: ScanRecord, source: 'barcode' | 'manual' | 'demo') => {
      setLastBarcode(record.barcode);
      recordScan(record);
      useGameStore.getState().addScannedProduct(record.productId);
      awardTokens(source === 'demo' ? 10 : 12);
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
    },
    [
      fireConfetti,
      firstRun,
      markFirstScanCompleted,
      markMission,
      missionScan,
      openModal,
      recordScan,
    ],
  );

  const lookupBarcode = useCallback(
    async (rawBarcode: string, source: 'barcode' | 'manual') => {
      const barcode = rawBarcode.replace(/\D/g, '');
      if (barcode.length < 6 || scanning) return;
      hapticTap();
      setLastBarcode(null);

      const result = await runLookup(barcode);
      if (!result) return; // aborted, or failed (onError already toasted)

      const record = scanRecordFromLookup(result, source);
      completeScan(record, source);
      syncScan(result, source);
      showToast(
        result.found ? 'Produto identificado' : 'Registro manual criado',
        result.found ? 'success' : 'info',
      );
    },
    [completeScan, runLookup, scanning, showToast],
  );

  const {
    videoRef: cameraRef,
    active: cameraActive,
    error: cameraError,
    start: startCamera,
    stop: stopCamera,
  } = useBarcodeScanner({
    onDetect: (raw) => void lookupBarcode(raw, 'barcode'),
  });

  const submitBarcode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void lookupBarcode(barcodeInput, 'manual');
  };

  const triggerSampleLookup = () => {
    if (!sampleProduct || scanning) return;
    void lookupBarcode(sampleProduct.barcode, 'barcode');
  };

  const triggerScan = () => {
    if (scanning || !DEMO_DATA_ENABLED) return;
    hapticTap();
    lookup.reset(); // clear any stale barcode-lookup error before the demo ritual
    setDemoScanning(true);
    setLastBarcode(null);

    window.setTimeout(() => {
      void import('@/demo/simulatedScan')
        .then(({ performDemoScan }) => {
          const record = performDemoScan(
            history.map((h) => h.productId),
            { firstRun },
          );
          completeScan(record, 'demo');
        })
        .catch(() => {
          showToast('Demo indisponível', 'info');
        })
        .finally(() => {
          setDemoScanning(false);
        });
    }, SCAN_RITUAL_MS);
  };

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <h1 className="t-headline">Scanner</h1>
        <p className="t-caption mt-1">
          Consulta real por barcode, amostra Open Food Facts ou registro manual.
        </p>
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
            className="border-active bg-tint-green-3 relative h-32 w-32 rounded-[var(--radius-lg)]"
            style={{
              boxShadow: scanning ? '0 0 0 3px var(--tint-green-2)' : 'var(--shadow-glow)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-[var(--primary)]">
              <Icon icon={Camera} size={44} strokeWidth={1.4} />
            </div>
            {/* Corner brackets — Apple Wallet scanner style */}
            <span className="absolute top-[-2px] left-[-2px] h-4 w-4 rounded-tl-md border-t-2 border-l-2 border-[var(--primary)]" />
            <span className="absolute top-[-2px] right-[-2px] h-4 w-4 rounded-tr-md border-t-2 border-r-2 border-[var(--primary)]" />
            <span className="absolute bottom-[-2px] left-[-2px] h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-[var(--primary)]" />
            <span className="absolute right-[-2px] bottom-[-2px] h-4 w-4 rounded-br-md border-r-2 border-b-2 border-[var(--primary)]" />
          </div>

          {/* Scan line — runs only while the ritual is in flight (1.4s here is
              an intentional override of the 2.4s --animate-scan-line keyframe). */}
          <div
            className={cn(
              'pointer-events-none absolute inset-x-12 top-1/2 h-[2px] origin-left transition-opacity duration-200',
              scanning ? 'opacity-95' : 'opacity-0',
            )}
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--primary) 35%, var(--primary) 65%, transparent)',
              animation: scanning ? 'scanLine 1.4s linear infinite' : 'none',
              filter: 'blur(0.5px)',
            }}
          />

          {cameraActive ? (
            <video
              ref={cameraRef}
              muted
              playsInline
              className="absolute inset-0 h-full w-full rounded-[var(--radius-md)] object-cover opacity-80"
              aria-label="Prévia da câmera para leitura de barcode"
            />
          ) : null}
        </div>

        <form className="mt-5 flex gap-2" onSubmit={submitBarcode}>
          <label className="sr-only" htmlFor="barcode-input">
            Barcode do produto
          </label>
          <input
            id="barcode-input"
            value={barcodeInput}
            onChange={(event) => setBarcodeInput(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Digite o barcode"
            className="border-soft bg-tint-1 min-w-0 flex-1 rounded-[var(--radius-sm)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--line-active)]"
          />
          <Button
            variant="primary"
            type="submit"
            size="md"
            loading={scanning}
            disabled={barcodeInput.replace(/\D/g, '').length < 6 || scanning}
            leftIcon={<Icon icon={Keyboard} size={15} />}
          >
            Buscar
          </Button>
        </form>

        <div className={cn('mt-3 grid gap-2', DEMO_DATA_ENABLED ? 'grid-cols-3' : 'grid-cols-2')}>
          <Button
            variant={cameraActive ? 'ghost' : 'secondary'}
            size="md"
            onClick={cameraActive ? stopCamera : startCamera}
            disabled={scanning}
            leftIcon={<Icon icon={Video} size={15} />}
          >
            {cameraActive ? 'Fechar câmera' : 'Usar câmera'}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={triggerSampleLookup}
            disabled={scanning}
            loading={scanning && !barcodeInput}
            leftIcon={!scanning ? <Icon icon={Sparkles} size={15} /> : undefined}
          >
            {scanning ? 'Lendo…' : 'Amostra real'}
          </Button>
          {DEMO_DATA_ENABLED ? (
            <Button
              variant="ghost"
              size="md"
              onClick={triggerScan}
              disabled={scanning}
              loading={scanning && !barcodeInput}
              leftIcon={!scanning ? <Icon icon={Camera} size={15} /> : undefined}
            >
              Demo scan
            </Button>
          ) : null}
        </div>

        <p className="t-caption mt-3 text-center">
          {history.length} scan{history.length === 1 ? '' : 's'} ·{' '}
          {missionScan ? 'missão ok' : 'pendente'}
        </p>

        {lastBarcode ? (
          <p className="t-caption mt-1 text-center text-[var(--primary)]">Lido: {lastBarcode}</p>
        ) : null}

        {lookupError || cameraError ? (
          <p className="t-caption mt-2 text-center text-[var(--destructive)]">
            {lookupError ?? cameraError}
          </p>
        ) : null}
      </div>

      {firstRun ? (
        <p className="border-active bg-tint-green-1 t-body-sm rounded-[var(--radius-md)] px-4 py-3 text-[var(--primary)]">
          <Icon icon={Sparkles} size={14} className="mr-1.5 inline align-[-2px]" />
          Primeiro passo: escaneie uma amostra real para liberar missões e impacto.
        </p>
      ) : null}

      {/* Recent scans (persisted locally) */}
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
                  <span className="bg-tint-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-2xl">
                    {scan.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{scan.name}</h3>
                    <p className="t-caption mt-0.5 truncate">
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
          <span className="t-caption">{products.length} produtos</span>
        </div>
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <Icon icon={Search} size={18} className="text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto"
            aria-label="Buscar produtos"
            className="t-body w-full bg-transparent outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="Nada encontrado"
            description={`Nenhum produto para “${query.trim()}”.`}
          />
        ) : (
          <ListCard tone="flat" className="stagger mt-4">
            {filtered.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => openModal({ kind: 'product', id: product.id })}
                  className="flex w-full items-center gap-4 py-4 text-left transition-opacity hover:opacity-80"
                >
                  <span className="bg-tint-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-2xl">
                    {product.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{product.name}</h3>
                    <p data-score={product.score} className="text-score t-caption mt-0.5 truncate">
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

'use client';

import { forwardRef, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Search, Sparkles, X } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { SCORE_COLORS } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useScanHistoryStore, type ScanRecord } from '@/store/scanHistoryStore';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { fetchOffProduct } from '@/lib/openfoodfacts';
import { scoreFromOff } from '@/lib/scoring';
import { hapticTap } from '@/lib/haptic';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';

type LookupState =
  | { kind: 'idle' }
  | { kind: 'looking-up'; barcode: string }
  | { kind: 'not-found'; barcode: string }
  | { kind: 'error'; message: string };

export function ScannerPage() {
  const [query, setQuery] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({ kind: 'idle' });
  const deferredQuery = useDeferredValue(query);
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';
  const videoRef = useRef<HTMLVideoElement>(null);

  const openModal = useUIStore((s) => s.openModal);
  const modal = useUIStore((s) => s.modal);
  const showToast = useUIStore((s) => s.showToast);
  const markMission = useGameStore((s) => s.markMission);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);
  const firstScanCompleted = useUserStore((s) => s.firstScanCompleted);
  const markFirstScanCompleted = useUserStore((s) => s.markFirstScanCompleted);
  const recordScan = useScanHistoryStore((s) => s.recordScan);
  const history = useScanHistoryStore((s) => s.history);

  const firstRun = welcome && !firstScanCompleted;
  const awaitingFirstClose = useRef(false);

  // After the first scan's product modal closes, send the user home.
  useEffect(() => {
    if (awaitingFirstClose.current && modal === null) {
      awaitingFirstClose.current = false;
      showToast('Home liberada', 'reward');
      router.push('/home');
    }
  }, [modal, router, showToast]);

  const handleBarcode = async (barcode: string) => {
    setCameraOpen(false);
    setLookup({ kind: 'looking-up', barcode });
    try {
      const off = await fetchOffProduct(barcode);
      if (!off) {
        setLookup({ kind: 'not-found', barcode });
        showToast('Produto não encontrado no OFF', 'info');
        return;
      }
      const result = scoreFromOff(off);
      const record: ScanRecord = {
        id: `scan:${barcode}`,
        source: 'camera',
        barcode,
        name: off.name,
        brand: off.brand,
        category: off.category,
        imageUrl: off.imageUrl,
        score: result.score,
        breakdown: result.breakdown,
        tip: result.tip,
        rationale: result.rationale,
        scannedAt: new Date().toISOString(),
      };
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
      openModal({ kind: 'product', id: record.id });
      setLookup({ kind: 'idle' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro de rede';
      setLookup({ kind: 'error', message });
    }
  };

  const { status: cameraStatus, error: cameraError, start, stop } = useBarcodeScanner({
    onResult: handleBarcode,
  });

  // Attach the reader to the <video> element when the user opens the camera.
  useEffect(() => {
    if (!cameraOpen) {
      stop();
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    void start(el);
    return () => stop();
  }, [cameraOpen, start, stop]);

  const filteredCatalog = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) return PRODUCTS;
    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
    );
  }, [deferredQuery]);

  const openCamera = () => {
    hapticTap();
    setLookup({ kind: 'idle' });
    setCameraOpen(true);
  };

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <p className="t-eyebrow">Scanner</p>
        <h1 className="t-display mt-1.5 leading-[0.95]">
          O que você <span className="t-italic-soft">vai comprar</span>?
        </h1>
      </header>

      {/* Camera section */}
      <div className="scan-frame px-6 py-6">
        {cameraOpen ? (
          <CameraView
            ref={videoRef}
            status={cameraStatus}
            errorMessage={cameraError}
            onClose={() => setCameraOpen(false)}
          />
        ) : (
          <ScanCallToAction lookup={lookup} onOpenCamera={openCamera} />
        )}

        <p className="mt-4 text-center t-caption">
          {history.length} scan{history.length === 1 ? '' : 's'} no histórico ·{' '}
          {missionScan ? 'missão concluída' : 'missão pendente'}
        </p>
      </div>

      {firstRun ? (
        <p className="rounded-[var(--radius-md)] border border-[var(--line-active)] bg-[var(--tint-green-1)] px-4 py-3 t-body-sm text-[var(--accent-green)]">
          <Icon icon={Sparkles} size={14} className="mr-1.5 inline align-[-2px]" />
          Faça um scan e a home libera.
        </p>
      ) : null}

      {/* Recent scans (real, persisted) */}
      {history.length > 0 ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="t-title">Meus scans</h2>
            <span className="t-caption">{history.length} item{history.length === 1 ? '' : 's'}</span>
          </div>
          <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
            {history.slice(0, 5).map((scan) => (
              <li key={scan.id}>
                <button
                  onClick={() => openModal({ kind: 'product', id: scan.id })}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--tint-2)] text-xl">
                    {scan.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={scan.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{scan.name}</h3>
                    <p className="mt-0.5 truncate t-caption">
                      {scan.brand ?? 'Sem marca'} · {scan.category ?? 'Sem categoria'}
                    </p>
                  </div>
                  <ScoreBadge score={scan.score} className="h-9 w-9 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Demo catalog (clearly labeled) */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="t-title">Catálogo demo</h2>
          <span className="t-caption">para explorar a UX sem câmera</span>
        </div>
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <Icon icon={Search} size={18} className="text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nome, marca ou categoria"
            aria-label="Buscar produtos demo"
            className="t-body w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        {filteredCatalog.length === 0 ? (
          <p className="mt-4 t-body-sm text-center">
            Nada encontrado para &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
            {filteredCatalog.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => openModal({ kind: 'product', id: product.id })}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--tint-2)] text-2xl">
                    {product.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{product.name}</h3>
                    <p
                      className="mt-0.5 truncate t-caption"
                      style={{ color: SCORE_COLORS[product.score] }}
                    >
                      {product.tip}
                    </p>
                  </div>
                  <ScoreBadge score={product.score} className="h-9 w-9 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}

/* ---------- subviews ---------- */

function ScanCallToAction({
  lookup,
  onOpenCamera,
}: {
  lookup: LookupState;
  onOpenCamera: () => void;
}) {
  return (
    <>
      <div className="relative flex h-[200px] items-center justify-center">
        <div
          className="pointer-events-none absolute inset-x-10 top-1/2 h-px"
          style={{ background: 'var(--gradient-primary)', opacity: 0.25 }}
        />
        <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--line-active)] bg-[var(--tint-green-3)] text-[var(--accent-green)] shadow-[var(--shadow-glow)]">
          <Icon icon={Camera} size={40} strokeWidth={1.5} />
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5"
        onClick={onOpenCamera}
        loading={lookup.kind === 'looking-up'}
        disabled={lookup.kind === 'looking-up'}
        leftIcon={lookup.kind === 'looking-up' ? undefined : <Icon icon={Camera} size={16} />}
      >
        {lookup.kind === 'looking-up' ? 'Buscando produto…' : 'Escanear código de barras'}
      </Button>

      <LookupBanner state={lookup} />
    </>
  );
}

interface CameraViewProps {
  status: ReturnType<typeof useBarcodeScanner>['status'];
  errorMessage: string | null;
  onClose: () => void;
}

const CameraView = forwardRef<HTMLVideoElement, CameraViewProps>(function CameraView(
  { status, errorMessage, onClose },
  ref
) {
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-active)] bg-black">
        <video
          ref={ref}
          playsInline
          muted
          className="h-[260px] w-full object-cover"
          aria-label="Visualização da câmera"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-56 rounded-[var(--radius-md)] border-2 border-[var(--accent-green)] shadow-[0_0_0_2000px_rgba(0,0,0,0.35)]" />
        </div>
        {status === 'starting' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span
              className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-[var(--accent-green)]"
              aria-hidden
            />
          </div>
        ) : null}
      </div>

      <CameraStatusLine status={status} errorMessage={errorMessage} />

      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={onClose}
        leftIcon={<Icon icon={X} size={14} />}
      >
        Fechar câmera
      </Button>
    </div>
  );
});

function CameraStatusLine({
  status,
  errorMessage,
}: {
  status: ReturnType<typeof useBarcodeScanner>['status'];
  errorMessage: string | null;
}) {
  if (status === 'denied') {
    return (
      <p className="t-body-sm text-[var(--accent-red)]">
        Permissão negada. Ajuste em configurações do navegador para escanear.
      </p>
    );
  }
  if (status === 'unsupported') {
    return (
      <p className="t-body-sm text-[var(--text-secondary)]">
        Câmera indisponível neste dispositivo. Use a busca abaixo enquanto isso.
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p className="t-body-sm text-[var(--accent-red)]">
        {errorMessage ?? 'Erro ao iniciar câmera.'}
      </p>
    );
  }
  if (status === 'scanning') {
    return (
      <p className="t-body-sm text-[var(--text-secondary)]">
        Aponte para o código de barras. A leitura é automática.
      </p>
    );
  }
  return null;
}

function LookupBanner({ state }: { state: LookupState }) {
  if (state.kind === 'idle') return null;
  if (state.kind === 'looking-up') {
    return (
      <p className="mt-3 text-center t-caption text-[var(--text-secondary)]">
        Consultando Open Food Facts: {state.barcode}
      </p>
    );
  }
  if (state.kind === 'not-found') {
    return (
      <p className="mt-3 text-center t-caption text-[var(--accent-gold)]">
        Código {state.barcode} não está no Open Food Facts.
      </p>
    );
  }
  return (
    <p className="mt-3 text-center t-caption text-[var(--accent-red)]">
      Erro ao consultar OFF: {state.message}
    </p>
  );
}

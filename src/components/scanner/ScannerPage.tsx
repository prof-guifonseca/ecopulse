'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Search, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { SCORE_COLORS } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { performScan } from '@/lib/scanActions';
import { hapticTap } from '@/lib/haptic';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { cn } from '@/lib/cn';

// Scan completes (and modal opens) before the visual scan-line loop ends —
// the user perceives the result as soon as the camera "lock" feels right.
// The CSS keyframe (--animate-scan-line: 2.4s) keeps looping behind the modal.
const SCAN_ANIMATION_MS = 1600;

export function ScannerPage() {
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';
  const openModal = useUIStore((s) => s.openModal);
  const modal = useUIStore((s) => s.modal);
  const showToast = useUIStore((s) => s.showToast);
  const scannedProducts = useGameStore((s) => s.scannedProducts);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);
  const firstScanCompleted = useUserStore((s) => s.firstScanCompleted);
  const markFirstScanCompleted = useUserStore((s) => s.markFirstScanCompleted);
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

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) return PRODUCTS;
    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
    );
  }, [deferredQuery]);

  const simulateScan = () => {
    if (scanning) return;
    hapticTap();
    setScanning(true);

    setTimeout(() => {
      const chosen = performScan();
      if (firstRun) {
        markFirstScanCompleted();
        awaitingFirstClose.current = true;
      }
      openModal({ kind: 'product', id: chosen.id });
      setScanning(false);
    }, SCAN_ANIMATION_MS);
  };

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <p className="t-eyebrow">Scanner</p>
        <h1 className="t-display mt-1.5 leading-[0.95]">
          O que você <span className="t-italic-soft">vai comprar</span>?
        </h1>
      </header>

      {/* Editorial scan instrument */}
      <div className="scan-frame px-6 py-7">
        <div className="relative flex h-[220px] items-center justify-center">
          {/* Soft scan-line */}
          <div
            className={cn(
              'gradient-primary pointer-events-none absolute inset-x-10 top-1/2 h-px',
              scanning ? 'animate-scan-line opacity-90' : 'opacity-25'
            )}
          />
          {/* Camera target */}
          <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-lg)] border-active bg-tint-green-3 text-[var(--accent-green)] shadow-[var(--shadow-glow)]">
            <Icon icon={Camera} size={40} strokeWidth={1.5} />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={simulateScan}
          disabled={scanning}
          loading={scanning}
          leftIcon={!scanning ? <Icon icon={Camera} size={16} /> : undefined}
        >
          {scanning ? 'Escaneando…' : 'Simular scan'}
        </Button>

        <p className="mt-3 text-center t-caption">
          {scannedProducts.length} item{scannedProducts.length === 1 ? '' : 's'} no histórico ·{' '}
          {missionScan ? 'missão concluída' : 'missão pendente'}
        </p>
      </div>

      {firstRun ? (
        <p className="rounded-[var(--radius-md)] border-active bg-tint-green-1 px-4 py-3 t-body-sm text-[var(--accent-green)]">
          <Icon icon={Sparkles} size={14} className="mr-1.5 inline align-[-2px]" />
          Toque em Simular scan e a home libera.
        </p>
      ) : null}

      <section>
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <Icon icon={Search} size={18} className="text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nome, marca ou categoria"
            aria-label="Buscar produtos"
            className="t-body w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 t-body-sm text-center">
            Nada encontrado para &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border-soft bg-tint-1">
            {filtered.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => openModal({ kind: 'product', id: product.id })}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-tint-2 text-2xl">
                    {product.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="t-title truncate">{product.name}</h3>
                    <p className="mt-0.5 truncate t-caption" style={{ color: SCORE_COLORS[product.score] }}>
                      {product.tip}
                    </p>
                  </div>
                  <ScoreBadge score={product.score} size="sm" className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}

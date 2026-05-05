'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Search, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { SCORE_COLORS } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { hapticTap } from '@/lib/haptic';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tile } from '@/components/ui/Tile';
import { IconTile } from '@/components/ui/IconTile';
import { PageShell } from '@/components/ui/PageShell';

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
  const fireConfetti = useUIStore((s) => s.fireConfetti);
  const scannedProducts = useGameStore((s) => s.scannedProducts);
  const addScannedProduct = useGameStore((s) => s.addScannedProduct);
  const markMission = useGameStore((s) => s.markMission);
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
      const pool = PRODUCTS.filter((product) => !scannedProducts.includes(product.id));
      const chosen = (pool.length ? pool : PRODUCTS)[Math.floor(Math.random() * (pool.length || PRODUCTS.length))];

      addScannedProduct(chosen.id);
      awardTokens(10);

      if (!missionScan) {
        markMission('scan', true);
        showToast('Missão diária: escanear produto concluída', 'success');
      }

      if (scannedProducts.length + 1 === 1) unlockBadge('first-scan');
      if (scannedProducts.length + 1 >= 5) unlockBadge('scanner-5');

      showToast(`+10 tokens por ${chosen.name}`, 'reward');
      fireConfetti();

      if (firstRun) {
        markFirstScanCompleted();
        awaitingFirstClose.current = true;
      }

      openModal({ kind: 'product', id: chosen.id });
      setScanning(false);
    }, 1600);
  };

  return (
    <PageShell>
      {firstRun ? (
        <Card tone="soft" padded={false} className="flex items-start gap-3 px-4 py-4">
          <IconTile size="md" tone="brand" icon={<Icon icon={Sparkles} size={18} strokeWidth={2.2} />} />
          <div className="min-w-0">
            <div className="t-title">Primeiro scan libera a home</div>
            <p className="t-body-sm mt-1">Toque em Simular scan — você vê como funciona em 2 segundos.</p>
          </div>
        </Card>
      ) : null}

      <Card tone="hero" padded={false} className="px-5 py-5">

        <div className="scan-frame px-5 py-6">
          <div className="relative flex min-h-[240px] items-center justify-center py-4">
            <div
              className="pointer-events-none absolute inset-x-10 top-1/2 h-px"
              style={{
                background: 'var(--gradient-primary)',
                animation: scanning ? 'scanLine 1.4s linear infinite' : 'none',
                opacity: scanning ? 0.9 : 0.25,
              }}
            />
            <IconTile
              size="xl"
              tone="brand"
              icon={<Icon icon={Camera} size={36} strokeWidth={1.6} />}
              className="h-24 w-24 rounded-[var(--radius-lg)]"
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Tile size="sm" align="start" label="Histórico" value={`${scannedProducts.length} itens`} />
            <Tile size="sm" align="start" label="Missão" value={missionScan ? 'Concluída' : 'Pendente'} />
          </div>

          <p className="t-body-sm mt-4">
            {scanning
              ? 'Analisando o item agora…'
              : scannedProducts.length === 0
                ? 'Seu primeiro scan abre sua ficha e libera tokens.'
                : 'Simule um scan para abrir a ficha completa e ganhar recompensa.'}
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-4"
            onClick={simulateScan}
            disabled={scanning}
            loading={scanning}
            leftIcon={!scanning ? <Icon icon={Camera} size={16} /> : undefined}
          >
            {scanning ? 'Escaneando...' : 'Simular scan'}
          </Button>
        </div>
      </Card>

      <section>
        <SectionHeader title="Buscar" />
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <Icon icon={Search} size={18} className="text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, marca ou categoria"
            aria-label="Buscar produtos"
            className="t-body w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Produtos"
          right={<span className="t-caption">{filtered.length} {filtered.length === 1 ? 'item' : 'itens'}</span>}
        />

        {filtered.length === 0 ? (
          <Card tone="soft" padded={false} className="px-4 py-4">
            <div className="t-title">Nada encontrado</div>
            <p className="t-body-sm mt-1">
              Nada encontrado para &ldquo;{query.trim()}&rdquo;. Tente outra palavra.
            </p>
          </Card>
        ) : null}

        <div className="space-y-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => openModal({ kind: 'product', id: product.id })}
              className="group block w-full text-left transition-colors duration-200 [&_.card]:hover:border-[var(--line-strong)]"
            >
              <Card tone="solid" padded={false} className="px-4 py-4">
                <div className="flex items-start gap-4">
                  <IconTile size="lg" icon={<span>{product.emoji}</span>} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="t-title truncate">{product.name}</h3>
                        <p className="t-caption mt-0.5 truncate">
                          {product.brand} · {product.category}
                        </p>
                      </div>
                      <ScoreBadge score={product.score} className="shrink-0" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 t-body-sm">
                      <span className="truncate" style={{ color: SCORE_COLORS[product.score] }}>
                        {product.tip}
                      </span>
                      {scannedProducts.includes(product.id) ? (
                        <span className="t-caption shrink-0">já visto</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

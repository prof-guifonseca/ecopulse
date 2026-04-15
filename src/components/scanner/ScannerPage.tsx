'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Camera, Search } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { SCORE_COLORS } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Stat } from '@/components/ui/Stat';

export function ScannerPage() {
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);
  const scannedProducts = useGameStore((s) => s.scannedProducts);
  const addScannedProduct = useGameStore((s) => s.addScannedProduct);
  const markMission = useGameStore((s) => s.markMission);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);

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
      openModal({ kind: 'product', id: chosen.id });
      setScanning(false);
    }, 1600);
  };

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.35s ease' }}>
      <Card tone="hero" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Escaneie e entenda rápido"
          subtitle="Veja a ficha completa e alimente seu histórico sem passar por painel técnico."
        />

        <div className="scan-frame px-5 py-6">
          <div className="relative flex min-h-[240px] items-center justify-center py-4">
            <div className="absolute h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(141,219,152,0.16),transparent_62%)] blur-2xl" />
            <div className="absolute h-[190px] w-[190px] rounded-full border border-white/6" />
            <div className="absolute h-[140px] w-[140px] rounded-full border border-[rgba(141,219,152,0.28)]" />
            <div
              className="pointer-events-none absolute inset-x-10 top-1/2 h-px"
              style={{
                background: 'var(--gradient-primary)',
                animation: scanning ? 'scanLine 1.2s linear infinite' : 'none',
                opacity: scanning ? 1 : 0.35,
              }}
            />
            <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-[var(--line-soft)] bg-white/4 text-accent-green shadow-[0_18px_36px_rgba(141,219,152,0.12)]">
              <Icon icon={Camera} size={40} strokeWidth={1.6} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="Histórico" value={`${scannedProducts.length} itens`} align="start" />
            <Stat label="Missão" value={missionScan ? 'Concluída' : 'Pendente'} align="start" />
          </div>

          <p className="mt-4 text-[0.85rem] leading-5 text-text-muted">
            {scanning
              ? 'Analisando o item agora…'
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
        <SectionHeader
          title="Pesquisar antes de escanear"
          subtitle="Busque por nome, marca ou categoria."
        />
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <Icon icon={Search} size={18} className="text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, marca ou categoria"
            className="w-full bg-transparent text-[0.95rem] outline-none placeholder:text-text-muted"
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Produtos para consultar"
          subtitle={`${filtered.length} item${filtered.length === 1 ? '' : 's'} disponíveis agora.`}
        />

        <div className="space-y-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => openModal({ kind: 'product', id: product.id })}
              className="group block w-full text-left transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Card tone="solid" padded={false} className="px-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[var(--line-soft)] bg-white/4 text-3xl">
                    {product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[0.98rem] font-semibold leading-tight text-text-primary">{product.name}</h3>
                        <p className="mt-0.5 truncate text-[0.8rem] text-text-muted">
                          {product.brand} · {product.category}
                        </p>
                      </div>
                      <ScoreBadge score={product.score} className="shrink-0" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[0.82rem]">
                      <span className="truncate" style={{ color: SCORE_COLORS[product.score] }}>
                        {product.tip}
                      </span>
                      {scannedProducts.includes(product.id) ? (
                        <span className="shrink-0 text-[0.72rem] text-text-muted">já visto</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

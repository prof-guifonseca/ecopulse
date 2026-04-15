'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { PRODUCTS } from '@/data';
import { SCORE_COLORS } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { GlassCard } from '@/components/shared/GlassCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { cn } from '@/lib/cn';

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
    <div className="space-y-4" style={{ animation: 'fadeIn 0.35s ease' }}>
      <GlassCard variant="hud" accent="mint" className="px-5 py-5">
        <SectionHeader
          title="Escaneie e entenda rápido"
          subtitle="Abra um produto, veja a ficha completa e alimente seu histórico sem passar por um painel técnico."
        />

        <div className="scan-frame px-5 py-5">
          <div className="relative flex min-h-[260px] items-center justify-center py-8">
            <div className="absolute h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(145,216,159,0.16),transparent_62%)] blur-2xl" />
            <div className="absolute h-[210px] w-[210px] rounded-full border border-white/8" />
            <div className="absolute h-[156px] w-[156px] rounded-full border border-accent-green/20" />
            <div
              className="pointer-events-none absolute inset-x-8 top-1/2 h-px"
              style={{
                background: 'var(--gradient-primary)',
                animation: scanning ? 'scanLine 1.2s linear infinite' : 'none',
                opacity: scanning ? 1 : 0.3,
              }}
            />
            <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/8 bg-white/6 text-6xl shadow-[0_18px_36px_rgba(145,216,159,0.1)]">
              📷
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <QuietStat label="Histórico" value={`${scannedProducts.length} itens`} />
            <QuietStat label="Missão" value={missionScan ? 'Concluída' : 'Pendente'} />
          </div>

          <p className="mt-4 text-sm leading-6 text-text-secondary">
            {scanning
              ? 'Estamos analisando o item agora.'
              : 'Use o simulador para abrir uma ficha completa, ganhar recompensa e registrar esse produto na sua rotina.'}
          </p>
          <button
            onClick={simulateScan}
            disabled={scanning}
            className={cn(
              'mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold text-bg-primary transition-opacity',
              scanning && 'opacity-70'
            )}
            style={{ background: 'var(--gradient-primary)' }}
          >
            {scanning ? 'Escaneando...' : 'Simular scan'}
          </button>
        </div>
      </GlassCard>

      <section className="space-y-3">
        <SectionHeader
          title="Pesquisar antes de escanear"
          subtitle="Busque por nome, marca ou categoria para abrir a ficha direto."
        />
        <div className="input-shell flex items-center gap-3 px-4 py-3">
          <span className="text-xl text-text-secondary">🔎</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, marca ou categoria"
            className="w-full bg-transparent text-base outline-none placeholder:text-text-muted"
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Produtos para consultar"
          subtitle={`${filtered.length} item${filtered.length === 1 ? '' : 's'} disponíveis agora.`}
        />

        <div className="space-y-3">
          {filtered.map((product, index) => (
            <button
              key={product.id}
              onClick={() => openModal({ kind: 'product', id: product.id })}
              className="group block w-full text-left"
            >
              <GlassCard
                variant="tile"
                accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
                className="overflow-hidden px-4 py-4 transition-transform duration-200 group-hover:translate-y-[-2px]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white/6 text-3xl">
                    {product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold leading-6 text-text-primary">{product.name}</h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {product.brand} · {product.category}
                        </p>
                      </div>
                      <ScoreBadge score={product.score} className="shrink-0" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span style={{ color: SCORE_COLORS[product.score] }}>{product.tip}</span>
                      {scannedProducts.includes(product.id) ? (
                        <span className="whitespace-nowrap text-text-secondary">já visto</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuietStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface surface-ghost rounded-[18px] px-3 py-3">
      <div className="text-[0.72rem] font-medium text-text-secondary">{label}</div>
      <div className="mt-1 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}

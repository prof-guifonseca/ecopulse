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
        showToast('Missao diaria: escanear produto ✅', 'success');
      }

      if (scannedProducts.length + 1 === 1) unlockBadge('first-scan');
      if (scannedProducts.length + 1 >= 5) unlockBadge('scanner-5');

      showToast(`+10 tokens — ${chosen.name} ${chosen.emoji}`, 'reward');
      fireConfetti();
      openModal({ kind: 'product', id: chosen.id });
      setScanning(false);
    }, 1600);
  };

  return (
    <div className="space-y-6 lg:space-y-8" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_340px]">
        <GlassCard variant="hud" accent="cyan" className="px-5 py-5 sm:px-6 sm:py-6">
          <SectionHeader
            eyebrow="scan bay"
            title="Scanner de Sustentabilidade"
            subtitle="Mire um produto, leia impacto e converta consumo em inteligencia acionavel."
          />

          <div className="scan-frame flex min-h-[360px] flex-col justify-between px-5 py-5 sm:px-6">
            <div className="flex flex-wrap gap-2">
              <span className="command-pill" data-active="true">live optics</span>
              <span className="command-pill">{scannedProducts.length} produtos lidos</span>
            </div>

            <div className="relative flex flex-1 items-center justify-center py-8">
              <div className="absolute h-[260px] w-[260px] rounded-full border border-white/8 bg-[radial-gradient(circle,rgba(54,215,255,0.08),transparent_66%)] blur-2xl" />
              <div className="absolute h-[220px] w-[220px] rounded-full border border-white/10" />
              <div className="absolute h-[160px] w-[160px] rounded-full border border-accent-cyan/30" />
              <div
                className="pointer-events-none absolute inset-x-10 top-1/2 h-px"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 18px rgba(54,215,255,0.32)',
                  animation: scanning ? 'scanLine 1.2s linear infinite' : 'none',
                  opacity: scanning ? 1 : 0.45,
                }}
              />
              <div className="flex h-28 w-28 items-center justify-center rounded-[30px] border border-white/10 bg-white/6 text-6xl shadow-[0_0_50px_rgba(54,215,255,0.18)]">
                📷
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="text-sm text-text-secondary">
                {scanning
                  ? 'Varredura em andamento. Aguarde a classificacao do item.'
                  : 'Acione o simulador para abrir um produto, gerar recompensa e alimentar o historico do operador.'}
              </div>
              <button
                onClick={simulateScan}
                disabled={scanning}
                className={cn(
                  'rounded-full px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-bg-primary shadow-[0_0_28px_rgba(54,215,255,0.28)] transition-transform duration-200 hover:translate-y-[-1px]',
                  scanning && 'opacity-60'
                )}
                style={{ background: 'var(--gradient-primary)' }}
              >
                {scanning ? 'Escaneando' : 'Simular Scan'}
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="panel" accent="mint" className="px-5 py-5">
          <div className="hud-label">bay telemetry</div>
          <div className="mt-3 font-display text-2xl font-bold">Leitura rapida</div>
          <div className="mt-5 grid gap-3">
            <TelemetryCard label="Itens vistos" value={scannedProducts.length} icon="📦" accent="cyan" />
            <TelemetryCard label="Missao scan" value={missionScan ? 'ok' : 'pendente'} icon="🎯" accent="mint" />
            <TelemetryCard label="Busca ativa" value={deferredQuery.trim() ? 'filtrada' : 'total'} icon="🔎" accent="amber" />
          </div>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="product registry" title="Buscar Produtos" subtitle="Filtre por nome, marca ou categoria." />
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

      <section>
        <SectionHeader
          eyebrow="catalog"
          title="Grade de Produtos"
          subtitle={`${filtered.length} item${filtered.length === 1 ? '' : 's'} disponivel${filtered.length === 1 ? '' : 'eis'} para consulta.`}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product, index) => (
            <button
              key={product.id}
              onClick={() => openModal({ kind: 'product', id: product.id })}
              className="group block text-left"
            >
              <GlassCard
                variant="tile"
                accent={index % 4 === 0 ? 'cyan' : index % 4 === 1 ? 'mint' : index % 4 === 2 ? 'amber' : 'violet'}
                className="h-full overflow-hidden p-0 transition-transform duration-200 group-hover:translate-y-[-4px]"
              >
                <div className="flex items-start justify-between gap-4 px-5 pt-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-3xl">
                    {product.emoji}
                  </div>
                  <ScoreBadge score={product.score} />
                </div>
                <div className="px-5 py-4">
                  <h3 className="font-display text-2xl font-bold leading-tight">{product.name}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{product.brand}</p>
                  <div className="mt-4 flex items-center justify-between gap-4 text-sm text-text-secondary">
                    <span>{product.category}</span>
                    {scannedProducts.includes(product.id) ? (
                      <span style={{ color: SCORE_COLORS[product.score] }}>✓ visto</span>
                    ) : null}
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

function TelemetryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: 'mint' | 'cyan' | 'amber';
}) {
  return (
    <GlassCard variant="ghost" accent={accent} className="px-4 py-4">
      <div className="hud-label">{label}</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
          {icon}
        </div>
        <div className="font-display text-2xl font-bold">{value}</div>
      </div>
    </GlassCard>
  );
}

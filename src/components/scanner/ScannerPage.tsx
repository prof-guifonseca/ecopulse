'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { PRODUCTS } from '@/data';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SCORE_COLORS } from '@/lib/scanner';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
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
    if (!normalizedQuery) return PRODUCTS.slice(0, 5);

    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
    ).slice(0, 8);
  }, [deferredQuery]);

  const simulateScan = () => {
    if (scanning) return;

    setScanning(true);

    window.setTimeout(() => {
      const pool = PRODUCTS.filter((product) => !scannedProducts.includes(product.id));
      const chosen = (pool.length ? pool : PRODUCTS)[Math.floor(Math.random() * (pool.length || PRODUCTS.length))];

      addScannedProduct(chosen.id);
      awardTokens(10);

      if (!missionScan) {
        markMission('scan', true);
        showToast('Missão diária de scan concluída', 'success');
      }

      if (scannedProducts.length + 1 === 1) unlockBadge('first-scan');
      if (scannedProducts.length + 1 >= 5) unlockBadge('scanner-5');

      showToast(`+10 tokens por ${chosen.name}`, 'reward');
      fireConfetti();
      openModal({ kind: 'product', id: chosen.id });
      setScanning(false);
    }, 1400);
  };

  return (
    <div className="space-y-6 pb-3" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,25,21,0.98),rgba(8,13,11,0.96))] px-5 py-5 shadow-[0_30px_80px_rgba(1,8,5,0.34)]">
        <div className="max-w-[18ch]">
          <div className="text-[0.76rem] font-medium text-text-secondary">Fluxo hero</div>
          <h1 className="mt-3 text-[2.45rem] font-semibold leading-[0.92] tracking-[-0.06em] text-text-primary">
            Escaneie e abra a ficha na hora.
          </h1>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            A demonstração principal do produto: uma ação, um resultado e uma próxima escolha bem visível.
          </p>
        </div>

        <div className="mt-6 scan-frame p-4">
          <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(145,216,159,0.16),transparent_42%),linear-gradient(180deg,rgba(18,27,22,0.96),rgba(10,15,13,0.96))]">
            <div className="absolute left-4 top-4 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[0.74rem] font-medium text-text-secondary">
              Demonstração guiada
            </div>
            <div className="absolute h-[240px] w-[240px] rounded-full border border-white/8" />
            <div className="absolute h-[176px] w-[176px] rounded-full border border-accent-green/18" />
            <div
              className="pointer-events-none absolute inset-x-8 top-1/2 h-px"
              style={{
                background: 'var(--gradient-primary)',
                animation: scanning ? 'scanLine 1.2s linear infinite' : 'none',
                opacity: scanning ? 1 : 0.32,
              }}
            />
            <div className="flex h-28 w-28 items-center justify-center rounded-[34px] border border-white/8 bg-white/6 text-6xl shadow-[0_18px_44px_rgba(145,216,159,0.12)]">
              📷
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ScannerStat label="Histórico" value={`${scannedProducts.length} itens`} />
            <ScannerStat label="Missão" value={missionScan ? 'Concluída' : 'Pendente'} />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm leading-6 text-text-secondary">
              {scanning
                ? 'Analisando um produto para abrir a ficha no próximo movimento.'
                : 'Use o simulador para mostrar o momento em que a análise vira uma ficha de produto em bottom sheet.'}
            </p>
            <button
              onClick={simulateScan}
              disabled={scanning}
              className={cn(
                'flex min-h-12 items-center justify-center rounded-full bg-[var(--gradient-primary)] px-5 text-sm font-semibold text-bg-primary transition-opacity',
                scanning && 'opacity-75'
              )}
            >
              {scanning ? 'Escaneando agora...' : 'Simular scan'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Pesquisar no catálogo"
          subtitle="Apoio à demo: encontre uma ficha específica sem criar uma segunda experiência paralela."
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
          title={query ? 'Resultados filtrados' : 'Fichas prontas para abrir'}
          subtitle={
            query
              ? `${filtered.length} item${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}.`
              : 'Uma amostra pequena do catálogo para manter a navegação leve durante a apresentação.'
          }
        />
        <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] shadow-[0_20px_56px_rgba(1,8,5,0.22)]">
          {filtered.map((product, index) => (
            <button
              key={product.id}
              onClick={() => openModal({ kind: 'product', id: product.id })}
              className={cn(
                'flex w-full items-start gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-white/[0.03]',
                index !== filtered.length - 1 && 'border-b border-white/6'
              )}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/8 bg-white/6 text-3xl">
                {product.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">{product.name}</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {product.brand} · {product.category}
                    </p>
                  </div>
                  <ScoreBadge score={product.score} className="shrink-0" />
                </div>
                <p className="mt-3 text-sm leading-6" style={{ color: SCORE_COLORS[product.score] }}>
                  {product.tip}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ScannerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.045] px-3 py-3">
      <div className="text-[0.72rem] font-medium text-text-secondary">{label}</div>
      <div className="mt-1 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}

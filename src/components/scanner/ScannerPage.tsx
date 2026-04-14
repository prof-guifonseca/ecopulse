'use client';

import { useMemo, useState } from 'react';
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
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);
  const scannedProducts = useGameStore((s) => s.scannedProducts);
  const addScannedProduct = useGameStore((s) => s.addScannedProduct);
  const markMission = useGameStore((s) => s.markMission);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  const simulateScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      const pool = PRODUCTS.filter((p) => !scannedProducts.includes(p.id));
      const chosen = (pool.length ? pool : PRODUCTS)[Math.floor(Math.random() * (pool.length || PRODUCTS.length))];
      addScannedProduct(chosen.id);
      awardTokens(10);
      if (!missionScan) {
        markMission('scan', true);
        showToast('Missão diária: escanear produto ✅', 'success');
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
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section>
        <SectionHeader title="Scanner de Sustentabilidade" subtitle="Mire um produto e descubra o impacto" />
        <GlassCard className="overflow-hidden p-0">
          <div
            className="relative flex h-48 items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(82,183,136,0.12), rgba(0,180,216,0.12))' }}
          >
            <div
              className="pointer-events-none absolute inset-x-6 h-0.5 rounded-full"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 12px var(--accent-green)',
                animation: scanning ? 'scanLine 1.2s linear infinite' : 'none',
                top: '50%',
                opacity: scanning ? 1 : 0.35,
              }}
            />
            <div className="text-6xl" style={{ animation: scanning ? 'pulseRing 1s ease infinite' : undefined }}>
              📷
            </div>
          </div>
          <div className="p-4">
            <button
              onClick={simulateScan}
              disabled={scanning}
              className={cn(
                'w-full rounded-full py-3 text-sm font-bold transition-transform active:scale-[0.98]',
                scanning && 'opacity-60'
              )}
              style={{ background: 'var(--gradient-primary)', color: 'var(--bg-primary)' }}
            >
              {scanning ? 'Escaneando...' : '📸 Simular Scan'}
            </button>
            <p className="mt-2 text-center text-[11px] text-text-secondary">
              +10 tokens por produto escaneado
            </p>
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionHeader title="Buscar Produtos" />
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, marca ou categoria"
            className="w-full rounded-full border border-white/5 bg-bg-tertiary px-4 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-accent-green"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">🔎</span>
        </div>
      </section>

      <section>
        <SectionHeader title="Catálogo" subtitle={`${filtered.length} produto${filtered.length === 1 ? '' : 's'}`} />
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => openModal({ kind: 'product', id: p.id })}
              className="glass-card overflow-hidden p-3 text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-md text-2xl"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {p.emoji}
                </div>
                <ScoreBadge score={p.score} />
              </div>
              <h3 className="mt-2 line-clamp-2 text-xs font-semibold">{p.name}</h3>
              <p className="text-[10px] text-text-secondary">{p.brand}</p>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-secondary">
                <span>{p.category}</span>
                {scannedProducts.includes(p.id) && (
                  <span style={{ color: SCORE_COLORS[p.score] }}>✓ visto</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

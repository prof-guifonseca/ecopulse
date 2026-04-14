'use client';

import { PRODUCTS } from '@/data';
import { BREAKDOWN_LABELS, SCORE_COLORS, findAlternatives } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Modal } from './Modal';
import type { Product } from '@/types';

interface Props {
  id: string;
}

export function ProductDetailModal({ id }: Props) {
  const product = PRODUCTS.find((p) => p.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);
  const scanned = useGameStore((s) => s.scannedProducts.includes(id));
  const markMission = useGameStore((s) => s.markMission);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);
  const addScanned = useGameStore((s) => s.addScannedProduct);
  const showToast = useUIStore((s) => s.showToast);

  if (!product) return null;

  const color = SCORE_COLORS[product.score];
  const alternatives = findAlternatives(product, PRODUCTS);

  const addToList = () => {
    addScanned(id);
    awardTokens(5);
    showToast('+5 Eco-Tokens! Produto escaneado 🔍', 'reward');
    if (!missionScan) markMission('scan', true);
    const count = useGameStore.getState().scannedProducts.length;
    if (count === 1) unlockBadge('first-scan');
    if (count >= 10) unlockBadge('scanner-10');
    closeModal();
  };

  return (
    <Modal onClose={closeModal}>
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold text-bg-primary"
          style={{ background: color, animation: 'scoreReveal 0.5s cubic-bezier(.34,1.56,.64,1)' }}
        >
          {product.score}
        </div>
        <h3 className="mt-3 font-display text-lg font-bold">{product.name}</h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          {product.brand} · {product.category}
        </p>

        <div className="mt-4 w-full space-y-3">
          {Object.entries(product.breakdown).map(([k, v]) => (
            <BreakdownRow key={k} label={BREAKDOWN_LABELS[k]!} value={v as number} color={color} />
          ))}
        </div>

        <div
          className="mt-4 w-full rounded-md border-l-2 p-3 text-left text-xs leading-relaxed"
          style={{ background: 'rgba(255,209,102,0.06)', borderColor: 'var(--accent-gold)' }}
        >
          💡 {product.tip}
        </div>

        {alternatives.length > 0 && <AlternativesList items={alternatives} openItem={(pid) => openModal({ kind: 'product', id: pid })} />}

        <button
          type="button"
          onClick={addToList}
          disabled={scanned}
          className="mt-5 w-full rounded-full py-3 text-sm font-bold text-bg-primary transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {scanned ? '✅ Já adicionado' : '+ Adicionar à lista · 5 Tokens'}
        </button>
      </div>
    </Modal>
  );
}

function BreakdownRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium text-text-secondary">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function AlternativesList({ items, openItem }: { items: Product[]; openItem: (id: string) => void }) {
  return (
    <div className="mt-5 w-full text-left">
      <h4 className="mb-2 text-sm font-semibold">✅ Alternativas mais sustentáveis</h4>
      <div className="space-y-2">
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => openItem(a.id)}
            className="flex w-full items-center gap-3 rounded-md bg-bg-tertiary p-3 text-left transition-transform active:scale-[0.98]"
          >
            <span className="text-2xl">{a.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold">{a.name}</div>
              <div className="truncate text-xs text-text-secondary">{a.brand}</div>
            </div>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-bg-primary"
              style={{ background: SCORE_COLORS[a.score] }}
            >
              {a.score}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

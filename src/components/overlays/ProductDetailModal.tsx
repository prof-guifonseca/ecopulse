'use client';

import { Lightbulb, Plus } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { BREAKDOWN_LABELS, SCORE_COLORS, findAlternatives } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ModalShell } from './ModalShell';
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
    showToast('+5 Eco-Tokens', 'reward');
    if (!missionScan) markMission('scan', true);
    const count = useGameStore.getState().scannedProducts.length;
    if (count === 1) unlockBadge('first-scan');
    if (count >= 10) unlockBadge('scanner-10');
    closeModal();
  };

  return (
    <ModalShell eyebrow="Produto" title={product.name}>
      <div className="flex flex-col items-center text-center">
        <div
          className="t-mega animate-score-reveal flex h-20 w-20 items-center justify-center rounded-full text-[var(--on-primary)]"
          style={{ background: color }}
        >
          {product.score}
        </div>
        <p className="t-caption mt-2">
          {product.brand} · {product.category}
        </p>

        <div className="mt-5 w-full space-y-3">
          {Object.entries(product.breakdown).map(([k, v]) => (
            <BreakdownRow key={k} label={BREAKDOWN_LABELS[k]!} value={v as number} color={color} />
          ))}
        </div>

        <div className="mt-5 flex w-full items-start gap-3 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--accent-gold)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_8%,transparent)] px-4 py-3 text-left t-body-sm">
          <Icon icon={Lightbulb} size={16} className="mt-0.5 text-[var(--accent-gold)]" />
          <span>{product.tip}</span>
        </div>

        {alternatives.length > 0 && (
          <AlternativesList items={alternatives} openItem={(pid) => openModal({ kind: 'product', id: pid })} />
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={addToList}
          disabled={scanned}
          leftIcon={!scanned ? <Icon icon={Plus} size={16} strokeWidth={2.4} /> : undefined}
        >
          {scanned ? 'Já adicionado' : 'Adicionar ao histórico'}
        </Button>
      </div>
    </ModalShell>
  );
}

function BreakdownRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between t-caption">
        <span className="font-semibold text-[var(--text-secondary)]">{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-tint-3">
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
      <div className="t-eyebrow mb-2">Alternativas melhores</div>
      <div className="space-y-2">
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => openItem(a.id)}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border-soft bg-tint-1 p-3 text-left transition-colors hover:border-[var(--line-strong)]"
          >
            <IconTile size="md" icon={<span>{a.emoji}</span>} />
            <div className="min-w-0 flex-1">
              <div className="t-title truncate">{a.name}</div>
              <div className="t-caption truncate">{a.brand}</div>
            </div>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-[var(--on-primary)]"
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

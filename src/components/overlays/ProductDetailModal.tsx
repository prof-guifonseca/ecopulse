'use client';

import { Info, Lightbulb, Plus } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { BREAKDOWN_LABELS, SCORE_COLORS, findAlternatives } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { unsplashUrl, type UnsplashKey } from '@/lib/unsplash';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ModalShell } from './ModalShell';
import type { Product, Score } from '@/types';

const CATEGORY_IMAGE: Record<string, UnsplashKey> = {
  alimentos: 'freshProduce',
  bebidas: 'bulkShopping',
  cosméticos: 'ceramics',
  cosmeticos: 'ceramics',
  limpeza: 'refillStore',
  vestuário: 'vintageFashion',
  vestuario: 'vintageFashion',
  moda: 'clothingRack',
};

function pickProductImage(category: string): UnsplashKey {
  const key = category.toLowerCase();
  return CATEGORY_IMAGE[key] ?? 'urbanGarden';
}

interface Props {
  id: string;
}

interface UnifiedView {
  source: 'catalog' | 'scan';
  name: string;
  brand: string;
  category: string;
  emoji: string;
  barcode: string;
  score: Score;
  breakdown: Record<string, number>;
  tip: string;
  rationale: string[];
  /** Identifier in the catalog so we can find alternatives. */
  catalogId: string;
}

export function ProductDetailModal({ id }: Props) {
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const markMission = useGameStore((s) => s.markMission);
  const missionScan = useGameStore((s) => s.dailyMissions.scan);
  const addScanned = useGameStore((s) => s.addScannedProduct);
  const scanned = useGameStore((s) => s.scannedProducts.includes(id));
  const historyEntry = useScanHistoryStore((s) => s.history.find((x) => x.id === id));

  const view = resolveView(id, historyEntry);
  if (!view) return null;

  const color = SCORE_COLORS[view.score];
  const isFromHistory = view.source === 'scan';
  const catalogProduct = PRODUCTS.find((p) => p.id === view.catalogId);
  const alternatives = catalogProduct
    ? findAlternatives(catalogProduct, PRODUCTS)
    : [];

  const addToHistoryFromCatalog = () => {
    addScanned(view.catalogId);
    awardTokens(5);
    showToast('+5 Eco-Tokens', 'reward');
    if (!missionScan) markMission('scan', true);
    const count = useGameStore.getState().scannedProducts.length;
    if (count === 1) unlockBadge('first-scan');
    if (count >= 10) unlockBadge('scanner-10');
    closeModal();
  };

  const heroImage = unsplashUrl(pickProductImage(view.category), { w: 800, h: 360, q: 70 });

  return (
    <ModalShell
      eyebrow={isFromHistory ? `Scan · ${view.barcode}` : `Catálogo · ${view.barcode}`}
      title={view.name}
    >
      <div className="flex flex-col items-center text-center">
        {/* Editorial photo with score badge floating over it */}
        <div
          className="relative -mx-5 mb-4 h-36 w-[calc(100%+2.5rem)] overflow-hidden"
          style={{
            backgroundImage: `url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,18,14,0.30) 0%, rgba(10,18,14,0.70) 75%, var(--bg-secondary) 100%)',
            }}
          />
          <div
            className="absolute bottom-3 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full text-[2rem] font-extrabold text-[var(--on-primary)] shadow-[var(--shadow-deep-glow)]"
            style={{ background: color, animation: 'scoreReveal 0.5s cubic-bezier(.34,1.56,.64,1)' }}
          >
            {view.score}
          </div>
        </div>

        <p className="t-caption mt-8">
          {[view.brand, view.category].filter(Boolean).join(' · ') || 'Sem metadados'}
        </p>

        <div className="mt-5 w-full space-y-3">
          {Object.entries(view.breakdown).map(([k, v]) => (
            <BreakdownRow key={k} label={BREAKDOWN_LABELS[k] ?? k} value={v} color={color} />
          ))}
        </div>

        <div className="mt-5 flex w-full items-start gap-3 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--accent-gold)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_8%,transparent)] px-4 py-3 text-left t-body-sm">
          <Icon icon={Lightbulb} size={16} className="mt-0.5 text-[var(--accent-gold)]" />
          <span>{view.tip}</span>
        </div>

        {view.rationale.length > 0 ? (
          <div className="mt-3 w-full rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-4 py-3 text-left">
            <div className="flex items-center gap-2 t-eyebrow">
              <Icon icon={Info} size={12} />
              Como calculamos
            </div>
            <ul className="mt-2 space-y-1 t-caption">
              {view.rationale.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {alternatives.length > 0 ? (
          <AlternativesList
            items={alternatives}
            openItem={(pid) => openModal({ kind: 'product', id: pid })}
          />
        ) : null}

        {isFromHistory ? (
          <Button variant="secondary" size="lg" fullWidth className="mt-6" onClick={closeModal}>
            Fechar
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-6"
            onClick={addToHistoryFromCatalog}
            disabled={scanned}
            leftIcon={!scanned ? <Icon icon={Plus} size={16} strokeWidth={2.4} /> : undefined}
          >
            {scanned ? 'Já adicionado' : 'Adicionar ao histórico'}
          </Button>
        )}
      </div>
    </ModalShell>
  );
}

function resolveView(
  id: string,
  scan: ReturnType<typeof useScanHistoryStore.getState>['history'][number] | undefined
): UnifiedView | null {
  if (scan) {
    return {
      source: 'scan',
      catalogId: scan.productId,
      name: scan.name,
      brand: scan.brand,
      category: scan.category,
      emoji: scan.emoji,
      barcode: scan.barcode,
      score: scan.score,
      breakdown: { ...scan.breakdown },
      tip: scan.tip,
      rationale: scan.rationale,
    };
  }
  const catalogProduct = PRODUCTS.find((p) => p.id === id);
  if (!catalogProduct) return null;
  return {
    source: 'catalog',
    catalogId: catalogProduct.id,
    name: catalogProduct.name,
    brand: catalogProduct.brand,
    category: catalogProduct.category,
    emoji: catalogProduct.emoji,
    barcode: catalogProduct.barcode,
    score: catalogProduct.score,
    breakdown: catalogProduct.breakdown,
    tip: catalogProduct.tip,
    rationale: [],
  };
}

function BreakdownRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between t-caption">
        <span className="font-semibold text-[var(--text-secondary)]">{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tint-3)]">
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
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] p-3 text-left transition-colors hover:border-[var(--line-strong)]"
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

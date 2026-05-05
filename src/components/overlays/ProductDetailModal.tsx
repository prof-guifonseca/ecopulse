'use client';

import { Info, Lightbulb, Plus } from 'lucide-react';
import { PRODUCTS } from '@/data';
import { BREAKDOWN_LABELS, SCORE_COLORS, findAlternatives } from '@/lib/scanner';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ModalShell } from './ModalShell';
import type { Product, Score } from '@/types';

interface Props {
  id: string;
}

interface UnifiedView {
  source: 'demo' | 'scan';
  name: string;
  brand: string | null;
  category: string | null;
  emoji: string | null;
  imageUrl: string | null;
  score: Score;
  breakdown: Record<string, number>;
  tip: string;
  rationale: string[];
  /** Only for demo entries — identifier in PRODUCTS catalog. */
  demoId?: string;
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
  const isDemo = view.source === 'demo';
  const alternatives = isDemo && view.demoId
    ? findAlternatives(PRODUCTS.find((p) => p.id === view.demoId)!, PRODUCTS)
    : [];

  const addToDemoList = () => {
    if (!isDemo || !view.demoId) return;
    addScanned(view.demoId);
    awardTokens(5);
    showToast('+5 Eco-Tokens', 'reward');
    if (!missionScan) markMission('scan', true);
    const count = useGameStore.getState().scannedProducts.length;
    if (count === 1) unlockBadge('first-scan');
    if (count >= 10) unlockBadge('scanner-10');
    closeModal();
  };

  return (
    <ModalShell eyebrow={isDemo ? 'Produto demo' : 'Scan real'} title={view.name}>
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-[2rem] font-extrabold text-[var(--on-primary)]"
          style={{ background: color, animation: 'scoreReveal 0.5s cubic-bezier(.34,1.56,.64,1)' }}
        >
          {view.score}
        </div>
        <p className="t-caption mt-2">
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

        {isDemo ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-6"
            onClick={addToDemoList}
            disabled={scanned}
            leftIcon={!scanned ? <Icon icon={Plus} size={16} strokeWidth={2.4} /> : undefined}
          >
            {scanned ? 'Já adicionado' : 'Adicionar ao histórico'}
          </Button>
        ) : (
          <Button variant="secondary" size="lg" fullWidth className="mt-6" onClick={closeModal}>
            Fechar
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
      name: scan.name,
      brand: scan.brand,
      category: scan.category,
      emoji: null,
      imageUrl: scan.imageUrl,
      score: scan.score,
      breakdown: { ...scan.breakdown },
      tip: scan.tip,
      rationale: scan.rationale,
    };
  }
  const demo = PRODUCTS.find((p) => p.id === id);
  if (!demo) return null;
  return {
    source: 'demo',
    demoId: demo.id,
    name: demo.name,
    brand: demo.brand,
    category: demo.category,
    emoji: demo.emoji,
    imageUrl: null,
    score: demo.score,
    breakdown: demo.breakdown,
    tip: demo.tip,
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

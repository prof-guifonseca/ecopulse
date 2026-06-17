'use client';

import { Sparkles, TreePine, Trees } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CHAPTERS, getChapter, type ChapterId } from '@/lib/journey';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ModalShell } from './ModalShell';

const PLANT_DONATION_TOKEN_COST = 500;

const ICON_BY_CHAPTER: Record<ChapterId, LucideIcon> = {
  semente: Sparkles,
  broto: Sparkles,
  arbusto: TreePine,
  arvore: TreePine,
  floresta: Trees,
};

interface Props {
  chapterId: string;
}

export function ChapterUnlockOverlay({ chapterId }: Props) {
  const chapter = getChapter(chapterId as ChapterId);
  const closeModal = useUIStore((s) => s.closeModal);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);
  const tokens = useUserStore((s) => s.tokens);
  const spendTokens = useUserStore((s) => s.spendTokens);
  const adoptedDoctrines = useUserStore((s) => s.adoptedDoctrines);
  const bumpRealImpact = useGameStore((s) => s.bumpRealImpact);
  const addOwnedShopItem = useGameStore((s) => s.addOwnedShopItem);
  const treesPlanted = useGameStore((s) => s.realImpact.treesPlanted);

  const ChapterIcon = ICON_BY_CHAPTER[chapter.id] ?? Sparkles;
  const idx = CHAPTERS.findIndex((c) => c.id === chapter.id);
  const isFloresta = chapter.id === 'floresta';

  const plantTree = () => {
    if (tokens < PLANT_DONATION_TOKEN_COST) {
      showToast('Tokens insuficientes para registrar o plantio.', 'info');
      return;
    }
    if (!spendTokens(PLANT_DONATION_TOKEN_COST)) return;
    // Doutrina 'raiz-funda' grants an extra local tree record on the next donation.
    const extra = adoptedDoctrines.includes('raiz-antiga:raiz-funda') ? 1 : 0;
    bumpRealImpact({ treesPlanted: 1 + extra });
    addOwnedShopItem('s6');
    fireConfetti();
    showToast(
      extra > 0 ? `Registro local · 2 árvores (Raiz funda)` : 'Registro local · 1 árvore',
      'reward',
      4200,
    );
    closeModal();
  };

  return (
    <ModalShell
      eyebrow={`Capítulo ${idx + 1} · ${chapter.label}`}
      title={`Você é ${chapter.label} agora`}
      variant="center"
    >
      <div className="space-y-5 pt-2">
        <div className="flex justify-center">
          <IconTile size="lg" tone="brand" icon={<Icon icon={ChapterIcon} size={28} />} />
        </div>

        <p className="t-body text-center text-[var(--text-secondary)]">{chapter.blurb}</p>

        {isFloresta ? (
          <div className="border-soft bg-tint-1 rounded-[var(--radius-md)] p-4">
            <p className="t-eyebrow mb-1">Ritual da Floresta</p>
            <p className="t-body">
              A jornada se fecha com um compromisso local de plantio. Sua escolha entra no contador
              da Floresta EcoPulse até conectarmos uma instituição parceira.
            </p>
            <p className="t-caption mt-2">
              Floresta atual: {treesPlanted} {treesPlanted === 1 ? 'árvore' : 'árvores'}.
            </p>
          </div>
        ) : (
          <div className="border-soft bg-tint-1 rounded-[var(--radius-md)] p-4">
            <p className="t-eyebrow mb-1">O que muda</p>
            <p className="t-body">
              Estágio do jardim, missões diárias e o rival em destaque no teste de loadout se
              ajustam à sua maturação.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {isFloresta ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={plantTree}
            disabled={tokens < PLANT_DONATION_TOKEN_COST}
            leftIcon={<Icon icon={Trees} size={16} />}
          >
            {`Plantar a sua árvore · ${PLANT_DONATION_TOKEN_COST} tokens`}
          </Button>
        ) : null}
        <Button variant="ghost" size="md" fullWidth onClick={closeModal}>
          {isFloresta ? 'Ainda não' : 'Continuar'}
        </Button>
      </div>
    </ModalShell>
  );
}

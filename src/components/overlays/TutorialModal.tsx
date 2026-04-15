'use client';

import { Check, Clock, Coins } from 'lucide-react';
import { TUTORIALS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';

interface Props {
  id: string;
}

export function TutorialModal({ id }: Props) {
  const tutorial = TUTORIALS.find((t) => t.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  const done = useGameStore((s) => s.completedTutorials.includes(id));
  const complete = useGameStore((s) => s.completeTutorial);
  const showToast = useUIStore((s) => s.showToast);
  const fireConfetti = useUIStore((s) => s.fireConfetti);

  if (!tutorial) return null;

  const doComplete = () => {
    complete(id);
    awardTokens(tutorial.tokens);
    showToast(`+${tutorial.tokens} Eco-Tokens`, 'reward');
    fireConfetti();
    const count = useGameStore.getState().completedTutorials.length;
    if (count === 1) unlockBadge('upcycler-1');
    closeModal();
  };

  return (
    <ModalShell eyebrow="Upcycling" title={tutorial.title}>
      <div>
        <div
          className="relative flex min-h-[120px] items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
          style={{ background: tutorial.gradient }}
        >
          <div className="absolute inset-0 bg-black/25" aria-hidden />
          <div className="relative text-5xl drop-shadow-md">{tutorial.emoji}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.8rem] text-text-muted">
          <span className="inline-flex items-center gap-1">
            Nível: {'●'.repeat(tutorial.difficulty)}{'○'.repeat(Math.max(0, 3 - tutorial.difficulty))}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon={Clock} size={12} />
            {tutorial.time}
          </span>
          <span>{tutorial.steps} passos</span>
        </div>

        <div className="mt-5">
          <div className="display-eyebrow mb-2">Materiais</div>
          <div className="flex flex-wrap gap-1.5">
            {tutorial.materials.map((m) => (
              <span
                key={m}
                className="rounded-full border border-[var(--line-soft)] bg-white/[0.03] px-2.5 py-1 text-[0.78rem] text-text-secondary"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="display-eyebrow mb-2">Passos</div>
          <div className="space-y-2">
            {Array.from({ length: tutorial.steps }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-3 py-2.5 text-[0.85rem]"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.72rem] font-bold text-[#0a140e]"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {i + 1}
                </span>
                <span className="text-text-secondary">Passo {i + 1} do tutorial…</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[var(--radius-md)] border border-[rgba(224,194,122,0.25)] bg-[rgba(224,194,122,0.06)] px-4 py-3 text-[0.85rem] text-text-secondary">
          <Icon icon={Coins} size={14} className="text-accent-gold" />
          Recompensa: <strong className="text-accent-gold">{tutorial.tokens} Eco-Tokens</strong>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={doComplete}
          disabled={done}
          leftIcon={done ? <Icon icon={Check} size={16} /> : undefined}
        >
          {done ? 'Completo' : 'Completar tutorial'}
        </Button>
      </div>
    </ModalShell>
  );
}

'use client';

import { Check, Clock, Coins } from 'lucide-react';
import { TUTORIALS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
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
    showToast(`+${tutorial.tokens} tokens`, 'reward');
    fireConfetti();
    const count = useGameStore.getState().completedTutorials.length;
    if (count === 1) unlockBadge('upcycler-1');
    closeModal();
  };

  return (
    <ModalShell title={tutorial.title}>
      <div>
        <div
          className="relative flex min-h-[120px] items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
          style={{ background: tutorial.gradient }}
        >
          <div className="absolute inset-0 bg-black/20" aria-hidden />
          <div className="relative text-5xl drop-shadow-md">{tutorial.emoji}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 t-caption">
          <span className="inline-flex items-center gap-1">
            Nível: {'●'.repeat(tutorial.difficulty)}{'○'.repeat(Math.max(0, 3 - tutorial.difficulty))}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon={Clock} size={12} />
            {tutorial.time}
          </span>
          <span>{tutorial.steps.length} passos</span>
        </div>

        <div className="mt-5">
          <div className="t-eyebrow mb-2">Materiais</div>
          <div className="flex flex-wrap gap-1.5">
            {tutorial.materials.map((m) => (
              <Chip key={m} asStatic>{m}</Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="t-eyebrow mb-2">Passos</div>
          <div className="space-y-2">
            {tutorial.steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border-soft bg-tint-1 px-3 py-2.5 t-body-sm"
              >
                <span className="gradient-primary t-micro mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[var(--on-primary)]">
                  {i + 1}
                </span>
                <span className="text-[var(--text-secondary)]">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--accent-gold)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_8%,transparent)] px-4 py-3 t-body-sm">
          <Icon icon={Coins} size={14} className="text-[var(--accent-gold)]" />
          <strong className="text-[var(--accent-gold)]">+{tutorial.tokens} tokens</strong>
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
          {done ? 'Completo' : 'Concluir'}
        </Button>
      </div>
    </ModalShell>
  );
}

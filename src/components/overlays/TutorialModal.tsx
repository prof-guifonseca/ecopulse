'use client';

import { TUTORIALS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Modal } from './Modal';

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
    showToast(`+${tutorial.tokens} Eco-Tokens! 🎨`, 'reward');
    fireConfetti();
    const count = useGameStore.getState().completedTutorials.length;
    if (count === 1) unlockBadge('upcycler-1');
    closeModal();
  };

  return (
    <Modal onClose={closeModal}>
      <div>
        <div className="mb-2 text-center text-5xl">{tutorial.emoji}</div>
        <h3 className="text-center font-display text-base font-bold">{tutorial.title}</h3>
        <p className="mt-1 text-center text-xs text-text-secondary">
          {'🌿'.repeat(tutorial.difficulty)} · ⏱ {tutorial.time} · {tutorial.steps} passos
        </p>

        <div className="mt-4">
          <p className="mb-2 text-xs text-text-secondary">Materiais:</p>
          <div className="flex flex-wrap gap-1.5">
            {tutorial.materials.map((m) => (
              <span key={m} className="rounded-full bg-bg-tertiary px-2.5 py-1 text-[11px]">{m}</span>
            ))}
          </div>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {Array.from({ length: tutorial.steps }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 text-[13px]">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-bg-primary"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {i + 1}
              </span>
              <span className="text-text-secondary">Passo {i + 1} do tutorial...</span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-md border-l-2 p-3 text-xs"
          style={{ background: 'rgba(255,209,102,0.08)', borderColor: 'var(--accent-gold)' }}
        >
          🪙 Recompensa: <strong style={{ color: 'var(--accent-gold)' }}>{tutorial.tokens} Eco-Tokens</strong>
        </div>

        <button
          type="button"
          onClick={doComplete}
          disabled={done}
          className="mt-5 w-full rounded-full py-3 text-sm font-bold text-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {done ? '✅ Completo' : '🎨 Completar Tutorial'}
        </button>
      </div>
    </Modal>
  );
}

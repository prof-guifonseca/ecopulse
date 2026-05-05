'use client';

import { Coins } from 'lucide-react';
import { CHALLENGES, TUTORIALS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { resolveIcon } from '@/lib/iconRegistry';
import { runChallenge } from '@/lib/challengeActions';

export function DiscoveryBlock() {
  const openModal = useUIStore((s) => s.openModal);
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const progress = useGameStore((s) => s.challengeProgress);

  // Surface the most relevant challenge: an active one if any, else next up.
  const featured =
    CHALLENGES.find((c) => activeChallenges.includes(c.id) && !completedChallenges.includes(c.id)) ??
    CHALLENGES.find((c) => !completedChallenges.includes(c.id)) ??
    CHALLENGES[0];
  const isActive = activeChallenges.includes(featured.id);
  const isDone = completedChallenges.includes(featured.id);
  const completion = isDone
    ? 100
    : isActive
    ? Math.min(100, ((progress[featured.id] ?? 0) / featured.duration) * 100)
    : 0;
  const ChallengeIcon = resolveIcon(featured.iconName);

  const tutorials = TUTORIALS.slice(0, 2);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="t-title">Em destaque</h2>
      </div>

      {/* Featured challenge */}
      <Card tone="solid" padded={false} className="px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border-active bg-tint-green-2 text-[var(--accent-green)]">
            {ChallengeIcon ? <Icon icon={ChallengeIcon} size={18} /> : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Desafio</p>
            <h3 className="mt-0.5 t-title">{featured.title}</h3>
            <p className="mt-1 t-caption">
              {featured.duration} dias · {featured.participants.toLocaleString('pt-BR')} pessoas
            </p>
          </div>
          <Chip asStatic active className="shrink-0">
            <Icon icon={Coins} size={12} />
            {featured.tokens}
          </Chip>
        </div>

        {(isActive || isDone) ? (
          <ProgressBar value={completion} size="sm" className="mt-4" />
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="t-caption">
            {isDone ? 'Concluído' : isActive ? `${Math.round(completion)}% feito` : 'Pronto pra começar'}
          </span>
          <Button
            variant={isDone ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => runChallenge(featured)}
            disabled={isDone}
          >
            {isDone ? 'Completo' : isActive ? 'Avançar' : 'Participar'}
          </Button>
        </div>
      </Card>

      {/* Two upcycling cards */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {tutorials.map((tutorial) => (
          <button
            key={tutorial.id}
            onClick={() => openModal({ kind: 'tutorial', id: tutorial.id })}
            className="group block text-left transition-colors duration-200 [&_.card]:hover:border-[var(--line-strong)]"
          >
            <Card tone="solid" padded={false} className="h-full">
              <div className="relative flex min-h-[100px] items-end px-4 py-4" style={{ background: tutorial.gradient }}>
                <div className="absolute inset-0 bg-black/15" aria-hidden />
                <div className="relative text-3xl drop-shadow-md">{tutorial.emoji}</div>
              </div>
              <div className="px-4 py-3">
                <h3 className="t-title leading-tight">{tutorial.title}</h3>
                <p className="mt-1 t-caption">
                  {'●'.repeat(tutorial.difficulty)}{'○'.repeat(Math.max(0, 3 - tutorial.difficulty))} · {tutorial.time}
                </p>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}

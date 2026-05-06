'use client';

import { RotateCcw, Trophy, UsersRound, Zap } from 'lucide-react';
import type { BattleResult } from '@/types';
import { arenaOutcomePresentation } from '@/lib/arena/presentation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface Props {
  result: BattleResult;
  reward: {
    baseReward: number;
    firstWinBonus: number;
    total: number;
  };
  onRematch: () => void;
  onChangeOpponent: () => void;
}

export function ArenaResultOverlay({ result, reward, onRematch, onChangeOpponent }: Props) {
  const presentation = arenaOutcomePresentation(result.outcome);

  return (
    <section
      className={cn(
        'relative z-20 -mt-12 rounded-[var(--radius-lg)] border px-4 py-4 shadow-[var(--shadow-lifted)] backdrop-blur-xl',
        RESULT_STYLE[presentation.tone]
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/22 text-current">
          <Icon icon={Trophy} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="t-eyebrow">Resultado</p>
          <h2 className="t-headline mt-1">{presentation.title}</h2>
          <p className="mt-1 t-body-sm text-[var(--text-secondary)]">{presentation.body}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <RewardTile label="Arena XP" value={`+${reward.total}`} />
        <RewardTile label="Bônus" value={reward.firstWinBonus > 0 ? `+${reward.firstWinBonus}` : '0'} />
        <RewardTile label="Rounds" value={result.rounds.toString()} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          variant="reward"
          size="md"
          fullWidth
          onClick={onRematch}
          leftIcon={<Icon icon={RotateCcw} size={16} />}
        >
          {presentation.primaryCta}
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onChangeOpponent}
          leftIcon={<Icon icon={UsersRound} size={16} />}
        >
          {presentation.secondaryCta}
        </Button>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center t-caption">
        <Icon icon={Zap} size={13} className="text-[var(--accent-gold)]" />
        0 tokens por batalha.
      </p>
    </section>
  );
}

function RewardTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-white/10 bg-black/18 px-2 py-3 text-center">
      <p className="truncate text-[0.64rem] font-semibold uppercase tracking-normal text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-1 t-title text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

const RESULT_STYLE = {
  win: 'border-[color-mix(in_srgb,var(--accent-green)_34%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_90%,var(--accent-green)_10%)] text-[var(--accent-green)]',
  loss: 'border-[color-mix(in_srgb,var(--accent-red)_30%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,var(--accent-red)_8%)] text-[var(--accent-red)]',
  draw: 'border-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,var(--accent-gold)_8%)] text-[var(--accent-gold)]',
};

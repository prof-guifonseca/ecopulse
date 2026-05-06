'use client';

import { Brain, ChevronRight, ShieldCheck, Swords, Zap, type LucideIcon } from 'lucide-react';
import type { BattleAction, BattleSession } from '@/types';
import { BATTLE_ACTION_LABELS } from '@/lib/battle/rules';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface Props {
  session: BattleSession;
  reviewingRound: boolean;
  canChooseAction: boolean;
  onAction: (action: BattleAction) => void;
  onNextRound: () => void;
}

export function ArenaActionDock({ session, reviewingRound, canChooseAction, onAction, onNextRound }: Props) {
  if (session.status === 'finished') {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-[var(--glass-bg)] p-3 shadow-[var(--shadow-lifted)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-1 py-1">
          <div className="min-w-0">
            <p className="t-title">Sessão encerrada</p>
            <p className="mt-0.5 t-caption">Arena XP registrado.</p>
          </div>
          <Icon icon={Zap} size={22} className="shrink-0 text-[var(--accent-gold)]" />
        </div>
      </div>
    );
  }

  if (reviewingRound) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-[var(--glass-bg)] p-3 shadow-[var(--shadow-lifted)] backdrop-blur-xl">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onNextRound}
          rightIcon={<Icon icon={ChevronRight} size={18} />}
        >
          Próximo round
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-[var(--glass-bg)] p-3 shadow-[var(--shadow-lifted)] backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2">
        {ACTION_BUTTONS.map((item) => (
          <button
            key={item.action}
            type="button"
            disabled={!canChooseAction}
            onClick={() => onAction(item.action)}
            className={cn(
              'group min-h-[78px] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-tint-2 px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-tint-green-2 disabled:cursor-not-allowed disabled:opacity-55',
              item.tone
            )}
          >
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-primary)] text-current shadow-[0_8px_18px_rgba(0,0,0,0.28)]">
              <Icon icon={item.icon} size={18} />
            </span>
            <span className="mt-2 block text-sm font-bold text-[var(--text-primary)]">{BATTLE_ACTION_LABELS[item.action]}</span>
            <span className="mt-0.5 block text-[0.66rem] font-semibold text-[var(--text-secondary)]">{item.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const ACTION_BUTTONS: Array<{
  action: BattleAction;
  hint: string;
  icon: LucideIcon;
  tone: string;
}> = [
  { action: 'attack', hint: '+10 energia', icon: Swords, tone: 'text-[var(--accent-red)]' },
  { action: 'defend', hint: '+8 energia', icon: ShieldCheck, tone: 'text-[var(--accent-cyan)]' },
  { action: 'focus', hint: '+14 energia', icon: Brain, tone: 'text-[var(--accent-gold)]' },
];

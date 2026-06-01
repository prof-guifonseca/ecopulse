'use client';

import { useState } from 'react';
import { ArrowRight, ChevronLeft, ShieldCheck, Recycle, Sprout, Hammer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TRIBES, type TribeId } from '@/data/tribes';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface Props {
  initial: TribeId;
  onNext: (tribe: TribeId) => void;
  onBack: () => void;
}

const ICON_BY_TRIBE: Record<TribeId, LucideIcon> = {
  guardioes: ShieldCheck,
  recicladores: Recycle,
  cultivadores: Sprout,
  reparadores: Hammer,
};

const TRIBE_ORDER: TribeId[] = ['guardioes', 'recicladores', 'cultivadores', 'reparadores'];

export function OnboardingStepTribe({ initial, onNext, onBack }: Props) {
  const [tribe, setTribe] = useState<TribeId>(initial);

  return (
    <>
      <header className="relative flex items-center justify-between">
        <IconButton
          onClick={onBack}
          aria-label="Voltar"
          size="sm"
          variant="soft"
          icon={<Icon icon={ChevronLeft} size={18} />}
        />
        <p className="t-eyebrow">Sua tribo</p>
        <span className="h-9 w-9" aria-hidden />
      </header>

      <main className="animate-fade-in relative flex flex-1 flex-col gap-5">
        <div className="space-y-2">
          <h1 className="t-display">Escolha sua causa.</h1>
          <p className="t-body text-[var(--text-secondary)] max-w-[34ch]">
            A tribo personaliza o tom das missões sem mudar as regras. Cada pessoa começa por onde consegue agir.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-2">
          {TRIBE_ORDER.map((id) => {
            const def = TRIBES[id];
            const I = ICON_BY_TRIBE[id];
            const active = tribe === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setTribe(id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-active bg-tint-green-3'
                      : 'border-soft bg-tint-1 hover:bg-tint-2'
                  )}
                  aria-pressed={active}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
                      active
                        ? 'bg-[var(--accent-green)] text-[var(--on-primary)]'
                        : 'bg-tint-2 text-[var(--accent-green)]'
                    )}
                  >
                    <Icon icon={I} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="t-title">{def.label}</p>
                    <p className="t-caption">{def.blurb}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="t-micro text-[var(--text-muted)]">
          Piloto inicial em Londrina (PR), com dados abertos e pontos curados.
        </p>
      </main>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => onNext(tribe)}
        rightIcon={<Icon icon={ArrowRight} size={16} />}
      >
        Continuar
      </Button>
    </>
  );
}

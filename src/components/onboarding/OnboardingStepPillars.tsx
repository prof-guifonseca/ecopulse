'use client';

import { ArrowRight, ChevronLeft, MapPin, ScanLine, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PILLARS = [
  {
    icon: ScanLine,
    title: 'Scanner inteligente',
    body: 'Aponte para qualquer produto e veja o impacto ambiental real antes de comprar.',
  },
  {
    icon: MapPin,
    title: 'Mapa de ação',
    body: 'Pontos de coleta, mercados verdes e eventos próximos a você. Um clique até a ação.',
  },
  {
    icon: Users,
    title: 'Tribo viva',
    body: 'Histórias de pessoas reais transformando o cotidiano. Você não caminha sozinho.',
  },
] as const;

export function OnboardingStepPillars({ onNext, onBack }: Props) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--accent-green) 12%, transparent) 0%, transparent 55%)',
        }}
      />

      <header className="relative flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--tint-1)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Icon icon={ChevronLeft} size={18} />
        </button>
        <p className="t-eyebrow">Como funciona</p>
        <span className="h-9 w-9" aria-hidden />
      </header>

      <main
        className="relative flex flex-1 flex-col justify-center gap-7"
        style={{ animation: 'fadeIn 0.5s ease' }}
      >
        <h1 className="t-display leading-[0.95]" style={{ fontSize: '2rem' }}>
          Três gestos. <span className="t-italic-soft">Um caminho.</span>
        </h1>

        <ul className="space-y-4">
          {PILLARS.map((p) => (
            <li
              key={p.title}
              className="flex gap-4 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--tint-green-3)] text-[var(--accent-green)]">
                <Icon icon={p.icon} size={22} strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="t-title">{p.title}</h2>
                <p className="mt-1 t-body-sm">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onNext}
        rightIcon={<Icon icon={ArrowRight} size={16} />}
        className="relative"
      >
        Continuar
      </Button>
    </>
  );
}

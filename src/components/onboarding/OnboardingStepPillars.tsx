'use client';

import { ArrowRight, ChevronLeft, MapPin, ScanLine, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PILLARS = [
  {
    icon: ScanLine,
    title: 'Scanner',
    body: 'Veja o impacto do produto.',
  },
  {
    icon: MapPin,
    title: 'Mapa',
    body: 'Encontre pontos próximos.',
  },
  {
    icon: Users,
    title: 'Comunidade',
    body: 'Acompanhe a turma.',
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
        <IconButton
          onClick={onBack}
          aria-label="Voltar"
          size="sm"
          variant="soft"
          icon={<Icon icon={ChevronLeft} size={18} />}
        />
        <p className="t-eyebrow">Como funciona</p>
        <span className="h-9 w-9" aria-hidden />
      </header>

      <main className="animate-fade-in relative flex flex-1 flex-col justify-center gap-7">
        <h1 className="t-mega">Três gestos.</h1>

        <ul className="space-y-4">
          {PILLARS.map((p) => (
            <li
              key={p.title}
              className="flex gap-4 rounded-[var(--radius-md)] border-soft bg-tint-1 p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-tint-green-3 text-[var(--accent-green)]">
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

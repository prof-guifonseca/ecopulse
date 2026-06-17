'use client';

import { ArrowRight, MapPin, ScanLine, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onNext: () => void;
}

const PROOF_POINTS = [
  { icon: ScanLine, label: 'Produto', value: 'score ambiental' },
  { icon: MapPin, label: 'Cidade', value: 'pontos reais' },
  { icon: Users, label: 'Turma', value: 'ações visíveis' },
] as const;

export function OnboardingStepVision({ onNext }: Props) {
  return (
    <>
      {/* Photographic background — full bleed inside the device shell */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/community/feed/f14-arthur-thomas-trail-cleanup.png"
          alt=""
          fill
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover object-[58%_50%]"
          style={{ filter: 'saturate(1.04)' }}
        />
        <div className="photo-fade absolute inset-0" />
      </div>

      <header className="relative">
        <p className="t-eyebrow">Desafio Liga Jovem</p>
      </header>

      <main className="animate-fade-in relative flex flex-1 flex-col justify-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-black/20 px-3 py-1.5 text-[var(--primary)] backdrop-blur-md">
            <Icon icon={Sparkles} size={14} />
            <span className="t-micro">Protótipo navegável</span>
          </div>
          <h1 className="text-[2.85rem] leading-[0.92] font-black tracking-normal text-[var(--foreground)] sm:text-[3.45rem]">
            EcoPulse
          </h1>
          <p className="t-body max-w-[31ch] text-[var(--text-secondary)]">
            Sustentabilidade na rotina: escaneie produtos, encontre pontos confiáveis e transforme
            ações em impacto.
          </p>
        </div>

        <ul className="grid grid-cols-3 gap-2">
          {PROOF_POINTS.map((item) => (
            <li
              key={item.label}
              className="rounded-[var(--radius-sm)] border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-md"
            >
              <Icon icon={item.icon} size={16} className="text-[var(--primary)]" />
              <p className="t-micro mt-2 text-[var(--foreground)]">{item.label}</p>
              <p className="mt-1 text-[0.66rem] leading-tight font-medium text-[var(--muted-foreground)]">
                {item.value}
              </p>
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

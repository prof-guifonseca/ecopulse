'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { unsplashUrl } from '@/lib/unsplash';

interface Props {
  onNext: () => void;
}

export function OnboardingStepVision({ onNext }: Props) {
  return (
    <>
      {/* Photographic background — full bleed inside the device shell */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={unsplashUrl('forest', { w: 900, h: 1600, q: 70 })}
          alt=""
          fill
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
          style={{ filter: 'blur(2px) saturate(1.05)' }}
        />
        <div className="photo-fade absolute inset-0" />
      </div>

      <header className="relative">
        <p className="t-eyebrow">EcoPulse</p>
      </header>

      <main className="animate-fade-in relative flex flex-1 flex-col justify-end gap-6">
        <div className="space-y-4">
          <h1 className="t-display">Sustentabilidade na rotina.</h1>
          <p className="t-body max-w-[28ch] text-[var(--text-secondary)]">
            Ações simples. Impacto visível.
          </p>
        </div>
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

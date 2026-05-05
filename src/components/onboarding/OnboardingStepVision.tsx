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
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,18,14,0.55) 0%, rgba(10,18,14,0.78) 55%, rgba(10,18,14,0.96) 100%)',
          }}
        />
      </div>

      <header className="relative">
        <p className="t-eyebrow">EcoPulse</p>
      </header>

      <main
        className="relative flex flex-1 flex-col justify-end gap-6"
        style={{ animation: 'fadeIn 0.6s ease' }}
      >
        <div className="space-y-4">
          <h1 className="t-display leading-[0.95]" style={{ fontSize: '2.4rem' }}>
            Sustentabilidade <br />
            <span className="t-italic-soft">que cabe no bolso.</span>
          </h1>
          <p className="t-body max-w-[28ch] text-[var(--text-secondary)]">
            Hábitos reais, recompensas tangíveis. Sem ruído.
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

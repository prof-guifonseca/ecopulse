'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const DEFAULT_NAME = 'Arthur';
const DEFAULT_AVATAR_BASE = 'base2';
const DEFAULT_TRIBE = 'guardioes';

export function OnboardingFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const finishing = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (finishing.current) return;
    if (onboarded) router.replace('/home');
  }, [hydrated, onboarded, router]);

  const start = () => {
    finishing.current = true;
    completeOnboarding({
      name: DEFAULT_NAME,
      avatarBase: DEFAULT_AVATAR_BASE,
      tribe: DEFAULT_TRIBE,
    });
    router.replace('/scanner?welcome=1');
  };

  return (
    <div
      className="device-shell mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col justify-between overflow-hidden px-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-[calc(env(safe-area-inset-top,0px)+28px)] sm:h-[calc(100dvh-3rem)] sm:max-h-[920px] sm:rounded-[var(--radius-shell)]"
    >
      {/* Soft brand halo, centered */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--accent-green) 14%, transparent) 0%, transparent 55%)',
        }}
      />

      <header className="relative">
        <p className="t-eyebrow">EcoPulse</p>
      </header>

      <main className="relative flex flex-1 flex-col items-start justify-center gap-7" style={{ animation: 'fadeIn 0.55s ease' }}>
        <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--tint-1)]">
          <Avatar baseId={DEFAULT_AVATAR_BASE} size="xl" />
        </div>

        <div className="space-y-3">
          <h1 className="t-display leading-[0.95]">
            Olá, <span className="t-italic-soft">{DEFAULT_NAME}.</span>
          </h1>
          <p className="t-body max-w-[24ch] text-[var(--text-secondary)]">
            Hábitos sustentáveis com impacto real. Sem ruído.
          </p>
        </div>
      </main>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={start}
        rightIcon={<Icon icon={ArrowRight} size={16} />}
        className="relative"
      >
        Começar
      </Button>
    </div>
  );
}

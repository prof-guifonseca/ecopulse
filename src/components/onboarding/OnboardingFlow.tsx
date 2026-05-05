'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Leaf } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const DEFAULT_NAME = 'Suelen';
const DEFAULT_AVATAR_BASE = 'base1';
const DEFAULT_AVATAR_EMOJI = '🌿';
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
      avatar: DEFAULT_AVATAR_EMOJI,
      avatarBase: DEFAULT_AVATAR_BASE,
      tribe: DEFAULT_TRIBE,
    });
    router.replace('/scanner?welcome=1');
  };

  return (
    <div
      className="mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col items-center justify-between bg-[var(--bg-primary)] px-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-[calc(env(safe-area-inset-top,0px)+28px)]"
      style={{ animation: 'fadeIn 0.4s ease' }}
    >
      <header className="flex w-full items-center gap-2">
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Icon icon={Leaf} size={16} strokeWidth={2.2} className="text-[var(--on-primary)]" />
        </span>
        <span className="t-eyebrow">EcoPulse</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div
          className="flex h-44 w-44 items-center justify-center rounded-full border border-[var(--line-soft)]"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, var(--tint-green-2), transparent 65%), var(--bg-secondary)',
          }}
        >
          <Avatar baseId={DEFAULT_AVATAR_BASE} size="xl" />
        </div>

        <div className="space-y-3">
          <h1 className="t-display">Olá, {DEFAULT_NAME}.</h1>
          <p className="t-body-sm max-w-[28ch] text-[var(--text-secondary)]">
            Hábitos sustentáveis com impacto real. Bora começar?
          </p>
        </div>
      </main>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={start}
        rightIcon={<Icon icon={ArrowRight} size={16} />}
      >
        Começar
      </Button>
    </div>
  );
}

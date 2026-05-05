'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { OnboardingStepVision } from './OnboardingStepVision';
import { OnboardingStepPillars } from './OnboardingStepPillars';
import { OnboardingStepName } from './OnboardingStepName';
import { OnboardingDots } from './OnboardingDots';

const DEFAULT_AVATAR_BASE = 'base2';
const DEFAULT_TRIBE = 'guardioes';
const TOTAL_STEPS = 3;

export function OnboardingFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const finishing = useRef(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (finishing.current) return;
    if (onboarded) router.replace('/home');
  }, [hydrated, onboarded, router]);

  const finish = (name: string) => {
    finishing.current = true;
    completeOnboarding({
      name,
      avatarBase: DEFAULT_AVATAR_BASE,
      tribe: DEFAULT_TRIBE,
    });
    router.replace('/scanner?welcome=1');
  };

  return (
    <div className="device-shell mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col justify-between overflow-hidden px-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-[calc(env(safe-area-inset-top,0px)+24px)] sm:h-[calc(100dvh-3rem)] sm:max-h-[920px] sm:rounded-[var(--radius-shell)]">
      {step === 0 ? (
        <OnboardingStepVision onNext={() => setStep(1)} />
      ) : step === 1 ? (
        <OnboardingStepPillars onNext={() => setStep(2)} onBack={() => setStep(0)} />
      ) : (
        <OnboardingStepName
          avatarBase={DEFAULT_AVATAR_BASE}
          onSubmit={finish}
          onBack={() => setStep(1)}
        />
      )}

      <div className="relative mt-4">
        <OnboardingDots total={TOTAL_STEPS} current={step} />
      </div>
    </div>
  );
}

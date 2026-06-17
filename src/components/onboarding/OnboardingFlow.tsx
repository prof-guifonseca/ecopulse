'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { startNewUserSimulation } from '@/simulation/bootstrap';
import type { TribeId } from '@/data/tribes';
import { OnboardingStepVision } from './OnboardingStepVision';
import { OnboardingStepPillars } from './OnboardingStepPillars';
import { OnboardingStepTribe } from './OnboardingStepTribe';
import { OnboardingStepName } from './OnboardingStepName';
import { OnboardingDots } from './OnboardingDots';

const DEFAULT_AVATAR_BASE = 'base2';
const DEFAULT_TRIBE: TribeId = 'guardioes';
const TOTAL_STEPS = 4;

export function OnboardingFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const finishing = useRef(false);
  const [step, setStep] = useState(0);
  const [tribe, setTribe] = useState<TribeId>(DEFAULT_TRIBE);

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
      tribe,
    });
    startNewUserSimulation({ name, tribe });
    router.replace('/scanner?welcome=1');
  };

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[var(--content-width)] flex-col justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-[calc(env(safe-area-inset-bottom,0px)+28px)] sm:px-8">
      {step === 0 ? (
        <OnboardingStepVision onNext={() => setStep(1)} />
      ) : step === 1 ? (
        <OnboardingStepPillars onNext={() => setStep(2)} onBack={() => setStep(0)} />
      ) : step === 2 ? (
        <OnboardingStepTribe
          initial={tribe}
          onNext={(t) => {
            setTribe(t);
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      ) : (
        <OnboardingStepName
          avatarBase={DEFAULT_AVATAR_BASE}
          onSubmit={finish}
          onBack={() => setStep(2)}
        />
      )}

      <div className="relative mt-4">
        <OnboardingDots total={TOTAL_STEPS} current={step} />
      </div>
    </div>
  );
}

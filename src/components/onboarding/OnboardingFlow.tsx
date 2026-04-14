'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { AVATAR_BASES, TRIBES } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { cn } from '@/lib/cn';

const SLIDES = [
  {
    emoji: '🌱',
    title: 'Bem-vindo ao EcoPulse',
    body: 'Transforme hábitos em impacto. Ganhe tokens, suba de nível, mude o mundo.',
  },
  {
    emoji: '📱',
    title: 'Escaneie produtos',
    body: 'Descubra o impacto ambiental do que você consome. Encontre alternativas melhores.',
  },
  {
    emoji: '🏆',
    title: 'Desafios e missões',
    body: 'Missões diárias, desafios semanais e uma comunidade que te apoia.',
  },
];

const TRIBE_IDS = [
  { id: 'guardioes', label: 'Guardiões Verdes', emoji: '🌲' },
  { id: 'warriors', label: 'EcoWarriors', emoji: '⚡' },
];

export function OnboardingFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [baseId, setBaseId] = useState<string>(AVATAR_BASES[0].id);
  const [tribe, setTribe] = useState<string>('guardioes');

  useEffect(() => {
    if (hydrated && onboarded) router.replace('/home');
  }, [hydrated, onboarded, router]);

  if (!hydrated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-bg-primary">
        <div className="animate-pulse text-5xl">🌿</div>
      </div>
    );
  }

  const totalSteps = SLIDES.length + 3; // intro slides + name + avatar + tribe

  const finish = () => {
    completeOnboarding({
      name: name.trim() || 'Eco-User',
      avatar: '🌿',
      avatarBase: baseId,
      tribe,
    });
    router.replace('/home');
  };

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const isSlide = step < SLIDES.length;
  const isNameStep = step === SLIDES.length;
  const isAvatarStep = step === SLIDES.length + 1;
  const isTribeStep = step === SLIDES.length + 2;

  const canProceed = isSlide || (isNameStep && name.trim().length >= 2) || isAvatarStep || isTribeStep;

  return (
    <div className="flex h-[100dvh] flex-col bg-bg-primary" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pt-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              background: i <= step ? 'var(--accent-green)' : 'var(--bg-tertiary)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6">
        {isSlide && (
          <div className="flex max-w-sm flex-col items-center text-center">
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full text-7xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {SLIDES[step].emoji}
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold">{SLIDES[step].title}</h1>
            <p className="mt-3 text-sm text-text-secondary">{SLIDES[step].body}</p>
          </div>
        )}

        {isNameStep && (
          <div className="flex w-full max-w-sm flex-col items-center text-center">
            <div className="text-6xl">👋</div>
            <h1 className="mt-4 font-display text-2xl font-bold">Como podemos te chamar?</h1>
            <p className="mt-2 text-sm text-text-secondary">Seu nome aparece no perfil e ranking</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              autoFocus
              maxLength={24}
              className="mt-6 w-full rounded-full border border-white/10 bg-bg-tertiary px-5 py-3 text-center text-base outline-none focus:border-accent-green"
            />
          </div>
        )}

        {isAvatarStep && (
          <div className="flex w-full max-w-md flex-col items-center text-center">
            <Avatar baseId={baseId} size="xl" />
            <h1 className="mt-4 font-display text-2xl font-bold">Escolha seu avatar</h1>
            <p className="mt-2 text-sm text-text-secondary">Você pode personalizar depois na aba Perfil</p>
            <div className="mt-6 grid w-full grid-cols-3 gap-3">
              {AVATAR_BASES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBaseId(b.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-md border-2 p-2 transition-colors',
                    baseId === b.id
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-transparent bg-bg-tertiary'
                  )}
                >
                  <Avatar baseId={b.id} size="sm" />
                  <span className="text-[10px] font-medium">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isTribeStep && (
          <div className="flex w-full max-w-sm flex-col items-center text-center">
            <div className="text-6xl">👥</div>
            <h1 className="mt-4 font-display text-2xl font-bold">Escolha sua tribo</h1>
            <p className="mt-2 text-sm text-text-secondary">Compita por XP semanal ao lado de colegas</p>
            <div className="mt-6 grid w-full grid-cols-1 gap-3">
              {TRIBE_IDS.map((t) => {
                const tData = TRIBES.find((x) => x.name.toLowerCase().includes(t.label.toLowerCase().split(' ')[0]));
                return (
                  <button
                    key={t.id}
                    onClick={() => setTribe(t.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                      tribe === t.id
                        ? 'border-accent-green bg-accent-green/10'
                        : 'border-transparent bg-bg-tertiary'
                    )}
                  >
                    <span className="text-4xl">{t.emoji}</span>
                    <div className="flex-1">
                      <div className="font-display text-base font-bold">{t.label}</div>
                      <div className="text-xs text-text-secondary">
                        {tData?.members ?? 0} membros · #{tData?.rank ?? '—'} ranking
                      </div>
                    </div>
                    {tribe === t.id && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 border-t border-white/5 px-6 py-4">
        <button
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-0"
        >
          Voltar
        </button>
        <button
          onClick={next}
          disabled={!canProceed}
          className="flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-50"
          style={{ background: 'var(--gradient-primary)', color: 'var(--bg-primary)' }}
        >
          {step === totalSteps - 1 ? '🌱 Começar' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}

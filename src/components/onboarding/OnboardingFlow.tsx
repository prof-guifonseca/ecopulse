'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { AVATAR_BASES, TRIBES } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/cn';

const INTRO_SLIDES = [
  {
    eyebrow: 'EcoPulse',
    title: 'Rotina com impacto real.',
    body: 'Escaneie produtos, acompanhe seu progresso e descubra escolhas mais conscientes.',
    emoji: '🌿',
    accent: 'mint' as const,
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

  const totalSteps = INTRO_SLIDES.length + 3;
  const intro = step < INTRO_SLIDES.length ? INTRO_SLIDES[step] : null;
  const isNameStep = step === INTRO_SLIDES.length;
  const isAvatarStep = step === INTRO_SLIDES.length + 1;
  const isTribeStep = step === INTRO_SLIDES.length + 2;
  const canProceed = intro !== null || (isNameStep && name.trim().length >= 2) || isAvatarStep || isTribeStep;
  const progress = ((step + 1) / totalSteps) * 100;

  const finish = () => {
    completeOnboarding({
      name: name.trim() || 'Eco-User',
      avatar: '🌿',
      avatarBase: baseId,
      tribe,
    });
    router.replace('/home');
  };

  return (
    <div className="mx-auto flex h-[100svh] w-full max-w-[var(--shell-width)] flex-col gap-3 overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-[calc(env(safe-area-inset-top,0px)+10px)]">
      <div className="shrink-0">
        <div className="font-display text-[0.82rem] font-semibold tracking-[0.08em] text-text-secondary">
          EcoPulse
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progress}%`, background: 'var(--gradient-primary)' }}
          />
        </div>
        <div className="mt-1.5 text-sm text-text-secondary">
          Passo {step + 1} de {totalSteps}
        </div>
      </div>

      <GlassCard
        variant="hud"
        accent={isTribeStep ? 'cyan' : isAvatarStep ? 'mint' : isNameStep ? 'amber' : intro?.accent ?? 'mint'}
        className="min-h-0 flex-1 overflow-hidden px-4 py-4"
      >
        <div className="flex h-full flex-col">
          <div className="overflow-y-auto pr-1">
            {intro ? (
              <div className="space-y-3">
                <div className="hud-label">{intro.eyebrow}</div>
                <h1 className="text-[1.65rem] font-semibold leading-none text-text-primary">{intro.title}</h1>
                <p className="max-w-[24ch] text-sm leading-6 text-text-secondary">{intro.body}</p>
                <div className="flex min-h-[148px] items-end rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(145,216,159,0.12),transparent_50%),rgba(255,255,255,0.03)] px-5 py-4">
                  <div>
                    <div className="text-4xl">{intro.emoji}</div>
                    <p className="mt-3 max-w-[21ch] text-sm leading-6 text-text-secondary">
                      Comece com um perfil claro. Depois, o app deve guiar você sem ruído.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isNameStep ? (
              <div className="space-y-4">
                <div>
                  <div className="hud-label">Seu nome</div>
                  <h1 className="mt-2 text-[1.85rem] font-semibold leading-none text-text-primary">
                    Como você quer aparecer no app?
                  </h1>
                  <p className="mt-3 max-w-[28ch] text-sm leading-6 text-text-secondary">
                    Esse nome será usado nas missões, no ranking e nas conversas da comunidade.
                  </p>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  autoFocus
                  maxLength={24}
                  className="input-shell w-full px-5 py-4 text-lg font-semibold"
                />
              </div>
            ) : null}

            {isAvatarStep ? (
              <div className="space-y-5">
                <div>
                  <div className="hud-label">Seu avatar</div>
                  <h1 className="mt-2 text-[1.85rem] font-semibold leading-none text-text-primary">
                    Escolha uma base para o seu perfil
                  </h1>
                  <p className="mt-3 max-w-[28ch] text-sm leading-6 text-text-secondary">
                    Você pode personalizar depois. O importante agora é começar com uma identidade clara.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="surface surface-panel flex h-44 w-44 items-center justify-center rounded-[30px] bg-white/4">
                    <Avatar baseId={baseId} size="xl" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_BASES.map((base) => (
                    <button
                      key={base.id}
                      onClick={() => setBaseId(base.id)}
                      className={cn(
                        'surface surface-tile flex flex-col items-center gap-3 px-3 py-4 text-center transition-all duration-200',
                        baseId === base.id ? 'border-accent-green/25 bg-accent-green/10' : 'surface-accent-none'
                      )}
                    >
                      <Avatar baseId={base.id} size="sm" />
                      <span className="text-xs font-semibold leading-tight">{base.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {isTribeStep ? (
              <div className="space-y-5">
                <div>
                  <div className="hud-label">Sua tribo</div>
                  <h1 className="mt-2 text-[1.85rem] font-semibold leading-none text-text-primary">
                    Escolha com quem você quer começar
                  </h1>
                  <p className="mt-3 max-w-[28ch] text-sm leading-6 text-text-secondary">
                    A tribo dá contexto ao ranking e ajuda a tornar sua jornada menos solitária.
                  </p>
                </div>

                <div className="space-y-3">
                  {TRIBE_IDS.map((item) => {
                    const tribeData = TRIBES.find((entry) =>
                      entry.name.toLowerCase().includes(item.label.toLowerCase().split(' ')[0])
                    );

                    return (
                      <button
                        key={item.id}
                        onClick={() => setTribe(item.id)}
                        className={cn(
                          'surface surface-tile flex w-full items-center gap-4 px-4 py-4 text-left transition-all duration-200',
                          tribe === item.id ? 'border-white/12 bg-white/8' : 'surface-accent-none'
                        )}
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/6 text-3xl">
                          {item.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-base font-semibold text-text-primary">{item.label}</div>
                          <div className="mt-1 text-sm text-text-secondary">
                            {tribeData?.members ?? 0} membros · #{tribeData?.rank ?? '—'} no ranking
                          </div>
                        </div>
                        {tribe === item.id ? <span className="text-lg text-accent-green">✓</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-text-primary disabled:opacity-35"
            >
              Voltar
            </button>
            <button
              onClick={() => {
                if (step === totalSteps - 1) finish();
                else setStep((current) => current + 1);
              }}
              disabled={!canProceed}
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-bg-primary disabled:opacity-50"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {step === totalSteps - 1 ? 'Entrar no app' : 'Continuar'}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

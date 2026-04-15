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
    title: 'Transforme rotina em impacto real.',
    body: 'Escaneie produtos, acompanhe seu progresso e encontre formas simples de viver com mais consciência.',
    emoji: '🌿',
    accent: 'mint' as const,
  },
  {
    eyebrow: 'Comunidade',
    title: 'Você não precisa fazer isso sozinho.',
    body: 'Missões, histórias, tribos e eventos ajudam a manter constância sem tornar a experiência pesada.',
    emoji: '🤝',
    accent: 'amber' as const,
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
    <div className="mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col px-4 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-[calc(env(safe-area-inset-top,0px)+10px)]">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <div className="hud-label">Boas-vindas</div>
          <div className="text-base font-semibold text-text-primary">
            Passo {step + 1} de {totalSteps}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 34 : 10,
                background: i <= step ? 'var(--accent-green)' : 'rgba(255,255,255,0.14)',
              }}
            />
          ))}
        </div>
      </div>

      <GlassCard
        variant="hud"
        accent={isTribeStep ? 'cyan' : isAvatarStep ? 'mint' : isNameStep ? 'amber' : intro?.accent ?? 'mint'}
        className="min-h-0 flex-1 px-4 py-4"
      >
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {intro ? (
            <>
              <div className="hud-label">{intro.eyebrow}</div>
              <h1 className="mt-2 text-[1.9rem] font-semibold leading-none text-text-primary">{intro.title}</h1>
              <p className="mt-4 text-sm leading-6 text-text-secondary">{intro.body}</p>
              <div className="mt-6 flex min-h-[168px] items-center justify-center rounded-[30px] border border-white/8 bg-white/4 text-7xl">
                {intro.emoji}
              </div>
            </>
          ) : null}

          {isNameStep ? (
            <div className="space-y-4">
              <div>
                <div className="hud-label">Seu nome</div>
                <h1 className="mt-2 text-[1.85rem] font-semibold leading-none text-text-primary">
                  Como você quer aparecer no app?
                </h1>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Esse nome vai aparecer nas missões, no ranking e na comunidade.
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
                  Escolha uma base para seu perfil
                </h1>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Você pode personalizar mais tarde, mas já vale começar com uma presença visual sua.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="surface surface-panel flex h-44 w-44 items-center justify-center rounded-[32px] bg-white/4">
                  <Avatar baseId={baseId} size="xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {AVATAR_BASES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBaseId(b.id)}
                    className={cn(
                      'surface surface-tile flex flex-col items-center gap-3 px-3 py-4 text-center transition-all duration-200',
                      baseId === b.id
                        ? 'surface-accent-mint border-accent-green/25 bg-accent-green/10'
                        : 'surface-accent-none'
                    )}
                  >
                    <Avatar baseId={b.id} size="sm" />
                    <span className="text-xs font-semibold leading-tight">{b.name}</span>
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
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  A tribo define seu ponto de entrada no ranking e ajuda a dar contexto à jornada.
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
                        tribe === item.id
                          ? 'surface-accent-cyan border-white/12 bg-white/8'
                          : 'surface-accent-none'
                      )}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/6 text-3xl">
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

      </GlassCard>

      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
          className="command-pill justify-center disabled:opacity-35"
        >
          Voltar
        </button>
        <button
          onClick={() => {
            if (step === totalSteps - 1) finish();
            else setStep((current) => current + 1);
          }}
          disabled={!canProceed}
          className="rounded-full px-6 py-2.5 text-sm font-bold text-bg-primary disabled:opacity-50"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {step === totalSteps - 1 ? 'Entrar no app' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}

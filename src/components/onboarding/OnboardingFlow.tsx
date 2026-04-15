'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Leaf } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { AVATAR_BASES, TRIBES } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

const INTRO_SLIDES = [
  {
    eyebrow: 'EcoPulse',
    title: 'Rotina com impacto real.',
    body: 'Escaneie produtos, acompanhe seu progresso e descubra escolhas mais conscientes.',
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
    <div className="mx-auto flex h-[100svh] w-full max-w-[var(--shell-width)] flex-col gap-5 overflow-hidden bg-[var(--bg-primary)] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-[calc(env(safe-area-inset-top,0px)+18px)]">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Icon icon={Leaf} size={16} strokeWidth={2.2} className="text-[#0a140e]" />
          </span>
          <span className="display-eyebrow">EcoPulse</span>
        </div>
        <div className="mt-4">
          <ProgressBar value={progress} tone="brand" size="sm" />
          <div className="mt-2 text-[0.78rem] text-text-muted">
            Passo {step + 1} de {totalSteps}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {intro ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-[1.85rem] font-semibold leading-tight text-text-primary">{intro.title}</h1>
                <p className="mt-3 max-w-[32ch] text-[0.95rem] leading-6 text-text-muted">{intro.body}</p>
              </div>
              <div
                className="relative flex min-h-[220px] items-end overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-soft)] px-6 py-6"
                style={{
                  background:
                    'radial-gradient(circle at 30% 20%, rgba(141,219,152,0.2), transparent 55%), linear-gradient(180deg, #182a21, #0e1612)',
                }}
              >
                <div>
                  <div className="text-5xl">🌿</div>
                  <p className="mt-3 max-w-[24ch] text-[0.88rem] leading-5 text-text-muted">
                    Comece com um perfil claro. Depois, o app guia você sem ruído.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isNameStep ? (
            <div className="space-y-5">
              <div>
                <div className="display-eyebrow">Seu nome</div>
                <h1 className="mt-2 text-[1.75rem] font-semibold leading-tight text-text-primary">
                  Como você quer aparecer no app?
                </h1>
                <p className="mt-3 max-w-[32ch] text-[0.9rem] leading-5 text-text-muted">
                  Esse nome aparece em missões, ranking e conversas da comunidade.
                </p>
              </div>
              <div className="input-shell">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  autoFocus
                  maxLength={24}
                  className="w-full bg-transparent px-5 py-4 text-[1.1rem] font-semibold outline-none placeholder:text-text-muted"
                />
              </div>
            </div>
          ) : null}

          {isAvatarStep ? (
            <div className="space-y-5">
              <div>
                <div className="display-eyebrow">Seu avatar</div>
                <h1 className="mt-2 text-[1.75rem] font-semibold leading-tight text-text-primary">
                  Escolha uma base para o seu perfil
                </h1>
                <p className="mt-3 max-w-[32ch] text-[0.9rem] leading-5 text-text-muted">
                  Você personaliza depois. Comece com uma identidade clara.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-white/[0.04]">
                  <Avatar baseId={baseId} size="xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {AVATAR_BASES.map((base) => (
                  <button
                    key={base.id}
                    onClick={() => setBaseId(base.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-3 py-3 text-center transition-all',
                      baseId === base.id
                        ? 'border-[rgba(141,219,152,0.4)] bg-[rgba(141,219,152,0.08)]'
                        : 'border-[var(--line-soft)] bg-white/[0.02] hover:border-[var(--line-strong)]'
                    )}
                  >
                    <Avatar baseId={base.id} size="sm" />
                    <span className="text-[0.72rem] font-semibold leading-tight">{base.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isTribeStep ? (
            <div className="space-y-5">
              <div>
                <div className="display-eyebrow">Sua tribo</div>
                <h1 className="mt-2 text-[1.75rem] font-semibold leading-tight text-text-primary">
                  Escolha com quem você quer começar
                </h1>
                <p className="mt-3 max-w-[32ch] text-[0.9rem] leading-5 text-text-muted">
                  A tribo dá contexto ao ranking e companhia na jornada.
                </p>
              </div>

              <div className="space-y-3">
                {TRIBE_IDS.map((item) => {
                  const tribeData = TRIBES.find((entry) =>
                    entry.name.toLowerCase().includes(item.label.toLowerCase().split(' ')[0])
                  );
                  const selected = tribe === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setTribe(item.id)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-[var(--radius-md)] border px-4 py-4 text-left transition-all',
                        selected
                          ? 'border-[rgba(141,219,152,0.4)] bg-[rgba(141,219,152,0.08)]'
                          : 'border-[var(--line-soft)] bg-white/[0.02] hover:border-[var(--line-strong)]'
                      )}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--line-soft)] bg-white/[0.04] text-2xl">
                        {item.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.95rem] font-semibold text-text-primary">{item.label}</div>
                        <div className="mt-0.5 text-[0.78rem] text-text-muted">
                          {tribeData?.members ?? 0} membros · #{tribeData?.rank ?? '—'} no ranking
                        </div>
                      </div>
                      {selected ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-[#0a140e]">
                          <Icon icon={Check} size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            Voltar
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!canProceed}
            rightIcon={<Icon icon={ArrowRight} size={16} />}
            onClick={() => {
              if (step === totalSteps - 1) finish();
              else setStep((current) => current + 1);
            }}
          >
            {step === totalSteps - 1 ? 'Entrar no app' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { AVATAR_BASES, TRIBES } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/cn';

const SLIDES = [
  {
    emoji: '🌱',
    eyebrow: 'Boot Sequence',
    title: 'Bem-vindo ao EcoPulse',
    body: 'Transforme hábitos em impacto. Ganhe tokens, suba de nível, mude o mundo.',
    detail: 'Entre em uma rede eco-cyberpunk de missões, escaneamento e colaboração.',
    accent: 'mint' as const,
  },
  {
    emoji: '📱',
    eyebrow: 'Scan Layer',
    title: 'Escaneie produtos',
    body: 'Descubra o impacto ambiental do que você consome. Encontre alternativas melhores.',
    detail: 'Leia score, compare escolhas e transforme consumo em inteligência tática.',
    accent: 'cyan' as const,
  },
  {
    emoji: '🏆',
    eyebrow: 'Faction Loop',
    title: 'Desafios e missões',
    body: 'Missões diárias, desafios semanais e uma comunidade que te apoia.',
    detail: 'Suba no ranking, desbloqueie colecionáveis e acumule presença na sua tribo.',
    accent: 'violet' as const,
  },
];

const TRIBE_IDS = [
  { id: 'guardioes', label: 'Guardiões Verdes', emoji: '🌲' },
  { id: 'warriors', label: 'EcoWarriors', emoji: '⚡' },
];

const STEP_LABELS = ['Intro', 'Scan', 'Loop', 'ID', 'Avatar', 'Faction'];

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
      <div className="flex h-[100dvh] items-center justify-center bg-bg-primary px-4">
        <GlassCard variant="hud" accent="mint" className="flex min-w-[280px] max-w-md flex-col items-center gap-3 px-8 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 text-5xl">
            🌿
          </div>
          <div className="hud-label">launching eco pulse</div>
          <div className="font-display text-2xl font-bold">Preparando ambiente</div>
        </GlassCard>
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
  const activeSlide = isSlide ? SLIDES[step] : null;

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-bg-primary" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[38vh] bg-[radial-gradient(circle_at_top,rgba(54,215,255,0.14),transparent_58%)]" />
        <div className="absolute bottom-0 right-0 h-[42vh] w-[50vw] bg-[radial-gradient(circle,rgba(171,139,255,0.12),transparent_64%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="hud-label">eco pulse // onboarding</div>
            <div className="font-display text-lg font-bold sm:text-xl">{STEP_LABELS[step]}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 36 : 10,
                  background: i <= step ? 'var(--accent-green)' : 'rgba(147, 180, 215, 0.16)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-6">
          <GlassCard
            variant="hud"
            accent={isTribeStep ? 'violet' : isAvatarStep ? 'cyan' : isNameStep ? 'amber' : activeSlide?.accent ?? 'mint'}
            className="flex min-h-[0] flex-col justify-between px-5 py-5 sm:px-8 sm:py-7 lg:min-h-[620px]"
          >
            <div className="space-y-4">
              <div className="command-pill w-fit" data-active="true">
                <span>{String(step + 1).padStart(2, '0')}</span>
                <span>de {String(totalSteps).padStart(2, '0')}</span>
              </div>
              {isSlide ? (
                <>
                  <div className="hud-label">{activeSlide?.eyebrow}</div>
                  <h1 className="max-w-[12ch] font-display text-4xl font-bold leading-none sm:text-5xl lg:text-6xl">
                    {activeSlide?.title}
                  </h1>
                  <p className="max-w-xl text-base text-text-secondary sm:text-lg">{activeSlide?.body}</p>
                  <p className="max-w-lg text-sm text-text-muted sm:text-base">{activeSlide?.detail}</p>
                </>
              ) : null}
              {isNameStep ? (
                <>
                  <div className="hud-label">Identity Signal</div>
                  <h1 className="max-w-[12ch] font-display text-4xl font-bold leading-none sm:text-5xl">
                    Como devemos chamar você no grid?
                  </h1>
                  <p className="max-w-lg text-base text-text-secondary">
                    Esse nome aparece em ranking, comentários, progressão e eventos da tribo.
                  </p>
                </>
              ) : null}
              {isAvatarStep ? (
                <>
                  <div className="hud-label">Visual Signature</div>
                  <h1 className="max-w-[12ch] font-display text-4xl font-bold leading-none sm:text-5xl">
                    Escolha a silhueta do seu operador.
                  </h1>
                  <p className="max-w-lg text-base text-text-secondary">
                    O avatar vira sua presença no mapa, nos desafios e na vitrine do perfil.
                  </p>
                </>
              ) : null}
              {isTribeStep ? (
                <>
                  <div className="hud-label">Faction Select</div>
                  <h1 className="max-w-[12ch] font-display text-4xl font-bold leading-none sm:text-5xl">
                    Defina sua facção principal.
                  </h1>
                  <p className="max-w-lg text-base text-text-secondary">
                    Cada tribo compete por XP semanal e define seu ponto de apoio no ecossistema.
                  </p>
                </>
              ) : null}
            </div>

            <div className="mt-6 flex flex-1 items-center justify-center lg:mt-10">
              {isSlide ? (
                <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] sm:h-[360px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_60%)]" />
                  <div className="absolute h-[58%] w-[58%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(255,255,255,0.04)_58%,transparent_72%)] blur-2xl" />
                  <div
                    className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/12 text-7xl shadow-[0_0_60px_rgba(54,215,255,0.16)] sm:h-56 sm:w-56 sm:text-8xl"
                    style={{
                      background:
                        activeSlide?.accent === 'violet'
                          ? 'var(--gradient-purple)'
                          : activeSlide?.accent === 'cyan'
                          ? 'linear-gradient(135deg, #1f6dff 0%, #36d7ff 100%)'
                          : 'var(--gradient-primary)',
                    }}
                  >
                    {activeSlide?.emoji}
                  </div>
                </div>
              ) : null}

              {isNameStep ? (
                <div className="grid w-full gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Perfil', value: 'Pilot ID' },
                    { label: 'Ranking', value: 'Visible' },
                    { label: 'Chat', value: 'Ready' },
                  ].map((item) => (
                    <GlassCard key={item.label} variant="ghost" className="px-4 py-5 text-center">
                      <div className="hud-label">{item.label}</div>
                      <div className="mt-2 font-display text-xl font-bold">{item.value}</div>
                    </GlassCard>
                  ))}
                </div>
              ) : null}

              {isAvatarStep ? (
                <div className="flex w-full justify-center">
                  <div className="surface surface-panel surface-accent-cyan flex w-full max-w-md flex-col items-center gap-5 px-6 py-8 text-center">
                    <div className="flex h-44 w-44 items-center justify-center rounded-[32px] border border-white/10 bg-white/4 shadow-[0_0_60px_rgba(54,215,255,0.12)]">
                      <Avatar baseId={baseId} size="xl" />
                    </div>
                    <div>
                      <div className="hud-label">active profile render</div>
                      <div className="mt-2 font-display text-2xl font-bold">
                        {AVATAR_BASES.find((avatarBase) => avatarBase.id === baseId)?.name ?? 'Eco Explorer'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {isTribeStep ? (
                <div className="grid w-full gap-3 sm:grid-cols-2">
                  {TRIBE_IDS.map((item) => {
                    const active = tribe === item.id;
                    const tribeData = TRIBES.find((entry) =>
                      entry.name.toLowerCase().includes(item.label.toLowerCase().split(' ')[0])
                    );

                    return (
                      <GlassCard
                        key={item.id}
                        variant="tile"
                        accent={active ? 'violet' : 'none'}
                        className={cn(
                          'px-5 py-6 text-left transition-transform duration-200',
                          active && 'translate-y-[-4px] shadow-[0_0_40px_rgba(171,139,255,0.18)]'
                        )}
                      >
                        <div className="text-5xl">{item.emoji}</div>
                        <div className="mt-4 font-display text-2xl font-bold">{item.label}</div>
                        <div className="mt-2 text-sm text-text-secondary">
                          {tribeData?.members ?? 0} membros · #{tribeData?.rank ?? '—'} no ranking.
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </GlassCard>

          <GlassCard
            variant="panel"
            accent={isTribeStep ? 'violet' : isAvatarStep ? 'cyan' : isNameStep ? 'amber' : activeSlide?.accent ?? 'mint'}
            className="flex min-h-[0] flex-col justify-between px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="space-y-5">
              <div>
                <div className="hud-label">mission console</div>
                <div className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {isSlide && 'Preparar o operador para o grid'}
                  {isNameStep && 'Registrar sua assinatura'}
                  {isAvatarStep && 'Fixar identidade visual'}
                  {isTribeStep && 'Conectar-se a uma facção'}
                </div>
                <p className="mt-2 text-sm text-text-secondary sm:text-base">
                  {isSlide && 'Leia o briefing, entenda a dinâmica do app e avance para desbloquear seu terminal pessoal.'}
                  {isNameStep && 'Use pelo menos dois caracteres para um identificador legível em toda a experiência.'}
                  {isAvatarStep && 'Escolha um base avatar agora. As customizações adicionais seguem disponíveis no Perfil.'}
                  {isTribeStep && 'A escolha pode evoluir depois, mas já define o seu ponto de entrada competitivo.'}
                </p>
              </div>

              {isNameStep ? (
                <div className="space-y-3">
                  <div className="hud-label">display name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome de operador…"
                    autoFocus
                    maxLength={24}
                    className="input-shell w-full px-5 py-4 text-lg font-semibold"
                  />
                  <div className="text-sm text-text-muted">Exemplo: Guilh, EcoRunner, VerdePrime.</div>
                </div>
              ) : null}

              {isAvatarStep ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {AVATAR_BASES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBaseId(b.id)}
                      className={cn(
                        'surface surface-tile flex flex-col items-center gap-3 px-3 py-4 text-center transition-all duration-200',
                        baseId === b.id
                          ? 'surface-accent-cyan border-accent-cyan/30 bg-accent-cyan/10 shadow-[0_0_30px_rgba(54,215,255,0.16)]'
                          : 'surface-accent-none'
                      )}
                    >
                      <Avatar baseId={b.id} size="sm" />
                      <span className="text-xs font-semibold leading-tight">{b.name}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {isTribeStep ? (
                <div className="grid gap-3">
                  {TRIBE_IDS.map((t) => {
                    const tData = TRIBES.find((x) =>
                      x.name.toLowerCase().includes(t.label.toLowerCase().split(' ')[0])
                    );

                    return (
                      <button
                        key={t.id}
                        onClick={() => setTribe(t.id)}
                        className={cn(
                          'surface surface-panel flex items-center gap-4 px-4 py-4 text-left transition-all duration-200',
                          tribe === t.id
                            ? 'surface-accent-violet border-accent-purple/25 bg-accent-purple/10 shadow-[0_0_36px_rgba(171,139,255,0.14)]'
                            : 'surface-accent-none'
                        )}
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-3xl">
                          {t.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-lg font-bold">{t.label}</div>
                          <div className="text-sm text-text-secondary">
                            {tData?.members ?? 0} membros · #{tData?.rank ?? '—'} no ranking semanal
                          </div>
                        </div>
                        {tribe === t.id ? <span className="text-xl text-accent-purple">✓</span> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {isSlide ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Scanner', value: 'Live Score' },
                    { label: 'Missões', value: 'Daily Loop' },
                    { label: 'Tribos', value: 'Weekly XP' },
                  ].map((item, index) => (
                    <GlassCard
                      key={item.label}
                      variant="ghost"
                      accent={index === 0 ? 'cyan' : index === 1 ? 'mint' : 'violet'}
                      className="px-4 py-5"
                    >
                      <div className="hud-label">{item.label}</div>
                      <div className="mt-2 font-display text-xl font-bold">{item.value}</div>
                    </GlassCard>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <div className="hud-divider" />
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <span className="command-pill">{step < totalSteps - 1 ? 'Next Objective' : 'System Ready'}</span>
                <span>{step < totalSteps - 1 ? STEP_LABELS[step + 1] : 'Iniciar Terminal'}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard variant="hud" accent="mint" className="mt-4 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className="command-pill justify-center disabled:opacity-0 sm:min-w-[130px]"
            >
              Voltar
            </button>
            <button
              onClick={next}
              disabled={!canProceed}
              className="rounded-full bg-[var(--gradient-primary)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-bg-primary shadow-[0_0_26px_rgba(54,215,255,0.28)] transition-transform duration-200 disabled:opacity-50"
            >
              {step === totalSteps - 1 ? 'Comecar' : 'Continuar'}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

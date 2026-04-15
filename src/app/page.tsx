import Link from 'next/link';

const DEMO_STEPS = [
  { label: 'Rotina guiada', body: 'A primeira tela já apresenta a ação principal, sem forçar leitura de dashboard.' },
  { label: 'Scanner hero', body: 'A demo abre a ficha do produto em um gesto e transforma a análise em espetáculo controlado.' },
  { label: 'Mapa vivo', body: 'Locais e eventos aparecem como próximos passos claros, não como blocos competindo por atenção.' },
];

export default function Index() {
  return (
    <main className="phone-stage-shell min-h-[100dvh]">
      <div className="phone-stage relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(145,216,159,0.16),transparent_34%),radial-gradient(circle_at_78%_74%,rgba(213,187,123,0.14),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />

        <div className="relative flex h-full flex-col justify-between px-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-[calc(env(safe-area-inset-top,0px)+28px)]">
          <section>
            <p className="font-display text-[0.84rem] font-semibold tracking-[0.08em] text-text-secondary">
              EcoPulse demo prototype
            </p>
            <div className="mt-8 max-w-[18ch]">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.74rem] font-medium text-text-secondary">
                Showcase mobile-first
              </div>
              <h1 className="mt-5 font-display text-[3.4rem] font-semibold leading-[0.86] tracking-[-0.06em] text-text-primary">
                EcoPulse
              </h1>
              <p className="mt-4 text-[1rem] leading-7 text-text-secondary">
                Um protótipo demonstrativo para apresentar escaneamento, descoberta local e impacto pessoal em um fluxo vertical único.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {DEMO_STEPS.map((item, index) => (
                <article
                  key={item.label}
                  className="rounded-[24px] border border-white/8 bg-white/[0.045] px-4 py-4 backdrop-blur-md"
                >
                  <div className="text-[0.75rem] font-medium text-text-secondary">0{index + 1}</div>
                  <h2 className="mt-2 text-[1.02rem] font-semibold text-text-primary">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,25,21,0.96),rgba(10,15,13,0.94))] p-5 shadow-[0_28px_80px_rgba(1,8,5,0.36)]">
            <p className="text-[0.78rem] font-medium text-text-secondary">Entrada oficial da demo</p>
            <p className="mt-2 max-w-[24ch] text-sm leading-6 text-text-secondary">
              Entre direto no shell de apresentação ou visite o onboarding como fluxo auxiliar.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/home?demo=1"
                className="flex min-h-12 items-center justify-center rounded-full bg-[var(--gradient-primary)] px-5 text-sm font-semibold text-bg-primary shadow-[0_18px_34px_rgba(145,216,159,0.16)] transition-transform duration-200 hover:translate-y-[-1px]"
              >
                Entrar no protótipo
              </Link>
              <Link
                href="/onboarding"
                className="flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-white/8"
              >
                Ver onboarding secundário
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

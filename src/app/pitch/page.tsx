import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  MapPin,
  PiggyBank,
  ScanLine,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

const PITCH_BLOCKS: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: ScanLine,
    title: 'Problema',
    body: 'Escolhas sustentáveis exigem pesquisa demais: rótulo, descarte, reparo e alternativas ficam espalhados.',
  },
  {
    icon: Sparkles,
    title: 'Solução',
    body: 'O EcoPulse junta scanner, mapa ESG e comunidade em uma rotina gamificada de 3 ações.',
  },
  {
    icon: BadgeCheck,
    title: 'Protótipo',
    body: 'App navegável com Open Food Facts, OpenStreetMap, pontos curados de Londrina, missões e badges.',
  },
  {
    icon: PiggyBank,
    title: 'Viabilidade',
    body: 'Piloto gratuito em escolas, com expansão por parcerias locais, comércio sustentável e programas ESG.',
  },
];

const CRITERIA = ['Público-alvo', 'Inovação', 'Impacto', 'Viabilidade', 'Protótipo'];

const FLOW = [
  { time: '0:00', label: 'Dor', text: 'informação ambiental dispersa' },
  { time: '1:00', label: 'Demo', text: 'scan real e score do produto' },
  { time: '2:10', label: 'Cidade', text: 'mapa com fonte e confiança' },
  { time: '3:20', label: 'Engaja', text: 'missões, feed e recompensas' },
  { time: '4:20', label: 'Escala', text: 'escolas e parceiros locais' },
];

export default function PitchPage() {
  return (
    <main className="h-[100dvh] overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="relative min-h-[100dvh] overflow-hidden px-5 py-5 sm:px-8 lg:px-10">
        <Image
          src="/community/feed/f14-arthur-thomas-trail-cleanup.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_50%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,10,0.96)_0%,rgba(3,7,10,0.82)_48%,rgba(3,7,10,0.18)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(114,211,118,0.20),transparent_30%)]"
        />

        <div className="relative mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-6xl flex-col">
          <header className="flex items-center justify-between gap-4">
            <Link href="/onboarding" className="flex items-center gap-2.5" aria-label="Abrir EcoPulse">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-white/[0.15] bg-white/[0.08] text-[var(--accent-green)] backdrop-blur-md">
                <Icon icon={Leaf} size={18} />
              </span>
              <span className="text-sm font-black leading-none">EcoPulse</span>
            </Link>
            <span className="rounded-full border border-white/[0.15] bg-white/[0.08] px-3 py-1.5 t-micro text-[var(--text-secondary)] backdrop-blur-md">
              Pitch de 5 minutos
            </span>
          </header>

          <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-2xl">
              <p className="t-eyebrow text-[var(--accent-green)]">Meio ambiente e sustentabilidade</p>
              <h1 className="mt-4 text-[3.6rem] font-black leading-[0.92] tracking-normal text-[var(--text-primary)] sm:text-[4.7rem]">
                EcoPulse
              </h1>
              <p className="mt-5 max-w-[38rem] text-lg font-medium leading-relaxed text-[var(--text-secondary)]">
                Um app educacional que transforma escolhas sustentáveis em ações simples, mensuráveis e compartilháveis.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {CRITERIA.map((criterion) => (
                  <span
                    key={criterion}
                    className="rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 t-micro text-[var(--text-secondary)] backdrop-blur-md"
                  >
                    {criterion}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/onboarding"
                  className="gradient-primary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-5 text-sm font-bold text-[var(--on-primary)] transition-all duration-200 hover:brightness-105"
                >
                  Abrir protótipo
                  <Icon icon={ArrowRight} size={16} />
                </Link>
                <a
                  href="#roteiro"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-white/[0.16] bg-white/[0.08] px-5 text-sm font-bold text-[var(--text-primary)] backdrop-blur-md transition-colors duration-200 hover:bg-white/[0.12]"
                >
                  Ver roteiro
                </a>
              </div>
            </div>

            <aside className="rounded-[var(--radius-lg)] border border-white/[0.12] bg-black/[0.28] p-5 backdrop-blur-xl">
              <p className="t-eyebrow text-[var(--accent-green)]">Roteiro da fala</p>
              <ol className="mt-4 space-y-3">
                {FLOW.map((item) => (
                  <li key={item.time} className="grid grid-cols-[3.2rem_minmax(0,1fr)] gap-3">
                    <span className="rounded-[var(--radius-xs)] border border-white/[0.12] bg-white/[0.08] px-2 py-1 text-center t-micro text-[var(--accent-gold)]">
                      {item.time}
                    </span>
                    <div>
                      <p className="t-micro text-[var(--text-primary)]">{item.label}</p>
                      <p className="mt-1 t-caption">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>

          <div id="roteiro" className="grid gap-3 pb-3 sm:grid-cols-2 lg:grid-cols-4">
            {PITCH_BLOCKS.map((block) => (
              <article
                key={block.title}
                className="rounded-[var(--radius-md)] border border-white/[0.12] bg-black/[0.24] p-4 backdrop-blur-xl"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-tint-green-2 text-[var(--accent-green)]">
                  <Icon icon={block.icon} size={17} />
                </span>
                <h2 className="mt-4 t-title">{block.title}</h2>
                <p className="mt-2 t-body-sm">{block.body}</p>
              </article>
            ))}
          </div>

          <footer className="grid gap-2 border-t border-white/[0.10] py-4 text-[var(--text-secondary)] sm:grid-cols-3">
            <p className="flex items-center gap-2 t-caption">
              <Icon icon={ScanLine} size={13} className="text-[var(--accent-green)]" />
              Scanner com Open Food Facts
            </p>
            <p className="flex items-center gap-2 t-caption">
              <Icon icon={MapPin} size={13} className="text-[var(--accent-cyan)]" />
              Mapa ESG de Londrina
            </p>
            <p className="flex items-center gap-2 t-caption">
              <Icon icon={Users} size={13} className="text-[var(--accent-gold)]" />
              Comunidade e missões diárias
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

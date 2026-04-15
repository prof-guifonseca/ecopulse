'use client';

import { TOKEN_PACKS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { GlassCard } from '@/components/shared/GlassCard';
import { Modal } from './Modal';

interface Props {
  packId?: string;
}

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const EXPLANATION_STEPS = [
  {
    title: 'Jogue',
    icon: '🎯',
    text: 'Continue ganhando EcoTokens por missões, desafios, scanner e ações cooperativas dentro do app.',
  },
  {
    title: 'Acelere',
    icon: '🪙',
    text: 'Quando o checkout real entrar no ar, os tokens comprados vão cair no mesmo saldo usado na loja e nos boosts.',
  },
  {
    title: 'Impacte',
    icon: '🌍',
    text: '20% de cada compra compõem o Fundo EcoPulse para OSCs auditadas e alinhadas aos 17 ODS.',
  },
] as const;

export function GreenMarketInfoModal({ packId }: Props) {
  const closeModal = useUIStore((s) => s.closeModal);
  const selectedPack = TOKEN_PACKS.find((pack) => pack.id === packId);

  return (
    <Modal onClose={closeModal} variant="center">
      <div className="space-y-5">
        <div>
          <div className="hud-label">mercado verde</div>
          <h3 className="mt-2 font-display text-3xl font-bold">Como os EcoTokens pagos entram no jogo</h3>
          <p className="mt-3 text-sm text-text-secondary">
            Esta primeira versão é de conteúdo e transparência. Não existe checkout nem crédito real de saldo ainda.
          </p>
        </div>

        {selectedPack ? (
          <GlassCard variant="ghost" accent={selectedPack.featured ? 'amber' : 'mint'} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-display text-2xl font-bold">{selectedPack.name}</div>
                <div className="mt-1 text-sm text-text-secondary">{selectedPack.description}</div>
              </div>
              <span className="command-pill" data-active="true">
                {selectedPack.badge}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InfoMetric label="EcoTokens" value={`${selectedPack.tokens}`} accent="var(--accent-gold)" />
              <InfoMetric label="Preço futuro" value={PRICE_FORMATTER.format(selectedPack.priceInCents / 100)} accent="var(--accent-cyan)" />
              <InfoMetric label="Fundo verde" value={PRICE_FORMATTER.format(selectedPack.fundShareInCents / 100)} accent="var(--accent-green)" />
            </div>
          </GlassCard>
        ) : null}

        <div className="grid gap-3">
          {EXPLANATION_STEPS.map((step, index) => (
            <GlassCard
              key={step.title}
              variant="ghost"
              accent={index === 0 ? 'cyan' : index === 1 ? 'amber' : 'mint'}
              className="px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                  {step.icon}
                </div>
                <div>
                  <div className="font-display text-xl font-bold">{step.title}</div>
                  <p className="mt-1 text-sm text-text-secondary">{step.text}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard variant="panel" accent="violet" className="px-4 py-4">
          <div className="hud-label">regras desta fase</div>
          <div className="mt-3 grid gap-2 text-sm text-text-secondary">
            <p>O saldo continua único: tokens ganhos e tokens pagos convivem na mesma economia.</p>
            <p>A escolha das OSCs não é individual nesta etapa; o repasse é feito por fundo curado.</p>
            <p>Os critérios de validação ficam públicos no app antes da entrada do checkout real.</p>
          </div>
        </GlassCard>

        <button
          type="button"
          onClick={closeModal}
          className="w-full rounded-full py-3 text-sm font-bold text-bg-primary"
          style={{ background: 'var(--gradient-primary)' }}
        >
          Entendi
        </button>
      </div>
    </Modal>
  );
}

function InfoMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-3 py-3">
      <div className="hud-label">{label}</div>
      <div className="mt-2 font-display text-xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

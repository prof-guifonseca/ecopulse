'use client';

import { Coins, Globe2, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TOKEN_PACKS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';

interface Props {
  packId?: string;
}

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const EXPLANATION_STEPS: Array<{ title: string; icon: LucideIcon; text: string }> = [
  {
    title: 'Jogue',
    icon: Target,
    text: 'Continue ganhando EcoTokens por missões, desafios, scanner e ações cooperativas.',
  },
  {
    title: 'Acelere',
    icon: Coins,
    text: 'Quando o checkout real entrar, os tokens comprados caem no mesmo saldo da loja.',
  },
  {
    title: 'Impacte',
    icon: Globe2,
    text: '20% de cada compra compõem o Fundo EcoPulse, destinado a OSCs auditadas.',
  },
];

export function GreenMarketInfoModal({ packId }: Props) {
  const closeModal = useUIStore((s) => s.closeModal);
  const selectedPack = TOKEN_PACKS.find((pack) => pack.id === packId);

  return (
    <ModalShell eyebrow="Mercado Verde" title="Como os EcoTokens pagos entram no jogo" variant="center">
      <div className="space-y-5">
        <p className="text-[0.88rem] leading-5 text-text-muted">
          Esta primeira versão é de conteúdo e transparência. Não existe checkout nem crédito real de saldo ainda.
        </p>

        {selectedPack ? (
          <Card tone="soft" accent={selectedPack.featured ? 'reward' : 'brand'} padded={false} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[1.05rem] font-semibold text-text-primary">{selectedPack.name}</div>
                <div className="mt-1 text-[0.85rem] text-text-muted">{selectedPack.description}</div>
              </div>
              <span className="command-pill shrink-0" data-active="true">
                {selectedPack.badge}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <InfoMetric label="Tokens" value={`${selectedPack.tokens}`} />
              <InfoMetric label="Preço" value={PRICE_FORMATTER.format(selectedPack.priceInCents / 100)} />
              <InfoMetric label="Fundo" value={PRICE_FORMATTER.format(selectedPack.fundShareInCents / 100)} />
            </div>
          </Card>
        ) : null}

        <div className="space-y-3">
          {EXPLANATION_STEPS.map((step) => (
            <Card key={step.title} tone="solid" padded={false} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(141,219,152,0.12)] text-accent-green">
                  <Icon icon={step.icon} size={18} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[0.98rem] font-semibold text-text-primary">{step.title}</div>
                  <p className="mt-1 text-[0.85rem] leading-5 text-text-muted">{step.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card tone="soft" padded={false} className="px-4 py-4">
          <div className="display-eyebrow mb-2">Regras desta fase</div>
          <div className="space-y-1.5 text-[0.85rem] leading-5 text-text-muted">
            <p>• O saldo é único: tokens ganhos e tokens pagos convivem na mesma economia.</p>
            <p>• A escolha das OSCs não é individual; o repasse é feito por fundo curado.</p>
            <p>• Os critérios de validação ficam públicos no app antes do checkout real.</p>
          </div>
        </Card>

        <Button variant="primary" size="lg" fullWidth onClick={closeModal}>
          Entendi
        </Button>
      </div>
    </ModalShell>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.03] px-3 py-3">
      <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">{label}</div>
      <div className="mt-1.5 text-[0.92rem] font-semibold text-text-primary">{value}</div>
    </div>
  );
}

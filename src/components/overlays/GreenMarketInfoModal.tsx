'use client';

import { Coins, Globe2, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TOKEN_PACKS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Tile } from '@/components/ui/Tile';
import { IconTile } from '@/components/ui/IconTile';
import { Chip } from '@/components/ui/Chip';
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
    text: 'Ganhe Eco-Tokens em missões, desafios, scanner e ações na comunidade.',
  },
  {
    title: 'Acelere',
    icon: Coins,
    text: 'Compre packs para abrir recompensas mais rápido. Tudo no mesmo saldo.',
  },
  {
    title: 'Impacte',
    icon: Globe2,
    text: '20% de cada pack vai direto para o Fundo EcoPulse de organizações auditadas.',
  },
];

export function GreenMarketInfoModal({ packId }: Props) {
  const closeModal = useUIStore((s) => s.closeModal);
  const selectedPack = TOKEN_PACKS.find((pack) => pack.id === packId);

  return (
    <ModalShell eyebrow="Loja" title="Como os Eco-Tokens pagos entram no jogo" variant="center">
      <div className="space-y-5">
        {selectedPack ? (
          <Card tone="soft" accent={selectedPack.featured ? 'reward' : 'brand'} padded={false} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="t-title">{selectedPack.name}</div>
                <div className="t-body-sm mt-1">{selectedPack.description}</div>
              </div>
              <Chip asStatic active className="shrink-0">{selectedPack.badge}</Chip>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Tile size="sm" label="Tokens" value={`${selectedPack.tokens}`} />
              <Tile size="sm" label="Preço" value={PRICE_FORMATTER.format(selectedPack.priceInCents / 100)} />
              <Tile size="sm" label="Fundo" value={PRICE_FORMATTER.format(selectedPack.fundShareInCents / 100)} />
            </div>
          </Card>
        ) : null}

        <div className="space-y-3">
          {EXPLANATION_STEPS.map((step) => (
            <Card key={step.title} tone="solid" padded={false} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <IconTile size="md" tone="brand" icon={<Icon icon={step.icon} size={18} strokeWidth={2} />} />
                <div>
                  <div className="t-title">{step.title}</div>
                  <p className="t-body-sm mt-1">{step.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={closeModal}>
          Entendi
        </Button>
      </div>
    </ModalShell>
  );
}

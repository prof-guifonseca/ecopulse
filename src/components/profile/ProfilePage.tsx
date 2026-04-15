'use client';

import { useState } from 'react';
import { Award, Coins, Flame, Pencil, Trophy, Users } from 'lucide-react';
import {
  BADGES,
  IMPACT_FUND_SNAPSHOT,
  IMPACT_PARTNERS,
  LEADERBOARD,
  MARKET_FAQS,
  SHOP_ITEMS,
  TOKEN_PACKS,
  TRIBES,
} from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/shared/Avatar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ImpactRing } from '@/components/shared/ImpactRing';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Stat } from '@/components/ui/Stat';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { gardenStage, GARDEN_LABEL } from '@/lib/garden';
import { cn } from '@/lib/cn';

const PROFILE_TABS = [
  { value: 'impact' as const, label: 'Impacto' },
  { value: 'shop' as const, label: 'Loja' },
  { value: 'badges' as const, label: 'Badges' },
  { value: 'tribos' as const, label: 'Tribos' },
];

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;
const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type TabValue = (typeof PROFILE_TABS)[number]['value'];

export function ProfilePage() {
  const [tab, setTab] = useState<TabValue>('impact');
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const avatarBase = useUserStore((s) => s.avatarBase);
  const avatarOutfits = useUserStore((s) => s.avatarOutfits);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const tribe = useUserStore((s) => s.tribe);
  const badges = useGameStore((s) => s.badges);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const openAvatarBuilder = useUIStore((s) => s.openAvatarBuilder);

  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const stage = gardenStage(level);

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.35s ease' }}>
      <Card tone="hero" padded={false} className="px-5 py-6">
        <div className="flex items-start gap-4">
          <button
            onClick={openAvatarBuilder}
            className="relative rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-white/[0.04] p-3"
            aria-label="Editar avatar"
          >
            <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="xl" />
            <span
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-[#1a130a]"
              style={{ background: 'var(--gradient-gold)' }}
            >
              <Icon icon={Pencil} size={14} strokeWidth={2.4} />
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="display-eyebrow">Seu espaço</div>
            <h1 className="mt-2 text-[1.55rem] font-semibold leading-tight text-text-primary">{name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="command-pill" data-active="true">Nível {level}</span>
              <span className="command-pill">{tribe === 'guardioes' ? 'Guardiões' : 'EcoWarriors'}</span>
              <span className="command-pill">{GARDEN_LABEL[stage]}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Tokens" value={tokens} icon={<Icon icon={Coins} size={13} />} />
          <Stat label="Streak" value={`${streak}d`} icon={<Icon icon={Flame} size={13} />} />
          <Stat label="Badges" value={badges.length} icon={<Icon icon={Award} size={13} />} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[0.8rem]">
            <span className="text-text-muted">Próximo nível</span>
            <span className="font-semibold text-text-secondary">
              {xp}/{xpToNext} XP
            </span>
          </div>
          <ProgressBar value={pct} tone="brand" />
        </div>
      </Card>

      <Tabs items={PROFILE_TABS} value={tab} onChange={setTab} />

      {tab === 'impact' && <ImpactPanel scannedCount={scannedCount} />}
      {tab === 'shop' && <ShopPanel />}
      {tab === 'badges' && <BadgesPanel owned={badges} />}
      {tab === 'tribos' && <TribesPanel currentTribe={tribe} />}
    </div>
  );
}

function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-6">
      <Card tone="solid" accent="brand" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Seu impacto em formação"
          subtitle="Um resumo direto do que suas escolhas já começaram a mover."
        />
        <div className="grid grid-cols-3 gap-3">
          <ImpactMetric pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO2" value={`${co2}kg`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 12)} color="var(--accent-green)" label="Resíduo" value={`${waste}kg`} />
        </div>
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-4 py-3 text-[0.85rem] leading-5 text-text-muted">
          Continue escaneando produtos e concluindo missões para ampliar sua área de impacto e fazer o jardim evoluir.
        </div>
      </Card>

      <Card tone="solid" accent="brand" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Fundo EcoPulse"
          subtitle="Como a lógica de repasse aparece hoje dentro do app."
          right={
            <Button variant="ghost" size="sm" onClick={() => openModal({ kind: 'greenMarketInfo' })}>
              Como funciona
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <FundMetric label="Arrecadado" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)} />
          <FundMetric label="Comprometido" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalCommittedInCents)} />
          <FundMetric label="OSCs apoiadas" value={`${IMPACT_FUND_SNAPSHOT.supportedOrgs}`} />
          <FundMetric label="ODS cobertos" value={`${IMPACT_FUND_SNAPSHOT.coveredSdgs}`} />
          <FundMetric
            label="Último repasse"
            value={formatDateLabel(IMPACT_FUND_SNAPSHOT.lastTransferAt)}
            className="col-span-2"
          />
        </div>

        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-4 py-3 text-[0.82rem] leading-5 text-text-muted">
          20% do valor planejado para cada pack futuro é reservado ao fundo. {IMPACT_FUND_SNAPSHOT.verificationNote}
        </div>
      </Card>

      <section>
        <SectionHeader
          title="Perguntas rápidas"
          subtitle="Respostas curtas para entender o Mercado Verde sem rodeios."
        />
        <div className="space-y-3">
          {MARKET_FAQS.map((item) => (
            <Card key={item.id} tone="solid" padded={false} className="px-4 py-4">
              <div className="text-[0.9rem] font-semibold text-text-primary">{item.question}</div>
              <p className="mt-1.5 text-[0.85rem] leading-5 text-text-muted">{item.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="OSCs em destaque"
          subtitle="Exemplos de como a curadoria de impacto aparece nesta fase."
        />
        <div className="space-y-3">
          {IMPACT_PARTNERS.map((partner) => (
            <Card key={partner.id} tone="solid" padded={false} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[0.95rem] font-semibold text-text-primary">{partner.name}</div>
                  <div className="mt-0.5 text-[0.78rem] text-text-muted">
                    {partner.city}/{partner.state}
                  </div>
                </div>
                <span className="command-pill shrink-0" data-active="true">
                  {partner.verificationStatus}
                </span>
              </div>
              <p className="mt-3 text-[0.85rem] leading-5 text-text-muted">{partner.summary}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function ImpactMetric({
  pct,
  color,
  label,
  value,
}: {
  pct: number;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-2 py-3">
      <ImpactRing pct={pct} color={color} size={80} label={label} value={value} />
    </div>
  );
}

function ShopPanel() {
  const tokens = useUserStore((s) => s.tokens);
  const openModal = useUIStore((s) => s.openModal);
  const owned = useGameStore((s) => s.ownedShopItems);

  return (
    <div className="space-y-6">
      <Card tone="solid" accent="reward" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Mercado Verde"
          subtitle="Mesma moeda, mais clareza sobre impacto."
        />
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Seu saldo" value={tokens} icon={<Icon icon={Coins} size={13} />} />
          <Stat label="Fundo" value="20%" />
          <Stat label="Status" value="Em breve" />
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={() => openModal({ kind: 'greenMarketInfo' })}
        >
          Entender como funciona
        </Button>
      </Card>

      <section>
        <SectionHeader
          title="Packs de EcoTokens"
          subtitle="Veja a lógica comercial antes do checkout real."
        />
        <div className="space-y-3">
          {TOKEN_PACKS.map((pack) => (
            <Card
              key={pack.id}
              tone="solid"
              accent={pack.featured ? 'reward' : 'none'}
              padded={false}
              className="px-5 py-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[1.05rem] font-semibold text-text-primary">{pack.name}</div>
                  <p className="mt-1 text-[0.85rem] leading-5 text-text-muted">{pack.description}</p>
                </div>
                <span className="command-pill shrink-0" data-active={pack.featured ? 'true' : undefined}>
                  {pack.badge}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <PackMetric label="Tokens" value={`${pack.tokens}`} />
                <PackMetric label="Preço" value={formatCurrency(pack.priceInCents)} />
                <PackMetric label="Fundo" value={formatCurrency(pack.fundShareInCents)} />
              </div>
              <Button
                variant={pack.featured ? 'reward' : 'primary'}
                size="md"
                fullWidth
                className="mt-4"
                onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
              >
                Ver detalhes
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Itens já disponíveis"
          subtitle="Os tokens comprados entram no mesmo saldo usado aqui."
        />
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = owned.includes(item.id);
            return (
              <button key={item.id} onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="text-left">
                <Card tone="solid" padded={false} className="flex h-full flex-col gap-3 px-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--line-soft)] bg-white/[0.04] text-2xl">
                    {item.emoji}
                  </div>
                  <div className="text-[0.88rem] font-semibold leading-5 text-text-primary">{item.name}</div>
                  <div className="text-[0.75rem] leading-4 text-text-muted">{item.desc}</div>
                  <div
                    className={cn(
                      'mt-auto inline-flex items-center gap-1 text-[0.82rem] font-semibold',
                      isOwned ? 'text-accent-green' : 'text-accent-gold'
                    )}
                  >
                    {isOwned ? (
                      'Adquirido'
                    ) : (
                      <>
                        <Icon icon={Coins} size={12} />
                        {item.price}
                      </>
                    )}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BadgesPanel({ owned }: { owned: string[] }) {
  return (
    <section>
      <SectionHeader
        title="Badges conquistados"
        subtitle="Suas conquistas aparecem como coleção, não como vitrine."
      />
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((badge) => {
          const unlocked = owned.includes(badge.id);

          return (
            <Card
              key={badge.id}
              tone="solid"
              padded={false}
              className={cn(
                'flex h-full flex-col items-center gap-2.5 px-4 py-4 text-center',
                !unlocked && 'opacity-40 grayscale'
              )}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/[0.04] text-3xl">
                {badge.emoji}
              </div>
              <div className="text-[0.88rem] font-semibold leading-tight text-text-primary">{badge.name}</div>
              <div className="text-[0.72rem] leading-4 text-text-muted">{badge.desc}</div>
              <span className="command-pill justify-center" data-active={unlocked ? 'true' : undefined}>
                {badge.tier}
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function TribesPanel({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="space-y-6">
      <section>
        <SectionHeader
          title="Sua posição na rede"
          subtitle="Entenda sua tribo e o clima competitivo da semana."
        />
        <div className="space-y-3">
          {TRIBES.map((tribe) => {
            const isMine =
              (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
              (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');

            return (
              <Card key={tribe.id} tone="solid" accent={isMine ? 'brand' : 'none'} padded={false} className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--line-soft)] bg-white/[0.04] text-2xl">
                    {tribe.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[0.95rem] font-semibold text-text-primary">{tribe.name}</div>
                      {isMine ? (
                        <span className="command-pill" data-active="true">
                          <Icon icon={Users} size={12} />
                          sua tribo
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[0.78rem] text-text-muted">
                      {tribe.members} membros · #{tribe.rank} no ranking
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card tone="solid" accent="brand" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Ranking da semana"
          subtitle="Quem está puxando a comunidade agora."
        />
        <ol className="space-y-2">
          {LEADERBOARD.slice(0, 10).map((entry) => {
            const isMe = entry.name === 'Você';
            const rankMark = entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`;

            return (
              <li
                key={entry.rank}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5',
                  isMe
                    ? 'border-[rgba(141,219,152,0.32)] bg-[rgba(141,219,152,0.08)]'
                    : 'border-transparent bg-white/[0.02]'
                )}
              >
                <span className="w-8 text-center text-[0.8rem] font-semibold text-text-secondary">{rankMark}</span>
                <span className="text-xl">{entry.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.88rem] font-semibold text-text-primary">{entry.name}</div>
                  <div className="text-[0.72rem] text-text-muted">{entry.tribe}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-accent-gold">
                  <Icon icon={Trophy} size={12} />
                  {entry.xp.toLocaleString('pt-BR')}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

function FundMetric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-3 py-3', className)}>
      <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">{label}</div>
      <div className="mt-1.5 text-[0.95rem] font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function PackMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-3 py-2.5">
      <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">{label}</div>
      <div className="mt-1 text-[0.85rem] font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function formatCurrency(cents: number) {
  return PRICE_FORMATTER.format(cents / 100);
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split('-');
  const monthLabel = MONTH_LABELS[Math.max(0, Number(month) - 1)] ?? month;
  return `${day} ${monthLabel} ${year}`;
}

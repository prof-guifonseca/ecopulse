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
import { Tile } from '@/components/ui/Tile';
import { IconTile } from '@/components/ui/IconTile';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { PageShell } from '@/components/ui/PageShell';
import { resolveIcon } from '@/lib/iconRegistry';
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
    <PageShell>
      {/* Editorial portrait hero — avatar centered, name as a magazine cover */}
      <header className="relative flex flex-col items-center px-4 pb-2 pt-2 text-center">
        <button
          onClick={openAvatarBuilder}
          className="relative h-32 w-32 rounded-full border border-[var(--line-soft)] bg-[var(--tint-1)] p-2"
          aria-label="Editar avatar"
        >
          <span
            aria-hidden
            className="absolute inset-[-6px] rounded-full opacity-70"
            style={{
              background:
                'conic-gradient(from 130deg, color-mix(in srgb, var(--accent-green) 35%, transparent), transparent 35%, color-mix(in srgb, var(--accent-gold) 30%, transparent), transparent 70%)',
            }}
          />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[var(--bg-secondary)]">
            <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />
          </span>
          <span
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-[var(--on-reward)]"
            style={{ background: 'var(--gradient-gold)' }}
          >
            <Icon icon={Pencil} size={14} strokeWidth={2.4} />
          </span>
        </button>

        <p className="t-eyebrow mt-5">Seu espaço</p>
        <h1 className="t-display mt-1.5 leading-[1]">{name}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Chip asStatic active>Nível {level}</Chip>
          <Chip asStatic>{tribe === 'guardioes' ? 'Guardiões' : 'EcoWarriors'}</Chip>
          <Chip asStatic>{GARDEN_LABEL[stage]}</Chip>
        </div>
      </header>

      <Card tone="solid" padded={false} className="px-5 py-5">
        <div className="grid grid-cols-3 gap-2">
          <Tile size="sm" label="Tokens" value={tokens} icon={<Icon icon={Coins} size={13} />} />
          <Tile size="sm" label="Streak" value={`${streak}d`} icon={<Icon icon={Flame} size={13} />} />
          <Tile size="sm" label="Badges" value={badges.length} icon={<Icon icon={Award} size={13} />} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="t-caption">Próximo nível</span>
            <span className="t-caption font-semibold text-[var(--text-secondary)]">
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
    </PageShell>
  );
}

function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-6">
      <Card tone="solid" padded={false} className="px-5 py-5">
        <SectionHeader title="Seu impacto" />
        <div className="grid grid-cols-3 gap-3">
          <ImpactMetric pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO2" value={`${co2}kg`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 12)} color="var(--accent-green)" label="Resíduo" value={`${waste}kg`} />
        </div>
        <p className="t-body-sm mt-4 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-4 py-3">
          Continue escaneando produtos e concluindo missões para ampliar sua área de impacto e fazer o jardim evoluir.
        </p>
      </Card>

      <Card tone="solid" padded={false} className="px-5 py-5">
        <SectionHeader
          title="Fundo EcoPulse"
          right={
            <Button variant="ghost" size="sm" onClick={() => openModal({ kind: 'greenMarketInfo' })}>
              Como funciona
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <Tile size="sm" align="start" label="Arrecadado" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)} />
          <Tile size="sm" align="start" label="Comprometido" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalCommittedInCents)} />
          <Tile size="sm" align="start" label="OSCs apoiadas" value={`${IMPACT_FUND_SNAPSHOT.supportedOrgs}`} />
          <Tile size="sm" align="start" label="ODS cobertos" value={`${IMPACT_FUND_SNAPSHOT.coveredSdgs}`} />
          <Tile
            size="sm"
            align="start"
            label="Último repasse"
            value={formatDateLabel(IMPACT_FUND_SNAPSHOT.lastTransferAt)}
            className="col-span-2"
          />
        </div>

        <p className="t-body-sm mt-4 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-4 py-3">
          20% do valor planejado para cada pack futuro é reservado ao fundo. {IMPACT_FUND_SNAPSHOT.verificationNote}
        </p>
      </Card>

      <details className="group rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-5 py-4 [&[open]>summary>span:last-child]:rotate-90">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 t-title">
          <span>Saiba mais</span>
          <span className="text-[var(--text-muted)] transition-transform duration-200">›</span>
        </summary>

        <div className="mt-5 space-y-6">
          <section>
            <div className="mb-3 t-title">Perguntas rápidas</div>
            <div className="space-y-3">
              {MARKET_FAQS.map((item) => (
                <Card key={item.id} tone="solid" padded={false} className="px-4 py-4">
                  <div className="t-title">{item.question}</div>
                  <p className="t-body-sm mt-1.5">{item.answer}</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 t-title">Organizações apoiadas</div>
            <div className="space-y-3">
              {IMPACT_PARTNERS.map((partner) => (
                <Card key={partner.id} tone="solid" padded={false} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="t-title">{partner.name}</div>
                      <div className="t-caption mt-0.5">
                        {partner.city}/{partner.state}
                      </div>
                    </div>
                    <Chip asStatic active className="shrink-0">{partner.verificationStatus}</Chip>
                  </div>
                  <p className="t-body-sm mt-3">{partner.summary}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </details>
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
    <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-2 py-3">
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
      {/* Wallet hero — single emphatic balance, secondary action only */}
      <Card tone="hero" padded={false} className="px-5 py-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="t-eyebrow">Sua carteira</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="t-display leading-[1] text-[var(--accent-green)]">{tokens}</span>
              <span className="t-body-sm">Eco-Tokens</span>
            </div>
            <p className="t-caption mt-2 max-w-[28ch]">
              20% do que entra em packs vai pro Fundo EcoPulse.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal({ kind: 'greenMarketInfo' })}
          >
            Como funciona
          </Button>
        </div>
      </Card>

      <section>
        <SectionHeader title="Packs de apoio" />
        <div className="space-y-3">
          {TOKEN_PACKS.map((pack) => (
            <Card
              key={pack.id}
              tone="solid"
              accent={pack.featured ? 'reward' : 'none'}
              padded={false}
              className="px-5 py-5"
            >
              {pack.featured ? (
                <p className="t-eyebrow mb-2 text-[var(--accent-gold)]">Mais escolhido</p>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="t-title">{pack.name}</div>
                  <p className="t-body-sm mt-1">{pack.description}</p>
                </div>
                <Chip asStatic active={pack.featured} className="shrink-0">{pack.badge}</Chip>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Tile size="sm" label="Tokens" value={`${pack.tokens}`} />
                <Tile size="sm" label="Preço" value={formatCurrency(pack.priceInCents)} />
                <Tile size="sm" label="Fundo" value={formatCurrency(pack.fundShareInCents)} />
              </div>
              <Button
                variant={pack.featured ? 'reward' : 'secondary'}
                size="md"
                fullWidth
                className="mt-4"
                onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
              >
                Saiba mais
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Itens" />
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = owned.includes(item.id);
            return (
              <button key={item.id} onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="text-left">
                <Card tone="solid" padded={false} className="flex h-full flex-col gap-3 px-4 py-4">
                  <IconTile size="md" icon={<span>{item.emoji}</span>} />
                  <div className="t-title">{item.name}</div>
                  <div className="t-caption">{item.desc}</div>
                  <div
                    className={cn(
                      'mt-auto inline-flex items-center gap-1 t-body-sm font-semibold',
                      isOwned ? 'text-[var(--accent-green)]' : 'text-[var(--accent-gold)]'
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
    <section className="space-y-4">
      <SectionHeader title="Badges conquistados" />
      {owned.length === 0 ? (
        <Card tone="soft" padded={false} className="flex items-start gap-3 px-4 py-4">
          <IconTile size="md" tone="reward" icon={<Icon icon={Trophy} size={20} />} />
          <div className="min-w-0">
            <div className="t-title">Seu primeiro badge tá esperando</div>
            <p className="t-body-sm mt-1">
              Escaneie, complete desafios e construa upcycling pra desbloquear.
            </p>
          </div>
        </Card>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((badge) => {
          const unlocked = owned.includes(badge.id);
          const Lucide = resolveIcon(badge.iconName as never);

          return (
            <Card
              key={badge.id}
              tone="solid"
              padded={false}
              className={cn(
                'flex h-full flex-col items-center gap-2.5 px-4 py-4 text-center',
                !unlocked && 'opacity-40'
              )}
            >
              <IconTile
                size="lg"
                tone={unlocked ? 'brand' : 'default'}
                icon={Lucide ? <Icon icon={Lucide} size={28} /> : <span>{badge.emoji}</span>}
                className="rounded-full"
              />
              <div className="t-title">{badge.name}</div>
              <div className="t-caption leading-4">{badge.desc}</div>
              <Chip asStatic active={unlocked}>{badge.tier}</Chip>
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
        <SectionHeader title="Sua tribo" />
        <div className="space-y-3">
          {TRIBES.map((tribe) => {
            const isMine =
              (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
              (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');
            const Lucide = resolveIcon(tribe.iconName as never);

            return (
              <Card key={tribe.id} tone="solid" accent={isMine ? 'brand' : 'none'} padded={false} className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <IconTile
                    size="md"
                    tone={isMine ? 'brand' : 'default'}
                    icon={Lucide ? <Icon icon={Lucide} size={20} /> : <span>{tribe.emoji}</span>}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="t-title">{tribe.name}</div>
                      {isMine ? (
                        <Chip asStatic active leftIcon={<Icon icon={Users} size={12} />}>
                          sua tribo
                        </Chip>
                      ) : null}
                    </div>
                    <div className="t-caption mt-0.5">
                      {tribe.members} membros · #{tribe.rank} no ranking
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card tone="solid" padded={false} className="px-5 py-5">
        <SectionHeader title="Ranking da semana" />
        <ol className="space-y-2">
          {LEADERBOARD.slice(0, 10).map((entry) => {
            const isMe = entry.name === 'Você';
            const isTopThree = entry.rank <= 3;

            return (
              <li
                key={entry.rank}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5',
                  isMe
                    ? 'border-[var(--line-active)] bg-[var(--tint-green-2)]'
                    : 'border-transparent bg-[var(--tint-1)]'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    isTopThree ? 'text-[var(--on-reward)]' : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                  )}
                  style={isTopThree ? { background: 'var(--gradient-gold)' } : undefined}
                >
                  {entry.rank}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="t-title truncate">{entry.name}</div>
                  <div className="t-caption">{entry.tribe}</div>
                </div>
                <span className="inline-flex items-center gap-1 t-body-sm font-semibold text-[var(--accent-gold)]">
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

function formatCurrency(cents: number) {
  return PRICE_FORMATTER.format(cents / 100);
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split('-');
  const monthLabel = MONTH_LABELS[Math.max(0, Number(month) - 1)] ?? month;
  return `${day} ${monthLabel} ${year}`;
}

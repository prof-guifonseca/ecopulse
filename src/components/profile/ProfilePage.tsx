'use client';

import { useState } from 'react';
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
import { GlassCard } from '@/components/shared/GlassCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ImpactRing } from '@/components/shared/ImpactRing';
import { gardenStage, GARDEN_LABEL } from '@/lib/garden';
import { cn } from '@/lib/cn';

const PROFILE_TABS = ['impact', 'shop', 'badges', 'tribos'] as const;
const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;
const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProfilePage() {
  const [tab, setTab] = useState<(typeof PROFILE_TABS)[number]>('impact');
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
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <GlassCard variant="hud" accent="mint" className="px-5 py-5">
        <div className="flex items-start gap-4">
          <button
            onClick={openAvatarBuilder}
            className="relative rounded-[30px] border border-white/8 bg-white/6 p-3 shadow-[0_18px_36px_rgba(145,216,159,0.12)]"
            aria-label="Editar avatar"
          >
            <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="xl" />
            <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--gradient-gold)] text-lg text-bg-primary">
              ✎
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="hud-label">Seu perfil</div>
            <h1 className="mt-2 text-[2rem] font-semibold leading-none text-text-primary">{name}</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Um retrato claro da sua jornada: progresso, recompensas, impacto e presença na comunidade.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="command-pill" data-active="true">
                Nível {level}
              </span>
              <span className="command-pill">{tribe}</span>
              <span className="command-pill">{GARDEN_LABEL[stage]}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <QuickStat label="Tokens" value={tokens} />
          <QuickStat label="Streak" value={streak} />
          <QuickStat label="Badges" value={badges.length} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-text-secondary">
            <span>Progresso até o próximo nível</span>
            <span>{xp}/{xpToNext} XP</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PROFILE_TABS.map((currentTab) => (
          <button
            key={currentTab}
            onClick={() => setTab(currentTab)}
            className="command-pill whitespace-nowrap"
            data-active={tab === currentTab ? 'true' : undefined}
          >
            {currentTab === 'impact' && 'Impacto'}
            {currentTab === 'shop' && 'Loja'}
            {currentTab === 'badges' && 'Badges'}
            {currentTab === 'tribos' && 'Tribos'}
          </button>
        ))}
      </div>

      {tab === 'impact' && <ImpactPanel scannedCount={scannedCount} />}
      {tab === 'shop' && <ShopPanel />}
      {tab === 'badges' && <BadgesPanel owned={badges} />}
      {tab === 'tribos' && <TribesPanel currentTribe={tribe} />}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface surface-ghost rounded-[20px] px-3 py-3 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-5">
      <GlassCard variant="panel" accent="mint" className="px-5 py-5">
        <SectionHeader
          eyebrow="Jardim"
          title="Seu impacto já está tomando forma"
          subtitle="Uma leitura visual do que suas escolhas já representam dentro do ecossistema."
        />
        <div className="grid grid-cols-3 gap-3">
          <ImpactMetric pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO2" value={`${co2}kg`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 12)} color="var(--accent-purple)" label="Resíduo" value={`${waste}kg`} />
        </div>
        <GlassCard variant="ghost" accent="none" className="mt-4 px-4 py-4">
          <div className="text-sm leading-6 text-text-secondary">
            Continue escaneando produtos e concluindo missões para aumentar sua área de impacto e fazer seu jardim evoluir.
          </div>
        </GlassCard>
      </GlassCard>

      <GlassCard variant="panel" accent="mint" className="px-5 py-5">
        <SectionHeader
          eyebrow="Fundo EcoPulse"
          title="Transparência sobre impacto e repasse"
          subtitle="O Mercado Verde nasce com uma lógica simples: explicar com clareza como o valor circula."
          right={
            <button type="button" onClick={() => openModal({ kind: 'greenMarketInfo' })} className="command-pill">
              Como funciona
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <FundMetric label="Arrecadado" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)} />
          <FundMetric label="Comprometido" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalCommittedInCents)} />
          <FundMetric label="OSCs apoiadas" value={`${IMPACT_FUND_SNAPSHOT.supportedOrgs}`} />
          <FundMetric label="ODS cobertos" value={`${IMPACT_FUND_SNAPSHOT.coveredSdgs}`} />
          <FundMetric label="Último repasse" value={formatDateLabel(IMPACT_FUND_SNAPSHOT.lastTransferAt)} className="col-span-2" />
        </div>

        <GlassCard variant="ghost" accent="none" className="mt-4 px-4 py-4">
          <div className="text-sm leading-6 text-text-secondary">
            20% do valor planejado para cada pack futuro é reservado ao fundo. {IMPACT_FUND_SNAPSHOT.verificationNote}
          </div>
        </GlassCard>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Perguntas rápidas"
          title="O que muda com o Mercado Verde"
          subtitle="Respostas diretas para manter a monetização transparente desde a fase inicial."
        />
        <div className="space-y-3">
          {MARKET_FAQS.map((item, index) => (
            <GlassCard
              key={item.id}
              variant="ghost"
              accent={index % 2 === 0 ? 'mint' : 'amber'}
              className="px-4 py-4"
            >
              <div className="text-sm font-semibold text-text-primary">{item.question}</div>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.answer}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Parceiros"
          title="OSCs em destaque nesta fase"
          subtitle="Exemplos de como a curadoria de impacto vai aparecer dentro do app."
        />
        <div className="space-y-3">
          {IMPACT_PARTNERS.map((partner, index) => (
            <GlassCard
              key={partner.id}
              variant="tile"
              accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
              className="px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-text-primary">{partner.name}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {partner.city}/{partner.state}
                  </div>
                </div>
                <span className="command-pill" data-active="true">
                  {partner.verificationStatus}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{partner.summary}</p>
            </GlassCard>
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
    <GlassCard variant="tile" accent="mint" className="flex flex-col items-center gap-3 px-3 py-4">
      <ImpactRing pct={pct} color={color} size={84} label={label} value={value} />
    </GlassCard>
  );
}

function ShopPanel() {
  const tokens = useUserStore((s) => s.tokens);
  const openModal = useUIStore((s) => s.openModal);
  const owned = useGameStore((s) => s.ownedShopItems);

  return (
    <div className="space-y-5">
      <GlassCard variant="hud" accent="mint" className="px-5 py-5">
        <SectionHeader
          eyebrow="Mercado Verde"
          title="Tokens, clareza e impacto no mesmo lugar"
          subtitle="A loja premium nasce primeiro como narrativa confiável: mesma moeda do jogo, mais transparência sobre destino do valor."
        />
        <div className="grid grid-cols-3 gap-3">
          <QuickStat label="Seu saldo" value={`${tokens}`} />
          <QuickStat label="Fundo" value="20%" />
          <QuickStat label="Status" value="Em breve" />
        </div>
        <button
          type="button"
          onClick={() => openModal({ kind: 'greenMarketInfo' })}
          className="mt-4 w-full rounded-full px-5 py-3 text-sm font-bold text-bg-primary"
          style={{ background: 'var(--gradient-primary)' }}
        >
          Entender como funciona
        </button>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Packs"
          title="Escolha seu pack de EcoTokens"
          subtitle="A lógica comercial já aparece aqui, mesmo antes de existir checkout real."
        />
        <div className="space-y-3">
          {TOKEN_PACKS.map((pack, index) => (
            <GlassCard
              key={pack.id}
              variant="tile"
              accent={pack.featured ? 'amber' : index % 2 === 0 ? 'mint' : 'cyan'}
              className="px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-text-primary">{pack.name}</div>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">{pack.description}</p>
                </div>
                <span className="command-pill" data-active={pack.featured ? 'true' : undefined}>
                  {pack.badge}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <PackMetric label="EcoTokens" value={`${pack.tokens}`} />
                <PackMetric label="Preço" value={formatCurrency(pack.priceInCents)} />
                <PackMetric label="Fundo" value={formatCurrency(pack.fundShareInCents)} />
              </div>
              <button
                type="button"
                onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
                className="mt-4 w-full rounded-full px-4 py-3 text-sm font-semibold text-bg-primary"
                style={{ background: pack.featured ? 'var(--gradient-gold)' : 'var(--gradient-primary)' }}
              >
                Ver detalhes
              </button>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Loja atual"
          title="Itens já disponíveis no app"
          subtitle="Os tokens comprados futuramente entram no mesmo saldo usado aqui."
        />
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item, index) => {
            const isOwned = owned.includes(item.id);
            return (
              <button key={item.id} onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="text-left">
                <GlassCard
                  variant="tile"
                  accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
                  className="flex h-full flex-col gap-3 px-4 py-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/6 text-3xl">
                    {item.emoji}
                  </div>
                  <div className="text-sm font-semibold text-text-primary">{item.name}</div>
                  <div className="text-xs leading-5 text-text-secondary">{item.desc}</div>
                  <div className="mt-auto text-sm font-semibold" style={{ color: isOwned ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                    {isOwned ? 'Adquirido' : `🪙 ${item.price}`}
                  </div>
                </GlassCard>
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
    <div className="grid grid-cols-2 gap-3">
      {BADGES.map((badge, index) => {
        const unlocked = owned.includes(badge.id);
        const accent =
          badge.tier === 'gold' ? 'amber' : badge.tier === 'epic' ? 'cyan' : index % 2 === 0 ? 'mint' : 'amber';

        return (
          <GlassCard
            key={badge.id}
            variant="tile"
            accent={accent}
            className={cn('flex h-full flex-col gap-3 px-4 py-4 text-center', !unlocked && 'opacity-45 grayscale')}
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/6 text-3xl">
                {badge.emoji}
              </div>
            </div>
            <div className="text-sm font-semibold text-text-primary">{badge.name}</div>
            <div className="text-xs leading-5 text-text-secondary">{badge.desc}</div>
            <span className="command-pill justify-center" data-active={unlocked ? 'true' : undefined}>
              {badge.tier}
            </span>
          </GlassCard>
        );
      })}
    </div>
  );
}

function TribesPanel({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Tribos"
          title="Onde você se encaixa na rede"
          subtitle="Veja sua facção atual e acompanhe o clima competitivo da semana."
        />
        <div className="space-y-3">
          {TRIBES.map((tribe) => {
            const isMine =
              (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
              (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');

            return (
              <GlassCard
                key={tribe.id}
                variant="tile"
                accent={isMine ? 'mint' : 'cyan'}
                className="px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/6 text-3xl">
                    {tribe.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-text-primary">{tribe.name}</div>
                      {isMine ? (
                        <span className="command-pill" data-active="true">
                          sua tribo
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-text-secondary">
                      {tribe.members} membros · #{tribe.rank} no ranking
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      <GlassCard variant="panel" accent="mint" className="px-5 py-5">
        <SectionHeader
          eyebrow="Ranking"
          title="Leitura rápida da semana"
          subtitle="Quem está puxando a comunidade agora."
        />
        <ol className="space-y-3">
          {LEADERBOARD.slice(0, 10).map((entry) => {
            const isMe = entry.name === 'Você';

            return (
              <li
                key={entry.rank}
                className={cn(
                  'surface surface-ghost flex items-center gap-3 rounded-[20px] px-4 py-3',
                  isMe && 'surface-accent-mint border-accent-green/20 bg-accent-green/10'
                )}
              >
                <span className="w-8 text-center text-sm font-semibold text-text-primary">
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </span>
                <span className="text-2xl">{entry.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-text-primary">{entry.name}</div>
                  <div className="text-xs text-text-secondary">{entry.tribe}</div>
                </div>
                <span className="text-sm font-semibold text-accent-gold">{entry.xp.toLocaleString('pt-BR')} XP</span>
              </li>
            );
          })}
        </ol>
      </GlassCard>
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
    <div className={cn('rounded-[20px] border border-white/8 bg-white/5 px-4 py-4', className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className="mt-2 text-base font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function PackMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/5 px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold text-text-primary">{value}</div>
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

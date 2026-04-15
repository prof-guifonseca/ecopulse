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
import { gardenStage, GARDEN_EMOJI, GARDEN_LABEL } from '@/lib/garden';
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
    <div className="space-y-6 lg:space-y-8" style={{ animation: 'fadeIn 0.35s ease' }}>
      <GlassCard variant="hud" accent="violet" className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <button
              onClick={openAvatarBuilder}
              className="relative self-start rounded-[30px] border border-white/10 bg-white/5 p-3 shadow-[0_0_42px_rgba(171,139,255,0.14)] transition-transform duration-200 hover:translate-y-[-3px]"
              aria-label="Editar avatar"
            >
              <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="xl" />
              <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[var(--gradient-gold)] text-lg text-bg-primary">
                ✎
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="hud-label">operator dossier</div>
              <h1 className="mt-2 font-display text-4xl font-bold leading-none sm:text-5xl">{name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="command-pill" data-active="true">
                  NV {level}
                </span>
                <span className="command-pill">{tribe}</span>
                <span className="command-pill">stage {stage}</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-text-secondary sm:text-base">
                Seu perfil agora funciona como um dossier de jogador: progresso, inventário e reputação ficam lado a lado.
              </p>
            </div>
          </div>

          <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
            <div className="hud-label">progress sync</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="font-display text-4xl font-bold">{xp}</div>
              <div className="text-sm text-text-secondary">de {xpToNext} XP</div>
            </div>
            <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-white/6">
              <div
                className="relative h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <QuickStat label="Tokens" value={tokens} icon="🪙" accent="amber" />
              <QuickStat label="Streak" value={streak} icon="🔥" accent="mint" />
              <QuickStat label="Badges" value={badges.length} icon="🏅" accent="violet" />
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <GlassCard variant="panel" accent="mint" className="px-5 py-5 sm:px-6">
          <SectionHeader
            eyebrow="garden stage"
            title="Jardim Eco"
            subtitle="Seu progresso ganha forma física dentro do ecossistema."
          />
          <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-[32px] border border-white/10 bg-[var(--gradient-primary)] text-7xl text-bg-primary shadow-[0_0_50px_rgba(54,215,255,0.18)]">
              {GARDEN_EMOJI[stage]}
            </div>
            <div className="space-y-3">
              <div className="font-display text-3xl font-bold">{GARDEN_LABEL[stage]}</div>
              <div className="text-sm text-text-secondary sm:text-base">
                {stage === 'sprout' && 'Continue operando para atingir o nível 4 e abrir a próxima fase biológica.'}
                {stage === 'shrub' && 'Seu jardim já ocupa mais território. No nível 8 ele alcança a fase completa.'}
                {stage === 'tree' && 'Você atingiu o estágio máximo e virou referência dentro da rede.'}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="command-pill">🌱 N1-3</span>
                <span className="command-pill">🌿 N4-7</span>
                <span className="command-pill" data-active="true">
                  🌳 N8+
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="panel" accent="amber" className="px-5 py-5">
          <div className="hud-label">active loadout</div>
          <div className="mt-3 font-display text-2xl font-bold">Inventário rápido</div>
          <div className="mt-5 grid gap-3">
            <QuickStat label="Produtos lidos" value={scannedCount} icon="📱" accent="cyan" />
            <QuickStat label="Facção" value={tribe} icon="👥" accent="violet" />
            <QuickStat label="Stage" value={stage} icon={GARDEN_EMOJI[stage]} accent="mint" />
          </div>
        </GlassCard>
      </section>

      <div className="flex flex-wrap gap-2">
        {PROFILE_TABS.map((currentTab) => (
          <button
            key={currentTab}
            onClick={() => setTab(currentTab)}
            className="command-pill"
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

function QuickStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: 'mint' | 'cyan' | 'amber' | 'violet';
}) {
  return (
    <GlassCard variant="ghost" accent={accent} className="px-4 py-4">
      <div className="hud-label">{label}</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
          {icon}
        </div>
        <div className="font-display text-2xl font-bold">{value}</div>
      </div>
    </GlassCard>
  );
}

function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <GlassCard variant="tile" accent="mint" className="flex flex-col items-center gap-4 px-5 py-6">
          <ImpactRing
            pct={Math.min(100, scannedCount * 10)}
            color="var(--accent-green)"
            size={92}
            label="CO2 evitado"
            value={`${co2}kg`}
          />
          <p className="text-center text-sm text-text-secondary">
            Seu histórico está reduzindo emissão acumulada no setor.
          </p>
        </GlassCard>
        <GlassCard variant="tile" accent="cyan" className="flex flex-col items-center gap-4 px-5 py-6">
          <ImpactRing
            pct={Math.min(100, scannedCount * 8)}
            color="var(--accent-cyan)"
            size={92}
            label="Água poupada"
            value={`${water}L`}
          />
          <p className="text-center text-sm text-text-secondary">
            A leitura de produtos aumenta visibilidade sobre consumo hídrico.
          </p>
        </GlassCard>
        <GlassCard variant="tile" accent="violet" className="flex flex-col items-center gap-4 px-5 py-6">
          <ImpactRing
            pct={Math.min(100, scannedCount * 12)}
            color="var(--accent-purple)"
            size={92}
            label="Lixo evitado"
            value={`${waste}kg`}
          />
          <p className="text-center text-sm text-text-secondary">
            Seu comportamento já desvia mais resíduos do fluxo padrão.
          </p>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_380px]">
        <GlassCard variant="panel" accent="mint" className="px-5 py-5 sm:px-6">
          <SectionHeader
            eyebrow="fundo ecopulse"
            title="Painel de transparência"
            subtitle="O Mercado Verde nasce com compromisso de visibilidade sobre captação, repasse e critérios."
            right={
              <button
                type="button"
                onClick={() => openModal({ kind: 'greenMarketInfo' })}
                className="command-pill"
              >
                Como funciona
              </button>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <FundMetric
              label="Total arrecadado"
              value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)}
              accent="var(--accent-cyan)"
            />
            <FundMetric
              label="Destinado ao fundo"
              value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalCommittedInCents)}
              accent="var(--accent-green)"
            />
            <FundMetric
              label="OSCs apoiadas"
              value={`${IMPACT_FUND_SNAPSHOT.supportedOrgs}`}
              accent="var(--accent-gold)"
            />
            <FundMetric
              label="ODS cobertos"
              value={`${IMPACT_FUND_SNAPSHOT.coveredSdgs}`}
              accent="var(--accent-purple)"
            />
            <FundMetric
              label="Último repasse"
              value={formatDateLabel(IMPACT_FUND_SNAPSHOT.lastTransferAt)}
              accent="var(--text-primary)"
              className="sm:col-span-2 xl:col-span-1"
            />
          </div>

          <GlassCard variant="ghost" accent="none" className="mt-5 px-4 py-4">
            <div className="hud-label">regras do fundo</div>
            <div className="mt-3 grid gap-2 text-sm text-text-secondary">
              <p>20% do valor bruto planejado para cada pack é reservado ao Fundo EcoPulse.</p>
              <p>O repasse é curado pela EcoPulse e não promete doação instantânea por transação individual.</p>
              <p>{IMPACT_FUND_SNAPSHOT.verificationNote}</p>
            </div>
          </GlassCard>
        </GlassCard>

        <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
          <SectionHeader
            eyebrow="perguntas rápidas"
            title="O que muda com o Mercado Verde"
            subtitle="Respostas curtas para não deixar a monetização parecer caixa-preta."
          />
          <div className="space-y-3">
            {MARKET_FAQS.map((item, index) => (
              <GlassCard
                key={item.id}
                variant="ghost"
                accent={index % 2 === 0 ? 'cyan' : 'mint'}
                className="px-4 py-4"
              >
                <div className="font-semibold text-text-primary">{item.question}</div>
                <p className="mt-2 text-sm text-text-secondary">{item.answer}</p>
              </GlassCard>
            ))}
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionHeader
          eyebrow="parceiros do fundo"
          title="OSCs mockadas para a fase inicial"
          subtitle="Cards de demonstração para explicar como a curadoria de impacto vai aparecer no app."
        />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {IMPACT_PARTNERS.map((partner, index) => {
            const accent = index % 4 === 0 ? 'mint' : index % 4 === 1 ? 'cyan' : index % 4 === 2 ? 'amber' : 'violet';

            return (
              <li key={partner.id}>
                <GlassCard variant="tile" accent={accent} className="flex h-full flex-col gap-4 px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-display text-2xl font-bold">{partner.name}</div>
                      <div className="mt-1 text-sm text-text-secondary">
                        {partner.city}/{partner.state}
                      </div>
                    </div>
                    <span className="command-pill" data-active="true">
                      {partner.verificationStatus}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{partner.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {partner.sdgs.map((sdg) => (
                      <span key={sdg} className="command-pill">
                        {sdg}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ShopPanel() {
  const tokens = useUserStore((s) => s.tokens);
  const openModal = useUIStore((s) => s.openModal);
  const owned = useGameStore((s) => s.ownedShopItems);

  return (
    <div className="space-y-6">
      <GlassCard variant="hud" accent="mint" className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px] xl:items-center">
          <div>
            <div className="hud-label">mercado verde</div>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-bold sm:text-4xl">
              Compre EcoTokens, acelere sua jornada e fortaleça causas ligadas aos ODS.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-text-secondary sm:text-base">
              A ideia é simples: você continua jogando para ganhar saldo, mas passa a enxergar como a economia paga pode
              conviver com impacto real. Nesta primeira entrega, a experiência é de conteúdo, clareza e confiança.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="command-pill" data-active="true">
                mesmo saldo do jogo
              </span>
              <span className="command-pill">20% para impacto real</span>
              <span className="command-pill">sem checkout nesta fase</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-bold text-text-secondary opacity-70"
              >
                Em breve
              </button>
              <button
                type="button"
                onClick={() => openModal({ kind: 'greenMarketInfo' })}
                className="rounded-full px-5 py-3 text-sm font-bold text-bg-primary"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Como funciona
              </button>
            </div>
          </div>

          <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
            <div className="hud-label">estado atual</div>
            <div className="mt-3 font-display text-2xl font-bold">Mercado pronto para narrativa, não para cobrança</div>
            <div className="mt-5 grid gap-3">
              <PackFact label="Seu saldo atual" value={`${tokens} EcoTokens`} accent="var(--accent-gold)" />
              <PackFact label="Modelo do fundo" value="Curadoria automática EcoPulse" accent="var(--accent-green)" />
              <PackFact label="Repasse planejado" value="20% por compra futura" accent="var(--accent-cyan)" />
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      <section>
        <SectionHeader
          eyebrow="packs planejados"
          title="Escolha seu pack de EcoTokens"
          subtitle="Os cards já apresentam a lógica comercial e a transparência de impacto, mesmo antes do checkout real."
        />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TOKEN_PACKS.map((pack, index) => {
            const accent = pack.featured
              ? 'amber'
              : index % 4 === 0
                ? 'mint'
                : index % 4 === 1
                  ? 'cyan'
                  : index % 4 === 2
                    ? 'violet'
                    : 'amber';

            return (
              <li key={pack.id}>
                <GlassCard variant="tile" accent={accent} className="flex h-full flex-col gap-4 px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-3xl font-bold">{pack.name}</div>
                      <p className="mt-2 text-sm text-text-secondary">{pack.description}</p>
                    </div>
                    <span className="command-pill" data-active={pack.featured ? 'true' : undefined}>
                      {pack.badge}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    <PackMetric label="EcoTokens" value={`${pack.tokens}`} accent="var(--accent-gold)" />
                    <PackMetric label="Preço" value={formatCurrency(pack.priceInCents)} accent="var(--accent-cyan)" />
                    <PackMetric
                      label="Fundo verde"
                      value={formatCurrency(pack.fundShareInCents)}
                      accent="var(--accent-green)"
                    />
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{pack.fundSharePercent}% para impacto real</span>
                    {' '}via Fundo EcoPulse com curadoria alinhada aos ODS.
                  </div>

                  <div className="mt-auto grid gap-2">
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-full border border-white/10 bg-white/6 py-3 text-sm font-bold text-text-secondary opacity-70"
                    >
                      Em breve
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
                      className="w-full rounded-full py-3 text-sm font-bold text-bg-primary"
                      style={{ background: pack.featured ? 'var(--gradient-gold)' : 'var(--gradient-primary)' }}
                    >
                      Como funciona
                    </button>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="loja atual"
          title="Itens já disponíveis com EcoTokens"
          subtitle="Nada da sua loja atual muda: quando o Mercado Verde entrar no ar, os tokens comprados cairão neste mesmo saldo."
        />
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SHOP_ITEMS.map((item, index) => {
            const isOwned = owned.includes(item.id);
            const accent = index % 4 === 0 ? 'mint' : index % 4 === 1 ? 'cyan' : index % 4 === 2 ? 'amber' : 'violet';

            return (
              <li key={item.id}>
                <button onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="group block w-full text-left">
                  <GlassCard
                    variant="tile"
                    accent={accent}
                    className="flex h-full flex-col gap-4 px-5 py-5 transition-transform duration-200 group-hover:translate-y-[-4px]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-4xl">
                        {item.emoji}
                      </div>
                      <span className="command-pill" data-active={isOwned ? 'true' : undefined}>
                        {isOwned ? 'owned' : 'drop'}
                      </span>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold">{item.name}</div>
                      <div className="mt-2 text-sm text-text-secondary">{item.desc}</div>
                    </div>
                    <div
                      className="mt-auto text-sm font-bold"
                      style={{ color: isOwned ? 'var(--accent-green)' : 'var(--accent-gold)' }}
                    >
                      {isOwned ? '✓ Adquirido' : `🪙 ${item.price}`}
                    </div>
                  </GlassCard>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function BadgesPanel({ owned }: { owned: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {BADGES.map((badge, index) => {
        const unlocked = owned.includes(badge.id);
        const accent =
          badge.tier === 'gold' ? 'amber' : badge.tier === 'epic' ? 'violet' : index % 2 === 0 ? 'mint' : 'cyan';

        return (
          <li key={badge.id}>
            <GlassCard
              variant="tile"
              accent={accent}
              className={cn('flex h-full flex-col gap-4 px-5 py-5 text-center', !unlocked && 'opacity-45 grayscale')}
            >
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 text-4xl">
                  {badge.emoji}
                </div>
              </div>
              <div>
                <div className="font-display text-xl font-bold">{badge.name}</div>
                <div className="mt-2 text-sm text-text-secondary">{badge.desc}</div>
              </div>
              <span className="command-pill justify-center" data-active={unlocked ? 'true' : undefined}>
                {badge.tier}
              </span>
            </GlassCard>
          </li>
        );
      })}
    </ul>
  );
}

function TribesPanel({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        {TRIBES.map((tribe) => {
          const isMine =
            (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
            (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');

          return (
            <GlassCard key={tribe.id} variant="panel" accent={isMine ? 'mint' : 'none'} className="px-5 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-3xl">
                  {tribe.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl font-bold">{tribe.name}</span>
                    <span className="command-pill">#{tribe.rank}</span>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {tribe.members} membros · {tribe.weeklyXP.toLocaleString('pt-BR')} XP esta semana
                  </div>
                </div>
                {isMine ? (
                  <span className="command-pill" data-active="true">
                    sua tribo
                  </span>
                ) : null}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
        <SectionHeader eyebrow="weekly ladder" title="Ranking Semanal" subtitle="Leitura rápida da camada competitiva." />
        <ol className="space-y-3">
          {LEADERBOARD.slice(0, 10).map((entry) => {
            const isMe = entry.name === 'Você';

            return (
              <li
                key={entry.rank}
                className={cn(
                  'surface surface-ghost flex items-center gap-3 px-4 py-3',
                  isMe && 'surface-accent-mint border-accent-green/25 bg-accent-green/8'
                )}
              >
                <span className="flex w-9 justify-center font-display text-lg font-bold">
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </span>
                <span className="text-2xl">{entry.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{entry.name}</div>
                  <div className="text-xs text-text-secondary">{entry.tribe}</div>
                </div>
                <span className="text-sm font-bold text-accent-gold">{entry.xp.toLocaleString('pt-BR')} XP</span>
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
  accent,
  className,
}: {
  label: string;
  value: string;
  accent: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[22px] border border-white/10 bg-white/5 px-4 py-4', className)}>
      <div className="hud-label">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function PackMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <div className="hud-label">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function PackFact({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
      <div className="hud-label">{label}</div>
      <div className="mt-2 text-sm font-semibold" style={{ color: accent }}>
        {value}
      </div>
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

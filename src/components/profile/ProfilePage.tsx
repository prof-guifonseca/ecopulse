'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BADGES,
  IMPACT_FUND_SNAPSHOT,
  IMPACT_PARTNERS,
  LEADERBOARD,
  SHOP_ITEMS,
  TOKEN_PACKS,
  TRIBES,
} from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { ImpactRing } from '@/components/shared/ImpactRing';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { buildDemoHref, isDemoMode } from '@/lib/demoMode';
import { GARDEN_LABEL, gardenStage } from '@/lib/garden';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/cn';

const PROFILE_TABS = ['impact', 'shop', 'badges', 'tribos'] as const;
const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProfilePage() {
  const searchParams = useSearchParams();
  const demoMode = isDemoMode(searchParams);
  const currentTab = parseTab(searchParams.get('tab'));
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
    <div className="space-y-6 pb-3" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,25,21,0.98),rgba(8,13,11,0.96))] px-5 py-5 shadow-[0_30px_80px_rgba(1,8,5,0.34)]">
        <div className="flex items-start gap-4">
          <button
            onClick={openAvatarBuilder}
            className="relative rounded-[30px] border border-white/8 bg-white/6 p-3 shadow-[0_18px_36px_rgba(145,216,159,0.08)]"
            aria-label="Editar avatar"
          >
            <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="xl" />
            <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--gradient-gold)] text-lg text-bg-primary">
              ✎
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="text-[0.76rem] font-medium text-text-secondary">Fluxo de apoio</div>
            <h1 className="mt-3 text-[2.05rem] font-semibold leading-[0.96] tracking-[-0.05em] text-text-primary">
              {name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Perfil de demonstração com identidade, progresso e um único conjunto de decisões por vez.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="command-pill" data-active="true">
                Nível {level}
              </span>
              <span className="command-pill">{tribe === 'guardioes' ? 'Guardiões' : 'EcoWarriors'}</span>
              <span className="command-pill">{GARDEN_LABEL[stage]}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <ProfileStat label="Tokens" value={`${tokens}`} />
          <ProfileStat label="Streak" value={`${streak} dias`} />
          <ProfileStat label="Badges" value={`${badges.length}`} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm text-text-secondary">
            <span>Próximo nível</span>
            <span>
              {xp}/{xpToNext} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PROFILE_TABS.map((tab) => (
          <Link
            key={tab}
            href={buildDemoHref('/profile', demoMode, { tab })}
            className="command-pill whitespace-nowrap"
            data-active={currentTab === tab ? 'true' : undefined}
          >
            {tab === 'impact' && 'Impacto'}
            {tab === 'shop' && 'Loja'}
            {tab === 'badges' && 'Badges'}
            {tab === 'tribos' && 'Tribos'}
          </Link>
        ))}
      </div>

      {currentTab === 'impact' && <ImpactTab scannedCount={scannedCount} />}
      {currentTab === 'shop' && <ShopTab />}
      {currentTab === 'badges' && <BadgesTab owned={badges} />}
      {currentTab === 'tribos' && <TribesTab currentTribe={tribe} />}
    </div>
  );
}

function ImpactTab({ scannedCount }: { scannedCount: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-5 py-5">
        <SectionHeader
          title="Seu impacto em uma leitura"
          subtitle="A visão mais útil para a demo: três sinais fortes e uma explicação curta."
        />
        <div className="grid grid-cols-3 gap-3">
          <ImpactMetric pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO2" value={`${co2}kg`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
          <ImpactMetric pct={Math.min(100, scannedCount * 12)} color="var(--accent-purple)" label="Resíduo" value={`${waste}kg`} />
        </div>
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Continue escaneando produtos e visitando pontos para mostrar como o impacto cresce junto da rotina.
        </p>
      </section>

      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-5 py-5">
        <SectionHeader
          title="Fundo EcoPulse"
          subtitle="Um resumo comercial bem direto para explicar o que acontece com as contribuições."
          right={
            <button type="button" onClick={() => openModal({ kind: 'greenMarketInfo' })} className="command-pill">
              Como funciona
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <SimpleMetric label="Arrecadado" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)} />
          <SimpleMetric label="Comprometido" value={formatCurrency(IMPACT_FUND_SNAPSHOT.totalCommittedInCents)} />
          <SimpleMetric label="OSCs apoiadas" value={`${IMPACT_FUND_SNAPSHOT.supportedOrgs}`} />
          <SimpleMetric label="ODS cobertos" value={`${IMPACT_FUND_SNAPSHOT.coveredSdgs}`} />
        </div>

        <article className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.045] px-4 py-4">
          <div className="text-sm font-semibold text-text-primary">{IMPACT_PARTNERS[0].name}</div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{IMPACT_PARTNERS[0].summary}</p>
        </article>
      </section>
    </div>
  );
}

function ShopTab() {
  const tokens = useUserStore((s) => s.tokens);
  const owned = useGameStore((s) => s.ownedShopItems);
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-5 py-5">
        <SectionHeader
          title="Mercado Verde"
          subtitle="A loja aparece como capítulo do perfil, não como outro aplicativo dentro do app."
        />
        <div className="grid grid-cols-3 gap-2">
          <ProfileStat label="Saldo" value={`${tokens}`} />
          <ProfileStat label="Fundo" value="20%" />
          <ProfileStat label="Status" value="Protótipo" />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Packs para demonstrar"
          subtitle="Escolha um pack para explicar a lógica comercial e abrir o detalhe completo."
        />
        <div className="space-y-3">
          {TOKEN_PACKS.slice(0, 3).map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
              className="block w-full rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-text-primary">{pack.name}</div>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{pack.description}</p>
                </div>
                <span className="command-pill" data-active={pack.featured ? 'true' : undefined}>
                  {pack.badge}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <SimpleMetric label="Tokens" value={`${pack.tokens}`} />
                <SimpleMetric label="Preço" value={formatCurrency(pack.priceInCents)} />
                <SimpleMetric label="Fundo" value={formatCurrency(pack.fundShareInCents)} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Itens já disponíveis"
          subtitle="Os itens existentes continuam aqui, mas em quantidade pequena para a demo não dispersar."
        />
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.slice(0, 4).map((item) => {
            const isOwned = owned.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => openModal({ kind: 'shopItem', id: item.id })}
                className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4 text-left"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/8 bg-white/6 text-3xl">
                  {item.emoji}
                </div>
                <div className="mt-3 text-sm font-semibold text-text-primary">{item.name}</div>
                <div className="mt-2 text-xs leading-5 text-text-secondary">{item.desc}</div>
                <div
                  className="mt-3 text-sm font-semibold"
                  style={{ color: isOwned ? 'var(--accent-green)' : 'var(--accent-gold)' }}
                >
                  {isOwned ? 'Adquirido' : `🪙 ${item.price}`}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BadgesTab({ owned }: { owned: string[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Coleção de badges"
        subtitle="Uma grade simples ajuda a apresentar conquista sem parecer uma vitrine caótica."
      />
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((badge) => {
          const unlocked = owned.includes(badge.id);

          return (
            <article
              key={badge.id}
              className={cn(
                'rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4 text-center',
                !unlocked && 'opacity-45 grayscale'
              )}
            >
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/8 bg-white/6 text-3xl">
                  {badge.emoji}
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-text-primary">{badge.name}</div>
              <div className="mt-2 text-xs leading-5 text-text-secondary">{badge.desc}</div>
              <span className="mt-3 inline-flex rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[0.74rem] font-medium text-text-secondary">
                {badge.tier}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TribesTab({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <SectionHeader
          title="Sua tribo"
          subtitle="Primeiro a identidade coletiva, depois o ranking. Isso deixa a leitura mais natural."
        />
        <div className="space-y-3">
          {TRIBES.map((tribe) => {
            const isMine =
              (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
              (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');

            return (
              <article
                key={tribe.id}
                className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/8 bg-white/6 text-3xl">
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
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-5 py-5">
        <SectionHeader
          title="Ranking da semana"
          subtitle="Uma lista enxuta para mostrar competição sem transformar a tela em dashboard."
        />
        <ol className="space-y-3">
          {LEADERBOARD.slice(0, 6).map((entry) => {
            const isMe = entry.name === 'Você';

            return (
              <li
                key={entry.rank}
                className={cn(
                  'flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.045] px-4 py-3',
                  isMe && 'border-accent-green/22 bg-accent-green/10'
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
      </section>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.045] px-3 py-3">
      <div className="text-[0.72rem] font-medium text-text-secondary">{label}</div>
      <div className="mt-1 text-base font-semibold text-text-primary">{value}</div>
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
    <div className="rounded-[24px] border border-white/8 bg-white/[0.045] px-3 py-4">
      <div className="flex justify-center">
        <ImpactRing pct={pct} color={color} size={88} label={label} value={value} />
      </div>
    </div>
  );
}

function SimpleMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.045] px-3 py-3">
      <div className="text-[0.72rem] font-medium text-text-secondary">{label}</div>
      <div className="mt-2 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function formatCurrency(cents: number) {
  return PRICE_FORMATTER.format(cents / 100);
}

function parseTab(value: string | null) {
  return PROFILE_TABS.includes(value as (typeof PROFILE_TABS)[number])
    ? (value as (typeof PROFILE_TABS)[number])
    : 'impact';
}

'use client';

import { useState } from 'react';
import { BADGES, LEADERBOARD, TRIBES, SHOP_ITEMS } from '@/data';
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
                <span className="command-pill" data-active="true">NV {level}</span>
                <span className="command-pill">{tribe}</span>
                <span className="command-pill">stage {stage}</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-text-secondary sm:text-base">
                Seu perfil agora funciona como um dossier de jogador: progresso, inventario e reputacao ficam lado a lado.
              </p>
            </div>
          </div>

          <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
            <div className="hud-label">progress sync</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="font-display text-4xl font-bold">{xp}</div>
              <div className="text-sm text-text-secondary">de {xpToNext} XP</div>
            </div>
            <div className="mt-4 relative h-3 overflow-hidden rounded-full bg-white/6">
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
            subtitle="Seu progresso ganha forma fisica dentro do ecossistema."
          />
          <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-[32px] border border-white/10 bg-[var(--gradient-primary)] text-7xl text-bg-primary shadow-[0_0_50px_rgba(54,215,255,0.18)]">
              {GARDEN_EMOJI[stage]}
            </div>
            <div className="space-y-3">
              <div className="font-display text-3xl font-bold">{GARDEN_LABEL[stage]}</div>
              <div className="text-sm text-text-secondary sm:text-base">
                {stage === 'sprout' && 'Continue operando para atingir o nivel 4 e abrir a proxima fase biologica.'}
                {stage === 'shrub' && 'Seu jardim ja ocupa mais territorio. No nivel 8 ele alcança a fase completa.'}
                {stage === 'tree' && 'Voce atingiu o estagio maximo e virou referencia dentro da rede.'}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="command-pill">🌱 N1-3</span>
                <span className="command-pill">🌿 N4-7</span>
                <span className="command-pill" data-active="true">🌳 N8+</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="panel" accent="amber" className="px-5 py-5">
          <div className="hud-label">active loadout</div>
          <div className="mt-3 font-display text-2xl font-bold">Inventario rapido</div>
          <div className="mt-5 grid gap-3">
            <QuickStat label="Produtos lidos" value={scannedCount} icon="📱" accent="cyan" />
            <QuickStat label="Faccao" value={tribe} icon="👥" accent="violet" />
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
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <GlassCard variant="tile" accent="mint" className="flex flex-col items-center gap-4 px-5 py-6">
        <ImpactRing pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" size={92} label="CO2 evitado" value={`${co2}kg`} />
        <p className="text-center text-sm text-text-secondary">Seu historico esta reduzindo emissao acumulada no setor.</p>
      </GlassCard>
      <GlassCard variant="tile" accent="cyan" className="flex flex-col items-center gap-4 px-5 py-6">
        <ImpactRing pct={Math.min(100, scannedCount * 8)} color="var(--accent-cyan)" size={92} label="Agua poupada" value={`${water}L`} />
        <p className="text-center text-sm text-text-secondary">A leitura de produtos aumenta visibilidade sobre consumo hidrico.</p>
      </GlassCard>
      <GlassCard variant="tile" accent="violet" className="flex flex-col items-center gap-4 px-5 py-6">
        <ImpactRing pct={Math.min(100, scannedCount * 12)} color="var(--accent-purple)" size={92} label="Lixo evitado" value={`${waste}kg`} />
        <p className="text-center text-sm text-text-secondary">Seu comportamento ja desvia mais residuos do fluxo padrao.</p>
      </GlassCard>
    </section>
  );
}

function ShopPanel() {
  const openModal = useUIStore((s) => s.openModal);
  const owned = useGameStore((s) => s.ownedShopItems);

  return (
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
                <div className="mt-auto text-sm font-bold" style={{ color: isOwned ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                  {isOwned ? '✓ Adquirido' : `🪙 ${item.price}`}
                </div>
              </GlassCard>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function BadgesPanel({ owned }: { owned: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {BADGES.map((badge, index) => {
        const unlocked = owned.includes(badge.id);
        const accent = badge.tier === 'gold' ? 'amber' : badge.tier === 'epic' ? 'violet' : index % 2 === 0 ? 'mint' : 'cyan';

        return (
          <li key={badge.id}>
            <GlassCard
              variant="tile"
              accent={accent}
              className={cn(
                'flex h-full flex-col gap-4 px-5 py-5 text-center',
                !unlocked && 'opacity-45 grayscale'
              )}
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
                {isMine ? <span className="command-pill" data-active="true">sua tribo</span> : null}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
        <SectionHeader eyebrow="weekly ladder" title="Ranking Semanal" subtitle="Leitura rapida da camada competitiva." />
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

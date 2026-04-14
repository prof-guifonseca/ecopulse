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

export function ProfilePage() {
  const [tab, setTab] = useState<'impact' | 'shop' | 'badges' | 'tribos'>('impact');
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
      {/* Profile header */}
      <section
        className="flex flex-col items-center gap-3 rounded-lg p-5"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <button
          onClick={openAvatarBuilder}
          className="relative rounded-full bg-white/20 p-1 transition-transform active:scale-95"
          aria-label="Editar avatar"
        >
          <Avatar baseId={avatarBase} outfits={avatarOutfits} emoji={avatar} size="lg" />
          <span
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-xs"
            style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
          >
            ✏️
          </span>
        </button>
        <div className="text-center text-bg-primary">
          <div className="font-display text-xl font-bold">{name}</div>
          <div className="text-xs opacity-80">Nível {level} · {tribe}</div>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1 flex justify-between text-[10px] text-bg-primary opacity-80">
            <span>{xp} XP</span>
            <span>{xpToNext} XP</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-2">
        <GlassCard className="text-center p-3">
          <div className="text-[10px] text-text-secondary">Tokens</div>
          <div className="mt-1 font-display text-lg font-bold" style={{ color: 'var(--accent-gold)' }}>
            🪙 {tokens}
          </div>
        </GlassCard>
        <GlassCard className="text-center p-3">
          <div className="text-[10px] text-text-secondary">Streak</div>
          <div className="mt-1 font-display text-lg font-bold" style={{ color: 'var(--accent-orange)' }}>
            🔥 {streak}
          </div>
        </GlassCard>
        <GlassCard className="text-center p-3">
          <div className="text-[10px] text-text-secondary">Badges</div>
          <div className="mt-1 font-display text-lg font-bold" style={{ color: 'var(--accent-purple)' }}>
            🏅 {badges.length}
          </div>
        </GlassCard>
      </section>

      {/* Garden */}
      <section>
        <SectionHeader title="Jardim Eco" subtitle="Seu progresso ganha vida" />
        <GlassCard>
          <div className="flex items-center gap-4">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-6xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {GARDEN_EMOJI[stage]}
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-bold">{GARDEN_LABEL[stage]}</div>
              <div className="text-xs text-text-secondary">
                {stage === 'sprout' && 'Continue para virar arbusto no nível 4'}
                {stage === 'shrub' && 'Vire árvore completa no nível 8'}
                {stage === 'tree' && 'Você desbloqueou o estágio máximo!'}
              </div>
              <div className="mt-2 flex gap-2 text-[11px] text-text-secondary">
                <span>🌱 N1–3</span>
                <span>→</span>
                <span>🌿 N4–7</span>
                <span>→</span>
                <span>🌳 N8+</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/5">
        {(['impact', 'shop', 'badges', 'tribos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
              tab === t
                ? 'border-accent-green text-text-primary'
                : 'border-transparent text-text-secondary'
            )}
          >
            {t === 'impact' && 'Impacto'}
            {t === 'shop' && 'Loja'}
            {t === 'badges' && 'Badges'}
            {t === 'tribos' && 'Tribos'}
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

function ImpactPanel({ scannedCount }: { scannedCount: number }) {
  const co2 = Math.round(scannedCount * 1.8 * 10) / 10;
  const water = scannedCount * 12;
  const waste = Math.round(scannedCount * 0.25 * 10) / 10;
  return (
    <section className="grid grid-cols-3 gap-3">
      <GlassCard className="flex flex-col items-center">
        <ImpactRing pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO₂ evitado" value={`${co2}kg`} />
      </GlassCard>
      <GlassCard className="flex flex-col items-center">
        <ImpactRing pct={Math.min(100, scannedCount * 8)} color="var(--accent-cyan)" label="Água poupada" value={`${water}L`} />
      </GlassCard>
      <GlassCard className="flex flex-col items-center">
        <ImpactRing pct={Math.min(100, scannedCount * 12)} color="var(--accent-purple)" label="Lixo evitado" value={`${waste}kg`} />
      </GlassCard>
    </section>
  );
}

function ShopPanel() {
  const openModal = useUIStore((s) => s.openModal);
  const owned = useGameStore((s) => s.ownedShopItems);
  return (
    <ul className="grid grid-cols-2 gap-3">
      {SHOP_ITEMS.map((item) => {
        const isOwned = owned.includes(item.id);
        return (
          <li key={item.id}>
            <button
              onClick={() => openModal({ kind: 'shopItem', id: item.id })}
              className="glass-card flex w-full flex-col items-center p-3 text-center transition-transform active:scale-[0.98]"
            >
              <div className="text-4xl">{item.emoji}</div>
              <div className="mt-1 text-xs font-semibold">{item.name}</div>
              <div className="mt-0.5 line-clamp-1 text-[10px] text-text-secondary">{item.desc}</div>
              <div className="mt-2 text-[11px] font-bold" style={{ color: isOwned ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                {isOwned ? '✓ Adquirido' : `🪙 ${item.price}`}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function BadgesPanel({ owned }: { owned: string[] }) {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {BADGES.map((b) => {
        const unlocked = owned.includes(b.id);
        return (
          <li key={b.id}>
            <GlassCard
              className={cn(
                'flex flex-col items-center p-3 text-center',
                !unlocked && 'opacity-40 grayscale'
              )}
            >
              <div className="text-3xl">{b.emoji}</div>
              <div className="mt-1 text-[11px] font-semibold">{b.name}</div>
              <div className="mt-0.5 line-clamp-2 text-[9px] text-text-secondary">{b.desc}</div>
              <div
                className="mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                style={{
                  background:
                    b.tier === 'bronze' ? 'rgba(167,108,66,0.2)' :
                    b.tier === 'silver' ? 'rgba(192,192,192,0.2)' :
                    b.tier === 'gold' ? 'rgba(255,209,102,0.2)' :
                    'rgba(199,125,255,0.2)',
                  color:
                    b.tier === 'bronze' ? '#c08552' :
                    b.tier === 'silver' ? '#c0c0c0' :
                    b.tier === 'gold' ? 'var(--accent-gold)' :
                    'var(--accent-purple)',
                }}
              >
                {b.tier}
              </div>
            </GlassCard>
          </li>
        );
      })}
    </ul>
  );
}

function TribesPanel({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {TRIBES.map((t) => (
          <li key={t.id}>
            <GlassCard className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                {t.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{t.name}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
                  >
                    #{t.rank}
                  </span>
                </div>
                <div className="text-[10px] text-text-secondary">
                  {t.members} membros · {t.weeklyXP.toLocaleString('pt-BR')} XP esta semana
                </div>
              </div>
              {(t.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
              (t.name === 'EcoWarriors' && currentTribe === 'warriors') ? (
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-bold"
                  style={{ background: 'var(--accent-green)', color: 'var(--bg-primary)' }}
                >
                  Sua tribo
                </span>
              ) : null}
            </GlassCard>
          </li>
        ))}
      </ul>

      <div>
        <SectionHeader title="Ranking Semanal" />
        <ol className="space-y-1.5">
          {LEADERBOARD.slice(0, 10).map((e) => {
            const isMe = e.name === 'Você';
            return (
              <li
                key={e.rank}
                className={cn(
                  'flex items-center gap-3 rounded-md p-2',
                  isMe && 'bg-accent-green/10'
                )}
                style={isMe ? { outline: '1px solid var(--accent-green)' } : undefined}
              >
                <span className="w-6 text-center font-display text-sm font-bold">
                  {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}
                </span>
                <span className="text-xl">{e.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-semibold">{e.name}</div>
                  <div className="text-[10px] text-text-secondary">{e.tribe}</div>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--accent-gold)' }}>
                  {e.xp.toLocaleString('pt-BR')} XP
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronRight, Coins, Pencil, Trophy } from 'lucide-react';
import {
  AVATAR_OUTFITS,
  BADGES,
  IMPACT_FUND_SNAPSHOT,
  LEADERBOARD,
  SHOP_ITEMS,
  SKIN_PACKS,
  TOKEN_PACKS,
  TRIBES,
} from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/shared/Avatar';
import { ImpactRing } from '@/components/shared/ImpactRing';
import { SkinPackArt } from '@/components/skins/SkinPackArt';
import { unlockHint } from '@/lib/skinUnlocks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type TabValue = (typeof PROFILE_TABS)[number]['value'];

export function ProfilePage() {
  const [tab, setTab] = useState<TabValue>('impact');
  const name = useUserStore((s) => s.name);
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
    <PageShell spacing={5}>
      {/* Editorial portrait */}
      <header className="flex flex-col items-center pt-2 text-center">
        <button
          onClick={openAvatarBuilder}
          className="relative h-28 w-28 rounded-full p-2"
          aria-label="Editar avatar"
        >
          <span
            aria-hidden
            className="absolute inset-[-4px] rounded-full opacity-70"
            style={{
              background:
                'conic-gradient(from 130deg, color-mix(in srgb, var(--accent-green) 35%, transparent), transparent 35%, color-mix(in srgb, var(--accent-gold) 30%, transparent), transparent 70%)',
            }}
          />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[var(--bg-secondary)]">
            <Avatar baseId={avatarBase} outfits={avatarOutfits} size="md" />
          </span>
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[var(--on-reward)]"
            style={{ background: 'var(--gradient-gold)' }}
          >
            <Icon icon={Pencil} size={12} strokeWidth={2.4} />
          </span>
        </button>

        <h1 className="t-display mt-4 leading-[0.95]">{name}</h1>
        <p className="mt-1.5 t-caption">
          Nível {level} · {tribe === 'guardioes' ? 'Guardiões' : 'EcoWarriors'} · {GARDEN_LABEL[stage]}
        </p>

        <div className="mt-4 grid w-full grid-cols-3 gap-3 text-center">
          <Stat label="Tokens" value={tokens} />
          <Stat label="Streak" value={`${streak}d`} />
          <Stat label="Badges" value={badges.length} />
        </div>

        <div className="mt-4 w-full">
          <div className="mb-1.5 flex items-baseline justify-between t-caption">
            <span>Próximo nível</span>
            <span className="font-semibold text-[var(--text-secondary)]">
              {xp}/{xpToNext} XP
            </span>
          </div>
          <ProgressBar value={pct} size="sm" />
        </div>
      </header>

      <Tabs items={PROFILE_TABS} value={tab} onChange={setTab} />

      {tab === 'impact' && <ImpactPanel scannedCount={scannedCount} />}
      {tab === 'shop' && <ShopPanel tokens={tokens} />}
      {tab === 'badges' && <BadgesPanel owned={badges} />}
      {tab === 'tribos' && <TribesPanel currentTribe={tribe} />}
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="t-headline leading-none">{value}</div>
      <div className="mt-1 t-caption">{label}</div>
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
      <div className="grid grid-cols-3 gap-3">
        <ImpactRing pct={Math.min(100, scannedCount * 10)} color="var(--accent-green)" label="CO₂" value={`${co2}kg`} />
        <ImpactRing pct={Math.min(100, scannedCount * 8)} color="var(--accent-gold)" label="Água" value={`${water}L`} />
        <ImpactRing pct={Math.min(100, scannedCount * 12)} color="var(--accent-green)" label="Resíduo" value={`${waste}kg`} />
      </div>

      <button
        onClick={() => openModal({ kind: 'greenMarketInfo' })}
        className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-4 py-4 text-left transition-colors hover:bg-[var(--tint-2)]"
      >
        <div className="min-w-0">
          <p className="t-eyebrow">Fundo EcoPulse</p>
          <p className="mt-1 t-body-sm">
            {formatCurrency(IMPACT_FUND_SNAPSHOT.totalRaisedInCents)} arrecadados ·{' '}
            {IMPACT_FUND_SNAPSHOT.supportedOrgs} OSCs apoiadas
          </p>
        </div>
        <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
      </button>
    </div>
  );
}

function ShopPanel({ tokens }: { tokens: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const ownedItems = useGameStore((s) => s.ownedShopItems);
  const ownedSkinPacks = useUserStore((s) => s.ownedSkinPacks);
  const equippedSkinPack = useUserStore((s) => s.equippedSkinPack);
  const ownedOutfits = useUserStore((s) => s.ownedOutfits);
  const outfitsEquipped = useUserStore((s) => s.avatarOutfits);

  return (
    <div className="space-y-6">
      {/* Carteira */}
      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="t-eyebrow">Carteira</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="t-display leading-[1] text-[var(--accent-green)]">{tokens}</span>
              <span className="t-body-sm">Eco-Tokens</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => openModal({ kind: 'greenMarketInfo' })}>
            Como funciona
          </Button>
        </div>
      </Card>

      {/* Personagens — SkinPacks como cards ilustrados em carousel horizontal */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Personagens</h2>
          <span className="t-caption">{ownedSkinPacks.length}/{SKIN_PACKS.length} desbloqueados</span>
        </div>
        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKIN_PACKS.map((skin) => {
            const owned = ownedSkinPacks.includes(skin.id);
            const equipped = equippedSkinPack === skin.id;
            const meets = unlockMet(skin.unlock);
            const locked = !owned && !meets && skin.unlock.kind !== 'paid';
            return (
              <button
                key={skin.id}
                onClick={() => openModal({ kind: 'skinPack', id: skin.id })}
                className="group flex w-[140px] shrink-0 flex-col rounded-[var(--radius-md)] border bg-[var(--tint-1)] text-left transition-colors hover:border-[var(--line-strong)] focus:outline-none"
                style={{
                  borderColor: equipped ? 'var(--line-active)' : 'var(--line-soft)',
                  backgroundColor: equipped ? 'var(--tint-green-2)' : undefined,
                }}
              >
                <div
                  className={cn(
                    'flex h-[120px] items-center justify-center overflow-hidden rounded-t-[var(--radius-md)]',
                    locked && 'opacity-40 grayscale'
                  )}
                >
                  <SkinPackArt id={skin.id} size="lg" />
                </div>
                <div className="space-y-1 px-3 py-3">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="t-title truncate">{skin.name}</h3>
                  </div>
                  <p className="t-caption">
                    {equipped
                      ? <span className="text-[var(--accent-green)]">Equipado</span>
                      : owned
                      ? 'Possuído · toque pra equipar'
                      : locked
                      ? `🔒 ${unlockHint(skin)}`
                      : <span className="text-[var(--accent-gold)]">{skin.priceTokens} tokens</span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Acessórios — peças soltas para modo composite */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Acessórios</h2>
          <span className="t-caption">Modo livre</span>
        </div>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {AVATAR_OUTFITS.map((item) => {
            const owned = ownedOutfits.includes(item.id);
            const equippedHere = outfitsEquipped[item.slot] === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => useUIStore.getState().openAvatarBuilder()}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line-soft)] bg-[var(--tint-2)] text-lg">
                    {item.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="t-title truncate">{item.name}</div>
                    <p className="mt-0.5 t-caption">{slotLabel(item.slot)} · {item.tier}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 t-caption font-semibold',
                      equippedHere
                        ? 'text-[var(--accent-green)]'
                        : owned
                        ? 'text-[var(--text-secondary)]'
                        : 'text-[var(--accent-gold)]'
                    )}
                  >
                    {equippedHere ? 'Equipado' : owned ? 'Possuído' : `${item.price}t`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Eco-Tokens — packs pagos */}
      <section>
        <h2 className="mb-3 t-title">Eco-Tokens</h2>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {TOKEN_PACKS.map((pack) => (
            <li key={pack.id}>
              <button
                onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="t-title truncate">{pack.name}</h3>
                    {pack.featured ? (
                      <Chip asStatic active className="text-[var(--accent-gold)]">{pack.badge}</Chip>
                    ) : null}
                  </div>
                  <p className="mt-0.5 t-caption">
                    {pack.tokens} tokens · {formatCurrency(pack.priceInCents)}
                  </p>
                </div>
                <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Outros — SHOP_ITEMS originais */}
      <section>
        <h2 className="mb-3 t-title">Outros</h2>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            return (
              <button key={item.id} onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="text-left">
                <Card tone="solid" padded={false} className="flex h-full flex-col gap-2 px-4 py-4">
                  <span className="text-3xl leading-none">{item.emoji}</span>
                  <div className="t-title">{item.name}</div>
                  <p className="t-caption">{item.desc}</p>
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

import type { OutfitSlot, SkinUnlock } from '@/types';

function slotLabel(slot: OutfitSlot): string {
  const labels: Record<OutfitSlot, string> = {
    hat: 'chapéu',
    glasses: 'óculos',
    shirt: 'roupa',
    accessory: 'acessório',
    background: 'fundo',
    weapon: 'arma',
    hairstyle: 'cabelo',
  };
  return labels[slot];
}

/** Mirrors checkSkinUnlocks logic for the locked-state visual cue. */
function unlockMet(unlock: SkinUnlock): boolean {
  const user = useUserStore.getState();
  const game = useGameStore.getState();
  switch (unlock.kind) {
    case 'paid':
      return false;
    case 'level':
      return user.level >= unlock.value;
    case 'badge':
      return game.badges.includes(unlock.id);
    case 'count':
      switch (unlock.metric) {
        case 'scans':
          return game.scannedProducts.length >= unlock.value;
        case 'visits':
          return game.visitedPoints.length >= unlock.value;
        case 'challenges':
          return game.completedChallenges.length >= unlock.value;
        case 'tutorials':
          return game.completedTutorials.length >= unlock.value;
      }
      return false;
  }
}

function BadgesPanel({ owned }: { owned: string[] }) {
  const unlockedCount = owned.length;
  return (
    <section className="space-y-4">
      <p className="t-caption">
        {unlockedCount}/{BADGES.length} desbloqueados
      </p>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const unlocked = owned.includes(badge.id);
          const Lucide = resolveIcon(badge.iconName as never);
          return (
            <div
              key={badge.id}
              className={cn(
                'flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)] px-2 py-4 text-center transition-opacity',
                !unlocked && 'opacity-35'
              )}
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  unlocked
                    ? 'border border-[var(--line-active)] bg-[var(--tint-green-2)] text-[var(--accent-green)]'
                    : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                )}
              >
                {Lucide ? <Icon icon={Lucide} size={20} /> : null}
              </span>
              <div className="t-caption font-semibold leading-tight text-[var(--text-primary)]">
                {badge.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TribesPanel({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {TRIBES.map((tribe) => {
          const isMine =
            (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
            (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');
          const Lucide = resolveIcon(tribe.iconName as never);
          return (
            <div
              key={tribe.id}
              className={cn(
                'flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-3 py-4 text-center',
                isMine
                  ? 'border-[var(--line-active)] bg-[var(--tint-green-2)]'
                  : 'border-[var(--line-soft)] bg-[var(--tint-1)]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  isMine
                    ? 'border border-[var(--line-active)] bg-[var(--bg-primary)] text-[var(--accent-green)]'
                    : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                )}
              >
                {Lucide ? <Icon icon={Lucide} size={18} /> : null}
              </span>
              <h3 className="t-title leading-tight">{tribe.name}</h3>
              <p className="t-caption">
                #{tribe.rank} · {tribe.members} membros
              </p>
              {isMine ? (
                <span className="mt-1 t-caption font-semibold text-[var(--accent-green)]">
                  sua tribo
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 t-title">Ranking da semana</h2>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {LEADERBOARD.slice(0, 10).map((entry) => {
            const isMe = entry.name === 'Você';
            const isTopThree = entry.rank <= 3;
            return (
              <li
                key={entry.rank}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5',
                  isMe && 'bg-[var(--tint-green-2)]'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    isTopThree
                      ? 'text-[var(--on-reward)]'
                      : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
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
        </ul>
      </section>
    </div>
  );
}

function formatCurrency(cents: number) {
  return PRICE_FORMATTER.format(cents / 100);
}

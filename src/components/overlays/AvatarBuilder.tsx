'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Check, Coins, Lock, X } from 'lucide-react';
import {
  AVATAR_BASES,
  EMPTY_GEAR,
  GEAR_ITEMS,
  GEAR_SETS,
  GEAR_SLOT_LABELS,
  createAvatarLoadoutPresets,
  type DemoLoadoutPreset,
} from '@/data';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { unlockBadge } from '@/lib/gameActions';
import { baseStatsForLevel } from '@/lib/battle/rules';
import {
  clearSlot,
  deriveStatsFromLoadout,
  equipGearItem,
  equippedGearIds,
} from '@/lib/gear/rules';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/cn';
import type { AvatarLoadout, BattleStats, GearItem, GearSlot } from '@/types';

function PickerTile({
  selected,
  onClick,
  disabled,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-[132px] flex-col items-center gap-2 rounded-[var(--radius-md)] border px-4 py-4 text-center transition-all duration-150 active:scale-[0.99]',
        selected
          ? 'bg-tint-green-2 border-[var(--line-active)]'
          : 'bg-tint-1 border-[var(--border)] hover:border-[var(--input)]',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

const GEAR_SLOTS: GearSlot[] = [
  'hair',
  'head',
  'face',
  'torso',
  'legs',
  'feet',
  'back',
  'mainHand',
  'offHand',
  'aura',
];

const TAB_ITEMS = [
  { value: 'presets', label: 'Presets' },
  { value: 'base', label: 'Base' },
  ...GEAR_SLOTS.map((slot) => ({ value: slot, label: GEAR_SLOT_LABELS[slot] })),
] as const;

type TabValue = (typeof TAB_ITEMS)[number]['value'];

export function AvatarBuilder() {
  const close = useUIStore((s) => s.closeAvatarBuilder);
  const showToast = useUIStore((s) => s.showToast);
  const openModal = useUIStore((s) => s.openModal);

  const user = useUserStore();
  const [draftLoadout, setDraftLoadout] = useState<AvatarLoadout>(() => ({
    baseId: user.avatarLoadout.baseId ?? user.avatarBase ?? AVATAR_BASES[0].id,
    equippedGear: { ...EMPTY_GEAR, ...user.avatarLoadout.equippedGear },
    activeSetId: user.avatarLoadout.activeSetId ?? null,
  }));
  const [tab, setTab] = useState<TabValue>('presets');
  const presets = useMemo(
    () => createAvatarLoadoutPresets(draftLoadout.baseId ?? user.avatarBase ?? AVATAR_BASES[0].id),
    [draftLoadout.baseId, user.avatarBase],
  );

  const currentStats = useMemo(
    () =>
      deriveStatsFromLoadout({
        baseStats: baseStatsForLevel(user.level),
        loadout: user.avatarLoadout,
        gearItems: GEAR_ITEMS,
        gearSets: GEAR_SETS,
      }),
    [user.avatarLoadout, user.level],
  );
  const draftStats = useMemo(
    () =>
      deriveStatsFromLoadout({
        baseStats: baseStatsForLevel(user.level),
        loadout: draftLoadout,
        gearItems: GEAR_ITEMS,
        gearSets: GEAR_SETS,
      }),
    [draftLoadout, user.level],
  );

  const save = () => {
    user.setAvatarLoadout(draftLoadout);
    const equippedCount = equippedGearIds(draftLoadout).length;
    if (equippedCount >= 3) unlockBadge('fashionista');
    showToast('Avatar atualizado', 'success');
    close();
  };

  const buyGearItem = (item: GearItem) => {
    if (user.ownedGearItems.includes(item.id)) return true;
    if (!user.spendTokens(item.priceTokens)) {
      showToast('Tokens insuficientes', 'info');
      return false;
    }
    user.addOwnedGearItem(item.id);
    showToast(`${item.name} adquirido`, 'reward');
    return true;
  };

  const handleSelectGear = (item: GearItem) => {
    const owned = user.ownedGearItems.includes(item.id);
    if (!owned && !buyGearItem(item)) return;
    setDraftLoadout((prev) => {
      const alreadyEquipped = prev.equippedGear[item.slot] === item.id;
      return alreadyEquipped ? clearSlot(prev, item.slot) : equipGearItem(prev, item);
    });
  };

  const handleSelectPreset = (preset: DemoLoadoutPreset) => {
    if (preset.kind === 'set' && !user.ownedGearSets.includes(preset.id)) {
      openModal({ kind: 'gearSet', id: preset.id });
      return;
    }
    setDraftLoadout((prev) => ({
      baseId: prev.baseId ?? preset.loadout.baseId,
      equippedGear: { ...EMPTY_GEAR, ...preset.loadout.equippedGear },
      activeSetId: preset.loadout.activeSetId,
    }));
  };

  return (
    <div className="animate-fade-in bg-scrim-strong fixed inset-0 z-[700] flex justify-center">
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[var(--background)]">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--glass-bg)] px-4 py-[calc(env(safe-area-inset-top,0px)+10px)] pb-3 backdrop-blur-xl">
          <IconButton onClick={close} aria-label="Fechar" icon={<Icon icon={X} size={18} />} />
          <div className="flex-1 text-center">
            <h2 className="t-title">Vestiário</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={save}>
            Salvar
          </Button>
        </header>

        <div className="px-4 py-5">
          <div className="grid grid-cols-[minmax(8.75rem,10rem)_1fr] items-center gap-4">
            <div className="border-soft flex h-44 w-full items-end justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[radial-gradient(circle_at_50%_12%,rgba(126,230,178,0.16),transparent_48%),var(--tint-1)]">
              <Avatar
                loadout={draftLoadout}
                size="stage"
                alt="Preview do avatar"
                pose="builder"
                highlightSlot={isGearSlot(tab) ? tab : undefined}
              />
            </div>
            <div className="space-y-3">
              <LoadoutStatus loadout={draftLoadout} />
              <StatsComparison current={currentStats} draft={draftStats} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Tabs<TabValue>
            items={TAB_ITEMS}
            value={tab}
            onChange={setTab}
            fitted={false}
            className="min-w-max"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {tab === 'presets' ? (
            <PresetGrid
              presets={presets}
              draftLoadout={draftLoadout}
              ownedGearSets={user.ownedGearSets}
              onSelectPreset={handleSelectPreset}
            />
          ) : tab === 'base' ? (
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_BASES.map((base) => {
                const active = draftLoadout.baseId === base.id;
                return (
                  <PickerTile
                    key={base.id}
                    selected={active}
                    onClick={() => setDraftLoadout((prev) => ({ ...prev, baseId: base.id }))}
                  >
                    <Avatar
                      loadout={{ ...draftLoadout, baseId: base.id }}
                      size="md"
                      alt={base.name}
                      pose="builder"
                    />
                    <span className="t-caption font-semibold text-[var(--foreground)]">
                      {base.name}
                    </span>
                  </PickerTile>
                );
              })}
            </div>
          ) : (
            <GearSlotGrid
              slot={tab}
              loadout={draftLoadout}
              ownedGearItems={user.ownedGearItems}
              onClear={() => setDraftLoadout((prev) => clearSlot(prev, tab))}
              onSelect={handleSelectGear}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function GearSlotGrid({
  slot,
  loadout,
  ownedGearItems,
  onClear,
  onSelect,
}: {
  slot: GearSlot;
  loadout: AvatarLoadout;
  ownedGearItems: string[];
  onClear: () => void;
  onSelect: (item: GearItem) => void;
}) {
  const items = GEAR_ITEMS.filter((item) => item.slot === slot);
  return (
    <div className="grid grid-cols-2 gap-3">
      <PickerTile selected={!loadout.equippedGear[slot]} onClick={onClear}>
        <span className="border-soft bg-tint-2 t-title flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)]">
          -
        </span>
        <span className="t-title">Vazio</span>
        <span className="t-caption">Sem peça</span>
      </PickerTile>

      {items.length === 0 ? <p className="t-caption col-span-2 text-center">Slot vazio.</p> : null}

      {items.map((item) => {
        const owned = ownedGearItems.includes(item.id);
        const equipped = loadout.equippedGear[item.slot] === item.id;
        return (
          <PickerTile
            key={item.id}
            selected={equipped}
            onClick={() => onSelect(item)}
            className="relative"
          >
            {equipped ? (
              <span className="gradient-primary absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-[var(--primary-foreground)]">
                <Icon icon={Check} size={12} strokeWidth={2.4} />
              </span>
            ) : null}
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[radial-gradient(circle_at_50%_10%,rgba(126,230,178,0.13),transparent_48%),var(--tint-2)]">
              <Avatar
                loadout={previewLoadoutForGear(loadout, item)}
                size="lg"
                alt={item.name}
                pose="builder"
                highlightSlot={item.slot}
                showAura={item.slot === 'aura'}
              />
            </div>
            <span className="t-title">{item.name}</span>
            <span className="t-caption">{item.tier}</span>
            <StatDeltas stats={item.battleStats} />
            {owned ? (
              <span className="t-caption">{equipped ? 'Equipado' : 'Equipar'}</span>
            ) : (
              <span className="t-body-sm inline-flex items-center gap-1 font-semibold text-[var(--accent-gold)]">
                <Icon icon={Coins} size={12} />
                {item.priceTokens}
              </span>
            )}
          </PickerTile>
        );
      })}
    </div>
  );
}

function isGearSlot(value: TabValue): value is GearSlot {
  return GEAR_SLOTS.includes(value as GearSlot);
}

function LoadoutStatus({ loadout }: { loadout: AvatarLoadout }) {
  const activeSet = GEAR_SETS.find((item) => item.id === loadout.activeSetId);
  const equippedCount = equippedGearIds(loadout).length;
  return (
    <div className="border-soft bg-tint-1 rounded-[var(--radius-md)] px-3 py-3">
      <p className="t-eyebrow">{activeSet ? 'Conjunto ativo' : 'Modo livre'}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="t-title truncate">{activeSet?.name ?? 'Peças combinadas'}</span>
        <span className="t-caption shrink-0">{equippedCount} peças</span>
      </div>
    </div>
  );
}

function PresetGrid({
  presets,
  draftLoadout,
  ownedGearSets,
  onSelectPreset,
}: {
  presets: DemoLoadoutPreset[];
  draftLoadout: AvatarLoadout;
  ownedGearSets: string[];
  onSelectPreset: (preset: DemoLoadoutPreset) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {presets.map((preset) => {
        const setItem =
          preset.kind === 'set' ? GEAR_SETS.find((item) => item.id === preset.id) : undefined;
        const owned = preset.kind === 'mix' || ownedGearSets.includes(preset.id);
        const selected = loadoutMatches(draftLoadout, preset.loadout);
        return (
          <PickerTile
            key={preset.id}
            selected={selected}
            onClick={() => onSelectPreset(preset)}
            className="relative"
          >
            {selected ? (
              <span className="gradient-primary absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-[var(--primary-foreground)]">
                <Icon icon={Check} size={12} strokeWidth={2.4} />
              </span>
            ) : null}
            <div
              className={cn(
                'flex h-28 w-28 items-center justify-center',
                !owned && 'opacity-55 grayscale',
              )}
            >
              <Avatar loadout={preset.loadout} size="xl" alt={preset.name} pose="builder" />
            </div>
            <span className="t-title">{preset.name}</span>
            <span className="t-caption">
              {selected
                ? 'Aplicado'
                : preset.kind === 'mix'
                  ? 'Aplicar mix'
                  : owned
                    ? 'Aplicar conjunto'
                    : 'Liberar'}
            </span>
            {!owned ? (
              <span className="t-caption inline-flex items-center gap-1">
                <Icon icon={Lock} size={11} />
                {setItem?.priceTokens ?? 0} tokens
              </span>
            ) : null}
          </PickerTile>
        );
      })}
    </div>
  );
}

function loadoutMatches(a: AvatarLoadout, b: AvatarLoadout) {
  if ((a.activeSetId ?? null) !== (b.activeSetId ?? null)) return false;
  return GEAR_SLOTS.every(
    (slot) => (a.equippedGear[slot] ?? null) === (b.equippedGear[slot] ?? null),
  );
}

function previewLoadoutForGear(loadout: AvatarLoadout, item: GearItem): AvatarLoadout {
  return {
    baseId: loadout.baseId,
    equippedGear: { ...EMPTY_GEAR, ...loadout.equippedGear, [item.slot]: item.id },
    activeSetId: null,
  };
}

function StatsComparison({ current, draft }: { current: BattleStats; draft: BattleStats }) {
  const rows: Array<{ key: keyof BattleStats; label: string }> = [
    { key: 'hp', label: 'HP' },
    { key: 'attack', label: 'Ataque' },
    { key: 'defense', label: 'Defesa' },
    { key: 'speed', label: 'Veloc.' },
    { key: 'focus', label: 'Foco' },
  ];
  return (
    <div className="border-soft bg-tint-1 min-w-0 rounded-[var(--radius-md)] px-3 py-3">
      <p className="t-eyebrow">Atributos</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {rows.map((row) => {
          const delta = draft[row.key] - current[row.key];
          return (
            <div key={row.key} className="bg-tint-2 rounded-[var(--radius-sm)] px-2 py-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="t-caption">{row.label}</span>
                <span className="t-body-sm font-semibold">{draft[row.key]}</span>
              </div>
              <span
                className={cn(
                  't-caption font-semibold',
                  delta > 0
                    ? 'text-[var(--primary)]'
                    : delta < 0
                      ? 'text-[var(--accent-orange)]'
                      : 'text-[var(--muted-foreground)]',
                )}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatDeltas({ stats }: { stats: Partial<BattleStats> }) {
  const entries = [
    ['hp', 'HP'],
    ['attack', 'Ataq.'],
    ['defense', 'Def.'],
    ['speed', 'Vel.'],
    ['focus', 'Foco'],
  ] as const;
  const visible = entries.filter(([key]) => Boolean(stats[key]));
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {visible.map(([key, label]) => (
        <span
          key={key}
          className="bg-tint-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-[0.64rem] font-semibold text-[var(--text-secondary)]"
        >
          +{stats[key]} {label}
        </span>
      ))}
    </div>
  );
}

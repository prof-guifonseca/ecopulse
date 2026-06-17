'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarLoadout, AvatarOutfits, GearSlot } from '@/types';
import {
  EMPTY_GEAR,
  gearItemIdsFromLegacySkinPacks,
  getGearItem,
  getGearSet,
  legacyItemIdsStillGear,
  loadoutFromLegacy,
  unique,
} from '@/data';
import {
  equipGearItem as equipGearItemRule,
  equipGearSet as equipGearSetRule,
} from '@/lib/gear/rules';
import { DEFAULT_REGION_ID, tribeFromGearSetId } from '@/data';
import { createSafeJSONStorage, readLegacyState, markLegacyMigrated } from './storage';

interface UserState {
  name: string;
  tribe: string;
  level: number;
  xp: number;
  xpToNext: number;
  tokens: number;
  tokensToday: number;
  streak: number;
  onboarded: boolean;
  firstScanCompleted: boolean;
  avatarBase: string | null;
  avatarOutfits: AvatarOutfits;
  ownedOutfits: string[];
  /** SkinPack id currently equipped, or null = composite (base + slots). */
  equippedSkinPack: string | null;
  /** Unlocked SkinPacks (via progression OR purchase). */
  ownedSkinPacks: string[];
  /** Canonical wearable avatar loadout. */
  avatarLoadout: AvatarLoadout;
  /** Canonical owned wearable equipment. */
  ownedGearItems: string[];
  /** Canonical owned equipment sets. */
  ownedGearSets: string[];
  /** Current region (geographic context). Defaults to 'londrina' — the first
   *  instance of the pluggable Region abstraction. */
  regionId: string;
  /** Doutrinas adopted by defeating arena rivals — small lasting passives. */
  adoptedDoctrines: string[];

  setProfile: (partial: Partial<UserState>) => void;
  addXp: (amount: number) => { leveled: boolean; newLevel: number };
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  resetTokensToday: () => void;
  setStreak: (value: number) => void;
  setOutfit: (slot: keyof AvatarOutfits, id: string | null) => void;
  addOwnedOutfit: (id: string) => void;
  setAvatarLoadout: (loadout: AvatarLoadout) => void;
  equipGearItem: (id: string) => void;
  clearGearSlot: (slot: GearSlot) => void;
  addOwnedGearItem: (id: string) => void;
  addOwnedGearItems: (ids: string[]) => void;
  unlockGearSet: (id: string) => boolean;
  equipGearSet: (id: string) => void;
  markFirstScanCompleted: () => void;
  completeOnboarding: (data: { name: string; avatarBase: string | null; tribe: string }) => void;
  /** Equip a SkinPack (must be owned) or null to switch back to composite. */
  equipSkinPack: (id: string | null) => void;
  /** Idempotent unlock; returns true if newly unlocked. */
  unlockSkinPack: (id: string) => boolean;
  /** Adopt a doutrina (idempotent). Returns true when newly adopted. */
  adoptDoctrine: (id: string) => boolean;
  setRegionId: (id: string) => void;
}

const DEFAULT_USER = {
  name: 'Eco-User',
  tribe: 'guardioes',
  level: 1,
  xp: 0,
  xpToNext: 100,
  tokens: 0,
  tokensToday: 0,
  streak: 0,
  onboarded: false,
  firstScanCompleted: false,
  avatarBase: null as string | null,
  avatarOutfits: {
    hat: null,
    glasses: null,
    shirt: null,
    accessory: null,
    background: null,
    weapon: null,
    hairstyle: null,
  } as AvatarOutfits,
  ownedOutfits: [] as string[],
  equippedSkinPack: null as string | null,
  ownedSkinPacks: [] as string[],
  avatarLoadout: {
    baseId: null,
    equippedGear: { ...EMPTY_GEAR },
    activeSetId: null,
  } as AvatarLoadout,
  ownedGearItems: [] as string[],
  ownedGearSets: [] as string[],
  regionId: DEFAULT_REGION_ID,
  adoptedDoctrines: [] as string[],
};

export function migrateUserStateToV3(state: Partial<UserState>): UserState {
  const prev = { ...DEFAULT_USER, ...state } as UserState;
  const legacySkinPacks = prev.ownedSkinPacks ?? [];
  const legacyOutfits = legacyItemIdsStillGear(prev.ownedOutfits ?? []);
  const ownedGearSets = unique([...(prev.ownedGearSets ?? []), ...legacySkinPacks]);
  const ownedGearItems = unique([
    ...(prev.ownedGearItems ?? []),
    ...legacyOutfits,
    ...gearItemIdsFromLegacySkinPacks(ownedGearSets),
  ]);
  const incomingLoadout = state.avatarLoadout;
  const hasPersistedLoadout = Boolean(
    incomingLoadout &&
    (incomingLoadout.baseId ||
      incomingLoadout.activeSetId ||
      Object.values(incomingLoadout.equippedGear ?? {}).some(Boolean)),
  );
  const migratedLoadout = hasPersistedLoadout
    ? {
        baseId: prev.avatarLoadout.baseId ?? prev.avatarBase ?? DEFAULT_USER.avatarBase,
        equippedGear: { ...EMPTY_GEAR, ...(prev.avatarLoadout.equippedGear ?? {}) },
        activeSetId: prev.avatarLoadout.activeSetId ?? null,
      }
    : loadoutFromLegacy(prev.avatarBase ?? null, prev.avatarOutfits ?? {}, prev.equippedSkinPack);

  return {
    ...prev,
    avatarBase: migratedLoadout.baseId,
    avatarOutfits: { ...DEFAULT_USER.avatarOutfits, ...(prev.avatarOutfits ?? {}) },
    ownedOutfits: unique([...(prev.ownedOutfits ?? []), ...legacyOutfits]),
    equippedSkinPack: null,
    ownedSkinPacks: unique(legacySkinPacks),
    avatarLoadout: migratedLoadout,
    ownedGearItems,
    ownedGearSets,
  };
}

export function migrateUserStateToV5(state: Partial<UserState>): UserState {
  const prev = migrateUserStateToV4(state);
  const regionId = prev.regionId && prev.regionId.length > 0 ? prev.regionId : DEFAULT_REGION_ID;
  const adoptedDoctrines = Array.isArray(prev.adoptedDoctrines)
    ? unique(prev.adoptedDoctrines)
    : [];

  // If tribe is still the bare default and the user is already onboarded, try
  // to deduce a tribe from the active gear set so the lateral identity isn't
  // empty for legacy installs.
  let tribe = prev.tribe;
  const looksUntouched = (!tribe || tribe === DEFAULT_USER.tribe) && prev.onboarded;
  if (looksUntouched) {
    const deduced = tribeFromGearSetId(prev.avatarLoadout?.activeSetId ?? null);
    if (deduced) tribe = deduced;
  }
  if (!tribe) tribe = DEFAULT_USER.tribe;

  return {
    ...prev,
    tribe,
    regionId,
    adoptedDoctrines,
  };
}

export function migrateUserStateToV4(state: Partial<UserState>): UserState {
  const prev = migrateUserStateToV3(state);
  const ownedGearSets = unique(prev.ownedGearSets ?? []);
  const ownedGearItems = unique([
    ...(prev.ownedGearItems ?? []),
    ...gearItemIdsFromLegacySkinPacks(ownedGearSets),
  ]);
  const activeSet = getGearSet(prev.avatarLoadout.activeSetId);
  const equippedGear = { ...EMPTY_GEAR, ...(prev.avatarLoadout.equippedGear ?? {}) };

  if (activeSet) {
    for (const [slot, itemId] of Object.entries(activeSet.defaultLoadout) as Array<
      [GearSlot, string]
    >) {
      if (!equippedGear[slot]) {
        equippedGear[slot] = itemId;
      }
    }
  }

  const avatarLoadout = {
    baseId: prev.avatarLoadout.baseId ?? prev.avatarBase,
    equippedGear,
    activeSetId: prev.avatarLoadout.activeSetId ?? null,
  };

  return {
    ...prev,
    avatarBase: avatarLoadout.baseId,
    avatarLoadout,
    ownedGearSets,
    ownedGearItems,
    ownedOutfits: unique([...(prev.ownedOutfits ?? []), ...ownedGearItems]),
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER,

      setProfile: (partial) =>
        set((s) => {
          const nextLoadout = partial.avatarLoadout
            ? {
                baseId:
                  partial.avatarLoadout.baseId ?? partial.avatarBase ?? s.avatarLoadout.baseId,
                equippedGear: { ...EMPTY_GEAR, ...partial.avatarLoadout.equippedGear },
                activeSetId: partial.avatarLoadout.activeSetId ?? null,
              }
            : partial.avatarBase !== undefined
              ? { ...s.avatarLoadout, baseId: partial.avatarBase }
              : s.avatarLoadout;
          return {
            ...partial,
            avatarBase: partial.avatarBase ?? nextLoadout.baseId,
            avatarLoadout: nextLoadout,
          };
        }),

      addXp: (amount) => {
        let { xp, xpToNext, level } = get();
        let leveled = false;
        xp += amount;
        while (xp >= xpToNext) {
          xp -= xpToNext;
          level += 1;
          xpToNext = Math.floor(xpToNext * 1.4);
          leveled = true;
        }
        set({ xp, xpToNext, level });
        return { leveled, newLevel: level };
      },

      addTokens: (amount) =>
        set((s) => ({
          tokens: s.tokens + amount,
          tokensToday: s.tokensToday + amount,
        })),

      spendTokens: (amount) => {
        const { tokens } = get();
        if (tokens < amount) return false;
        set({ tokens: tokens - amount });
        return true;
      },

      resetTokensToday: () => set({ tokensToday: 0 }),

      setStreak: (value) => set({ streak: Math.max(0, value) }),

      markFirstScanCompleted: () => set({ firstScanCompleted: true }),

      setOutfit: (slot, id) =>
        set((s) => {
          const item = getGearItem(id);
          return {
            avatarOutfits: { ...s.avatarOutfits, [slot]: id },
            avatarLoadout: item ? equipGearItemRule(s.avatarLoadout, item) : s.avatarLoadout,
            equippedSkinPack: null,
          };
        }),

      addOwnedOutfit: (id) =>
        set((s) => {
          const gear = getGearItem(id);
          return {
            ownedOutfits: s.ownedOutfits.includes(id) ? s.ownedOutfits : [...s.ownedOutfits, id],
            ownedGearItems: gear ? unique([...s.ownedGearItems, id]) : s.ownedGearItems,
          };
        }),

      setAvatarLoadout: (loadout) =>
        set((s) => ({
          avatarBase: loadout.baseId,
          avatarLoadout: {
            baseId: loadout.baseId,
            equippedGear: { ...EMPTY_GEAR, ...loadout.equippedGear },
            activeSetId: loadout.activeSetId ?? null,
          },
          // Keep legacy composite slots roughly in sync for older call sites.
          avatarOutfits: { ...s.avatarOutfits },
          equippedSkinPack: null,
        })),

      equipGearItem: (id) =>
        set((s) => {
          const item = getGearItem(id);
          if (!item || !s.ownedGearItems.includes(id)) return s;
          const nextLoadout = equipGearItemRule(s.avatarLoadout, item);
          return {
            avatarLoadout: nextLoadout,
            avatarBase: nextLoadout.baseId,
            equippedSkinPack: null,
          };
        }),

      clearGearSlot: (slot) =>
        set((s) => ({
          avatarLoadout: {
            ...s.avatarLoadout,
            equippedGear: { ...s.avatarLoadout.equippedGear, [slot]: null },
          },
          equippedSkinPack: null,
        })),

      addOwnedGearItem: (id) =>
        set((s) =>
          s.ownedGearItems.includes(id)
            ? s
            : {
                ownedGearItems: [...s.ownedGearItems, id],
                ownedOutfits: unique([...s.ownedOutfits, id]),
              },
        ),

      addOwnedGearItems: (ids) =>
        set((s) => ({
          ownedGearItems: unique([...s.ownedGearItems, ...ids]),
          ownedOutfits: unique([...s.ownedOutfits, ...ids]),
        })),

      unlockGearSet: (id) => {
        const setItem = getGearSet(id);
        if (!setItem) return false;
        const { ownedGearSets, ownedGearItems, ownedSkinPacks } = get();
        if (ownedGearSets.includes(id)) return false;
        set({
          ownedGearSets: [...ownedGearSets, id],
          ownedGearItems: unique([...ownedGearItems, ...setItem.itemIds]),
          ownedOutfits: unique([...get().ownedOutfits, ...setItem.itemIds]),
          ownedSkinPacks: unique([...ownedSkinPacks, id]),
        });
        return true;
      },

      equipGearSet: (id) =>
        set((s) => {
          const setItem = getGearSet(id);
          if (!setItem || !s.ownedGearSets.includes(id)) return s;
          const nextLoadout = equipGearSetRule(
            { ...s.avatarLoadout, baseId: s.avatarLoadout.baseId ?? s.avatarBase },
            setItem,
          );
          return {
            avatarLoadout: nextLoadout,
            avatarBase: nextLoadout.baseId,
            equippedSkinPack: null,
          };
        }),

      completeOnboarding: ({ name, avatarBase, tribe }) =>
        set((s) => ({
          name,
          avatarBase,
          avatarLoadout: { ...s.avatarLoadout, baseId: avatarBase },
          tribe,
          onboarded: true,
        })),

      equipSkinPack: (id) =>
        set((s) => {
          if (id === null) return { equippedSkinPack: null };
          const setItem = getGearSet(id);
          if (!setItem || !s.ownedGearSets.includes(id)) return s;
          const nextLoadout = equipGearSetRule(
            { ...s.avatarLoadout, baseId: s.avatarLoadout.baseId ?? s.avatarBase },
            setItem,
          );
          return {
            equippedSkinPack: null,
            avatarLoadout: nextLoadout,
            avatarBase: nextLoadout.baseId,
          };
        }),

      adoptDoctrine: (id) => {
        const { adoptedDoctrines } = get();
        if (adoptedDoctrines.includes(id)) return false;
        set({ adoptedDoctrines: [...adoptedDoctrines, id] });
        return true;
      },

      setRegionId: (id) => set({ regionId: id }),

      unlockSkinPack: (id) => {
        const setItem = getGearSet(id);
        const { ownedSkinPacks, ownedGearSets, ownedGearItems, ownedOutfits } = get();
        const alreadyFullyOwned =
          ownedSkinPacks.includes(id) &&
          ownedGearSets.includes(id) &&
          Boolean(setItem?.itemIds.every((itemId) => ownedGearItems.includes(itemId)));
        if (alreadyFullyOwned) return false;
        set({
          ownedSkinPacks: unique([...ownedSkinPacks, id]),
          ownedGearSets: ownedGearSets.includes(id) ? ownedGearSets : [...ownedGearSets, id],
          ownedGearItems: setItem
            ? unique([...ownedGearItems, ...setItem.itemIds])
            : ownedGearItems,
          ownedOutfits: setItem ? unique([...ownedOutfits, ...setItem.itemIds]) : ownedOutfits,
        });
        return true;
      },
    }),
    {
      name: 'ecopulse:user',
      version: 5,
      storage: createSafeJSONStorage<UserState>(),
      migrate: (state, version) => {
        // Legacy localStorage import (still supported for v0).
        const legacy = readLegacyState();
        if (legacy) {
          return migrateUserStateToV5({
            ...(state as UserState),
            name: legacy.name ?? DEFAULT_USER.name,
            tribe: legacy.tribe ?? DEFAULT_USER.tribe,
            level: legacy.level ?? DEFAULT_USER.level,
            xp: legacy.xp ?? DEFAULT_USER.xp,
            xpToNext: legacy.xpToNext ?? DEFAULT_USER.xpToNext,
            tokens: legacy.tokens ?? DEFAULT_USER.tokens,
            tokensToday: legacy.tokensToday ?? DEFAULT_USER.tokensToday,
            streak: legacy.streak ?? DEFAULT_USER.streak,
            onboarded: legacy.onboarded ?? false,
            firstScanCompleted: legacy.firstScanCompleted ?? DEFAULT_USER.firstScanCompleted,
            avatarBase: legacy.avatarBase ?? null,
            avatarOutfits: { ...DEFAULT_USER.avatarOutfits, ...(legacy.avatarOutfits ?? {}) },
            ownedOutfits: legacy.ownedOutfits ?? [],
            equippedSkinPack: null,
            ownedSkinPacks: [],
          } as Partial<UserState>);
        }
        // v1 → v2: ensure new skin fields + new slot defaults
        if (version === 1) {
          const prev = state as Partial<UserState>;
          return migrateUserStateToV5({
            ...(state as UserState),
            avatarOutfits: { ...DEFAULT_USER.avatarOutfits, ...(prev.avatarOutfits ?? {}) },
            equippedSkinPack: prev.equippedSkinPack ?? null,
            ownedSkinPacks: prev.ownedSkinPacks ?? [],
          } as Partial<UserState>);
        }
        return migrateUserStateToV5(state as Partial<UserState>);
      },
      onRehydrateStorage: () => () => markLegacyMigrated(),
    },
  ),
);

if (typeof window !== 'undefined') {
  useUserStore.persist.setOptions({
    storage: createSafeJSONStorage<UserState>(),
  });
}

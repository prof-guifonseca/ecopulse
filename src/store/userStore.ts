'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarOutfits } from '@/types';
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

  setProfile: (partial: Partial<UserState>) => void;
  addXp: (amount: number) => { leveled: boolean; newLevel: number };
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  resetTokensToday: () => void;
  setStreak: (value: number) => void;
  setOutfit: (slot: keyof AvatarOutfits, id: string | null) => void;
  addOwnedOutfit: (id: string) => void;
  markFirstScanCompleted: () => void;
  completeOnboarding: (data: { name: string; avatarBase: string | null; tribe: string }) => void;
  /** Equip a SkinPack (must be owned) or null to switch back to composite. */
  equipSkinPack: (id: string | null) => void;
  /** Idempotent unlock; returns true if newly unlocked. */
  unlockSkinPack: (id: string) => boolean;
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
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER,

      setProfile: (partial) => set(partial),

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
        set((s) => ({ avatarOutfits: { ...s.avatarOutfits, [slot]: id } })),

      addOwnedOutfit: (id) =>
        set((s) => (s.ownedOutfits.includes(id) ? s : { ownedOutfits: [...s.ownedOutfits, id] })),

      completeOnboarding: ({ name, avatarBase, tribe }) =>
        set({ name, avatarBase, tribe, onboarded: true }),

      equipSkinPack: (id) =>
        set((s) => {
          // Allow null (un-equip) or any owned id. Silently no-op if id not owned.
          if (id !== null && !s.ownedSkinPacks.includes(id)) return s;
          return { equippedSkinPack: id };
        }),

      unlockSkinPack: (id) => {
        const { ownedSkinPacks } = get();
        if (ownedSkinPacks.includes(id)) return false;
        set({ ownedSkinPacks: [...ownedSkinPacks, id] });
        return true;
      },
    }),
    {
      name: 'ecopulse:user',
      version: 2,
      storage: createSafeJSONStorage<UserState>(),
      migrate: (state, version) => {
        // Legacy localStorage import (still supported for v0).
        const legacy = readLegacyState();
        if (legacy) {
          return {
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
          } as UserState;
        }
        // v1 → v2: ensure new skin fields + new slot defaults
        if (version === 1) {
          const prev = state as Partial<UserState>;
          return {
            ...(state as UserState),
            avatarOutfits: { ...DEFAULT_USER.avatarOutfits, ...(prev.avatarOutfits ?? {}) },
            equippedSkinPack: prev.equippedSkinPack ?? null,
            ownedSkinPacks: prev.ownedSkinPacks ?? [],
          } as UserState;
        }
        return state as UserState;
      },
      onRehydrateStorage: () => () => markLegacyMigrated(),
    }
  )
);

if (typeof window !== 'undefined') {
  useUserStore.persist.setOptions({
    storage: createSafeJSONStorage<UserState>(),
  });
}

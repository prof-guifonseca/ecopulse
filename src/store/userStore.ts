'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarOutfits } from '@/types';
import { createSafeJSONStorage, readLegacyState, markLegacyMigrated } from './storage';

interface UserState {
  name: string;
  avatar: string;
  tribe: string;
  level: number;
  xp: number;
  xpToNext: number;
  tokens: number;
  tokensToday: number;
  streak: number;
  onboarded: boolean;
  avatarBase: string | null;
  avatarOutfits: AvatarOutfits;
  ownedOutfits: string[];

  setProfile: (partial: Partial<UserState>) => void;
  addXp: (amount: number) => { leveled: boolean; newLevel: number };
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  setOutfit: (slot: keyof AvatarOutfits, id: string | null) => void;
  addOwnedOutfit: (id: string) => void;
  completeOnboarding: (data: { name: string; avatar: string; avatarBase: string | null; tribe: string }) => void;
}

const DEFAULT_USER = {
  name: 'Eco-User',
  avatar: '🌿',
  tribe: 'guardioes',
  level: 5,
  xp: 340,
  xpToNext: 500,
  tokens: 127,
  tokensToday: 35,
  streak: 12,
  onboarded: false,
  avatarBase: null as string | null,
  avatarOutfits: { hat: null, glasses: null, shirt: null, accessory: null, background: null } as AvatarOutfits,
  ownedOutfits: [] as string[],
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

      setOutfit: (slot, id) =>
        set((s) => ({ avatarOutfits: { ...s.avatarOutfits, [slot]: id } })),

      addOwnedOutfit: (id) =>
        set((s) => (s.ownedOutfits.includes(id) ? s : { ownedOutfits: [...s.ownedOutfits, id] })),

      completeOnboarding: ({ name, avatar, avatarBase, tribe }) =>
        set({ name, avatar, avatarBase, tribe, onboarded: true }),
    }),
    {
      name: 'ecopulse:user',
      version: 1,
      storage: createSafeJSONStorage<UserState>(),
      migrate: (state) => {
        const legacy = readLegacyState();
        if (legacy) {
          return {
            ...(state as UserState),
            name: legacy.name ?? DEFAULT_USER.name,
            avatar: legacy.avatar ?? DEFAULT_USER.avatar,
            tribe: legacy.tribe ?? DEFAULT_USER.tribe,
            level: legacy.level ?? DEFAULT_USER.level,
            xp: legacy.xp ?? DEFAULT_USER.xp,
            xpToNext: legacy.xpToNext ?? DEFAULT_USER.xpToNext,
            tokens: legacy.tokens ?? DEFAULT_USER.tokens,
            tokensToday: legacy.tokensToday ?? DEFAULT_USER.tokensToday,
            streak: legacy.streak ?? DEFAULT_USER.streak,
            onboarded: legacy.onboarded ?? false,
            avatarBase: legacy.avatarBase ?? null,
            avatarOutfits: { ...DEFAULT_USER.avatarOutfits, ...(legacy.avatarOutfits ?? {}) },
            ownedOutfits: legacy.ownedOutfits ?? [],
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

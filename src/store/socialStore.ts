'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafeJSONStorage, readLegacyState } from './storage';

interface SocialState {
  likedPosts: string[];
  following: string[];
  chatSentFirst: boolean;

  toggleLike: (postId: string) => boolean; // returns new liked state
  follow: (name: string) => void;
  markChatSent: () => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      likedPosts: [],
      following: [],
      chatSentFirst: false,

      toggleLike: (postId) => {
        const liked = get().likedPosts.includes(postId);
        set((s) => ({
          likedPosts: liked
            ? s.likedPosts.filter((x) => x !== postId)
            : [...s.likedPosts, postId],
        }));
        return !liked;
      },

      follow: (name) =>
        set((s) => (s.following.includes(name) ? s : { following: [...s.following, name] })),

      markChatSent: () => set({ chatSentFirst: true }),
    }),
    {
      name: 'ecopulse:social',
      version: 1,
      storage: createSafeJSONStorage<SocialState>(),
      migrate: (state) => {
        const legacy = readLegacyState();
        if (legacy) {
          return {
            ...(state as SocialState),
            likedPosts: legacy.likedPosts ?? [],
            following: legacy.following ?? [],
            chatSentFirst: legacy.chatSentFirst ?? false,
          } as SocialState;
        }
        return state as SocialState;
      },
    }
  )
);

if (typeof window !== 'undefined') {
  useSocialStore.persist.setOptions({
    storage: createSafeJSONStorage<SocialState>(),
  });
}

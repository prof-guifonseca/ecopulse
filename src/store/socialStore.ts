'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafeJSONStorage, readLegacyState } from './storage';
import type { CommunityComment } from '@/domain';

interface SocialState {
  likedPosts: string[];
  following: string[];
  comments: CommunityComment[];

  toggleLike: (postId: string) => boolean; // returns new liked state
  follow: (name: string) => void;
  addComment: (input: {
    postId: string;
    text: string;
    userName: string;
    userAvatar?: string;
    userId?: string;
  }) => CommunityComment;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      likedPosts: [],
      following: [],
      comments: [],

      toggleLike: (postId) => {
        const liked = get().likedPosts.includes(postId);
        set((s) => ({
          likedPosts: liked ? s.likedPosts.filter((x) => x !== postId) : [...s.likedPosts, postId],
        }));
        return !liked;
      },

      follow: (name) =>
        set((s) => (s.following.includes(name) ? s : { following: [...s.following, name] })),

      addComment: ({ postId, text, userName, userAvatar = '🌱', userId = 'local-user' }) => {
        const comment: CommunityComment = {
          id: `comment:${postId}:${Date.now().toString(36)}`,
          postId,
          userId,
          userName,
          userAvatar,
          text: text.trim().slice(0, 500),
          createdAt: new Date().toISOString(),
          source: 'user',
        };
        set((s) => ({ comments: [comment, ...s.comments].slice(0, 500) }));
        return comment;
      },
    }),
    {
      name: 'ecopulse:social',
      version: 2,
      storage: createSafeJSONStorage<SocialState>(),
      migrate: (state) => {
        const legacy = readLegacyState();
        if (legacy) {
          return {
            ...(state as SocialState),
            likedPosts: legacy.likedPosts ?? [],
            following: legacy.following ?? [],
            comments: normalizeComments((state as Partial<SocialState>)?.comments),
          } as SocialState;
        }
        return {
          ...(state as SocialState),
          comments: normalizeComments((state as Partial<SocialState>)?.comments),
        } as SocialState;
      },
    },
  ),
);

if (typeof window !== 'undefined') {
  useSocialStore.persist.setOptions({
    storage: createSafeJSONStorage<SocialState>(),
  });
}

function normalizeComments(value: unknown): CommunityComment[] {
  return Array.isArray(value) ? value.filter(isCommunityComment) : [];
}

function isCommunityComment(value: unknown): value is CommunityComment {
  if (!value || typeof value !== 'object') return false;
  const comment = value as Partial<CommunityComment>;
  return Boolean(comment.id && comment.postId && comment.text && comment.createdAt);
}

'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'reward';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export type ModalContent =
  | { kind: 'product'; id: string }
  | { kind: 'mapPoint'; id: string }
  | { kind: 'tutorial'; id: string }
  | { kind: 'shopItem'; id: string }
  | { kind: 'greenMarketInfo'; packId?: string }
  | { kind: 'postComments'; id: string }
  | { kind: 'createPost' }
  | { kind: 'userProfile'; name: string }
  | { kind: 'badge'; id: string };

interface UIState {
  toasts: Toast[];
  modal: ModalContent | null;
  storyIndex: number | null;
  chatId: string | null;
  chatListOpen: boolean;
  avatarBuilderOpen: boolean;
  confettiKey: number;

  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  dismissToast: (id: number) => void;
  openModal: (c: ModalContent) => void;
  closeModal: () => void;
  openStory: (i: number) => void;
  closeStory: () => void;
  openChat: (id: string) => void;
  closeChat: () => void;
  openChatList: () => void;
  closeChatList: () => void;
  openAvatarBuilder: () => void;
  closeAvatarBuilder: () => void;
  fireConfetti: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>()((set, get) => ({
  toasts: [],
  modal: null,
  storyIndex: null,
  chatId: null,
  chatListOpen: false,
  avatarBuilderOpen: false,
  confettiKey: 0,

  showToast: (message, type = 'success', durationMs = 3000) => {
    const id = ++toastCounter;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), durationMs);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  openModal: (c) => set({ modal: c }),
  closeModal: () => set({ modal: null }),
  openStory: (i) => set({ storyIndex: i }),
  closeStory: () => set({ storyIndex: null }),
  openChat: (id) => set({ chatId: id, chatListOpen: false }),
  closeChat: () => set({ chatId: null }),
  openChatList: () => set({ chatListOpen: true }),
  closeChatList: () => set({ chatListOpen: false }),
  openAvatarBuilder: () => set({ avatarBuilderOpen: true }),
  closeAvatarBuilder: () => set({ avatarBuilderOpen: false }),
  fireConfetti: () => set((s) => ({ confettiKey: s.confettiKey + 1 })),
}));

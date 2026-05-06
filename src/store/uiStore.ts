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
  | { kind: 'gearSet'; id: string }
  | { kind: 'skinPack'; id: string }
  | { kind: 'postComments'; id: string }
  | { kind: 'chapterUnlock'; chapterId: string };

interface UIState {
  toasts: Toast[];
  modal: ModalContent | null;
  avatarBuilderOpen: boolean;
  confettiKey: number;

  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  dismissToast: (id: number) => void;
  openModal: (c: ModalContent) => void;
  closeModal: () => void;
  openAvatarBuilder: () => void;
  closeAvatarBuilder: () => void;
  fireConfetti: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>()((set, get) => ({
  toasts: [],
  modal: null,
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
  openAvatarBuilder: () => set({ avatarBuilderOpen: true }),
  closeAvatarBuilder: () => set({ avatarBuilderOpen: false }),
  fireConfetti: () => set((s) => ({ confettiKey: s.confettiKey + 1 })),
}));

'use client';

import { createElement } from 'react';
import { create } from 'zustand';
import { Coins } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'info' | 'reward';

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
  modal: ModalContent | null;
  avatarBuilderOpen: boolean;
  confettiKey: number;

  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  openModal: (c: ModalContent) => void;
  closeModal: () => void;
  openAvatarBuilder: () => void;
  closeAvatarBuilder: () => void;
  fireConfetti: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  modal: null,
  avatarBuilderOpen: false,
  confettiKey: 0,

  // Toasts are owned by sonner (rendered by <Toasts /> in Overlays); the store
  // is just the typed entry point so call sites keep using showToast().
  showToast: (message, type = 'success', durationMs = 3000) => {
    if (type === 'reward') {
      sonnerToast(message, { duration: durationMs, icon: createElement(Coins, { size: 16 }) });
    } else if (type === 'info') {
      sonnerToast.info(message, { duration: durationMs });
    } else {
      sonnerToast.success(message, { duration: durationMs });
    }
  },
  openModal: (c) => set({ modal: c }),
  closeModal: () => set({ modal: null }),
  openAvatarBuilder: () => set({ avatarBuilderOpen: true }),
  closeAvatarBuilder: () => set({ avatarBuilderOpen: false }),
  fireConfetti: () => set((s) => ({ confettiKey: s.confettiKey + 1 })),
}));

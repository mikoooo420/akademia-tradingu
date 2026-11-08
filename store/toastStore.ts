'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'reward';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (toast) => {
    counter += 1;
    const id = `toast_${counter}_${Date.now()}`;
    const duration = toast.duration ?? (toast.type === 'reward' ? 6500 : 4500);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id, duration }].slice(-5) }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Skrót do wywoływania powiadomień poza komponentami React. */
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().push({ type: 'success', title, description }),
  error: (title: string, description?: string) => useToastStore.getState().push({ type: 'error', title, description }),
  info: (title: string, description?: string) => useToastStore.getState().push({ type: 'info', title, description }),
  reward: (title: string, description?: string) => useToastStore.getState().push({ type: 'reward', title, description }),
};

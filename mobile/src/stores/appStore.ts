import { create } from 'zustand';

/**
 * App Store
 * Global app state for UI and settings
 */

interface AppState {
  // UI State
  isLoading: boolean;
  loadingMessage: string | null;

  // Network State
  isOnline: boolean;

  // Actions
  setLoading: (loading: boolean, message?: string) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  // Initial state
  isLoading: false,
  loadingMessage: null,
  isOnline: true,

  // Set loading state
  setLoading: (loading: boolean, message?: string) => {
    set({
      isLoading: loading,
      loadingMessage: loading ? message || null : null,
    });
  },

  // Set online status
  setOnline: (online: boolean) => {
    set({ isOnline: online });
  },
}));

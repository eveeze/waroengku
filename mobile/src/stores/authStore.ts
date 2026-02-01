import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthUser, UserRole } from '@/api/types';
import { login as apiLogin, logout as apiLogout } from '@/api/endpoints/auth';
import { tokenStorage, storage } from '@/utils/storage';
import { config } from '@/constants/config';

/**
 * Auth Store
 * Manages authentication state with Zustand
 */

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  hydrate: () => Promise<void>;
  setHydrated: (state: boolean) => void;

  // Selectors
  isAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Check if we're running on web platform
const isWeb = Platform.OS === 'web';

// Web-compatible storage adapter using localStorage directly
const webStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch (error) {
      console.error('localStorage setItem error:', error);
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },
};

// Choose storage based on platform
const getStorage = () => {
  if (isWeb) {
    return webStorage;
  }
  return AsyncStorage;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state - on web, start as hydrated to avoid loading screen
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: isWeb, // KEY FIX: Start hydrated on web!
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiLogin({ email, password });

          // Save user to storage
          await storage.setObject(config.storage.user, response.user);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Login gagal';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          await apiLogout();
          await storage.removeItem(config.storage.user);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Set user
      setUser: (user: AuthUser | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Hydrate from storage
      hydrate: async () => {
        // On web, already hydrated via initial state
        if (isWeb) {
          return;
        }

        try {
          // Timeout race to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Hydration timeout')), 2500),
          );

          const loadPromise = async () => {
            const token = await tokenStorage.getAccessToken();
            const userJson = await storage.getObject<AuthUser>(
              config.storage.user,
            );
            return { token, userJson };
          };

          const result = (await Promise.race([
            loadPromise(),
            timeoutPromise,
          ])) as { token: string | null; userJson: AuthUser | null };

          if (result && result.token && result.userJson) {
            set({
              user: result.userJson,
              isAuthenticated: true,
              isHydrated: true,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isHydrated: true,
            });
          }
        } catch (err) {
          console.warn('[AuthStore] Hydrate fallback:', err);
          set({
            user: null,
            isAuthenticated: false,
            isHydrated: true,
          });
        }
      },

      setHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      // Check if user has specific role
      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'warungku-auth-storage',
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        console.log('[AuthStore] Persist rehydrated');
      },
    },
  ),
);

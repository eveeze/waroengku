import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Selectors
  isAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
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
          const message = error instanceof Error ? error.message : 'Login gagal';
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
        try {
          const token = await tokenStorage.getAccessToken();
          const userJson = await storage.getObject<AuthUser>(config.storage.user);
          
          if (token && userJson) {
            set({
              user: userJson,
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
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isHydrated: true,
          });
        }
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
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

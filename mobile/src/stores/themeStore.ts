import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Actions to be called on startup
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
      },
      hydrate: async () => {
        // Just ensures persistence is loaded
      },
    }),
    {
      name: 'theme-storage-system-restore',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

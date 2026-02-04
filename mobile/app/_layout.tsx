import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStore } from '@/stores/networkStore';
import { useThemeStore } from '@/stores/themeStore';
import { useColorScheme } from 'nativewind';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { OfflineNotice } from '@/components/shared';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

import {
  useFonts,
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import '../global.css';

/**
 * Root Layout
 * App entry point with providers
 */
export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const setupNetworkListener = useNetworkStore((state) => state.setupListener);
  const theme = useThemeStore((state) => state.theme);
  const { setColorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    // Sync theme
    if (theme === 'system') {
      setColorScheme('system');
    } else {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  useEffect(() => {
    // Hydrate auth state from storage on app start
    hydrate();

    // Setup network listener
    const unsubscribe = setupNetworkListener();
    return () => unsubscribe();
  }, [hydrate, setupNetworkListener]);

  if (!fontsLoaded) {
    return null; // Or a splash screen
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <OfflineNotice />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(admin)" />
            </Stack>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

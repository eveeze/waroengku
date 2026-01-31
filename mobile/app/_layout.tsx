import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStore } from '@/stores/networkStore';
import { OfflineNotice } from '@/components/shared';

import '../global.css';

/**
 * Root Layout
 * App entry point with providers
 */
export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const setupNetworkListener = useNetworkStore((state) => state.setupListener);

  useEffect(() => {
    // Hydrate auth state from storage on app start
    hydrate();

    // Setup network listener
    const unsubscribe = setupNetworkListener();
    return () => unsubscribe();
  }, [hydrate, setupNetworkListener]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <OfflineNotice />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

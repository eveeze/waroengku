import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';

/**
 * Index Screen
 * Entry point - redirects based on auth state
 */
export default function IndexScreen() {
  const { isAuthenticated, isHydrated, user, setHydrated } = useAuthStore();
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    // If stuck on loading for > 5 seconds, show bypass button
    const timer = setTimeout(() => {
      // Check if hydration is still pending
      if (!useAuthStore.getState().isHydrated) {
        setShowBypass(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while hydrating auth state
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-primary-600 items-center justify-center p-4">
        <Loading message="Memuat aplikasi..." />

        {showBypass && (
          <View className="mt-8 w-full max-w-xs items-center">
            <Text className="text-white text-center mb-4 opacity-90 font-medium">
              Proses memuat terlalu lama?
            </Text>
            <Button
              title="Lewati Loading (Force Enter)"
              onPress={() => setHydrated(true)}
              variant="outline"
              className="border-white/50 w-full"
              textClassName="text-white"
            />
          </View>
        )}
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated && user) {
    // Check if user is admin
    if (user.role === 'admin') {
      return <Redirect href="/(admin)" />;
    }
    // For other roles, still go to admin for now (will be handled later)
    return <Redirect href="/(admin)" />;
  }

  // Not authenticated - go to login
  return <Redirect href="/(auth)/login" />;
}

import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui/Loading';

/**
 * Index Screen
 * Entry point - redirects based on auth state
 */
export default function IndexScreen() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  // Show loading while hydrating auth state
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-primary-600 items-center justify-center">
        <Loading message="Memuat aplikasi..." />
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

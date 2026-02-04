import { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui/Loading';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';

/**
 * Admin Layout
 * Protected layout with bottom tabs for admin role
 */
import { TouchableOpacity, Text, View } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';

// ...

export default function AdminLayout() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Show loading while hydrating
  if (!isHydrated) {
    return <Loading fullScreen message="Memuat..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if user is admin (for now, we allow all roles to access admin)
  if (user.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Stock',
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: 'POS',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
        }}
      />

      {/* Hidden Routes (Still accessible, but no tab button) */}
      <Tabs.Screen name="customers" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="cash-flow" options={{ href: null }} />
      <Tabs.Screen name="refillables" options={{ href: null }} />
      <Tabs.Screen name="stock-opname" options={{ href: null }} />
      <Tabs.Screen name="inventory" options={{ href: null }} />
      <Tabs.Screen name="consignment" options={{ href: null }} />
    </Tabs>
  );
}

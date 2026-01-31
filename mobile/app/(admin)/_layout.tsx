import { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/ui/Loading';

/**
 * Admin Layout
 * Protected layout with bottom tabs for admin role
 */
export default function AdminLayout() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  // Show loading while hydrating
  if (!isHydrated) {
    return <Loading fullScreen message="Memuat..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if user is admin (for now, we allow all roles to access admin)
  // In production, you might want to restrict this
  if (user.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produk',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Pelanggan',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Kategori',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏷️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
    </Tabs>
  );
}


import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { DashboardData } from '@/api/types';
import { Loading } from '@/components/ui';

/**
 * Admin Dashboard Screen
 * Swiss Minimalist Design Refactor
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, userName, logout } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/reports/dashboard'],
    queryFn: ({ queryKey }) => fetchWithCache<any>({ queryKey }),
  });

  // Data structure might be { success: true, data: {...} } or just {...} depending on backend.
  // fetchWithCache returns response.data (full body).
  // Docs for dashboard: { success: true, message: "...", data: { ... } }
  const dashboard = data?.data as DashboardData | undefined;

  // No useEffect needed for initial fetch with useQuery

  const handleLogout = async () => {
    Alert.alert('LOGOUT', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Support both old and new API response format
  const todaySales = dashboard?.today?.total_sales ?? 0;
  const todayTransactions = dashboard?.today?.total_transactions ?? 0;
  const todayProfit = dashboard?.today?.estimated_profit ?? 0;

  // Alert counts
  const lowStockCount = dashboard?.low_stock_count ?? 0;
  const outOfStockCount = dashboard?.out_of_stock_count ?? 0;
  const outstandingKasbon = dashboard?.total_outstanding_kasbon ?? 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        {/* Header Section */}
        <View
          className="px-6 pb-6 border-b border-secondary-100 bg-white"
          style={{ paddingTop: insets.top + 20 }}
        >
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-1 font-body">
                Welcome back,
              </Text>
              <Text className="text-3xl font-heading uppercase tracking-tight text-primary-900">
                {userName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 items-center justify-center rounded-full bg-secondary-50"
            >
              <Text className="text-lg">➜</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 p-4 mb-4 rounded-lg">
              <Text className="text-red-600 font-bold mb-2">
                FAILED TO LOAD DATA
              </Text>
              <Text className="text-red-800 text-xs mb-3">
                {(error as Error)?.message || 'Unknown error'}
              </Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text className="font-bold underline text-red-900">RETRY</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hero Metric: Today's Sales */}
          <View className="py-2">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2 font-body">
              Today's Revenue
            </Text>
            <Text className="text-6xl font-heading tracking-tighter text-black leading-tight">
              {formatCurrency(todaySales)}
            </Text>
            <View className="flex-row items-center gap-4 mt-2">
              <Text className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 uppercase tracking-wide">
                +{todayTransactions} Transactions
              </Text>
              <Text className="text-sm font-bold text-secondary-500 uppercase tracking-wide">
                Profit: {formatCurrency(todayProfit)}
              </Text>
            </View>
          </View>
        </View>

        {/* Alerts Ticker */}
        {(outOfStockCount > 0 ||
          lowStockCount > 0 ||
          outstandingKasbon > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
            className="bg-secondary-50 border-b border-secondary-100"
          >
            {outOfStockCount > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/reports/inventory')}
                className="flex-row items-center bg-white border border-secondary-200 px-3 py-2 rounded-md mr-3"
              >
                <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <Text className="text-xs font-bold text-red-600 uppercase tracking-wide">
                  Out of Stock ({outOfStockCount})
                </Text>
              </TouchableOpacity>
            )}
            {lowStockCount > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/reports/inventory')}
                className="flex-row items-center bg-white border border-secondary-200 px-3 py-2 rounded-md mr-3"
              >
                <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                <Text className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                  Low Stock ({lowStockCount})
                </Text>
              </TouchableOpacity>
            )}
            {outstandingKasbon > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/reports/kasbon')}
                className="flex-row items-center bg-white border border-secondary-200 px-3 py-2 rounded-md mr-3"
              >
                <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <Text className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  Debt: {formatCurrency(outstandingKasbon)}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Main Navigation Grid */}
        <View className="p-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-4">
            Quick Actions
          </Text>

          {/* POS Primary Action */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(admin)/pos')}
            className="mb-6 bg-black p-6 rounded-none relative overflow-hidden h-40 justify-between group"
          >
            <View className="absolute right-[-20] top-[-20] w-32 h-32 bg-white/10 rounded-full" />

            <View>
              <Text className="text-white/60 font-bold uppercase tracking-widest text-xs mb-1">
                Point of Sale
              </Text>
              <Text className="text-white font-black text-3xl tracking-tight">
                OPEN CASHIER
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white font-bold mr-2 uppercase tracking-widest text-xs">
                Start Selling
              </Text>
              <Text className="text-white text-lg">→</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row flex-wrap gap-4">
            {/* Products */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/products')}
              className="flex-1 min-w-[140px] bg-white border border-secondary-200 p-5 aspect-square justify-between"
            >
              <Text className="text-3xl">📦</Text>
              <View>
                <Text className="font-heading text-lg text-primary-900">
                  PRODUCTS
                </Text>
                <Text className="text-xs text-secondary-500 font-medium">
                  Manage Inventory
                </Text>
              </View>
            </TouchableOpacity>

            {/* Customers */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/customers')}
              className="flex-1 min-w-[140px] bg-white border border-secondary-200 p-5 aspect-square justify-between"
            >
              <Text className="text-3xl">👥</Text>
              <View>
                <Text className="font-heading text-lg text-primary-900">
                  CUSTOMERS
                </Text>
                <Text className="text-xs text-secondary-500 font-medium">
                  Manage Members
                </Text>
              </View>
            </TouchableOpacity>

            {/* Reports */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/reports')}
              className="flex-1 min-w-[140px] bg-white border border-secondary-200 p-5 aspect-square justify-between"
            >
              <Text className="text-3xl">📈</Text>
              <View>
                <Text className="font-heading text-lg text-primary-900">
                  REPORTS
                </Text>
                <Text className="text-xs text-secondary-500 font-medium">
                  View Analytics
                </Text>
              </View>
            </TouchableOpacity>

            {/* Settings/Users */}
            {/* Inventory (Replaces Settings) */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/inventory')}
              className="flex-1 min-w-[140px] bg-white border border-secondary-200 p-5 aspect-square justify-between"
            >
              <Text className="text-3xl">🏭</Text>
              <View>
                <Text className="font-heading text-lg text-primary-900">
                  INVENTORY
                </Text>
                <Text className="text-xs text-secondary-500 font-medium">
                  Restock & Count
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

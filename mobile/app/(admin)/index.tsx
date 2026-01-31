import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { getDashboard } from '@/api/endpoints/reports';
import { Card, Loading } from '@/components/ui';

/**
 * Admin Dashboard Screen
 * Shows overview of warung metrics
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, userName, logout } = useAuth();

  const {
    data: dashboard,
    isLoading,
    error,
    execute: fetchDashboard,
  } = useApi(getDashboard);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
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
  const outstandingKasbon = dashboard?.total_outstanding_kasbon ?? 0;
  const lowStockCount = dashboard?.low_stock_count ?? 0;
  const outOfStockCount = dashboard?.out_of_stock_count ?? 0;

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-primary-200 text-sm">Selamat datang 👋</Text>
            <Text className="text-white text-xl font-bold">{userName}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-primary-500 px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 -mt-4"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDashboard} />
        }
      >
        {/* Error State */}
        {error && (
          <View className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-danger-700">Gagal memuat data: {error}</Text>
            <TouchableOpacity onPress={fetchDashboard} className="mt-2">
              <Text className="text-primary-600 font-medium">Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Summary Card */}
        <Card className="mb-4 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-secondary-900">
              📊 Hari Ini
            </Text>
            {dashboard?.today?.date && (
              <Text className="text-sm text-secondary-500">
                {new Date(dashboard.today.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            )}
          </View>

          <View className="flex-row">
            <View className="flex-1 bg-green-50 rounded-lg p-3 mr-2">
              <Text className="text-green-600 text-xs">Penjualan</Text>
              <Text className="text-green-800 text-lg font-bold mt-1">
                {formatCurrency(todaySales)}
              </Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-lg p-3 ml-2">
              <Text className="text-blue-600 text-xs">Transaksi</Text>
              <Text className="text-blue-800 text-lg font-bold mt-1">
                {todayTransactions} trx
              </Text>
            </View>
          </View>

          <View className="flex-row mt-3">
            <View className="flex-1 bg-purple-50 rounded-lg p-3 mr-2">
              <Text className="text-purple-600 text-xs">Keuntungan</Text>
              <Text className="text-purple-800 text-lg font-bold mt-1">
                {formatCurrency(todayProfit)}
              </Text>
            </View>
            <View className="flex-1 bg-orange-50 rounded-lg p-3 ml-2">
              <Text className="text-orange-600 text-xs">Stok Menipis</Text>
              <Text className="text-orange-800 text-lg font-bold mt-1">
                {lowStockCount} item
              </Text>
            </View>
          </View>
        </Card>

        {/* Alerts Row */}
        <View className="flex-row mb-4">
          {/* Outstanding Kasbon */}
          <TouchableOpacity
            className="flex-1 mr-2"
            onPress={() => router.push('/(admin)/reports/kasbon')}
          >
            <Card className="bg-red-50 border-red-100">
              <View className="flex-row items-center">
                <Text className="text-lg mr-2">💳</Text>
                <View className="flex-1">
                  <Text className="text-red-600 text-xs">Piutang</Text>
                  <Text className="text-red-800 text-sm font-bold">
                    {formatCurrency(outstandingKasbon)}
                  </Text>
                </View>
                <Text className="text-red-400">→</Text>
              </View>
            </Card>
          </TouchableOpacity>

          {/* Out of Stock */}
          <TouchableOpacity
            className="flex-1 ml-2"
            onPress={() => router.push('/(admin)/reports/inventory')}
          >
            <Card
              className={`${outOfStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-secondary-50'}`}
            >
              <View className="flex-row items-center">
                <Text className="text-lg mr-2">📦</Text>
                <View className="flex-1">
                  <Text
                    className={`text-xs ${outOfStockCount > 0 ? 'text-red-600' : 'text-secondary-500'}`}
                  >
                    Stok Habis
                  </Text>
                  <Text
                    className={`text-sm font-bold ${outOfStockCount > 0 ? 'text-red-800' : 'text-secondary-900'}`}
                  >
                    {outOfStockCount} item
                  </Text>
                </View>
                <Text className="text-secondary-400">→</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold text-secondary-900 mb-3">
          Menu Cepat
        </Text>

        <TouchableOpacity
          className="mb-4"
          onPress={() => router.push('/(admin)/pos')}
        >
          <Card className="bg-primary-600 border-primary-600 flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-bold">
                Buka Kasir (POS)
              </Text>
              <Text className="text-primary-100 text-sm">
                Buat transaksi baru
              </Text>
            </View>
            <Text className="text-4xl">🛒</Text>
          </Card>
        </TouchableOpacity>

        <View className="flex-row flex-wrap -mx-1.5">
          <TouchableOpacity
            className="w-1/3 px-1.5 mb-3"
            onPress={() => router.push('/(admin)/products')}
          >
            <Card className="items-center py-4">
              <Text className="text-2xl mb-2">📦</Text>
              <Text className="text-xs text-secondary-600 text-center">
                Kelola Produk
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/3 px-1.5 mb-3"
            onPress={() => router.push('/(admin)/customers')}
          >
            <Card className="items-center py-4">
              <Text className="text-2xl mb-2">👤</Text>
              <Text className="text-xs text-secondary-600 text-center">
                Pelanggan
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/3 px-1.5 mb-3"
            onPress={() => router.push('/(admin)/categories')}
          >
            <Card className="items-center py-4">
              <Text className="text-2xl mb-2">🏷️</Text>
              <Text className="text-xs text-secondary-600 text-center">
                Kategori
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/3 px-1.5 mb-3"
            onPress={() => router.push('/(admin)/users')}
          >
            <Card className="items-center py-4">
              <Text className="text-2xl mb-2">👥</Text>
              <Text className="text-xs text-secondary-600 text-center">
                Kelola User
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/3 px-1.5 mb-3"
            onPress={() => router.push('/(admin)/reports')}
          >
            <Card className="items-center py-4">
              <Text className="text-2xl mb-2">📈</Text>
              <Text className="text-xs text-secondary-600 text-center">
                Laporan
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/3 px-1.5 mb-3"
            onPress={() => router.push('/(admin)/reports/daily')}
          >
            <Card className="items-center py-4">
              <Text className="text-2xl mb-2">📅</Text>
              <Text className="text-xs text-secondary-600 text-center">
                Lap. Harian
              </Text>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { getDashboard } from '@/api/endpoints/reports';
import { Card } from '@/components/ui';

/**
 * Reports Hub Screen
 * Central navigation for all report types
 */
export default function ReportsHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: dashboard,
    isLoading,
    execute: fetchDashboard,
  } = useApi(getDashboard);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const reportCards = [
    {
      title: 'Laporan Harian',
      description: 'Penjualan dan transaksi per hari',
      icon: '📅',
      route: '/(admin)/reports/daily',
      color: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      title: 'Laporan Kasbon',
      description: 'Piutang dan hutang pelanggan',
      icon: '💳',
      route: '/(admin)/reports/kasbon',
      value: dashboard?.total_outstanding_kasbon,
      color: 'bg-red-50',
      iconBg: 'bg-red-100',
      textColor: 'text-red-700',
    },
    {
      title: 'Laporan Inventori',
      description: 'Stok produk dan nilai inventori',
      icon: '📦',
      route: '/(admin)/reports/inventory',
      badge: dashboard?.low_stock_count
        ? `${dashboard.low_stock_count} low stock`
        : undefined,
      color: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      textColor: 'text-orange-700',
    },
  ];

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text className="text-white text-2xl font-bold">Laporan</Text>
        <Text className="text-primary-200 mt-1">
          Analisis kinerja warung Anda
        </Text>
      </View>

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
        {/* Today Summary Card */}
        {dashboard?.today && (
          <Card className="mb-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <View className="bg-white rounded-lg p-4">
              <Text className="text-secondary-500 text-sm">Hari Ini</Text>
              <Text className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(dashboard.today.total_sales)}
              </Text>
              <View className="flex-row mt-3 pt-3 border-t border-secondary-100">
                <View className="flex-1">
                  <Text className="text-secondary-500 text-xs">Transaksi</Text>
                  <Text className="text-secondary-900 font-semibold">
                    {dashboard.today.total_transactions}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-secondary-500 text-xs">Keuntungan</Text>
                  <Text className="text-green-600 font-semibold">
                    {formatCurrency(dashboard.today.estimated_profit)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Stats */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Card className="bg-red-50 border-red-100">
              <Text className="text-red-600 text-xs">Total Piutang</Text>
              <Text className="text-red-800 text-lg font-bold mt-1">
                {dashboard?.total_outstanding_kasbon
                  ? formatCurrency(dashboard.total_outstanding_kasbon)
                  : '-'}
              </Text>
            </Card>
          </View>
          <View className="flex-1 ml-2">
            <Card className="bg-orange-50 border-orange-100">
              <Text className="text-orange-600 text-xs">Stok Menipis</Text>
              <Text className="text-orange-800 text-lg font-bold mt-1">
                {dashboard?.low_stock_count ?? '-'} item
              </Text>
            </Card>
          </View>
        </View>

        {/* Report Navigation Cards */}
        <Text className="text-lg font-semibold text-secondary-900 mb-3">
          Jenis Laporan
        </Text>

        {reportCards.map((report) => (
          <TouchableOpacity
            key={report.route}
            onPress={() => router.push(report.route as any)}
            className="mb-3"
          >
            <Card className={report.color}>
              <View className="flex-row items-center">
                <View
                  className={`w-12 h-12 rounded-xl ${report.iconBg} items-center justify-center mr-4`}
                >
                  <Text className="text-2xl">{report.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${report.textColor}`}
                  >
                    {report.title}
                  </Text>
                  <Text className="text-secondary-500 text-sm">
                    {report.description}
                  </Text>
                </View>
                {report.value && (
                  <Text className={`text-sm font-semibold ${report.textColor}`}>
                    {formatCurrency(report.value)}
                  </Text>
                )}
                {report.badge && (
                  <View className="bg-orange-200 px-2 py-1 rounded-full">
                    <Text className="text-orange-800 text-xs font-medium">
                      {report.badge}
                    </Text>
                  </View>
                )}
                <Text className="text-secondary-400 ml-2">→</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

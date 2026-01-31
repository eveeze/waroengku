import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getInventoryReport } from '@/api/endpoints/reports';
import { Header } from '@/components/shared';
import { Card, Loading, Button } from '@/components/ui';
import { LowStockItem, OutOfStockItem, StockByCategory } from '@/api/types';

/**
 * Inventory Report Screen
 * Shows stock and inventory summary
 */
export default function InventoryReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'lowstock' | 'outofstock'
  >('overview');

  const {
    data: report,
    isLoading,
    error,
    execute: fetchReport,
  } = useApi(getInventoryReport);

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    {
      key: 'lowstock' as const,
      label: `Stok Rendah (${report?.low_stock_products?.length || 0})`,
    },
    {
      key: 'outofstock' as const,
      label: `Habis (${report?.out_of_stock_products?.length || 0})`,
    },
  ];

  const renderLowStockItem = (item: LowStockItem) => (
    <TouchableOpacity
      key={item.product_id}
      onPress={() => router.push(`/(admin)/products/${item.product_id}`)}
      className="mb-3"
    >
      <Card className="bg-orange-50 border-orange-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mr-3">
            <Text className="text-lg">⚠️</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-secondary-900">
              {item.product_name}
            </Text>
            <Text className="text-sm text-orange-600">
              Min: {item.min_stock_alert} {item.unit}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-orange-600">
              {item.current_stock}
            </Text>
            <Text className="text-xs text-secondary-500">{item.unit}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderOutOfStockItem = (item: OutOfStockItem) => (
    <TouchableOpacity
      key={item.product_id}
      onPress={() => router.push(`/(admin)/products/${item.product_id}`)}
      className="mb-3"
    >
      <Card className="bg-red-50 border-red-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
            <Text className="text-lg">❌</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-secondary-900">
              {item.product_name}
            </Text>
            {item.last_sale_date && (
              <Text className="text-sm text-secondary-500">
                Terakhir terjual:{' '}
                {new Date(item.last_sale_date).toLocaleDateString('id-ID')}
              </Text>
            )}
          </View>
          <View className="bg-red-200 px-3 py-1 rounded-full">
            <Text className="text-red-800 text-sm font-medium">HABIS</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryStock = (item: StockByCategory) => (
    <View
      key={item.category_id}
      className="flex-row items-center py-3 border-b border-secondary-100"
    >
      <View className="w-8 h-8 bg-primary-100 rounded-lg items-center justify-center mr-3">
        <Text>🏷️</Text>
      </View>
      <View className="flex-1">
        <Text className="font-medium text-secondary-900">
          {item.category_name}
        </Text>
        <Text className="text-sm text-secondary-500">
          {item.product_count} produk
        </Text>
      </View>
      <Text className="text-base font-semibold text-secondary-700">
        {formatCurrency(item.total_stock_value)}
      </Text>
    </View>
  );

  if (isLoading && !report) {
    return <Loading fullScreen message="Memuat laporan..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Laporan Inventori" onBack={() => router.back()} />

      {/* Tabs */}
      <View className="bg-white px-4 py-2 border-b border-secondary-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  activeTab === tab.key ? 'bg-primary-600' : 'bg-secondary-100'
                }`}
              >
                <Text
                  className={
                    activeTab === tab.key
                      ? 'text-white font-medium'
                      : 'text-secondary-700'
                  }
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchReport} />
        }
      >
        {error && (
          <View className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-danger-700">
              Gagal memuat laporan: {error}
            </Text>
          </View>
        )}

        {report && activeTab === 'overview' && (
          <>
            {/* Summary Stats */}
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Card className="bg-blue-50 border-blue-100">
                  <View className="items-center">
                    <Text className="text-blue-600 text-sm">Total Produk</Text>
                    <Text className="text-2xl font-bold text-blue-800 mt-1">
                      {report.total_products}
                    </Text>
                  </View>
                </Card>
              </View>
              <View className="flex-1 ml-2">
                <Card className="bg-green-50 border-green-100">
                  <View className="items-center">
                    <Text className="text-green-600 text-sm">Nilai Stok</Text>
                    <Text className="text-lg font-bold text-green-800 mt-1">
                      {formatCurrency(report.total_stock_value)}
                    </Text>
                  </View>
                </Card>
              </View>
            </View>

            {/* Status Summary */}
            <Card title="Status Stok" className="mb-4">
              <View className="flex-row justify-around py-4">
                <TouchableOpacity
                  onPress={() => setActiveTab('lowstock')}
                  className="items-center"
                >
                  <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center">
                    <Text className="text-2xl font-bold text-orange-600">
                      {report.low_stock_products?.length || 0}
                    </Text>
                  </View>
                  <Text className="text-sm text-secondary-500 mt-2">
                    Stok Rendah
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab('outofstock')}
                  className="items-center"
                >
                  <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center">
                    <Text className="text-2xl font-bold text-red-600">
                      {report.out_of_stock_products?.length || 0}
                    </Text>
                  </View>
                  <Text className="text-sm text-secondary-500 mt-2">Habis</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Stock by Category */}
            {report.stock_by_category &&
              report.stock_by_category.length > 0 && (
                <Card title="Stok per Kategori" className="mb-4">
                  {report.stock_by_category.map(renderCategoryStock)}
                </Card>
              )}
          </>
        )}

        {report && activeTab === 'lowstock' && (
          <>
            {report.low_stock_products &&
            report.low_stock_products.length > 0 ? (
              report.low_stock_products.map(renderLowStockItem)
            ) : (
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">✅</Text>
                <Text className="text-secondary-500 text-lg">
                  Semua stok aman!
                </Text>
                <Text className="text-secondary-400 mt-1">
                  Tidak ada produk dengan stok rendah
                </Text>
              </View>
            )}
          </>
        )}

        {report && activeTab === 'outofstock' && (
          <>
            {report.out_of_stock_products &&
            report.out_of_stock_products.length > 0 ? (
              report.out_of_stock_products.map(renderOutOfStockItem)
            ) : (
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">🎉</Text>
                <Text className="text-secondary-500 text-lg">
                  Tidak ada produk habis!
                </Text>
                <Text className="text-secondary-400 mt-1">
                  Semua produk masih tersedia
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

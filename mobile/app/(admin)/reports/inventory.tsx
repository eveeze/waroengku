import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getInventoryReport } from '@/api/endpoints/reports';
import { LowStockItem, OutOfStockItem, StockByCategory } from '@/api/types';

/**
 * Inventory Report Screen
 * Swiss Minimalist Refactor
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
      label: `Low Stock (${report?.low_stock_products?.length || 0})`,
    },
    {
      key: 'outofstock' as const,
      label: `Out (${report?.out_of_stock_products?.length || 0})`,
    },
  ];

  const renderLowStockItem = (item: LowStockItem) => (
    <TouchableOpacity
      key={item.product_id}
      onPress={() => router.push(`/(admin)/products/${item.product_id}`)}
      className="mb-0 border-b border-secondary-100 bg-white active:bg-secondary-50"
    >
      <View className="p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-primary-900 uppercase tracking-tight">
            {item.product_name}
          </Text>
          <Text className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-1">
            Minimum: {item.min_stock_alert} {item.unit}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xl font-black text-orange-600">
            {item.current_stock}
          </Text>
          <Text className="text-[10px] text-secondary-500 font-bold uppercase">
            {item.unit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOutOfStockItem = (item: OutOfStockItem) => (
    <TouchableOpacity
      key={item.product_id}
      onPress={() => router.push(`/(admin)/products/${item.product_id}`)}
      className="mb-0 border-b border-secondary-100 bg-white active:bg-secondary-50"
    >
      <View className="p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-primary-900 uppercase tracking-tight">
            {item.product_name}
          </Text>
          {item.last_sale_date && (
            <Text className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider mt-1">
              Last Sale:{' '}
              {new Date(item.last_sale_date).toLocaleDateString('en-GB')}
            </Text>
          )}
        </View>
        <View className="bg-red-600 px-3 py-1">
          <Text className="text-white text-[10px] font-black uppercase tracking-widest">
            EMPTY
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryStock = (item: StockByCategory) => (
    <View
      key={item.category_id}
      className="flex-row items-center py-4 border-b border-secondary-100"
    >
      <View className="flex-1">
        <Text className="font-bold text-primary-900 uppercase tracking-wide text-sm">
          {item.category_name}
        </Text>
        <Text className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider mt-1">
          {item.product_count} items
        </Text>
      </View>
      <Text className="text-sm font-black text-primary-900">
        {formatCurrency(item.total_stock_value)}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          INVENTORY
        </Text>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-secondary-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          <View className="flex-row">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`py-4 mr-6 border-b-2 ${
                  activeTab === tab.key ? 'border-black' : 'border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-black uppercase tracking-widest ${
                    activeTab === tab.key ? 'text-black' : 'text-secondary-400'
                  }`}
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
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchReport}
            tintColor="#000"
          />
        }
      >
        {error && (
          <View className="bg-black p-4 mb-6 mx-6 mt-6">
            <Text className="text-white font-bold uppercase tracking-wide text-xs">
              Error: {error}
            </Text>
          </View>
        )}

        {report && activeTab === 'overview' && (
          <View className="p-6">
            {/* Summary Stats */}
            <View className="flex-row mb-8">
              <View className="flex-1 mr-4 border border-secondary-200 p-4">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500 mb-2">
                  Total Products
                </Text>
                <Text className="text-2xl font-black text-primary-900">
                  {report.total_products}
                </Text>
              </View>
              <View className="flex-1 border border-secondary-200 p-4">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500 mb-2">
                  Total Value
                </Text>
                <Text className="text-lg font-black text-primary-900">
                  {formatCurrency(report.total_stock_value)}
                </Text>
              </View>
            </View>

            {/* Status Summary Buttons */}
            <View className="flex-row mb-8 space-x-4">
              <TouchableOpacity
                onPress={() => setActiveTab('lowstock')}
                className="flex-1 bg-orange-50 p-4 border border-orange-100 items-center justify-center"
              >
                <Text className="text-4xl font-black text-orange-600 mb-1">
                  {report.low_stock_products?.length || 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-orange-800">
                  Low Stock
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('outofstock')}
                className="flex-1 bg-red-50 p-4 border border-red-100 items-center justify-center"
              >
                <Text className="text-4xl font-black text-red-600 mb-1">
                  {report.out_of_stock_products?.length || 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-red-800">
                  Out of Stock
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stock by Category */}
            {report.stock_by_category &&
              report.stock_by_category.length > 0 && (
                <View>
                  <Text className="text-xs font-bold uppercase tracking-widest text-secondary-900 mb-2 border-b border-black pb-2">
                    Valuation by Category
                  </Text>
                  {report.stock_by_category.map(renderCategoryStock)}
                </View>
              )}
          </View>
        )}

        {report && activeTab === 'lowstock' && (
          <View>
            {report.low_stock_products &&
            report.low_stock_products.length > 0 ? (
              report.low_stock_products.map(renderLowStockItem)
            ) : (
              <View className="items-center py-20 px-10">
                <Text className="text-secondary-300 font-black text-6xl mb-4">
                  ✅
                </Text>
                <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
                  Stocks Healthy
                </Text>
              </View>
            )}
          </View>
        )}

        {report && activeTab === 'outofstock' && (
          <View>
            {report.out_of_stock_products &&
            report.out_of_stock_products.length > 0 ? (
              report.out_of_stock_products.map(renderOutOfStockItem)
            ) : (
              <View className="items-center py-20 px-10">
                <Text className="text-secondary-300 font-black text-6xl mb-4">
                  🎉
                </Text>
                <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
                  Fully Stocked
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

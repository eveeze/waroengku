import { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import {
  InventoryReportData,
  LowStockItem,
  OutOfStockItem,
  StockByCategory,
  ApiResponse,
} from '@/api/types';
import { Loading } from '@/components/ui';

export default function InventoryReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'lowstock' | 'outofstock'
  >('overview');

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/reports/inventory'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<InventoryReportData>>({ queryKey }),
  });

  const report = response?.data;

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
      key={item.id}
      onPress={() => router.push(`/(admin)/products/${item.id}`)}
      className="mb-0 border-b border-border bg-background active:bg-muted"
    >
      <View className="p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground uppercase tracking-tight">
            {item.name}
          </Text>
          <Text className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mt-1">
            Minimum: {item.min_stock_alert} {item.unit}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xl font-black text-orange-600 dark:text-orange-400">
            {item.current_stock}
          </Text>
          <Text className="text-[10px] text-muted-foreground font-bold uppercase">
            {item.unit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOutOfStockItem = (item: OutOfStockItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => router.push(`/(admin)/products/${item.id}`)}
      className="mb-0 border-b border-border bg-background active:bg-muted"
    >
      <View className="p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground uppercase tracking-tight">
            {item.name}
          </Text>
          {item.last_sale_date && (
            <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
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
      className="flex-row items-center py-4 border-b border-border"
    >
      <View className="flex-1">
        <Text className="font-bold text-foreground uppercase tracking-wide text-sm">
          {item.category_name}
        </Text>
        <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
          {item.product_count} items
        </Text>
      </View>
      <Text className="text-sm font-black text-foreground">
        {formatCurrency(item.total_stock_value)}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
          INVENTORY
        </Text>
      </View>

      {/* Tabs */}
      <View className="bg-background border-b border-border">
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
                  activeTab === tab.key
                    ? 'border-foreground'
                    : 'border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-black uppercase tracking-widest ${
                    activeTab === tab.key
                      ? 'text-foreground'
                      : 'text-muted-foreground'
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
            onRefresh={refetch}
            tintColor="#888"
          />
        }
      >
        {error && (
          <View className="bg-destructive p-4 mb-6 mx-6 mt-6">
            <Text className="text-destructive-foreground font-bold uppercase tracking-wide text-xs">
              Error loading inventory report
            </Text>
          </View>
        )}

        {report && activeTab === 'overview' && (
          <View className="p-6">
            {/* Summary Stats */}
            <View className="flex-row mb-8">
              <View className="flex-1 mr-4 border border-border p-4">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Total Products
                </Text>
                <Text className="text-2xl font-black text-foreground">
                  {report.total_products}
                </Text>
              </View>
              <View className="flex-1 border border-border p-4">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Total Value
                </Text>
                <Text className="text-lg font-black text-foreground">
                  {formatCurrency(report.total_stock_value)}
                </Text>
              </View>
            </View>

            {/* Status Summary Buttons */}
            <View className="flex-row mb-8 space-x-4">
              <TouchableOpacity
                onPress={() => setActiveTab('lowstock')}
                className="flex-1 bg-orange-50 dark:bg-orange-900/20 p-4 border border-orange-100 dark:border-orange-900/30 items-center justify-center"
              >
                <Text className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1">
                  {report.low_stock_products?.length || 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                  Low Stock
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('outofstock')}
                className="flex-1 bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/30 items-center justify-center"
              >
                <Text className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">
                  {report.out_of_stock_products?.length || 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-red-800 dark:text-red-300">
                  Out of Stock
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stock by Category */}
            {report.stock_by_category &&
              report.stock_by_category.length > 0 && (
                <View>
                  <Text className="text-xs font-bold uppercase tracking-widest text-foreground mb-2 border-b border-foreground pb-2">
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
                <Text className="text-muted-foreground font-black text-6xl mb-4">
                  ✅
                </Text>
                <Text className="text-foreground font-bold text-lg text-center uppercase tracking-wide mb-2">
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
                <Text className="text-muted-foreground font-black text-6xl mb-4">
                  🎉
                </Text>
                <Text className="text-foreground font-bold text-lg text-center uppercase tracking-wide mb-2">
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

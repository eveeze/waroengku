import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { getDashboard } from '@/api/endpoints/reports';

/**
 * Reports Hub Screen
 * Swiss Minimalist Refactor
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

  const menuItems = [
    {
      title: 'DAILY REPORT',
      subtitle: 'Sales & Transactions',
      route: '/(admin)/reports/daily',
      icon: 'EARNINGS',
    },
    {
      title: 'ACCOUNTS RECEIVABLE',
      subtitle: 'Customer Debts (Kasbon)',
      route: '/(admin)/reports/kasbon',
      icon: 'DEBT',
      value: dashboard?.total_outstanding_kasbon,
      isMoney: true,
    },
    {
      title: 'INVENTORY VALUATION',
      subtitle: 'Stock Value & Low Stock',
      route: '/(admin)/reports/inventory',
      icon: 'STOCK',
      alert: dashboard?.low_stock_count
        ? `${dashboard.low_stock_count} LOW ITEM`
        : null,
    },
  ];

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
          REPORTS
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchDashboard}
            tintColor="#000"
          />
        }
      >
        {/* Today Summary */}
        <View className="mb-8 p-6 bg-black">
          <Text className="text-secondary-400 text-xs font-bold uppercase tracking-widest mb-2">
            Today's Performance
          </Text>
          <Text className="text-4xl font-black text-white mb-4">
            {dashboard?.today
              ? formatCurrency(dashboard.today.total_sales)
              : 'Rp 0'}
          </Text>

          <View className="flex-row border-t border-zinc-800 pt-4">
            <View className="flex-1">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                Transactions
              </Text>
              <Text className="text-white text-xl font-bold">
                {dashboard?.today?.total_transactions || 0}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                Est. Profit
              </Text>
              <Text className="text-green-400 text-xl font-bold">
                {dashboard?.today
                  ? formatCurrency(dashboard.today.estimated_profit)
                  : 'Rp 0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Grid */}
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-4">
            Analytics
          </Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="mb-4 bg-white border border-secondary-200 p-5 active:bg-secondary-50"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="bg-secondary-100 px-2 py-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-900">
                    {item.icon}
                  </Text>
                </View>
                {/* Right Value or Arrow */}
                {item.value !== undefined ? (
                  <Text
                    className={`font-bold ${item.title === 'ACCOUNTS RECEIVABLE' ? 'text-red-600' : 'text-primary-900'}`}
                  >
                    {item.isMoney ? formatCurrency(item.value) : item.value}
                  </Text>
                ) : (
                  <Text className="text-secondary-300 font-bold">↗</Text>
                )}
              </View>

              <Text className="text-lg font-black text-primary-900 uppercase tracking-tight mb-1">
                {item.title}
              </Text>
              <Text className="text-xs text-secondary-500 font-medium">
                {item.subtitle}
              </Text>

              {item.alert && (
                <View className="mt-3 bg-red-100 self-start px-2 py-1">
                  <Text className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                    ⚠️ {item.alert}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

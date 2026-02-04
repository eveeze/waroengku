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
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getDashboard } from '@/api/endpoints/reports';
import { DashboardData, ApiResponse } from '@/api/types';
import { Loading } from '@/components/ui';

export default function ReportsHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/reports/dashboard'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<DashboardData>>({ queryKey }),
  });

  const dashboard = response?.data;

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
            onRefresh={refetch}
            tintColor="#000"
          />
        }
      >
        {/* Today Summary */}
        <View className="mb-8 p-6 bg-foreground">
          <Text className="text-background/60 text-xs font-bold uppercase tracking-widest mb-2">
            Today's Performance
          </Text>
          <Text className="text-4xl font-black text-background mb-4">
            {dashboard?.today
              ? formatCurrency(dashboard.today.total_sales)
              : 'Rp 0'}
          </Text>

          <View className="flex-row border-t border-background/20 pt-4">
            <View className="flex-1">
              <Text className="text-background/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                Transactions
              </Text>
              <Text className="text-background text-xl font-bold">
                {dashboard?.today?.total_transactions || 0}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-background/60 text-[10px] font-bold uppercase tracking-widest mb-1">
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
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Analytics
          </Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="mb-4 bg-background border border-border p-5 active:bg-muted"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="bg-muted px-2 py-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    {item.icon}
                  </Text>
                </View>
                {/* Right Value or Arrow */}
                {item.value !== undefined ? (
                  <Text
                    className={`font-bold ${item.title === 'ACCOUNTS RECEIVABLE' ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {item.isMoney ? formatCurrency(item.value) : item.value}
                  </Text>
                ) : (
                  <Text className="text-muted-foreground font-bold">↗</Text>
                )}
              </View>

              <Text className="text-lg font-black text-foreground uppercase tracking-tight mb-1">
                {item.title}
              </Text>
              <Text className="text-xs text-muted-foreground font-medium">
                {item.subtitle}
              </Text>

              {item.alert && (
                <View className="mt-3 bg-red-100 dark:bg-red-900/30 self-start px-2 py-1">
                  <Text className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
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

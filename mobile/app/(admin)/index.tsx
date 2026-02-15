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
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getNotifications } from '@/api/endpoints';
import { DashboardData } from '@/api/types';
import { Feather } from '@expo/vector-icons';
import { DashboardSkeleton } from '@/components/skeletons';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

/**
 * Admin Dashboard Screen
 * Swiss Minimalist Design Refactor
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, userName, logout } = useAuth();
  const { breakpoints, gridColumns, getItemWidth, screenPadding, gap } =
    useResponsive();
  const isTablet = breakpoints.isTablet;
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Icon colors that work in both modes
  const iconColor = isDark ? '#FAFAFA' : '#18181B';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/reports/dashboard'],
    queryFn: ({ queryKey }) => fetchWithCache<any>({ queryKey }),
  });

  // Fetch notifications for unread count badge
  const { data: notificationsData } = useQuery({
    queryKey: ['/notifications'],
    queryFn: () => getNotifications({ limit: 50 }),
    refetchInterval: 60000, // Refresh every minute
  });

  const unreadNotifications =
    notificationsData?.notifications?.filter((n) => !n.is_read).length ?? 0;

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

  // Show skeleton during initial load
  if (isLoading && !dashboard) {
    return <DashboardSkeleton />;
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: BOTTOM_NAV_HEIGHT + 16,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        {/* Header Section */}
        <View
          className={`bg-background ${isTablet ? 'px-8 pb-8' : isSmallPhone ? 'px-4 pb-4' : 'px-6 pb-6'}`}
          style={{
            paddingTop: insets.top + (isSmallPhone ? 12 : isTablet ? 24 : 16),
          }}
        >
          <View
            className={`flex-row justify-between items-center ${isTablet ? 'mb-8' : isSmallPhone ? 'mb-3' : 'mb-5'}`}
          >
            <View className="flex-1 mr-3">
              <Text
                className={`font-bold uppercase tracking-[0.15em] text-muted-foreground mb-0.5 font-body ${isTablet ? 'text-xs' : 'text-[9px]'}`}
              >
                Welcome back,
              </Text>
              <Text
                className={`font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : isSmallPhone ? 'text-2xl' : 'text-3xl'}`}
                numberOfLines={1}
              >
                {userName}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <TouchableOpacity
                onPress={() => router.push('/(admin)/notifications' as any)}
                className={`items-center justify-center bg-muted relative ${isSmallPhone ? 'w-8 h-8' : 'w-10 h-10'}`}
              >
                <Feather
                  name="bell"
                  size={isSmallPhone ? 14 : 18}
                  color={iconColor}
                />
                {unreadNotifications > 0 && (
                  <View
                    className={`absolute -top-1 -right-1 min-w-4 h-4 bg-destructive items-center justify-center ${isSmallPhone ? 'px-0.5' : 'px-1'}`}
                  >
                    <Text
                      className={`font-bold text-destructive-foreground ${isSmallPhone ? 'text-[8px]' : 'text-[10px]'}`}
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className={`items-center justify-center bg-muted ${isSmallPhone ? 'w-8 h-8' : 'w-10 h-10'}`}
              >
                <Feather
                  name="log-out"
                  size={isSmallPhone ? 14 : 18}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-destructive/10 p-4 mb-4 rounded-none">
              <Text className="text-destructive font-bold mb-2 uppercase">
                FAILED TO LOAD DATA
              </Text>
              <Text className="text-destructive font-medium text-xs mb-3">
                {(error as Error)?.message || 'Unknown error'}
              </Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text className="font-bold underline text-destructive uppercase tracking-wide">
                  RETRY
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hero Metric: Today's Sales */}
          <View className={isTablet ? 'py-4' : isSmallPhone ? 'py-1' : 'py-2'}>
            <Text
              className={`font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1 font-body ${isTablet ? 'text-xs' : isSmallPhone ? 'text-[8px]' : 'text-[10px]'}`}
            >
              Today's Revenue
            </Text>
            <Text
              className={`font-black tracking-tighter text-foreground leading-tight ${isTablet ? 'text-7xl' : isSmallPhone ? 'text-4xl' : 'text-5xl'}`}
            >
              {formatCurrency(todaySales)}
            </Text>
            <View
              className={`flex-row items-center mt-1.5 ${isTablet ? 'gap-6' : isSmallPhone ? 'gap-2' : 'gap-3'}`}
            >
              <Text
                className={`font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 uppercase tracking-wide ${isTablet ? 'text-base' : isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
              >
                +{todayTransactions} Txn
              </Text>
              <Text
                className={`font-bold text-muted-foreground uppercase tracking-wide ${isTablet ? 'text-base' : isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
              >
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
            className="bg-muted border-b border-border"
          >
            {outOfStockCount > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/reports/inventory')}
                className="flex-row items-center bg-background border border-border px-3 py-2 rounded-md mr-3"
              >
                <View className="w-2 h-2 rounded-full bg-destructive mr-2" />
                <Text className="text-xs font-bold text-destructive uppercase tracking-wide">
                  Out of Stock ({outOfStockCount})
                </Text>
              </TouchableOpacity>
            )}
            {lowStockCount > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/reports/inventory')}
                className="flex-row items-center bg-background border border-border px-3 py-2 rounded-md mr-3"
              >
                <View className="w-2 h-2 rounded-full bg-warning mr-2" />
                <Text className="text-xs font-bold text-warning uppercase tracking-wide">
                  Low Stock ({lowStockCount})
                </Text>
              </TouchableOpacity>
            )}
            {outstandingKasbon > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(admin)/reports/kasbon')}
                className="flex-row items-center bg-background border border-border px-3 py-2 rounded-md mr-3"
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
        <View className={isTablet ? 'px-8 pb-8' : 'px-6 pb-6'}>
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm mb-6' : 'text-xs mb-4'}`}
          >
            Quick Actions
          </Text>

          {/* POS Primary Action */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(admin)/pos')}
            className={`bg-foreground rounded-none relative overflow-hidden justify-between ${isTablet ? 'mb-8 p-8 h-48' : 'mb-6 p-6 h-40'}`}
          >
            <View>
              <Text
                className={`text-background/60 font-bold uppercase tracking-widest mb-1 ${isTablet ? 'text-sm' : 'text-xs'}`}
              >
                Point of Sale
              </Text>
              <Text
                className={`text-background font-black tracking-tight ${isTablet ? 'text-4xl' : 'text-3xl'}`}
              >
                OPEN CASHIER
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`text-background font-bold mr-2 uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-xs'}`}
              >
                Start Selling
              </Text>
              <Text
                className={`text-background ${isTablet ? 'text-xl' : 'text-lg'}`}
              >
                →
              </Text>
            </View>
          </TouchableOpacity>

          <View
            className={`flex-row flex-wrap ${isTablet ? 'gap-6' : 'gap-4'}`}
          >
            {/* Products */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/products')}
              style={{ width: isTablet ? '30%' : '47%' }}
              className={`bg-muted aspect-square justify-between rounded-none ${isTablet ? 'p-6' : 'p-5'}`}
            >
              <Feather name="box" size={isTablet ? 32 : 24} color={iconColor} />
              <View>
                <Text
                  className={`font-heading text-foreground ${isTablet ? 'text-xl' : 'text-lg'}`}
                >
                  PRODUCTS
                </Text>
                <Text
                  className={`text-muted-foreground font-medium ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
                  Manage Inventory
                </Text>
              </View>
            </TouchableOpacity>

            {/* Customers */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/customers')}
              style={{ width: isTablet ? '30%' : '47%' }}
              className={`bg-muted aspect-square justify-between rounded-none ${isTablet ? 'p-6' : 'p-5'}`}
            >
              <Feather
                name="users"
                size={isTablet ? 32 : 24}
                color={iconColor}
              />
              <View>
                <Text
                  className={`font-heading text-foreground ${isTablet ? 'text-xl' : 'text-lg'}`}
                >
                  CUSTOMERS
                </Text>
                <Text
                  className={`text-muted-foreground font-medium ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
                  Manage Members
                </Text>
              </View>
            </TouchableOpacity>

            {/* Reports */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/reports')}
              style={{ width: isTablet ? '30%' : '47%' }}
              className={`bg-muted aspect-square justify-between rounded-none ${isTablet ? 'p-6' : 'p-5'}`}
            >
              <Feather
                name="bar-chart-2"
                size={isTablet ? 32 : 24}
                color={iconColor}
              />
              <View>
                <Text
                  className={`font-heading text-foreground ${isTablet ? 'text-xl' : 'text-lg'}`}
                >
                  REPORTS
                </Text>
                <Text
                  className={`text-muted-foreground font-medium ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
                  View Analytics
                </Text>
              </View>
            </TouchableOpacity>

            {/* Inventory */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/inventory')}
              style={{ width: isTablet ? '30%' : '47%' }}
              className={`bg-muted aspect-square justify-between rounded-none ${isTablet ? 'p-6' : 'p-5'}`}
            >
              <Feather
                name="layers"
                size={isTablet ? 32 : 24}
                color={iconColor}
              />
              <View>
                <Text
                  className={`font-heading text-foreground ${isTablet ? 'text-xl' : 'text-lg'}`}
                >
                  INVENTORY
                </Text>
                <Text
                  className={`text-muted-foreground font-medium ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
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

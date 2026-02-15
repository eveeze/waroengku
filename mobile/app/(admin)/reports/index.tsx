import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { DashboardData, ApiResponse } from '@/api/types';
import { ReportsSkeleton } from '@/components/skeletons';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

export default function ReportsHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#FAFAFA' : '#18181B';
  const mutedIconColor = colorScheme === 'dark' ? '#A1A1AA' : '#71717A';

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

  const menuItems: {
    title: string;
    subtitle: string;
    route: string;
    icon: keyof typeof Feather.glyphMap;
    value?: number;
    isMoney?: boolean;
    alert?: string | null;
  }[] = [
    {
      title: 'DAILY',
      subtitle: 'Sales & Transactions',
      route: '/(admin)/reports/daily',
      icon: 'calendar',
    },
    {
      title: 'RECEIVABLE',
      subtitle: 'Customer Debts',
      route: '/(admin)/reports/kasbon',
      icon: 'credit-card',
      value: dashboard?.total_outstanding_kasbon,
      isMoney: true,
    },
    {
      title: 'INVENTORY',
      subtitle: 'Stock Value & Low Stock',
      route: '/(admin)/reports/inventory',
      icon: 'package',
      alert: dashboard?.low_stock_count
        ? `${dashboard.low_stock_count} LOW`
        : null,
    },
  ];

  // Responsive sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-2xl'
      : 'text-3xl';
  const backSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const heroSize = isTablet
    ? 'text-6xl'
    : isSmallPhone
      ? 'text-4xl'
      : 'text-5xl';
  const labelSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const titleSize = isTablet
    ? 'text-lg'
    : isSmallPhone
      ? 'text-sm'
      : 'text-base';
  const subtitleSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const valueSize = isTablet
    ? 'text-2xl'
    : isSmallPhone
      ? 'text-lg'
      : 'text-xl';
  const headerPadding = isTablet
    ? 'px-8 pb-6'
    : isSmallPhone
      ? 'px-4 pb-4'
      : 'px-6 pb-5';
  const screenPadding = isTablet ? 24 : isSmallPhone ? 12 : 16;
  const iconSize = isTablet ? 24 : isSmallPhone ? 18 : 20;

  // Show skeleton during initial load
  if (isLoading && !dashboard) {
    return <ReportsSkeleton />;
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Header */}
      <View
        className={`border-b border-border bg-background ${headerPadding}`}
        style={{
          paddingTop: insets.top + (isSmallPhone ? 12 : isTablet ? 20 : 16),
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isSmallPhone ? 'mb-2' : 'mb-3'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground ${backSize}`}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${headerSize}`}
        >
          REPORTS
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: screenPadding,
          paddingBottom: BOTTOM_NAV_HEIGHT + 20,
          maxWidth: isTablet ? 800 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
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
        <View
          className={`bg-foreground ${isTablet ? 'mb-8 p-6' : isSmallPhone ? 'mb-5 p-4' : 'mb-6 p-5'}`}
        >
          <Text
            className={`text-background/60 font-bold uppercase tracking-widest mb-1 ${labelSize}`}
          >
            Today's Revenue
          </Text>
          <Text
            className={`text-background font-black tracking-tight ${heroSize}`}
          >
            {formatCurrency(dashboard?.today?.total_sales ?? 0)}
          </Text>
          <View
            className={`flex-row items-center mt-2 ${isTablet ? 'gap-4' : 'gap-3'}`}
          >
            <Text
              className={`font-bold text-background/80 uppercase tracking-wide ${labelSize}`}
            >
              {dashboard?.today?.total_transactions ?? 0} Txns
            </Text>
            <Text className="text-background/40">•</Text>
            <Text
              className={`font-bold text-background/80 uppercase tracking-wide ${labelSize}`}
            >
              Profit: {formatCurrency(dashboard?.today?.estimated_profit ?? 0)}
            </Text>
          </View>
        </View>

        {/* Report Links */}
        <View style={{ gap: isSmallPhone ? 8 : 12 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className={`bg-muted border border-border flex-row items-center justify-between active:opacity-70 ${isTablet ? 'p-5' : isSmallPhone ? 'p-3' : 'p-4'}`}
            >
              <View
                className="flex-row items-center flex-1"
                style={{ gap: isSmallPhone ? 10 : 14 }}
              >
                <View
                  className={`bg-background border border-border items-center justify-center ${isTablet ? 'w-12 h-12' : isSmallPhone ? 'w-9 h-9' : 'w-10 h-10'}`}
                >
                  <Feather name={item.icon} size={iconSize} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-bold text-foreground uppercase tracking-tight ${titleSize}`}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className={`text-muted-foreground font-medium ${subtitleSize}`}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>

              <View className="items-end ml-3">
                {item.value !== undefined && (
                  <Text
                    className={`font-black text-foreground tracking-tight ${valueSize}`}
                  >
                    {item.isMoney ? formatCurrency(item.value) : item.value}
                  </Text>
                )}
                {item.alert && (
                  <View className="bg-destructive/10 px-2 py-0.5 mt-1">
                    <Text
                      className={`text-destructive font-bold uppercase ${labelSize}`}
                    >
                      {item.alert}
                    </Text>
                  </View>
                )}
                {!item.value && !item.alert && (
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={mutedIconColor}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

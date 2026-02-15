import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  StatusBar,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { Transaction, PaginatedResponse, Customer } from '@/api/types';
import { Loading, Button } from '@/components/ui';
import { CustomerSelector } from '@/components/shared/CustomerSelector';
import { EmptyStateInline } from '@/components/shared';
import {
  TransactionFilterModal,
  FilterState,
} from '@/components/shared/TransactionFilterModal';
import { TransactionListInlineSkeleton } from '@/components/skeletons';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    payment_method: null,
    date_from: '',
    date_to: '',
    customer: null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['/transactions', { search, ...filters }],
    queryFn: async ({ pageParam = 1, queryKey }) => {
      const [url, params] = queryKey as [string, { search?: string }];
      return fetchWithCache<PaginatedResponse<Transaction>>({
        queryKey: [
          url,
          {
            page: pageParam,
            per_page: 20,
            search: params?.search || undefined,
            customer_id: filters.customer?.id,
            status: filters.status || undefined,
            payment_method: filters.payment_method || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
          },
        ],
        meta: undefined,
        signal: undefined,
      } as any);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });

  const transactions = data?.pages.flatMap((page) => page.data) || [];

  const formatCurrency = (amount: number | string | undefined | null) => {
    const value = parseFloat(String(amount || 0));
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(isNaN(value) ? 0 : value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400';
      case 'cancelled':
        return 'text-destructive bg-destructive/10 border-destructive dark:bg-red-900/30 dark:border-red-800 dark:text-red-400';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Responsive text sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-3xl'
      : 'text-4xl';
  const invoiceSize = isTablet
    ? 'text-xl'
    : isSmallPhone
      ? 'text-base'
      : 'text-lg';
  const amountSize = isTablet
    ? 'text-xl'
    : isSmallPhone
      ? 'text-base'
      : 'text-lg';
  const dateSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const statusSize = isTablet
    ? 'text-[10px]'
    : isSmallPhone
      ? 'text-[7px]'
      : 'text-[8px]';
  const padding = isTablet
    ? 'px-8 py-8'
    : isSmallPhone
      ? 'px-4 py-4'
      : 'px-6 py-6';
  const itemPadding = isTablet
    ? 'px-8 py-6'
    : isSmallPhone
      ? 'px-4 py-4'
      : 'px-6 py-5';

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/transactions/${item.id}`)}
      className="border-b border-border bg-background active:bg-muted"
    >
      <View className={`${itemPadding} flex-row justify-between items-center`}>
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1 flex-wrap">
            <Text
              className={`font-heading font-black text-foreground uppercase tracking-tight ${invoiceSize} mr-2`}
            >
              {item.invoice_number}
            </Text>
            <View
              className={`px-1.5 py-0.5 rounded border ${getStatusStyle(item.status).split(' ').slice(1).join(' ')}`}
            >
              <Text
                className={`${statusSize} font-bold uppercase tracking-widest ${getStatusStyle(item.status).split(' ')[0]}`}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Text
              className={`text-muted-foreground ${dateSize} font-bold uppercase tracking-wider mr-2 font-body`}
            >
              {formatDate(item.created_at)}
            </Text>
            <Text className={`text-muted-foreground ${dateSize}`}>•</Text>
            <Text
              className={`text-muted-foreground ${dateSize} font-bold uppercase tracking-wider ml-2 font-body`}
            >
              {formatTime(item.created_at)}
            </Text>
          </View>

          <Text
            className={`text-muted-foreground ${dateSize} mt-1 font-medium font-body truncate`}
            numberOfLines={1}
          >
            {item.customer?.name || 'Guest Customer'}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`font-heading font-black text-foreground ${amountSize} tracking-tight`}
          >
            {formatCurrency(item.total_amount)}
          </Text>
          <Text
            className={`${statusSize} font-bold text-muted-foreground uppercase tracking-widest mt-1`}
          >
            {item.payment_method}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Header */}
      <View
        className={`${padding} border-b border-border bg-background`}
        style={{ paddingTop: insets.top + (isSmallPhone ? 12 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isSmallPhone ? 'mb-3' : 'mb-4'}
        >
          <Text
            className={`${dateSize} font-bold uppercase tracking-widest text-muted-foreground font-body`}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          className={`${headerSize} font-heading font-black uppercase tracking-tighter text-foreground mb-4`}
        >
          HISTORY
        </Text>

        {/* Search */}
        <View className="flex-row gap-2 mb-3">
          <View
            className={`flex-1 bg-muted border border-border rounded-lg ${isSmallPhone ? 'px-3 py-2' : 'px-4 py-3'}`}
          >
            <TextInput
              placeholder="SEARCH INVOICE / NAME..."
              placeholderTextColor="hsl(var(--muted-foreground))"
              className={`font-bold ${isSmallPhone ? 'text-xs' : 'text-sm'} text-foreground`}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className={`${isSmallPhone ? 'w-10 h-10' : 'w-12 h-12'} items-center justify-center rounded-lg border ${
              filters.status ||
              filters.payment_method ||
              filters.date_from ||
              filters.customer
                ? 'bg-foreground border-foreground'
                : 'bg-background border-border'
            }`}
          >
            <Text
              className={`${
                filters.status ||
                filters.payment_method ||
                filters.date_from ||
                filters.customer
                  ? 'text-background'
                  : 'text-foreground'
              } ${isSmallPhone ? 'text-base' : 'text-lg'}`}
            >
              ⚙️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        <View className="flex-row flex-wrap gap-2">
          {filters.customer && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, customer: null }))
              }
              className="bg-foreground px-2 py-1 rounded-full flex-row items-center"
            >
              <Text className={`text-background ${statusSize} font-bold mr-1`}>
                User: {filters.customer.name}
              </Text>
              <Text className={`text-background ${statusSize}`}>✕</Text>
            </TouchableOpacity>
          )}
          {filters.status && (
            <TouchableOpacity
              onPress={() => setFilters((prev) => ({ ...prev, status: null }))}
              className="bg-muted px-2 py-1 rounded-full flex-row items-center"
            >
              <Text className={`text-foreground ${statusSize} font-bold mr-1`}>
                Status: {filters.status}
              </Text>
              <Text className={`text-foreground ${statusSize}`}>✕</Text>
            </TouchableOpacity>
          )}
          {filters.payment_method && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, payment_method: null }))
              }
              className="bg-muted px-2 py-1 rounded-full flex-row items-center"
            >
              <Text className={`text-foreground ${statusSize} font-bold mr-1`}>
                Pay: {filters.payment_method}
              </Text>
              <Text className={`text-foreground ${statusSize}`}>✕</Text>
            </TouchableOpacity>
          )}
          {filters.date_from !== '' && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, date_from: '', date_to: '' }))
              }
              className="bg-muted px-2 py-1 rounded-full flex-row items-center"
            >
              <Text className={`text-foreground ${statusSize} font-bold mr-1`}>
                Date: {filters.date_from}
              </Text>
              <Text className={`text-foreground ${statusSize}`}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TransactionFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={filters}
        onApply={setFilters}
        onClear={() =>
          setFilters({
            status: null,
            payment_method: null,
            date_from: '',
            date_to: '',
            customer: null,
          })
        }
        onOpenCustomerSelector={() => setShowCustomerSelector(true)}
      />

      <CustomerSelector
        visible={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        onSelect={(customer) => {
          setFilters((prev) => ({ ...prev, customer }));
        }}
        title="FILTER BY CUSTOMER"
      />

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: BOTTOM_NAV_HEIGHT + 20,
        }}
        ListEmptyComponent={
          isLoading ? (
            <TransactionListInlineSkeleton count={6} />
          ) : (
            <EmptyStateInline
              title="No Transactions"
              message="No transactions match your current filters."
              icon="📜"
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <Loading message="Loading more..." /> : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            tintColor="#000"
            onRefresh={refetch}
          />
        }
      />
    </View>
  );
}

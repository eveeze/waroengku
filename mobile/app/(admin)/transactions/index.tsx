import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { Transaction, PaginatedResponse, Customer } from '@/api/types';
import { Loading, Button } from '@/components/ui';
import { CustomerSelector } from '@/components/shared/CustomerSelector';
import {
  TransactionFilterModal,
  FilterState,
} from '@/components/shared/TransactionFilterModal';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      // fetchWithCache expects a queryKey compatible context or just call it directly?
      // fetchWithCache signature: ({ queryKey }: QueryFunctionContext) => Promise<T>
      // We can reuse it if we construct a proxy context, or just use the logic inside it?
      // Actually fetchWithCache implementation takes { queryKey } and uses queryKey[0] as url and queryKey[1] as params.
      // So we need to pass [url, full_params]

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

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/transactions/${item.id}`)}
      className="border-b border-border bg-background active:bg-muted"
    >
      <View className="px-6 py-5 flex-row justify-between items-center">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Text className="font-heading font-black text-foreground uppercase tracking-tight text-lg mr-2">
              {item.invoice_number}
            </Text>
            <View
              className={`px-2 py-0.5 rounded border ${getStatusStyle(item.status).split(' ').slice(1).join(' ')}`}
            >
              <Text
                className={`text-[8px] font-bold uppercase tracking-widest ${getStatusStyle(item.status).split(' ')[0]}`}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wider mr-2 font-body">
              {formatDate(item.created_at)}
            </Text>
            <Text className="text-muted-foreground text-xs">•</Text>
            <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wider ml-2 font-body">
              {formatTime(item.created_at)}
            </Text>
          </View>

          <Text
            className="text-muted-foreground text-xs mt-1 font-medium font-body truncate"
            numberOfLines={1}
          >
            {item.customer?.name || 'Guest Customer'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-heading font-black text-foreground text-lg tracking-tight">
            {formatCurrency(item.total_amount)}
          </Text>
          <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
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
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-body">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-foreground mb-4">
          HISTORY
        </Text>

        {/* Search */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-muted border border-border rounded-lg px-4 py-3">
            <TextInput
              placeholder="SEARCH INVOICE / NAME..."
              placeholderTextColor="hsl(var(--muted-foreground))"
              className="font-bold text-sm text-foreground"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className={`w-12 h-12 items-center justify-center rounded-lg border ${
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
              } text-lg`}
            >
              ⚙️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {filters.customer && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, customer: null }))
              }
              className="bg-foreground px-3 py-1 rounded-full flex-row items-center"
            >
              <Text className="text-background text-xs font-bold mr-2">
                User: {filters.customer.name}
              </Text>
              <Text className="text-background text-xs">✕</Text>
            </TouchableOpacity>
          )}
          {filters.status && (
            <TouchableOpacity
              onPress={() => setFilters((prev) => ({ ...prev, status: null }))}
              className="bg-muted px-3 py-1 rounded-full flex-row items-center"
            >
              <Text className="text-foreground text-xs font-bold mr-2">
                Status: {filters.status}
              </Text>
              <Text className="text-foreground text-xs">✕</Text>
            </TouchableOpacity>
          )}
          {filters.payment_method && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, payment_method: null }))
              }
              className="bg-muted px-3 py-1 rounded-full flex-row items-center"
            >
              <Text className="text-foreground text-xs font-bold mr-2">
                Pay: {filters.payment_method}
              </Text>
              <Text className="text-foreground text-xs">✕</Text>
            </TouchableOpacity>
          )}
          {filters.date_from !== '' && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, date_from: '', date_to: '' }))
              }
              className="bg-muted px-3 py-1 rounded-full flex-row items-center"
            >
              <Text className="text-foreground text-xs font-bold mr-2">
                Date: {filters.date_from}
              </Text>
              <Text className="text-foreground text-xs">✕</Text>
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
          paddingBottom: insets.bottom + 120,
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 opacity-50">
              <Text className="text-6xl mb-4">📜</Text>
              <Text className="text-lg font-bold uppercase tracking-widest text-foreground">
                No Transactions
              </Text>
            </View>
          ) : null
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

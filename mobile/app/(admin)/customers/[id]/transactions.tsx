import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getTransactions } from '@/api/endpoints/transactions';
import { Transaction } from '@/api/types';
import { Loading } from '@/components/ui';

export default function CustomerTransactionHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Try to get customer name from cache to display in header
  const customerName = (() => {
    const queries = queryClient
      .getQueryCache()
      .findAll({ queryKey: ['/customers'] });
    for (const query of queries) {
      const state = query.state.data as any;
      if (state?.pages) {
        for (const page of state.pages) {
          const found = page.data.find((c: any) => c.id === id);
          if (found) return found.name;
        }
      }
    }
    // Also check specific customer cache
    const specificCustomer = queryClient.getQueryData<any>([
      `/customers/${id}`,
    ]);
    if (specificCustomer?.data?.name) return specificCustomer.data.name;

    return 'Customer';
  })();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useInfiniteQuery({
    queryKey: ['/transactions', { customer_id: id }],
    queryFn: async ({ pageParam = 1 }) => {
      return getTransactions({
        customer_id: id,
        page: pageParam,
        per_page: 20,
      });
    },
    getNextPageParam: (lastPage) => {
      if (
        lastPage.meta &&
        lastPage.meta.page * lastPage.meta.per_page < lastPage.meta.total_items
      ) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!id,
  });

  const transactions = data?.pages.flatMap((page) => page.data) || [];

  const handleRefresh = () => {
    refetch();
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const renderPaymentMethodBadge = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return (
          <View className="bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">
              CASH
            </Text>
          </View>
        );
      case 'kasbon':
        return (
          <View className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase">
              KASBON
            </Text>
          </View>
        );
      case 'transfer':
      case 'qris':
        return (
          <View className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
              {method}
            </Text>
          </View>
        );
      default:
        return (
          <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">
              {method || 'UNKNOWN'}
            </Text>
          </View>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <View className="bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">
              COMPLETED
            </Text>
          </View>
        );
      case 'pending':
        return (
          <View className="bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">
              PENDING
            </Text>
          </View>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <View className="bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase">
              {status}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    return (
      <View className="bg-card border border-border p-4 mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-sm font-bold text-foreground">
              {item.invoice_number}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {formatDate(item.created_at)}
            </Text>
          </View>
          <View className="items-end gap-1">
            {renderStatusBadge(item.status)}
            {renderPaymentMethodBadge(item.payment_method)}
          </View>
        </View>

        <View className="mt-2 pt-2 border-t border-border flex-row justify-between items-center">
          <Text className="text-xs text-muted-foreground uppercase font-bold text-foreground">
            Total Amount
          </Text>
          <Text className="text-base font-black text-foreground">
            {formatCurrency(item.total_amount)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading && !transactions.length) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loading />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-red-500 font-bold mb-2">
          Error loading history
        </Text>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-none"
          onPress={handleRefresh}
        >
          <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className="px-6 pb-4 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-3xl font-black uppercase tracking-tighter text-foreground leading-tight">
          Transaction History
        </Text>
        <Text className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-wide">
          {customerName}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor="#666" // Dark mode compatible
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-muted-foreground text-sm">
              No transactions found for this customer.
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

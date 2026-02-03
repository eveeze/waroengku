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
import { Transaction, PaginatedResponse } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['/transactions', { search }],
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-secondary-600 bg-secondary-50 border-secondary-200';
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/transactions/${item.id}`)}
      className="border-b border-secondary-100 bg-white active:bg-secondary-50"
    >
      <View className="px-6 py-5 flex-row justify-between items-center">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Text className="font-heading font-black text-primary-900 uppercase tracking-tight text-lg mr-2">
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
            <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider mr-2 font-body">
              {formatDate(item.created_at)}
            </Text>
            <Text className="text-secondary-300 text-xs">•</Text>
            <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider ml-2 font-body">
              {formatTime(item.created_at)}
            </Text>
          </View>

          <Text
            className="text-secondary-600 text-xs mt-1 font-medium font-body truncate"
            numberOfLines={1}
          >
            {item.customer_name || 'Guest Customer'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-heading font-black text-primary-900 text-lg tracking-tight">
            {formatCurrency(item.final_amount)}
          </Text>
          <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">
            {item.payment_method}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 font-body">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-black mb-4">
          HISTORY
        </Text>

        {/* Search */}
        <View className="bg-secondary-50 border border-secondary-200 rounded-lg px-4 py-3">
          <TextInput
            placeholder="SEARCH INVOICE / CUSTOMER..."
            placeholderTextColor="#9CA3AF"
            className="font-bold text-sm text-primary-900"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

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
              <Text className="text-lg font-bold uppercase tracking-widest text-secondary-900">
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

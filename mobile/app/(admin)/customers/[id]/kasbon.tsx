import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getKasbonHistory, getKasbonSummary } from '@/api/endpoints/kasbon';
import { getCustomerById } from '@/api/endpoints/customers';
import { Card, Button, Loading } from '@/components/ui';
import {
  KasbonEntry,
  KasbonSummary,
  Customer,
  PaginatedResponse,
} from '@/api/types';

export default function KasbonHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [filter, setFilter] = useState<'all' | 'debt' | 'payment'>('all');

  const { data: customer } = useQuery({
    queryKey: [`/customers/${id}`],
    queryFn: ({ queryKey }) => fetchWithCache<Customer>({ queryKey }),
    enabled: !!id,
  });

  const { data: summary } = useQuery({
    queryKey: [`/kasbon/customers/${id}/summary`],
    queryFn: ({ queryKey }) => fetchWithCache<KasbonSummary>({ queryKey }),
    enabled: !!id,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [`/kasbon/customers/${id}/history`, { filter }],
    queryFn: async ({ pageParam = 1, queryKey }) => {
      const [_, params] = queryKey as [
        string,
        { filter?: 'all' | 'debt' | 'payment' },
      ];
      // Assuming getKasbonHistory handles params correctly
      return getKasbonHistory(id!, {
        page: pageParam as number,
        per_page: 20,
        type: params?.filter === 'all' ? undefined : params?.filter,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<KasbonEntry>) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: !!id,
  });

  const entries = data?.pages.flatMap((page) => page.data) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'debt' | 'payment') => {
    setFilter(newFilter);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEntry = ({ item }: { item: KasbonEntry }) => {
    const isDebt = item.type === 'debt';
    return (
      <View className="mb-3 p-4 bg-secondary border border-border rounded-xl">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              isDebt
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-green-50 dark:bg-green-900/20'
            }`}
          >
            <Text className="text-lg">{isDebt ? '📤' : '📥'}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-heading font-bold text-foreground text-base uppercase">
              {isDebt ? 'KASBON' : 'PAYMENT'}
            </Text>
            <Text className="text-[10px] text-muted-foreground font-bold mt-0.5">
              {formatDate(item.created_at)}
            </Text>
            {item.notes && (
              <Text className="text-xs text-muted-foreground mt-1 italic">
                {item.notes}
              </Text>
            )}
          </View>
          <Text
            className={`text-base font-black tracking-tight ${
              isDebt
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {isDebt ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Swiss Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-xl font-bold uppercase tracking-widest text-muted-foreground mb-1">
              HISTORY
            </Text>
            <Text className="text-3xl font-black uppercase tracking-tighter text-foreground">
              {customer?.name || 'Loading...'}
            </Text>
          </View>
          {summary && (
            <View className="items-end">
              <Text className="text-xs font-bold uppercase text-muted-foreground mb-1">
                Outstanding
              </Text>
              <Text
                className={`text-xl font-black ${summary.current_balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
              >
                {formatCurrency(summary.current_balance)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 py-4 bg-secondary border-b border-border">
        <View className="flex-row">
          {[
            { key: 'all', label: 'ALL' },
            { key: 'debt', label: 'DEBT' },
            { key: 'payment', label: 'PAYMENT' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleFilterChange(item.key as any)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                filter === item.key
                  ? 'bg-foreground border-foreground'
                  : 'bg-background border-border'
              }`}
            >
              <Text
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  filter === item.key
                    ? 'text-background'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-10">
              <Text className="text-muted-foreground font-bold">
                No history found.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6">
              <Loading message="Loading more..." />
            </View>
          ) : null
        }
      />
    </View>
  );
}

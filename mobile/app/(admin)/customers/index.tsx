import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
// We import getCustomers directly, letting useInfiniteQuery handle pagination state.
// caching is handled by React Query + ETag (if getCustomers calls apiCall which allows conditional requests,
// though for search/infinite it's less critical than Detail).
import { getCustomers } from '@/api/endpoints/customers';
import { Customer, PaginatedResponse } from '@/api/types';
import { Loading, Button } from '@/components/ui';

// Debounce helper could be useful but we'll stick to simple state for now or manual trigger if needed.
// For now, search triggers refetch on text change (fast enough for local dev, might want debounce in prod).

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['/customers', { search, showDebtOnly }],
    queryFn: async ({ pageParam = 1, queryKey }) => {
      const [_, params] = queryKey as [
        string,
        { search?: string; showDebtOnly?: boolean },
      ];
      return getCustomers({
        page: pageParam as number,
        per_page: 20,
        search: params?.search || undefined,
        has_debt: params?.showDebtOnly || undefined,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Customer>) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });

  const customers = (data?.pages.flatMap((page) => page.data) || []).filter(
    (c) => !!c,
  );

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const toggleDebtFilter = () => {
    setShowDebtOnly(!showDebtOnly);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/customers/${item.id}`)}
      className="bg-muted p-4 rounded-xl mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="font-heading text-xl text-foreground uppercase tracking-tight">
            {item.name}
          </Text>
          <Text className="text-muted-foreground text-xs font-bold mt-1">
            {item.phone || '-'}
          </Text>
        </View>

        {item.current_debt > 0 && (
          <View className="bg-destructive/10 px-2 py-1 rounded-md">
            <Text className="text-destructive text-[10px] font-black uppercase tracking-widest">
              Debt: {formatCurrency(item.current_debt)}
            </Text>
          </View>
        )}
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
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-foreground">
              MEMBERS
            </Text>
          </View>
          <Button
            title="NEW MEMBER"
            size="sm"
            onPress={() => router.push('/(admin)/customers/create')}
          />
        </View>

        {/* Search & Filter */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-muted rounded-lg px-4 py-2 border border-border">
            <TextInput
              placeholder="SEARCH MEMBER..."
              value={search}
              onChangeText={setSearch}
              className="font-bold text-foreground leading-tight"
              placeholderTextColor="hsl(var(--muted-foreground))"
            />
          </View>
          <TouchableOpacity
            onPress={toggleDebtFilter}
            className={`px-4 py-2 rounded-lg border ${
              showDebtOnly
                ? 'bg-destructive/10 border-destructive'
                : 'bg-background border-border'
            } justify-center`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-widest ${
                showDebtOnly ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              Has Debt
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={customers}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id || Math.random().toString()}
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
                No members found.
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

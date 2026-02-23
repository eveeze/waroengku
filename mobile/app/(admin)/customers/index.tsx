import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { getCustomers } from '@/api/endpoints/customers';
import { Customer, PaginatedResponse } from '@/api/types';
import { Loading } from '@/components/ui';
import { EmptyStateInline } from '@/components/shared';
import { CustomerListInlineSkeleton } from '@/components/skeletons';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const [search, setSearch] = useState('');
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
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
        is_active: true, // Only fetch active customers
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
  const nameSize = isTablet
    ? 'text-xl'
    : isSmallPhone
      ? 'text-base'
      : 'text-lg';
  const phoneSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const debtSize = isTablet
    ? 'text-xs'
    : isSmallPhone
      ? 'text-[8px]'
      : 'text-[10px]';
  const searchSize = isTablet
    ? 'text-base'
    : isSmallPhone
      ? 'text-xs'
      : 'text-sm';
  const filterSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const headerPadding = isTablet
    ? 'px-8 pb-6'
    : isSmallPhone
      ? 'px-4 pb-4'
      : 'px-6 pb-5';
  const itemPadding = isTablet
    ? 'p-5 mb-4'
    : isSmallPhone
      ? 'p-3 mb-2'
      : 'p-4 mb-3';
  const screenPadding = isTablet ? 24 : isSmallPhone ? 12 : 16;

  const renderItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/customers/${item.id}`)}
      className={`bg-muted border border-border ${itemPadding}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text
            className={`font-bold text-foreground uppercase tracking-tight ${nameSize}`}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            className={`text-muted-foreground font-medium mt-0.5 ${phoneSize}`}
          >
            {item.phone || '-'}
          </Text>
        </View>

        {item.current_debt > 0 && (
          <View
            className={`bg-destructive/10 ${isSmallPhone ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}
          >
            <Text
              className={`text-destructive font-bold uppercase tracking-wide ${debtSize}`}
            >
              {formatCurrency(item.current_debt)}
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
        className={`border-b border-border bg-background ${headerPadding}`}
        style={{
          paddingTop: insets.top + (isSmallPhone ? 12 : isTablet ? 20 : 16),
        }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-4' : isSmallPhone ? 'mb-2' : 'mb-3'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground ${backSize}`}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Title row */}
        <View
          className={`flex-row items-baseline justify-between ${isTablet ? 'mb-5' : 'mb-3'}`}
        >
          <Text
            className={`font-black uppercase tracking-tighter text-foreground ${headerSize}`}
          >
            MEMBERS
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/customers/create')}
            className={`bg-foreground flex-row items-center ${isTablet ? 'px-4 py-2' : isSmallPhone ? 'px-2.5 py-1.5' : 'px-3 py-1.5'}`}
          >
            <Feather
              name="plus"
              size={isSmallPhone ? 12 : 14}
              color="hsl(var(--background))"
            />
            <Text
              className={`text-background font-bold uppercase tracking-wide ml-1 ${isTablet ? 'text-sm' : isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
        <View className={`flex-row ${isTablet ? 'gap-3' : 'gap-2'}`}>
          <View
            className={`flex-1 bg-muted border border-border ${isTablet ? 'px-4 py-2.5' : isSmallPhone ? 'px-3 py-2' : 'px-3 py-2'}`}
          >
            <TextInput
              placeholder="SEARCH..."
              value={search}
              onChangeText={setSearch}
              className={`font-bold text-foreground ${searchSize}`}
              placeholderTextColor="hsl(var(--muted-foreground))"
            />
          </View>
          <TouchableOpacity
            onPress={toggleDebtFilter}
            className={`border justify-center ${
              showDebtOnly
                ? 'bg-destructive/10 border-destructive'
                : 'bg-background border-border'
            } ${isTablet ? 'px-4 py-2.5' : isSmallPhone ? 'px-2 py-2' : 'px-3 py-2'}`}
          >
            <Text
              className={`font-bold uppercase tracking-wide ${
                showDebtOnly ? 'text-destructive' : 'text-muted-foreground'
              } ${filterSize}`}
            >
              Debt
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={customers}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        contentContainerStyle={{
          padding: screenPadding,
          paddingBottom: BOTTOM_NAV_HEIGHT + 20,
          maxWidth: isTablet ? 800 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <CustomerListInlineSkeleton count={6} />
          ) : (
            <EmptyStateInline
              title="No Members"
              message="Add members to track debts."
              icon="👥"
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <Loading message="Loading..." />
            </View>
          ) : null
        }
      />
    </View>
  );
}

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
// import { useApi } from '@/hooks/useApi'; // Deprecated for GET
import { useApi } from '@/hooks/useApi'; // Keeping for search/actions
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import apiClient, { fetcher, fetchWithCache } from '@/api/client';
import {
  getProducts,
  getCategories,
  searchProductByBarcode,
} from '@/api/endpoints';
import { Product, Category, ProductListParams } from '@/api/types';
import { Card, Loading, Button } from '@/components/ui';
import { getCleanImageUrl } from '@/utils/image';
import { BarcodeScanner } from '@/components/shared';

/**
 * Products List Screen (Swiss Design)
 */
export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State
  const [search, setSearch] = useState('');
  // page, products, hasMore removed (handled by useInfiniteQuery)
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('active');
  const [showLowStock, setShowLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'base_price' | 'created_at'>(
    'name',
  );
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // React Query with useInfiniteQuery
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      '/products',
      {
        per_page: 20,
        search: search || undefined,
        category_id: selectedCategory,
        low_stock_only: showLowStock || undefined,
        sort_by: sortBy,
        sort_order: 'asc',
        is_active: statusFilter === 'all' ? 'all' : statusFilter === 'active',
      },
    ],
    queryFn: async ({ queryKey, pageParam = 1 }) => {
      const [url, params] = queryKey as [string, any];
      // Use fetchWithCache to handle 304s correctly while getting full body
      const response = await fetchWithCache<any>({
        queryKey: [url, { ...params, page: pageParam }],
      });

      // response is full body { success, message, data: [...], meta: ... }
      // We need to return the inner data object because the next step expects { data, meta }
      // The backend response wrapper puts the list inside "data".
      // Wait, if response is { data: [...] }, then response.data is the list.
      // Let's check docs again. Response is { data: [...], meta: ... } WRAPPED inside { success: true, data: ..., meta: ... } ?
      // Docs say:
      // {
      //   "success": true,
      //   "data": [ ... ],
      //   "meta": { ... }
      // }
      // So response itself IS the object we want, if type 'any' covers it.
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = lastPage.meta?.current_page || allPages.length;
      const totalPages = lastPage.meta?.total_pages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  // Flatten data
  // queryFn returns the full API response object: { success, data: Array, meta: Object }
  // So "page" is that object. page.data is the array.
  const products = data?.pages.flatMap((page) => page?.data || []) || [];

  const { data: categoriesData } = useQuery({
    queryKey: ['/categories'],
    queryFn: ({ queryKey }) => fetcher<Category[]>({ queryKey }),
  });

  // Derived state
  // Derived state effects removed as we use data directly
  // ...

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Barcode search manually triggered
  const { isLoading: isSearchingBarcode, execute: searchByBarcode } = useApi(
    (barcode: string) => searchProductByBarcode(barcode),
  );

  // Load categories on mount
  useEffect(() => {
    // Categories loaded via useQuery above
    // loadProducts is now handled by useQuery and focus effect
  }, []);

  // Removed loadCategories function as it is replaced by useQuery

  // Load products is now handled automatically by useQuery via queryKey dependencies.
  // We just need to manage the 'page' state.

  const handleSearch = () => {
    // Search update triggers refetch automatically via key change
  };

  const applyFilters = () => {
    setShowFilters(false);
    // Filter update triggers refetch automatically via key change
  };

  const handleRefresh = () => {
    refetch();
  };

  // Determine if we are loading initial data or refreshing
  const isListLoading = isLoading;

  // useFocusEffect to refetch on focus (optional // Removed manual loadProducts as useQuery handles it

  // Reload products whenever screen comes into focus
  // Placed AFTER definition
  useFocusEffect(
    useCallback(() => {
      // Optional: refetch() if we want strict freshness
    }, []),
  );

  const handleBarcodeScanned = async (barcode: string, type: string) => {
    setShowBarcodeScanner(false);
    try {
      const product = await searchByBarcode(barcode);
      if (product && product.id) {
        router.push(`/(admin)/products/${product.id}`);
      } else {
        Alert.alert('Not Found', `Barcode ${barcode} not found. Create new?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create',
            onPress: () => {
              router.push({
                pathname: '/(admin)/products/create',
                params: { barcode },
              });
            },
          },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Failed to search product.');
    }
  };

  // handleSearch defined earlier with useQuery state updates
  // handleRefresh defined earlier with refetch

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isLowStock = item.current_stock <= item.min_stock_alert;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/products/${item.id}`)}
        className="mb-4"
        activeOpacity={0.7}
      >
        <Card className="rounded-none border-x-0 border-t-0 border-b border-secondary-200 shadow-none bg-transparent px-0 py-2">
          <View className="flex-row">
            {/* Image placeholder */}
            <View className="w-16 h-16 bg-secondary-50 border border-secondary-200 rounded-md overflow-hidden mr-4">
              {item.image_url ? (
                <Image
                  source={{ uri: getCleanImageUrl(item.image_url) }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-xl text-secondary-300">#</Text>
                </View>
              )}
            </View>

            {/* Product info */}
            <View className="flex-1 justify-center">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text
                    className="text-lg font-heading font-bold text-primary-900 tracking-tight leading-6"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  {item.category_name && (
                    <Text className="text-xs font-body font-bold text-secondary-500 uppercase tracking-widest mt-1">
                      {item.category_name}
                    </Text>
                  )}
                </View>
                <Text className="text-lg font-heading font-bold text-primary-900 tracking-tight">
                  {formatCurrency(item.base_price)}
                </Text>
              </View>

              <View className="flex-row items-center mt-2">
                <View
                  className={`px-2 py-0.5 rounded mr-2 border ${isLowStock ? 'bg-danger-50 border-danger-200' : 'bg-secondary-50 border-secondary-200'}`}
                >
                  <Text
                    className={`text-xs font-bold ${isLowStock ? 'text-danger-700' : 'text-primary-900'}`}
                  >
                    STOCK: {item.current_stock}
                  </Text>
                </View>
                {!item.is_active && (
                  <View className="px-2 py-0.5 rounded mr-2 border bg-gray-100 border-gray-300">
                    <Text className="text-xs font-bold text-gray-500">
                      INACTIVE
                    </Text>
                  </View>
                )}
                {item.pricing_tiers && item.pricing_tiers.length > 0 && (
                  <Text className="text-xs text-secondary-400 font-medium">
                    +{item.pricing_tiers.length} TIERS
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="SCAN PRODUCT"
      />

      {/* Header */}
      <View
        className="px-6 pb-6 border-b border-secondary-200"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-1 font-body">
            INVENTORY
          </Text>
          <View className="flex-row items-end justify-between">
            <Text className="text-4xl font-heading font-bold tracking-tighter text-primary-900 uppercase">
              PRODUCTS
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowBarcodeScanner(true)}
                className="w-10 h-10 items-center justify-center bg-secondary-50 border border-secondary-200 rounded-lg"
              >
                <Text className="text-lg">📷</Text>
              </TouchableOpacity>
              <Button
                title="NEW"
                size="sm"
                onPress={() => router.push('/(admin)/products/create')}
              />
            </View>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-secondary-50 border border-secondary-200 rounded-lg px-4 flex-row items-center h-12">
            <TextInput
              className="flex-1 text-base font-medium text-primary-900 h-full"
              placeholder="Search products..."
              placeholderTextColor="#a1a1aa"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded-lg items-center justify-center border ${
              showFilters
                ? 'bg-primary-900 border-primary-900'
                : 'bg-white border-secondary-200'
            }`}
          >
            <Text className={showFilters ? 'text-white' : 'text-primary-900'}>
              F
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="mt-4 pt-4 border-t border-secondary-100 animate-fade-in-down">
            {/* Status Filter */}
            <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500 mb-2">
              Status
            </Text>
            <View className="flex-row mb-4 gap-2">
              {(['active', 'inactive', 'all'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md border ${
                    statusFilter === status
                      ? 'bg-primary-900 border-primary-900'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wide ${
                      statusFilter === status
                        ? 'text-white'
                        : 'text-primary-900'
                    }`}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Filter */}
            <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap mb-4 gap-2">
              <TouchableOpacity
                onPress={() => setSelectedCategory(undefined)}
                className={`px-4 py-2 rounded-md border ${
                  !selectedCategory
                    ? 'bg-primary-900 border-primary-900'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-wide ${!selectedCategory ? 'text-white' : 'text-primary-900'}`}
                >
                  ALL
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedCategory === cat.id
                      ? 'bg-primary-900 border-primary-900'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wide ${selectedCategory === cat.id ? 'text-white' : 'text-primary-900'}`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="APPLY FILTERS"
              fullWidth
              onPress={applyFilters}
              size="sm"
              variant="outline"
            />
          </View>
        )}
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor="#000"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isListLoading && !isRefetching ? (
            <View className="items-center py-20 opacity-50">
              <Text className="text-lg font-medium text-primary-900">
                NO PRODUCTS FOUND
              </Text>
              <Text className="text-sm text-secondary-500 mt-2 text-center mb-4 px-8">
                {statusFilter === 'active'
                  ? 'Your seeded products might be set to Inactive.'
                  : 'Try adjusting filters or search terms.'}
              </Text>
              {statusFilter === 'active' && (
                <TouchableOpacity
                  onPress={() => {
                    setStatusFilter('inactive');
                  }}
                  className="bg-primary-900 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-bold text-xs uppercase tracking-widest">
                    Show Inactive Products
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <Loading /> : isLoading ? <Loading /> : null
        }
      />
    </View>
  );
}

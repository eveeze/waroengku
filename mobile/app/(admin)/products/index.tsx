import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import {
  getProducts,
  getCategories,
  searchProductByBarcode,
} from '@/api/endpoints';
import { Product, Category, ProductListParams } from '@/api/types';
import { Card, Loading, Button } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';

/**
 * Products List Screen (Swiss Design)
 */
export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [showLowStock, setShowLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'base_price' | 'created_at'>(
    'name',
  );
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // API hooks
  const { isLoading, execute: fetchProducts } = useApi(
    (params: ProductListParams) => getProducts(params),
  );

  const { execute: fetchCategories } = useApi(getCategories);
  const { isLoading: isSearchingBarcode, execute: searchByBarcode } = useApi(
    (barcode: string) => searchProductByBarcode(barcode),
  );

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      if (cats) setCategories(cats);
    } catch {}
  };

  const loadProducts = useCallback(
    async (searchTerm = search, pageNum = 1, append = false) => {
      const params: ProductListParams = {
        page: pageNum,
        per_page: 20,
        search: searchTerm || undefined,
        category_id: selectedCategory,
        low_stock_only: showLowStock || undefined,
        sort_by: sortBy,
        sort_order: 'asc',
      };

      try {
        const result = await fetchProducts(params);
        if (result && result.success) {
          // Align with PaginatedResponse
          if (append) {
            setProducts((prev) => [...prev, ...result.data]);
          } else {
            setProducts(result.data);
          }
          setHasMore(pageNum < result.meta.total_pages);
        }
      } catch {}
    },
    [search, selectedCategory, showLowStock, sortBy],
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

  const handleSearch = () => {
    setPage(1);
    loadProducts(search, 1, false);
  };

  const handleRefresh = () => {
    setPage(1);
    loadProducts(search, 1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(search, nextPage, true);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    setPage(1);
    loadProducts(search, 1, false);
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
            <View className="w-16 h-16 bg-secondary-50 border border-secondary-200 rounded-md items-center justify-center mr-4">
              {item.image_url ? (
                <Text className="text-xl">📷</Text>
              ) : (
                <Text className="text-xl text-secondary-300">#</Text>
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
            {/* Category Filter */}
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
            tintColor="#000"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 opacity-50">
              <Text className="text-lg font-medium text-primary-900">
                NO PRODUCTS
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && products && products.length > 0 ? (
            <View className="py-8">
              <Loading />
            </View>
          ) : null
        }
      />
    </View>
  );
}

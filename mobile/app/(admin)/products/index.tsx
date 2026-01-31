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
 * Products List Screen
 * Full featured with search, filters, sorting, and barcode scanner
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
        low_stock: showLowStock || undefined,
        sort_by: sortBy,
        sort_order: 'asc',
      };

      try {
        const result = await fetchProducts(params);
        if (result) {
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
        // Navigate to product detail
        router.push(`/(admin)/products/${product.id}`);
      } else {
        // Product not found
        Alert.alert(
          'Produk Tidak Ditemukan',
          `Barcode ${barcode} tidak terdaftar. Ingin menambahkan produk baru?`,
          [
            { text: 'Batal', style: 'cancel' },
            {
              text: 'Tambah Baru',
              onPress: () => {
                router.push({
                  pathname: '/(admin)/products/create',
                  params: { barcode },
                });
              },
            },
          ],
        );
      }
    } catch (err) {
      // API error - treat as not found
      Alert.alert('Error', 'Gagal mencari produk. Periksa koneksi internet.');
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
        className="mb-3"
      >
        <Card>
          <View className="flex-row items-center">
            {/* Image placeholder */}
            <View className="w-14 h-14 bg-secondary-100 rounded-lg items-center justify-center mr-3">
              {item.image_url ? (
                <Text className="text-2xl">📷</Text>
              ) : (
                <Text className="text-2xl">📦</Text>
              )}
            </View>

            {/* Product info */}
            <View className="flex-1">
              <Text
                className="text-base font-semibold text-secondary-900"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-sm text-secondary-500">
                {item.category_name || 'Tanpa Kategori'}
              </Text>
              {item.barcode && (
                <Text className="text-xs text-secondary-400 font-mono">
                  {item.barcode}
                </Text>
              )}
            </View>

            {/* Price and stock */}
            <View className="items-end">
              <Text className="text-base font-bold text-primary-600">
                {formatCurrency(item.base_price)}
              </Text>
              <View
                className={`flex-row items-center mt-1 ${
                  isLowStock ? 'bg-danger-50 px-2 py-0.5 rounded' : ''
                }`}
              >
                {isLowStock && <Text className="mr-1">⚠️</Text>}
                <Text
                  className={`text-xs ${
                    isLowStock
                      ? 'text-danger-600 font-medium'
                      : 'text-secondary-500'
                  }`}
                >
                  Stok: {item.current_stock}
                </Text>
              </View>
              {/* Pricing tier indicator */}
              {item.pricing_tiers && item.pricing_tiers.length > 0 && (
                <Text className="text-xs text-primary-500 mt-0.5">
                  🏷️ {item.pricing_tiers.length} tier
                </Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="Cari Produk"
      />

      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-xl font-bold">Produk</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setShowBarcodeScanner(true)}
              className="bg-primary-500 px-3 py-2 rounded-lg mr-2"
            >
              <Text className="text-white">📷 Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/products/create')}
              className="bg-white px-4 py-2 rounded-lg"
            >
              <Text className="text-primary-600 font-medium">+ Tambah</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-white rounded-lg px-4 mr-2">
            <Text className="mr-2">🔍</Text>
            <TextInput
              className="flex-1 py-3 text-base"
              placeholder="Cari produk..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-lg ${showFilters ? 'bg-white' : 'bg-primary-500'}`}
          >
            <Text className={showFilters ? 'text-primary-600' : 'text-white'}>
              🔧
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View className="mt-3 bg-white rounded-lg p-3">
            {/* Low Stock Toggle */}
            <TouchableOpacity
              onPress={() => setShowLowStock(!showLowStock)}
              className="flex-row items-center mb-3"
            >
              <View
                className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                  showLowStock
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-secondary-300'
                }`}
              >
                {showLowStock && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="text-secondary-700">Stok Rendah Saja</Text>
            </TouchableOpacity>

            {/* Category Filter */}
            <Text className="text-xs text-secondary-500 mb-2">Kategori</Text>
            <View className="flex-row flex-wrap mb-3">
              <TouchableOpacity
                onPress={() => setSelectedCategory(undefined)}
                className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${
                  !selectedCategory ? 'bg-primary-600' : 'bg-secondary-100'
                }`}
              >
                <Text
                  className={
                    !selectedCategory ? 'text-white' : 'text-secondary-700'
                  }
                >
                  Semua
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600'
                      : 'bg-secondary-100'
                  }`}
                >
                  <Text
                    className={
                      selectedCategory === cat.id
                        ? 'text-white'
                        : 'text-secondary-700'
                    }
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort By */}
            <Text className="text-xs text-secondary-500 mb-2">Urutkan</Text>
            <View className="flex-row">
              {[
                { key: 'name', label: 'Nama' },
                { key: 'base_price', label: 'Harga' },
                { key: 'created_at', label: 'Terbaru' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  onPress={() =>
                    setSortBy(sort.key as 'name' | 'base_price' | 'created_at')
                  }
                  className={`px-3 py-1.5 rounded-full mr-2 ${
                    sortBy === sort.key ? 'bg-primary-600' : 'bg-secondary-100'
                  }`}
                >
                  <Text
                    className={
                      sortBy === sort.key ? 'text-white' : 'text-secondary-700'
                    }
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply Button */}
            <Button
              title="Terapkan Filter"
              size="small"
              fullWidth
              onPress={applyFilters}
              className="mt-3"
            />
          </View>
        )}
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-5xl mb-4">📦</Text>
              <Text className="text-secondary-500 text-lg">
                Tidak ada produk
              </Text>
              <Text className="text-secondary-400 mt-1">
                Tap "Tambah" untuk menambah produk baru
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && products.length > 0 ? (
            <View className="py-4">
              <Loading message="Memuat..." />
            </View>
          ) : null
        }
      />
    </View>
  );
}

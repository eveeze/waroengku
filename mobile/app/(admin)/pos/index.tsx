import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Dimensions,
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
import { useCartStore } from '@/stores/cartStore';

// Screen Dimensions
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT; // 16px padding * 3 gaps

export default function POSScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, getItemCount, getTotal } = useCartStore();

  // State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // API
  const { isLoading, execute: fetchProducts } = useApi(
    (params: ProductListParams) => getProducts(params),
  );
  const { execute: fetchCategories } = useApi(getCategories);
  const { execute: searchByBarcode } = useApi((code: string) =>
    searchProductByBarcode(code),
  );

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
        sort_by: 'name',
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
    [search, selectedCategory],
  );

  const handleSearch = () => {
    setPage(1);
    loadProducts(search, 1, false);
  };

  const handleCategorySelect = (id?: string) => {
    setSelectedCategory(id);
    setPage(1);
    // Use timeout to allow state to settle
    setTimeout(() => {
      // We need to pass the new category directly as state update is async
      loadProductsWithCategory(id);
    }, 0);
  };

  // Helper to load with explicit category since state might lag
  const loadProductsWithCategory = async (catId?: string) => {
    const params: ProductListParams = {
      page: 1,
      per_page: 20,
      search: search || undefined,
      category_id: catId,
      sort_by: 'name',
      sort_order: 'asc',
    };
    try {
      const result = await fetchProducts(params);
      if (result) {
        setProducts(result.data);
        setHasMore(1 < result.meta.total_pages);
      }
    } catch {}
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setShowBarcodeScanner(false);
    try {
      const product = await searchByBarcode(barcode);
      if (product && product.id) {
        addItem(product);
        Alert.alert('Produk Ditambahkan', `${product.name} +1`);
      } else {
        Alert.alert(
          'Produk Tidak Ditemukan',
          `Barcode ${barcode} tidak terdaftar.`,
        );
      }
    } catch {
      Alert.alert('Error', 'Gagal memproses barcode.');
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
    const hasStock = item.is_stock_active ? item.current_stock > 0 : true;

    return (
      <TouchableOpacity
        onPress={() => {
          if (hasStock) addItem(item);
        }}
        disabled={!hasStock}
        style={{ width: ITEM_WIDTH }}
        className="mb-4 mx-2"
      >
        <View
          className={`bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden ${!hasStock ? 'opacity-60' : ''}`}
        >
          {/* Image Area */}
          <View className="h-32 bg-secondary-50 items-center justify-center">
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-4xl">📦</Text>
            )}
            {!hasStock && (
              <View className="absolute inset-0 bg-white/60 items-center justify-center">
                <Text className="text-danger-600 font-bold bg-danger-50 px-2 py-1 rounded">
                  Habis
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="p-3">
            <Text
              className="font-semibold text-secondary-900 text-sm h-10"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-primary-600 font-bold text-sm">
                {formatCurrency(item.base_price)}
              </Text>
              {/* Stock Badge if low */}
              {item.is_stock_active &&
                item.current_stock <= item.min_stock_alert &&
                item.current_stock > 0 && (
                  <Text className="text-[10px] text-orange-600 bg-orange-50 px-1 rounded">
                    Sisa {item.current_stock}
                  </Text>
                )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="Scan Barcode ke Keranjang"
      />

      {/* Top Bar */}
      <View
        className="bg-white border-b border-secondary-200 px-4 py-3 z-10"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.replace('/(admin)')}
            className="mr-3"
          >
            <Text className="text-2xl">🔙</Text>
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-secondary-100 rounded-lg px-3 mr-2 h-11">
            <Text className="mr-2">🔍</Text>
            <TextInput
              className="flex-1 text-base h-full"
              placeholder="Cari produk..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowBarcodeScanner(true)}
            className="bg-primary-600 w-11 h-11 rounded-lg items-center justify-center"
          >
            <Text className="text-white text-xl">📷</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Horizontal Scroll */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, name: 'Semua' }, ...categories] as any[]}
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item.id)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory === item.id
                  ? 'bg-primary-600'
                  : 'bg-secondary-100'
              }`}
            >
              <Text
                className={
                  selectedCategory === item.id
                    ? 'text-white font-medium'
                    : 'text-secondary-600'
                }
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onEndReached={() => {
          if (!isLoading && hasMore) loadProducts(search, page + 1, true);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading ? <Loading message="" /> : null}
      />

      {/* Bottom Cart Summary */}
      {getItemCount() > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4 shadow-lg"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-secondary-600 text-xs">
                Total {getItemCount()} Barang
              </Text>
              <Text className="text-primary-700 font-bold text-xl">
                {formatCurrency(getTotal())}
              </Text>
            </View>
            <Button
              title="Lihat Keranjang & Bayar"
              onPress={() => router.push('/(admin)/pos/checkout')}
              className="px-6"
            />
          </View>
        </View>
      )}
    </View>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import {
  getProducts,
  getCategories,
  searchProductByBarcode,
  holdCart,
} from '@/api/endpoints';
import { Product, Category, ProductListParams } from '@/api/types';
import { Loading } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';
import { useCartStore } from '@/stores/cartStore';

// Screen Dimensions
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / COLUMN_COUNT;

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
    setTimeout(() => {
      loadProductsWithCategory(id);
    }, 0);
  };

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
        Alert.alert('Added', `${product.name} +1`);
      } else {
        Alert.alert('Not Found', `Barcode ${barcode} not registered.`);
      }
    } catch {
      Alert.alert('Error', 'Failed to process barcode.');
    }
  };

  const { execute: submitHoldCart } = useApi(holdCart);
  const { items, clearCart } = useCartStore();

  const handleHoldCart = async () => {
    if (items.length === 0) return;

    Alert.prompt(
      'Hold Cart',
      'Enter a reference name/note for this cart:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hold',
          onPress: async (name) => {
            if (!name) return;
            try {
              await submitHoldCart({
                items: items.map((i) => ({
                  product_id: i.product.id,
                  quantity: i.quantity,
                })),
                held_by: name,
              });
              clearCart();
              Alert.alert('Success', 'Cart held successfully.');
            } catch (e) {
              Alert.alert('Error', 'Failed to hold cart.');
            }
          },
        },
      ],
      'plain-text',
    );
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
        className="mb-4"
        activeOpacity={0.7}
      >
        <View
          className={`bg-white rounded-none border border-secondary-200 overflow-hidden ${!hasStock ? 'opacity-50' : ''}`}
        >
          {/* Image Area */}
          <View className="h-32 bg-secondary-50 items-center justify-center border-b border-secondary-100 relative">
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-3xl">📦</Text>
            )}

            {!hasStock && (
              <View className="absolute inset-0 bg-white/80 items-center justify-center">
                <Text className="text-black font-black text-xs uppercase tracking-widest border border-black px-2 py-1">
                  SOLD OUT
                </Text>
              </View>
            )}

            {/* Add Badge Overlay */}
            {hasStock && (
              <View className="absolute bottom-2 right-2 bg-black h-8 w-8 items-center justify-center rounded-full opacity-0 group-active:opacity-100">
                <Text className="text-white font-bold text-xs">+</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="p-3">
            <Text
              className="font-medium text-secondary-900 text-xs mb-1 h-8 leading-4"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text className="text-black font-black text-sm tracking-tight">
              {formatCurrency(item.base_price)}
            </Text>

            {item.is_stock_active &&
              item.current_stock <= item.min_stock_alert &&
              item.current_stock > 0 && (
                <Text className="text-[10px] text-danger-600 font-bold mt-1 uppercase tracking-wider">
                  Only {item.current_stock} left
                </Text>
              )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="SCAN ITEM"
      />

      {/* Top Bar */}
      <View
        className="bg-white border-b border-secondary-100 px-5 pb-4 z-10"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center mb-4 gap-3">
          <TouchableOpacity
            onPress={() => router.replace('/(admin)')}
            className="w-10 h-10 items-center justify-center bg-secondary-50 rounded-full"
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-secondary-50 border border-secondary-200 rounded-lg px-4 h-12">
            <Text className="mr-3 opacity-50">🔍</Text>
            <TextInput
              className="flex-1 text-base font-medium text-primary-900 h-full"
              placeholder="Search items..."
              placeholderTextColor="#A1A1AA"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowBarcodeScanner(true)}
            className="bg-black w-12 h-12 rounded-lg items-center justify-center mr-2"
          >
            <Text className="text-white text-xl">📷</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/pos/held-carts')}
            className="bg-secondary-100 w-12 h-12 rounded-lg items-center justify-center"
          >
            <Text className="text-xl">📋</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, name: 'ALL ITEMS' }, ...categories] as any[]}
          keyExtractor={(item) => item.id || 'all'}
          contentContainerStyle={{ paddingRight: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item.id)}
              className={`px-4 py-2 rounded-md mr-2 border ${
                selectedCategory === item.id
                  ? 'bg-black border-black'
                  : 'bg-white border-secondary-200'
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedCategory === item.id
                    ? 'text-white'
                    : 'text-secondary-500'
                }`}
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
        contentContainerStyle={{
          padding: PADDING,
          paddingBottom: 120,
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onEndReached={() => {
          if (!isLoading && hasMore) loadProducts(search, page + 1, true);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? <Loading message="" /> : <View className="h-10" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20">
              <Text className="text-secondary-400 font-bold uppercase tracking-widest">
                No Items Found
              </Text>
            </View>
          ) : null
        }
      />

      {/* Bottom Cart Summary (Floating) */}
      {getItemCount() > 0 && (
        <View
          className="absolute bottom-6 left-5 right-5"
          style={{ marginBottom: insets.bottom }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleHoldCart}
              className="flex-1 bg-secondary-800 rounded-xl shadow-xl p-4 flex-row items-center justify-center border border-secondary-800"
            >
              <Text className="text-white font-bold uppercase text-xs tracking-wider">
                Hold
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/(admin)/pos/checkout')}
              className="flex-[3] bg-black rounded-xl shadow-xl p-4 flex-row items-center justify-between border border-secondary-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-white/20 px-3 py-1 rounded-md">
                  <Text className="text-white font-bold">{getItemCount()}</Text>
                </View>
                <View>
                  <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    Total
                  </Text>
                  <Text className="text-white font-black text-lg tracking-tight">
                    {formatCurrency(getTotal())}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Text className="text-white font-bold mr-2 uppercase text-xs tracking-wider">
                  Checkout
                </Text>
                <Text className="text-white">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

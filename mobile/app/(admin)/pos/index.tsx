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
import { useOptimisticMutation } from '@/hooks';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetcher, fetchWithCache } from '@/api/client'; // useApi replaced

// Screen Dimensions
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / COLUMN_COUNT;

export default function POSScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, getItemCount, getTotal, items, updateQuantity, clearCart } =
    useCartStore();

  // State
  const [search, setSearch] = useState('');

  // page state removed
  // products state removed
  // hasMore state removed
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  // categories state removed, handled by useQuery
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // React Query for Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/categories'],
    queryFn: ({ queryKey }) => fetcher<Category[]>({ queryKey }),
  });

  // React Query for Products
  // React Query for Products (Infinite)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: [
      '/products',
      {
        per_page: 20,
        search: search || undefined,
        category_id: selectedCategory,
        sort_by: 'name',
        sort_order: 'asc',
      },
    ],
    queryFn: ({ pageParam = 1, queryKey }) => {
      const [path, params] = queryKey as [string, any];
      return fetchWithCache<any>({
        queryKey: [path, { ...params, page: pageParam }],
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const products = data?.pages.flatMap((page) => page.data) || [];

  // Barcode search manually triggered (generic useApi valid here or mutation)
  const { execute: searchByBarcode } = useApi((code: string) =>
    searchProductByBarcode(code),
  );

  // Derived state for products (handling pagination locally if needed or replace)

  // Clean up manual loaders
  // loadCategories removal
  // loadProducts removal

  // loadProducts removed

  const handleSearch = () => {
    // search update triggers useInfiniteQuery reset automatically
  };

  const handleCategorySelect = (id?: string) => {
    setSelectedCategory(id);
    // category update triggers useInfiniteQuery reset automatically
  };

  // loadProductsWithCategory removed

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

  const { mutate: mutateHoldCart } = useOptimisticMutation(
    async (variables: any) => holdCart(variables),
    {
      queryKey: ['/carts/held'], // Invalidate held carts list?
      updater: (old: any) => old,
      onSuccess: () => {
        clearCart();
        Alert.alert('Success', 'Cart held successfully.');
      },
      onError: (e: Error) => {
        Alert.alert('Error', 'Failed to hold cart.');
      },
    },
  );

  const handleHoldCart = async () => {
    if (items.length === 0) return;

    Alert.prompt(
      'Hold Cart',
      'Enter a reference name/note for this cart:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hold',
          onPress: async (name?: string) => {
            if (!name) return;
            try {
              mutateHoldCart({
                items: items.map((i) => ({
                  product_id: i.product.id,
                  quantity: i.quantity,
                })),
                held_by: name,
              });
            } catch (e) {
              // Mutate is sync, error handled in onError
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
    const cartItem = items.find((i) => i.product.id === item.id);
    const qty = cartItem ? cartItem.quantity : 0;

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
          className={`bg-background rounded-none border border-border overflow-hidden ${!hasStock ? 'opacity-50' : ''}`}
        >
          {/* Image Area */}
          <View className="h-32 bg-muted items-center justify-center border-b border-border relative">
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
              <View className="absolute inset-0 bg-background/80 items-center justify-center">
                <Text className="text-foreground font-black text-xs uppercase tracking-widest border border-foreground px-2 py-1">
                  SOLD OUT
                </Text>
              </View>
            )}

            {/* Qty Controls Overlay */}
            {hasStock && qty > 0 && (
              <View className="absolute bottom-0 left-0 right-0 bg-black/80 flex-row items-center justify-between px-3 py-2">
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, qty - 1)}
                  className="w-8 h-8 items-center justify-center bg-white/20 rounded-full"
                >
                  <Text className="text-white font-bold text-lg">-</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold text-base">{qty}</Text>
                <TouchableOpacity
                  onPress={() => addItem(item)}
                  className="w-8 h-8 items-center justify-center bg-white/20 rounded-full"
                >
                  <Text className="text-white font-bold text-lg">+</Text>
                </TouchableOpacity>
              </View>
            )}

            {hasStock && qty === 0 && (
              <View className="absolute bottom-2 right-2 bg-foreground h-8 w-8 items-center justify-center rounded-full opacity-0 group-active:opacity-100">
                <Text className="text-background font-bold text-xs">+</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="p-3">
            <Text
              className="font-medium text-foreground text-xs mb-1 h-8 leading-4"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text className="text-foreground font-black text-sm tracking-tight">
              {formatCurrency(item.base_price)}
            </Text>

            {item.is_stock_active &&
              item.current_stock <= item.min_stock_alert &&
              item.current_stock > 0 && (
                <Text className="text-[10px] text-destructive font-bold mt-1 uppercase tracking-wider">
                  Only {item.current_stock} left
                </Text>
              )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="SCAN ITEM"
      />

      {/* Top Bar */}
      <View
        className="bg-background border-b border-border px-5 pb-4 z-10"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center mb-4 gap-3">
          <TouchableOpacity
            onPress={() => router.replace('/(admin)')}
            className="w-10 h-10 items-center justify-center bg-muted rounded-full"
          >
            <Text className="text-lg text-foreground">←</Text>
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-muted border border-border rounded-lg px-4 h-12">
            <Text className="mr-3 opacity-50 text-foreground">🔍</Text>
            <TextInput
              className="flex-1 text-base font-medium text-foreground h-full"
              placeholder="Search items..."
              placeholderTextColor="hsl(var(--muted-foreground))"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowBarcodeScanner(true)}
            className="bg-foreground w-12 h-12 rounded-lg items-center justify-center mr-2"
          >
            <Text className="text-background text-xl">📷</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/pos/held-carts')}
            className="bg-muted w-12 h-12 rounded-lg items-center justify-center"
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
                  ? 'bg-foreground border-foreground'
                  : 'bg-background border-border'
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedCategory === item.id
                    ? 'text-background'
                    : 'text-muted-foreground'
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
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? <Loading message="" /> : <View className="h-10" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20">
              <Text className="text-muted-foreground font-bold uppercase tracking-widest">
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
              className="flex-1 bg-muted rounded-xl shadow-xl p-4 flex-row items-center justify-center border border-border"
            >
              <Text className="text-foreground font-bold uppercase text-xs tracking-wider">
                Hold
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/(admin)/pos/checkout')}
              className="flex-[3] bg-foreground rounded-xl shadow-xl p-4 flex-row items-center justify-between border border-border"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-background/20 px-3 py-1 rounded-md">
                  <Text className="text-background font-bold">
                    {getItemCount()}
                  </Text>
                </View>
                <View>
                  <Text className="text-background/60 text-[10px] font-bold uppercase tracking-widest">
                    Total
                  </Text>
                  <Text className="text-background font-black text-lg tracking-tight">
                    {formatCurrency(getTotal())}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Text className="text-background font-bold mr-2 uppercase text-xs tracking-wider">
                  Checkout
                </Text>
                <Text className="text-background">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

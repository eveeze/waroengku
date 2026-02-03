import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
const { setStringAsync } = Clipboard;
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi, useOptimisticMutation } from '@/hooks'; // useApi still used? Maybe generic one.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/api/client';
import {
  getProductById,
  deleteProduct,
  deletePricingTier,
  toggleProductActive,
} from '@/api/endpoints/products';
import { Header } from '@/components/shared';
import { Card, Button, Loading } from '@/components/ui';
import { Product, PricingTier } from '@/api/types';
import { getCleanImageUrl } from '@/utils/image';
// import { useApi } from '@/hooks/useApi'; // Removed generic useApi for fetching

/**
 * Product Detail Screen
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Removed local state 'product' as we use useQuery 'product' data
  // Renaming useQuery data to 'product' in destructuring is correct, but we need to remove the useState.
  // const [product, setProduct] = useState<Product | null>(null);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/products/${id}`],
    queryFn: ({ queryKey }) => fetcher<Product>({ queryKey }),
    enabled: !!id,
  });

  const { mutate: mutateDeleteProduct } = useOptimisticMutation(
    async () => deleteProduct(id!),
    {
      queryKey: ['/products'], // Invalidate list
      updater: (old: any) => old, // No optimistic update on list needed, actually we can filter it out but validation is cleaner.
      // Actually we want to remove from LIST on delete.
      // But we are redirecting back. So simple invalidation is enough.
      onSuccess: () => {
        Alert.alert('Success', 'Product deleted successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to delete product');
      },
    },
  );

  const { mutate: mutateToggleActive } = useOptimisticMutation(
    async () => toggleProductActive(product!.id),
    {
      queryKey: [`/products/${id}`],
      updater: (old: Product | undefined) => {
        if (!old) return old;
        return { ...old, is_active: !old.is_active };
      },
      onSuccess: (data) => {
        // Optional toast
      },
      onError: (err) => {
        Alert.alert('Error', 'Failed to update status');
      },
    },
  );

  const { mutate: mutateDeleteTier } = useOptimisticMutation(
    async (tierId: string) => deletePricingTier(id!, tierId),
    {
      queryKey: [`/products/${id}`],
      updater: (old: Product | undefined, tierId: string) => {
        if (!old) return old;
        return {
          ...old,
          pricing_tiers:
            old.pricing_tiers?.filter((t) => t.id !== tierId) || [],
        };
      },
      onSuccess: () => {
        Alert.alert('Success', 'Tier deleted successfully');
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to delete tier');
      },
    },
  );
  // loadProduct is removed as useQuery handles data fetching

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => mutateDeleteProduct(),
        },
      ],
    );
  };

  const handleDeleteTier = (tier: PricingTier) => {
    Alert.alert('Delete Tier', `Delete tier "${tier.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => mutateDeleteTier(tier.id),
      },
    ]);
  };

  if (isLoading && !product) {
    return <Loading fullScreen message="Loading product..." />;
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="text-secondary-500 font-bold uppercase tracking-widest">
          Product Not Found
        </Text>
        <Button
          title="GO BACK"
          variant="outline"
          onPress={() => router.back()}
          className="mt-6"
        />
      </View>
    );
  }

  const isLowStock = product.current_stock <= product.min_stock_alert;
  const profit = product.base_price - product.cost_price;
  const profitMargin =
    product.cost_price > 0
      ? ((profit / product.cost_price) * 100).toFixed(1)
      : 0;

  return (
    <View className="flex-1 bg-white">
      {/* Custom Header matching POS style */}
      <View
        className="px-6 pb-6 border-b border-secondary-200"
        style={{ paddingTop: insets.top + 24 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs font-body">
            ← BACK TO LIST
          </Text>
        </TouchableOpacity>
        <View className="flex-row justify-between items-start">
          <Text className="text-4xl font-heading font-black tracking-tighter text-primary-900 uppercase flex-1 mr-4 leading-9">
            {product.name}
          </Text>
          <TouchableOpacity
            onPress={() => mutateToggleActive()}
            className={`px-3 py-1 rounded-full border ${
              product.is_active
                ? 'bg-primary-900 border-primary-900'
                : 'bg-white border-secondary-300'
            }`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-widest font-heading ${
                product.is_active ? 'text-white' : 'text-secondary-400'
              }`}
            >
              {product.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Product Image Placeholder */}
        <View
          className="bg-secondary-50 rounded-xl items-center justify-center mb-8 border border-secondary-200 overflow-hidden"
          style={{ height: 300 }} // Explicit height
        >
          {product.image_url ? (
            <Image
              source={{ uri: getCleanImageUrl(product.image_url) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : (
            <View className="items-center">
              <Text className="text-6xl mb-2 opacity-20">📦</Text>
              <Text className="text-secondary-400 font-bold uppercase tracking-widest text-xs">
                No Image
              </Text>
            </View>
          )}
        </View>

        {/* Info Grid */}
        <View className="flex-row flex-wrap mb-8 gap-2">
          {product.category_name && (
            <View className="bg-white border border-secondary-200 px-3 py-1.5 rounded-md">
              <Text className="text-primary-900 text-xs font-bold uppercase tracking-widest font-heading">
                {product.category_name}
              </Text>
            </View>
          )}
          {product.barcode && (
            <TouchableOpacity
              onPress={async () => {
                await setStringAsync(product.barcode!);
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Barcode copied!', ToastAndroid.SHORT);
                } else {
                  Alert.alert('Copied', 'Barcode copied to clipboard');
                }
              }}
              className="bg-secondary-50 border border-secondary-200 px-3 py-1.5 rounded-md flex-row items-center gap-2"
            >
              <Text className="text-secondary-600 text-xs font-mono font-medium tracking-wide">
                {product.barcode}
              </Text>
              <Text className="text-[10px]">📋</Text>
            </TouchableOpacity>
          )}
          {product.sku && (
            <View className="bg-secondary-50 border border-secondary-200 px-3 py-1.5 rounded-md">
              <Text className="text-secondary-600 text-xs font-medium tracking-wide">
                SKU: {product.sku}
              </Text>
            </View>
          )}
        </View>

        {product.description && (
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
              DESCRIPTION
            </Text>
            <Text className="text-secondary-900 font-body leading-6 text-base">
              {product.description}
            </Text>
          </View>
        )}

        <View className="h-px bg-secondary-100 w-full mb-8" />

        {/* Pricing Info */}
        <View className="mb-8">
          <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-4 font-body">
            PRICING & PROFIT
          </Text>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-secondary-50 p-4 rounded-lg border border-secondary-200">
              <Text className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1">
                SELLING PRICE
              </Text>
              <Text className="text-2xl font-heading font-black text-primary-900 tracking-tight">
                {formatCurrency(product.base_price)}
              </Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-lg border border-dashed border-secondary-300">
              <Text className="text-xs font-bold text-secondary-400 uppercase tracking-wide mb-1">
                COST PRICE
              </Text>
              <Text className="text-xl font-heading font-bold text-secondary-700">
                {formatCurrency(product.cost_price)}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
            <Text className="text-green-800 font-bold uppercase tracking-widest text-xs">
              PROFIT MARGIN
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-green-700 font-heading font-black text-lg mr-2">
                +{formatCurrency(profit)}
              </Text>
              <Text className="text-green-600 font-bold text-xs bg-white px-2 py-0.5 rounded-full overflow-hidden">
                {profitMargin}%
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Tiers Link */}
        <TouchableOpacity
          onPress={() => router.push(`/(admin)/products/${id}/pricing`)}
          className="mb-8 bg-black p-5 rounded-xl flex-row justify-between items-center shadow-sm active:opacity-90"
        >
          <View>
            <Text className="text-white font-heading font-black text-lg uppercase tracking-tight">
              WHOLESALE PRICING
            </Text>
            <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
              {product.pricing_tiers?.length || 0} ACTIVE TIERS
            </Text>
          </View>
          <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-lg">→</Text>
          </View>
        </TouchableOpacity>

        {/* Stock Info */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase font-body">
              STOCK LEVEL
            </Text>
            <Text
              className={`text-xs font-bold uppercase tracking-widest font-heading ${
                product.is_stock_active
                  ? 'text-green-600'
                  : 'text-secondary-400'
              }`}
            >
              {product.is_stock_active ? 'TRACKING ACTIVE' : 'TRACKING OFF'}
            </Text>
          </View>

          <View className="bg-white border border-secondary-200 rounded-xl p-5">
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-secondary-100">
              <Text className="text-secondary-900 font-bold text-sm uppercase tracking-wide">
                CURRENT STOCK
              </Text>
              <Text
                className={`text-3xl font-heading font-black ${isLowStock ? 'text-danger-600' : 'text-primary-900'}`}
              >
                {product.current_stock}{' '}
                <Text className="text-sm text-secondary-500 font-medium">
                  {product.unit}
                </Text>
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">
                  MIN ALERT
                </Text>
                <Text className="text-lg font-heading font-bold text-secondary-700">
                  {product.min_stock_alert}
                </Text>
              </View>
              <View className="flex-1 border-l border-secondary-100 pl-4">
                <Text className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">
                  MAX STOCK
                </Text>
                <Text className="text-lg font-heading font-bold text-secondary-700">
                  {product.max_stock || '∞'}
                </Text>
              </View>
            </View>

            {isLowStock && (
              <View className="bg-danger-50 rounded-lg p-3 mt-4 border border-danger-100 flex-row items-center">
                <Text className="mr-2">⚠️</Text>
                <Text className="text-danger-800 font-bold text-xs uppercase tracking-wide">
                  Low Stock Warning
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <Button
            title="EDIT PRODUCT"
            variant="primary"
            fullWidth
            size="lg"
            onPress={() => router.push(`/(admin)/products/${id}/edit`)}
          />
          <Button
            title="DELETE PRODUCT"
            variant="ghost"
            fullWidth
            onPress={handleDelete}
            className="mt-2"
            textClassName="text-danger-600"
          />
        </View>
      </ScrollView>
    </View>
  );
}

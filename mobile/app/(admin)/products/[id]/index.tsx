import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import {
  getProductById,
  deleteProduct,
  deletePricingTier,
} from '@/api/endpoints/products';
import { Header } from '@/components/shared';
import { Card, Button, Loading } from '@/components/ui';
import { Product, PricingTier } from '@/api/types';

/**
 * Product Detail Screen
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  const {
    isLoading,
    error,
    execute: fetchProduct,
  } = useApi(() => getProductById(id!));

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    const result = await fetchProduct();
    if (result) {
      setProduct(result);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Produk',
      `Yakin ingin menghapus "${product?.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id!);
              Alert.alert('Berhasil', 'Produk berhasil dihapus');
              router.back();
            } catch (err) {
              Alert.alert(
                'Gagal',
                err instanceof Error ? err.message : 'Gagal menghapus produk'
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteTier = (tier: PricingTier) => {
    Alert.alert(
      'Hapus Tier',
      `Hapus tier "${tier.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePricingTier(id!, tier.id);
              Alert.alert('Berhasil', 'Tier berhasil dihapus');
              loadProduct();
            } catch (err) {
              Alert.alert(
                'Gagal',
                err instanceof Error ? err.message : 'Gagal menghapus tier'
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading && !product) {
    return <Loading fullScreen message="Memuat produk..." />;
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="text-secondary-500">Produk tidak ditemukan</Text>
        <Button
          title="Kembali"
          variant="outline"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    );
  }

  const isLowStock = product.current_stock <= product.min_stock_alert;
  const profit = product.base_price - product.cost_price;
  const profitMargin = product.cost_price > 0 
    ? ((profit / product.cost_price) * 100).toFixed(1)
    : 0;

  return (
    <View className="flex-1 bg-secondary-50">
      <Header 
        title="Detail Produk" 
        onBack={() => router.back()}
        actions={[
          {
            icon: '✏️',
            onPress: () => router.push(`/(admin)/products/${id}/edit`),
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
      >
        {/* Product Image Placeholder */}
        <View className="bg-white rounded-xl items-center justify-center py-12 mb-4 shadow-sm">
          {product.image_url ? (
            <Text className="text-6xl">📷</Text>
          ) : (
            <View className="items-center">
              <Text className="text-6xl mb-2">📦</Text>
              <Text className="text-secondary-400">Tidak ada gambar</Text>
            </View>
          )}
        </View>

        {/* Product Name & Status */}
        <Card className="mb-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-secondary-900">
                {product.name}
              </Text>
              {product.description && (
                <Text className="text-secondary-500 mt-1">
                  {product.description}
                </Text>
              )}
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                product.is_active ? 'bg-green-100' : 'bg-secondary-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  product.is_active ? 'text-green-700' : 'text-secondary-500'
                }`}
              >
                {product.is_active ? 'Aktif' : 'Nonaktif'}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap mt-3">
            {product.category_name && (
              <View className="bg-primary-50 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-primary-700 text-sm">
                  🏷️ {product.category_name}
                </Text>
              </View>
            )}
            {product.barcode && (
              <View className="bg-secondary-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-secondary-600 text-sm font-mono">
                  📊 {product.barcode}
                </Text>
              </View>
            )}
            {product.sku && (
              <View className="bg-secondary-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-secondary-600 text-sm">
                  SKU: {product.sku}
                </Text>
              </View>
            )}
            {product.is_refillable && (
              <View className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-blue-700 text-sm">
                  ♻️ Refillable
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Pricing Info */}
        <Card title="Harga" className="mb-4">
          <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
            <Text className="text-secondary-500">Harga Jual</Text>
            <Text className="text-2xl font-bold text-primary-600">
              {formatCurrency(product.base_price)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
            <Text className="text-secondary-500">Harga Modal</Text>
            <Text className="text-lg text-secondary-700">
              {formatCurrency(product.cost_price)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-secondary-500">Keuntungan</Text>
            <View className="items-end">
              <Text className="text-lg font-semibold text-green-600">
                {formatCurrency(profit)}
              </Text>
              <Text className="text-sm text-green-500">
                +{profitMargin}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Pricing Tiers */}
        {product.pricing_tiers && product.pricing_tiers.length > 0 && (
          <Card 
            title="Harga Grosir" 
            className="mb-4"
            actions={[
              { 
                title: '+ Tambah', 
                onPress: () => router.push(`/(admin)/products/${id}/pricing`) 
              },
            ]}
          >
            {product.pricing_tiers.map((tier, index) => (
              <TouchableOpacity
                key={tier.id}
                onLongPress={() => handleDeleteTier(tier)}
                className={`flex-row justify-between items-center py-3 ${
                  index < product.pricing_tiers!.length - 1 
                    ? 'border-b border-secondary-100' 
                    : ''
                }`}
              >
                <View>
                  <Text className="font-medium text-secondary-900">
                    {tier.name}
                  </Text>
                  <Text className="text-sm text-secondary-500">
                    Min. {tier.min_quantity}
                    {tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} pcs
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-semibold text-primary-600">
                    {formatCurrency(tier.price)}
                  </Text>
                  <Text className="text-xs text-green-500">
                    Hemat {formatCurrency(product.base_price - tier.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text className="text-xs text-secondary-400 mt-2 text-center">
              Tekan lama untuk menghapus tier
            </Text>
          </Card>
        )}

        {/* Stock Info */}
        <Card title="Stok" className="mb-4">
          <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
            <Text className="text-secondary-500">Stok Saat Ini</Text>
            <View className="flex-row items-center">
              {isLowStock && <Text className="mr-2">⚠️</Text>}
              <Text
                className={`text-lg font-semibold ${
                  isLowStock ? 'text-danger-600' : 'text-secondary-900'
                }`}
              >
                {product.current_stock} {product.unit}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
            <Text className="text-secondary-500">Stok Minimum</Text>
            <Text className="text-base text-secondary-700">
              {product.min_stock_alert} {product.unit}
            </Text>
          </View>
          {product.max_stock && (
            <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
              <Text className="text-secondary-500">Stok Maksimum</Text>
              <Text className="text-base text-secondary-700">
                {product.max_stock} {product.unit}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-secondary-500">Kelola Stok</Text>
            <Text className={product.is_stock_active ? 'text-green-600' : 'text-secondary-400'}>
              {product.is_stock_active ? '● Aktif' : '○ Nonaktif'}
            </Text>
          </View>

          {isLowStock && (
            <View className="bg-danger-50 rounded-lg p-3 mt-3">
              <Text className="text-danger-700 font-medium">
                ⚠️ Stok rendah! Perlu restock segera.
              </Text>
            </View>
          )}
        </Card>

        {/* Actions */}
        <View className="space-y-3">
          <Button
            title="Edit Produk"
            variant="primary"
            fullWidth
            onPress={() => router.push(`/(admin)/products/${id}/edit`)}
          />
          <Button
            title="Kelola Harga Grosir"
            variant="outline"
            fullWidth
            onPress={() => router.push(`/(admin)/products/${id}/pricing`)}
            className="mt-3"
          />
          <Button
            title="Hapus Produk"
            variant="danger"
            fullWidth
            onPress={handleDelete}
            className="mt-3"
          />
        </View>
      </ScrollView>
    </View>
  );
}

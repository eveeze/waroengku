import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import {
  getProductById,
  addPricingTier,
  updatePricingTier,
  deletePricingTier,
} from '@/api/endpoints/products';
import { Product, PricingTier, CreatePricingTierRequest } from '@/api/types';
import { useApi } from '@/hooks/useApi';

/**
 * Pricing Tiers Management Screen
 */
export default function PricingTiersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New tier form
  const [tierName, setTierName] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [tierPrice, setTierPrice] = useState('');

  const { execute: fetchProduct, isLoading } = useApi(() => getProductById(id!));

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    const result = await fetchProduct();
    if (result) {
      setProduct(result);
    }
  };

  const resetForm = () => {
    setTierName('');
    setMinQty('');
    setMaxQty('');
    setTierPrice('');
    setEditingTier(null);
    setShowAddForm(false);
  };

  const startEdit = (tier: PricingTier) => {
    setEditingTier(tier);
    setTierName(tier.name);
    setMinQty(String(tier.min_quantity));
    setMaxQty(tier.max_quantity ? String(tier.max_quantity) : '');
    setTierPrice(String(tier.price));
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!tierName || !minQty || !tierPrice) {
      Alert.alert('Error', 'Lengkapi semua field yang wajib diisi');
      return;
    }

    const price = Number(tierPrice);
    const min = Number(minQty);
    const max = maxQty ? Number(maxQty) : undefined;

    if (product && price >= product.base_price) {
      Alert.alert('Warning', 'Harga tier sebaiknya lebih rendah dari harga dasar');
    }

    try {
      setIsSubmitting(true);

      if (editingTier) {
        // Update existing tier
        await updatePricingTier(id!, editingTier.id, {
          name: tierName,
          min_quantity: min,
          max_quantity: max,
          price,
        });
        Alert.alert('Berhasil', 'Tier berhasil diperbarui');
      } else {
        // Add new tier
        await addPricingTier(id!, {
          name: tierName,
          min_quantity: min,
          max_quantity: max,
          price,
        });
        Alert.alert('Berhasil', 'Tier berhasil ditambahkan');
      }

      resetForm();
      loadProduct();
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal menyimpan tier'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (tier: PricingTier) => {
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
            } catch (error) {
              Alert.alert(
                'Gagal',
                error instanceof Error ? error.message : 'Gagal menghapus tier'
              );
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading && !product) {
    return <Loading fullScreen message="Memuat..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Harga Grosir" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
      >
        {/* Product Info */}
        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-secondary-100 rounded-lg items-center justify-center mr-3">
              <Text className="text-2xl">📦</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-secondary-900">
                {product?.name}
              </Text>
              <Text className="text-secondary-500">
                Harga dasar: {product && formatCurrency(product.base_price)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Existing Tiers */}
        <Card title="Tier Harga Aktif" className="mb-4">
          {product?.pricing_tiers && product.pricing_tiers.length > 0 ? (
            product.pricing_tiers
              .sort((a, b) => a.min_quantity - b.min_quantity)
              .map((tier, index) => (
                <View
                  key={tier.id}
                  className={`flex-row items-center justify-between py-3 ${
                    index < product.pricing_tiers!.length - 1
                      ? 'border-b border-secondary-100'
                      : ''
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => startEdit(tier)}
                    className="flex-1"
                  >
                    <Text className="font-medium text-secondary-900">
                      {tier.name}
                    </Text>
                    <Text className="text-sm text-secondary-500">
                      {tier.min_quantity}
                      {tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} pcs
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center">
                    <View className="items-end mr-3">
                      <Text className="font-semibold text-primary-600">
                        {formatCurrency(tier.price)}
                      </Text>
                      <Text className="text-xs text-green-500">
                        -{((1 - tier.price / product.base_price) * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(tier)}>
                      <Text className="text-danger-500 text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-4xl mb-2">🏷️</Text>
              <Text className="text-secondary-500">Belum ada tier harga</Text>
              <Text className="text-secondary-400 text-sm text-center mt-1">
                Tambahkan tier untuk memberikan diskon{'\n'}berdasarkan jumlah pembelian
              </Text>
            </View>
          )}
        </Card>

        {/* Add/Edit Form */}
        {showAddForm ? (
          <Card title={editingTier ? 'Edit Tier' : 'Tambah Tier Baru'} className="mb-4">
            <Input
              label="Nama Tier *"
              placeholder="cth: Grosir 10+, Karton"
              value={tierName}
              onChangeText={setTierName}
            />

            <View className="flex-row mt-3">
              <View className="flex-1 mr-2">
                <Input
                  label="Min Qty *"
                  placeholder="10"
                  value={minQty}
                  onChangeText={setMinQty}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-2">
                <Input
                  label="Max Qty"
                  placeholder="Opsional"
                  value={maxQty}
                  onChangeText={setMaxQty}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="mt-3">
              <Input
                label="Harga Per Unit *"
                placeholder="0"
                value={tierPrice}
                onChangeText={setTierPrice}
                keyboardType="numeric"
                leftIcon={<Text className="text-secondary-400">Rp</Text>}
              />
              {product && Number(tierPrice) > 0 && (
                <Text className="text-sm text-green-500 mt-1">
                  Diskon: {formatCurrency(product.base_price - Number(tierPrice))} (
                  {((1 - Number(tierPrice) / product.base_price) * 100).toFixed(1)}%)
                </Text>
              )}
            </View>

            <View className="flex-row mt-4">
              <Button
                title="Batal"
                variant="outline"
                onPress={resetForm}
                className="flex-1 mr-2"
              />
              <Button
                title={editingTier ? 'Simpan' : 'Tambah'}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                className="flex-1 ml-2"
              />
            </View>
          </Card>
        ) : (
          <Button
            title="+ Tambah Tier Baru"
            variant="outline"
            fullWidth
            onPress={() => setShowAddForm(true)}
          />
        )}

        {/* Tips */}
        <View className="bg-blue-50 rounded-lg p-4 mt-4">
          <Text className="text-blue-800 font-medium mb-2">💡 Tips Harga Grosir</Text>
          <Text className="text-blue-700 text-sm">
            • Tier otomatis dipilih berdasarkan jumlah pembelian{'\n'}
            • Urutkan dari quantity terkecil ke terbesar{'\n'}
            • Harga tier harus lebih rendah dari harga dasar{'\n'}
            • Gunakan max qty untuk membatasi range tier
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

  const { execute: fetchProduct, isLoading } = useApi(() =>
    getProductById(id!),
  );

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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = Number(tierPrice);
    const min = Number(minQty);
    const max = maxQty ? Number(maxQty) : undefined;

    if (product && price >= product.base_price) {
      Alert.alert('Warning', 'Tier price should be lower than base price');
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
        Alert.alert('Success', 'Tier updated successfully');
      } else {
        // Add new tier
        await addPricingTier(id!, {
          name: tierName,
          min_quantity: min,
          max_quantity: max,
          price,
        });
        Alert.alert('Success', 'Tier added successfully');
      }

      resetForm();
      loadProduct();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save tier',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (tier: PricingTier) => {
    Alert.alert(
      'Delete Tier',
      `Are you sure you want to delete "${tier.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePricingTier(id!, tier.id);
              Alert.alert('Success', 'Tier deleted successfully');
              loadProduct();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error
                  ? error.message
                  : 'Failed to delete tier',
              );
            }
          },
        },
      ],
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
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 pb-6 border-b border-secondary-200"
        style={{ paddingTop: insets.top + 24 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs font-body">
            ← BACK TO PRODUCT
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading font-black tracking-tighter text-primary-900 uppercase">
          WHOLESALE PRICING
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* Product Info */}
        <View className="mb-8 flex-row items-center border border-secondary-200 p-4 rounded-lg bg-secondary-50">
          <View className="w-12 h-12 bg-white border border-secondary-200 rounded-md items-center justify-center mr-4">
            <Text className="text-xl">📦</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-heading font-black text-primary-900 tracking-tight mb-1">
              {product?.name}
            </Text>
            <Text className="text-xs font-bold font-body text-secondary-500 uppercase tracking-widest">
              BASE PRICE: {product && formatCurrency(product.base_price)}
            </Text>
          </View>
        </View>

        {/* Existing Tiers */}
        <View className="mb-8">
          <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
            ACTIVE TIERS
          </Text>

          {product?.pricing_tiers && product.pricing_tiers.length > 0 ? (
            product.pricing_tiers
              .sort((a, b) => a.min_quantity - b.min_quantity)
              .map((tier, index) => (
                <View
                  key={tier.id}
                  className="bg-white border border-secondary-200 rounded-lg p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-lg font-heading font-black text-primary-900 uppercase">
                        {tier.name}
                      </Text>
                      <Text className="text-xs font-bold text-secondary-500 font-body uppercase tracking-wide mt-1">
                        MIN QTY: {tier.min_quantity}{' '}
                        {tier.max_quantity ? `- ${tier.max_quantity}` : '+'}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xl font-heading font-black text-primary-900 tracking-tight">
                        {formatCurrency(tier.price)}
                      </Text>
                      <View className="bg-green-100 px-2 py-0.5 rounded mt-1">
                        <Text className="text-[10px] font-bold text-green-700 uppercase tracking-widest font-body">
                          SAVE{' '}
                          {(
                            (1 - tier.price / product!.base_price) *
                            100
                          ).toFixed(0)}
                          %
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mt-2 pt-2 border-t border-secondary-100">
                    <TouchableOpacity
                      onPress={() => startEdit(tier)}
                      className="flex-1 py-2 items-center border-r border-secondary-100"
                    >
                      <Text className="text-xs font-bold text-primary-900 uppercase tracking-widest font-body">
                        EDIT
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(tier)}
                      className="flex-1 py-2 items-center"
                    >
                      <Text className="text-xs font-bold text-danger-600 uppercase tracking-widest font-body">
                        DELETE
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          ) : (
            <View className="items-center py-12 border border-dashed border-secondary-300 rounded-lg">
              <Text className="text-4xl mb-2 opacity-50">🏷️</Text>
              <Text className="text-secondary-400 font-bold uppercase tracking-widest font-body">
                No Pricing Tiers
              </Text>
            </View>
          )}
        </View>

        {/* Add/Edit Form */}
        {showAddForm ? (
          <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-lg animate-fade-in-down mb-8">
            <Text className="text-xs font-bold tracking-widest text-primary-900 uppercase mb-4 font-body border-b border-secondary-200 pb-2">
              {editingTier ? 'EDIT TIER' : 'NEW TIER'}
            </Text>

            <Input
              label="TIER NAME"
              placeholder="e.g. Wholesale, Box"
              value={tierName}
              onChangeText={setTierName}
            />

            <View className="flex-row gap-3 mt-1">
              <View className="flex-1">
                <Input
                  label="MIN QTY"
                  placeholder="10"
                  value={minQty}
                  onChangeText={setMinQty}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="MAX QTY"
                  placeholder="Optional"
                  value={maxQty}
                  onChangeText={setMaxQty}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="mt-1">
              <Input
                label="UNIT PRICE"
                placeholder="0"
                value={tierPrice}
                onChangeText={setTierPrice}
                keyboardType="numeric"
                leftIcon={
                  <Text className="text-secondary-400 font-heading font-bold">
                    Rp
                  </Text>
                }
              />
              {product && Number(tierPrice) > 0 && (
                <Text className="text-[10px] font-bold text-green-600 uppercase tracking-wide mt-1 font-body text-right">
                  Discount:{' '}
                  {((1 - Number(tierPrice) / product.base_price) * 100).toFixed(
                    1,
                  )}
                  %
                </Text>
              )}
            </View>

            <View className="flex-row gap-3 mt-4">
              <Button
                title="CANCEL"
                variant="ghost"
                onPress={resetForm}
                className="flex-1"
                size="sm"
              />
              <Button
                title={editingTier ? 'UPDATE TIER' : 'ADD TIER'}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                className="flex-1"
                size="sm"
              />
            </View>
          </View>
        ) : (
          <Button
            title="+ ADD NEW TIER"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => setShowAddForm(true)}
          />
        )}
      </ScrollView>
    </View>
  );
}

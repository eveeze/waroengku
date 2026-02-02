import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import { updateProduct, getProductById, getCategories } from '@/api/endpoints';
import { Category, Product } from '@/api/types';
import { useApi } from '@/hooks/useApi';

// Edit form schema (all optional except changed fields)
const editProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  unit: z.string(),
  base_price: z.number().min(0),
  cost_price: z.number().min(0),
  min_stock_alert: z.number().min(0),
  max_stock: z.number().optional(),
  is_active: z.boolean(),
  is_refillable: z.boolean(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

/**
 * Edit Product Screen
 */
export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const { execute: fetchProduct, isLoading } = useApi(() =>
    getProductById(id!),
  );
  const { execute: fetchCategories } = useApi(getCategories);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prod, cats] = await Promise.all([fetchProduct(), fetchCategories()]);

    if (prod) {
      setProduct(prod);
      reset({
        name: prod.name,
        barcode: prod.barcode || '',
        sku: prod.sku || '',
        description: prod.description || '',
        category_id: prod.category_id || '',
        unit: prod.unit,
        base_price: prod.base_price,
        cost_price: prod.cost_price,
        min_stock_alert: prod.min_stock_alert,
        max_stock: prod.max_stock,
        is_active: prod.is_active,
        is_refillable: prod.is_refillable,
      });
    }

    if (cats) setCategories(cats);
  };

  const onSubmit = async (data: EditProductFormData) => {
    try {
      setIsSubmitting(true);

      await updateProduct(id!, {
        name: data.name,
        barcode: data.barcode || undefined,
        sku: data.sku || undefined,
        description: data.description || undefined,
        category_id: data.category_id || undefined,
        unit: data.unit,
        base_price: data.base_price,
        cost_price: data.cost_price,
        min_stock_alert: data.min_stock_alert,
        max_stock: data.max_stock,
        is_active: data.is_active,
        is_refillable: data.is_refillable,
      });

      Alert.alert('Success', 'Product updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update product',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !product) {
    return <Loading fullScreen message="Loading product..." />;
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
            ← BACK TO DETAIL
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading font-black tracking-tighter text-primary-900 uppercase">
          EDIT PRODUCT
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 180,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              BASIC INFORMATION
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="PRODUCT NAME *"
                  placeholder="Enter product name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <View className="flex-row mt-1 gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="barcode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="BARCODE"
                      placeholder="Scan/input"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="sku"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="SKU"
                      placeholder="Product code"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mt-1">
                  <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                    DESCRIPTION
                  </Text>
                  <TextInput
                    className="border border-secondary-200 rounded-lg px-4 py-3 bg-secondary-50 text-base font-body text-primary-900 min-h-[100px]"
                    placeholder="Product description (optional)"
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}
            />

            {/* Category */}
            <View className="mt-5">
              <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                CATEGORY
              </Text>
              <Controller
                control={control}
                name="category_id"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap">
                    <TouchableOpacity
                      onPress={() => onChange('')}
                      className={`px-4 py-2 rounded-lg mr-2 mb-2 border ${
                        !value
                          ? 'bg-primary-900 border-primary-900'
                          : 'bg-white border-secondary-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-widest font-heading ${!value ? 'text-white' : 'text-primary-900'}`}
                      >
                        NONE
                      </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => onChange(cat.id)}
                        className={`px-4 py-2 rounded-lg mr-2 mb-2 border ${
                          value === cat.id
                            ? 'bg-primary-900 border-primary-900'
                            : 'bg-white border-secondary-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold uppercase tracking-widest font-heading ${
                            value === cat.id ? 'text-white' : 'text-primary-900'
                          }`}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, value } }) => (
                <View className="mt-3">
                  <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                    UNIT
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    {['pcs', 'kg', 'liter', 'pack', 'dus'].map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        onPress={() => onChange(unit)}
                        className={`px-4 py-2 rounded-lg mr-2 border ${
                          value === unit
                            ? 'bg-primary-900 border-primary-900'
                            : 'bg-white border-secondary-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold uppercase tracking-widest font-heading ${
                            value === unit ? 'text-white' : 'text-primary-900'
                          }`}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            />
          </View>

          {/* Pricing */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              PRICING
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="cost_price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="COST (HPP)"
                      placeholder="0"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      leftIcon={
                        <Text className="text-secondary-400 font-heading font-bold">
                          Rp
                        </Text>
                      }
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="base_price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="SELLING PRICE"
                      placeholder="0"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      leftIcon={
                        <Text className="text-secondary-400 font-heading font-bold">
                          Rp
                        </Text>
                      }
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Stock Settings */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              STOCK SETTINGS
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="min_stock_alert"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="MIN ALERT"
                      placeholder="10"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="max_stock"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="MAX STOCK"
                      placeholder="Optional"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) =>
                        onChange(text ? Number(text) : undefined)
                      }
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="is_refillable"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  className="flex-row items-center mt-2 border border-secondary-200 rounded-lg p-3"
                >
                  <View
                    className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                      value
                        ? 'bg-primary-900 border-primary-900'
                        : 'border-secondary-300'
                    }`}
                  >
                    {value && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-primary-900 font-heading font-bold uppercase tracking-wider text-xs">
                    REFILLABLE PRODUCT (GAS/GALON)
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Status */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              STATUS
            </Text>
            <Controller
              control={control}
              name="is_active"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  className="flex-row items-center justify-between border border-secondary-200 rounded-lg p-4 bg-secondary-50"
                >
                  <View>
                    <Text className="text-primary-900 font-heading font-black uppercase text-sm">
                      PRODUCT ACTIVE
                    </Text>
                    <Text className="text-secondary-500 text-xs font-body mt-1">
                      Inactive products won't show in POS
                    </Text>
                  </View>
                  <View
                    className={`w-12 h-6 rounded-full p-1 ${
                      value ? 'bg-primary-900' : 'bg-secondary-300'
                    }`}
                  >
                    <View
                      className={`w-4 h-4 rounded-full bg-white ${
                        value ? 'ml-auto' : ''
                      }`}
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-6 py-4"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="SAVE CHANGES"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

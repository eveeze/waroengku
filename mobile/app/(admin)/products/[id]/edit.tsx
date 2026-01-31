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
  name: z.string().min(2, 'Nama minimal 2 karakter'),
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

  const { execute: fetchProduct, isLoading } = useApi(() => getProductById(id!));
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
    const [prod, cats] = await Promise.all([
      fetchProduct(),
      fetchCategories(),
    ]);
    
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

      Alert.alert('Berhasil', 'Produk berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal memperbarui produk'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !product) {
    return <Loading fullScreen message="Memuat produk..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Edit Produk" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <Card title="Informasi Dasar" className="mb-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Produk *"
                  placeholder="Masukkan nama produk"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <View className="flex-row mt-3">
              <View className="flex-1 mr-2">
                <Controller
                  control={control}
                  name="barcode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Barcode"
                      placeholder="Scan/input"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              <View className="flex-1 ml-2">
                <Controller
                  control={control}
                  name="sku"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="SKU"
                      placeholder="Kode produk"
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
                <View className="mt-3">
                  <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                    Deskripsi
                  </Text>
                  <TextInput
                    className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                    placeholder="Deskripsi produk (opsional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            />

            {/* Category */}
            <View className="mt-3">
              <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                Kategori
              </Text>
              <Controller
                control={control}
                name="category_id"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap">
                    <TouchableOpacity
                      onPress={() => onChange('')}
                      className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                        !value ? 'bg-primary-600' : 'bg-secondary-100'
                      }`}
                    >
                      <Text className={!value ? 'text-white' : 'text-secondary-700'}>
                        Tidak Ada
                      </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => onChange(cat.id)}
                        className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                          value === cat.id ? 'bg-primary-600' : 'bg-secondary-100'
                        }`}
                      >
                        <Text className={value === cat.id ? 'text-white' : 'text-secondary-700'}>
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
                  <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                    Satuan
                  </Text>
                  <View className="flex-row">
                    {['pcs', 'kg', 'liter', 'pack', 'dus'].map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        onPress={() => onChange(unit)}
                        className={`px-4 py-2 rounded-lg mr-2 ${
                          value === unit ? 'bg-primary-600' : 'bg-secondary-100'
                        }`}
                      >
                        <Text className={value === unit ? 'text-white' : 'text-secondary-700'}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />
          </Card>

          {/* Pricing */}
          <Card title="Harga" className="mb-4">
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Controller
                  control={control}
                  name="cost_price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Harga Modal *"
                      placeholder="0"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      leftIcon={<Text className="text-secondary-400">Rp</Text>}
                    />
                  )}
                />
              </View>
              <View className="flex-1 ml-2">
                <Controller
                  control={control}
                  name="base_price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Harga Jual *"
                      placeholder="0"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      leftIcon={<Text className="text-secondary-400">Rp</Text>}
                    />
                  )}
                />
              </View>
            </View>
          </Card>

          {/* Stock Settings */}
          <Card title="Pengaturan Stok" className="mb-4">
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Controller
                  control={control}
                  name="min_stock_alert"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Stok Minimum"
                      placeholder="10"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              <View className="flex-1 ml-2">
                <Controller
                  control={control}
                  name="max_stock"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Stok Maksimum"
                      placeholder="Opsional"
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => onChange(text ? Number(text) : undefined)}
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
                  className="flex-row items-center mt-4"
                >
                  <View
                    className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                      value ? 'bg-primary-600 border-primary-600' : 'border-secondary-300'
                    }`}
                  >
                    {value && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-secondary-700">Produk Refillable (Gas/Galon)</Text>
                </TouchableOpacity>
              )}
            />
          </Card>

          {/* Status */}
          <Card title="Status" className="mb-4">
            <Controller
              control={control}
              name="is_active"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  className="flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-secondary-900 font-medium">Produk Aktif</Text>
                    <Text className="text-secondary-500 text-sm">
                      Produk nonaktif tidak akan muncul di POS
                    </Text>
                  </View>
                  <View
                    className={`w-12 h-6 rounded-full p-1 ${
                      value ? 'bg-primary-600' : 'bg-secondary-300'
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
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-4 py-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            title="Simpan Perubahan"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

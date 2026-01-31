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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header, BarcodeScanner } from '@/components/shared';
import {
  Button,
  Card,
  Input,
  Loading,
  ImagePickerInput,
} from '@/components/ui';
import { productSchema, ProductFormData } from '@/utils/validation';
import { createProduct, getCategories } from '@/api/endpoints';
import { Category, CreatePricingTierRequest } from '@/api/types';
import { useApi, ImageAsset } from '@/hooks';

/**
 * Create Product Screen
 * With Barcode Scanner and Image Picker integration
 */
export default function CreateProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricingTiers, setPricingTiers] = useState<CreatePricingTierRequest[]>(
    [],
  );
  const [showTierForm, setShowTierForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [productImage, setProductImage] = useState<ImageAsset | null>(null);
  const [newTier, setNewTier] = useState<CreatePricingTierRequest>({
    name: '',
    min_quantity: 1,
    price: 0,
  });

  const { execute: fetchCategories } = useApi(getCategories);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      sku: '',
      description: '',
      unit: 'pcs',
      base_price: 0,
      cost_price: 0,
      is_stock_active: true,
      current_stock: 0,
      min_stock_alert: 10,
      is_refillable: false,
    },
  });

  const basePrice = watch('base_price');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      if (cats) setCategories(cats);
    } catch {}
  };

  const handleBarcodeScanned = (barcode: string, type: string) => {
    setValue('barcode', barcode);
    setShowBarcodeScanner(false);
    Alert.alert('Barcode Terdeteksi', `Kode: ${barcode}`);
  };

  const handleImageSelected = (image: ImageAsset) => {
    setProductImage(image);
  };

  const handleImageCleared = () => {
    setProductImage(null);
  };

  const addPricingTier = () => {
    if (!newTier.name || newTier.price <= 0 || newTier.min_quantity < 1) {
      Alert.alert('Error', 'Lengkapi data pricing tier');
      return;
    }
    if (newTier.price >= basePrice) {
      Alert.alert(
        'Warning',
        'Harga tier sebaiknya lebih rendah dari harga dasar',
      );
    }
    setPricingTiers([...pricingTiers, newTier]);
    setNewTier({ name: '', min_quantity: 1, price: 0 });
    setShowTierForm(false);
  };

  const removePricingTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Upload image if productImage exists
      // For now, we'll just submit without the image URL
      await createProduct({
        ...data,
        pricing_tiers: pricingTiers.length > 0 ? pricingTiers : undefined,
      });

      Alert.alert('Berhasil', 'Produk berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal menambahkan produk',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Tambah Produk" onBack={() => router.back()} />

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="Scan Barcode Produk"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Image */}
          <Card title="Foto Produk" className="mb-4">
            <ImagePickerInput
              value={productImage?.uri}
              onImageSelected={handleImageSelected}
              onImageCleared={handleImageCleared}
              placeholder="Tap untuk menambahkan foto produk"
              aspectRatio={[4, 3]}
            />
          </Card>

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

            {/* Barcode with Scanner Button */}
            <View className="mt-3">
              <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                Barcode
              </Text>
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <Controller
                    control={control}
                    name="barcode"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Kode barcode"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowBarcodeScanner(true)}
                  className="bg-primary-600 px-4 rounded-lg items-center justify-center"
                >
                  <Text className="text-white text-lg">📷</Text>
                  <Text className="text-white text-xs">Scan</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-3">
              <Controller
                control={control}
                name="sku"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="SKU"
                    placeholder="Kode produk internal"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
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
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => onChange(value === cat.id ? '' : cat.id)}
                        className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                          value === cat.id
                            ? 'bg-primary-600'
                            : 'bg-secondary-100'
                        }`}
                      >
                        <Text
                          className={
                            value === cat.id
                              ? 'text-white'
                              : 'text-secondary-700'
                          }
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
                        <Text
                          className={
                            value === unit ? 'text-white' : 'text-secondary-700'
                          }
                        >
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
                      value={value > 0 ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      leftIcon={<Text className="text-secondary-400">Rp</Text>}
                      error={errors.cost_price?.message}
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
                      value={value > 0 ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      leftIcon={<Text className="text-secondary-400">Rp</Text>}
                      error={errors.base_price?.message}
                    />
                  )}
                />
              </View>
            </View>
          </Card>

          {/* Pricing Tiers */}
          <Card title="Harga Grosir (Opsional)" className="mb-4">
            {pricingTiers.length > 0 && (
              <View className="mb-3">
                {pricingTiers.map((tier, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between bg-secondary-50 rounded-lg p-3 mb-2"
                  >
                    <View>
                      <Text className="font-medium text-secondary-900">
                        {tier.name}
                      </Text>
                      <Text className="text-sm text-secondary-500">
                        Min. {tier.min_quantity} pcs →{' '}
                        {formatCurrency(tier.price)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removePricingTier(index)}>
                      <Text className="text-danger-500 text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {showTierForm ? (
              <View className="bg-secondary-50 rounded-lg p-3">
                <Input
                  label="Nama Tier"
                  placeholder="cth: Grosir 10+"
                  value={newTier.name}
                  onChangeText={(text) =>
                    setNewTier({ ...newTier, name: text })
                  }
                />
                <View className="flex-row mt-2">
                  <View className="flex-1 mr-2">
                    <Input
                      label="Min. Qty"
                      placeholder="10"
                      value={
                        newTier.min_quantity > 0
                          ? String(newTier.min_quantity)
                          : ''
                      }
                      onChangeText={(text) =>
                        setNewTier({
                          ...newTier,
                          min_quantity: Number(text) || 1,
                        })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Input
                      label="Harga"
                      placeholder="0"
                      value={newTier.price > 0 ? String(newTier.price) : ''}
                      onChangeText={(text) =>
                        setNewTier({ ...newTier, price: Number(text) || 0 })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View className="flex-row mt-3">
                  <Button
                    title="Batal"
                    variant="outline"
                    size="small"
                    onPress={() => setShowTierForm(false)}
                    className="flex-1 mr-2"
                  />
                  <Button
                    title="Tambah"
                    size="small"
                    onPress={addPricingTier}
                    className="flex-1 ml-2"
                  />
                </View>
              </View>
            ) : (
              <Button
                title="+ Tambah Tier Harga"
                variant="outline"
                fullWidth
                onPress={() => setShowTierForm(true)}
              />
            )}
          </Card>

          {/* Stock */}
          <Card title="Stok" className="mb-4">
            <Controller
              control={control}
              name="is_stock_active"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  className="flex-row items-center mb-3"
                >
                  <View
                    className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                      value
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-secondary-300'
                    }`}
                  >
                    {value && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-secondary-700">Kelola Stok</Text>
                </TouchableOpacity>
              )}
            />

            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Controller
                  control={control}
                  name="current_stock"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Stok Awal"
                      placeholder="0"
                      value={String(value)}
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
                  name="min_stock_alert"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Stok Minimum"
                      placeholder="10"
                      value={String(value)}
                      onChangeText={(text) => onChange(Number(text) || 0)}
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
                  className="flex-row items-center mt-3"
                >
                  <View
                    className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                      value
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-secondary-300'
                    }`}
                  >
                    {value && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-secondary-700">
                    Produk Refillable (Gas/Galon)
                  </Text>
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
            title="Simpan Produk"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

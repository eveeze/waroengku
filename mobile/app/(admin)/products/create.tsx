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
import { BarcodeScanner } from '@/components/shared';
import { Button, Card, Input, ImagePickerInput } from '@/components/ui';
import { productSchema, ProductFormData } from '@/utils/validation';
import { createProduct, getCategories, getConsignors } from '@/api/endpoints';
import { Category, CreatePricingTierRequest, Consignor } from '@/api/types';
import { useApi, ImageAsset } from '@/hooks';

/**
 * Create Product Screen (Swiss Design)
 */
export default function CreateProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [pricingTiers, setPricingTiers] = useState<CreatePricingTierRequest[]>(
    [],
  );
  const [showTierForm, setShowTierForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [productImage, setProductImage] = useState<ImageAsset | null>(null);

  // Tier form state
  const [newTier, setNewTier] = useState<CreatePricingTierRequest>({
    name: '',
    min_quantity: 1,
    price: 0,
  });

  const { execute: fetchCategories } = useApi(getCategories);
  const { execute: fetchConsignors } = useApi(getConsignors);

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
      category_id: '',
      consignor_id: null,
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

  const loadConsignors = async () => {
    try {
      const result = await fetchConsignors();
      if (result && Array.isArray(result)) {
        setConsignors(result);
      } else if (
        result &&
        'data' in result &&
        Array.isArray((result as any).data)
      ) {
        // Handle ApiResponse wrapper if present
        setConsignors((result as any).data);
      }
    } catch {}
  };

  useEffect(() => {
    loadConsignors();
  }, []);

  const handleBarcodeScanned = (barcode: string, type: string) => {
    setValue('barcode', barcode);
    setShowBarcodeScanner(false);
    Alert.alert('Scanned', `Barcode: ${barcode}`);
  };

  const handleImageSelected = (image: ImageAsset) => {
    setProductImage(image);
  };

  const handleImageCleared = () => {
    setProductImage(null);
  };

  const addPricingTier = () => {
    if (!newTier.name || newTier.price <= 0 || newTier.min_quantity < 1) {
      Alert.alert('Error', 'Invalid tier data');
      return;
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

      // Default SKU to Barcode if empty
      const productData = { ...data };
      if (!productData.sku && productData.barcode) {
        productData.sku = productData.barcode;
      }

      // FIXED: Pass image to createProduct
      await createProduct(
        {
          ...productData,
          pricing_tiers: pricingTiers.length > 0 ? pricingTiers : undefined,
        },
        productImage
          ? {
              uri: productImage.uri,
              type: productImage.mimeType || 'image/jpeg',
              name: productImage.fileName || 'upload.jpg',
            }
          : undefined,
      );

      Alert.alert('Success', 'Product created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
        title="SCAN PRODUCT"
      />

      {/* Header */}
      <View
        className="px-6 pb-6 border-b border-secondary-200"
        style={{ paddingTop: insets.top + 24 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs font-body">
            ← BACK TO LIST
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading font-black tracking-tighter text-primary-900">
          NEW PRODUCT
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
          {/* Section: Image */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              PRODUCT IMAGE
            </Text>
            <ImagePickerInput
              value={productImage?.uri}
              onImageSelected={handleImageSelected}
              onImageCleared={handleImageCleared}
              placeholder="TAP TO UPLOAD"
              aspectRatio={[4, 3]}
            />
          </View>

          {/* Section: Basic Info */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              BASIC INFORMATION
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="PRODUCT NAME"
                  placeholder="e.g. Kopi Susu Aren"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <View className="flex-row items-end gap-3 mt-1">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="barcode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="BARCODE"
                      placeholder="Scan or type..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowBarcodeScanner(true)}
                className="bg-primary-900 h-[52px] w-[52px] rounded-lg items-center justify-center mb-5"
              >
                <Text className="text-white text-xl">📷</Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="category_id"
              render={({ field: { onChange, value } }) => (
                <View className="mt-2 mb-5">
                  <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                    CATEGORY
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => onChange(value === cat.id ? '' : cat.id)}
                        className={`px-4 py-2 rounded-md mr-2 border ${
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
                  </ScrollView>
                </View>
              )}
            />
            <Controller
              control={control}
              name="consignor_id"
              render={({ field: { onChange, value } }) => (
                <View className="mb-5">
                  <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                    CONSIGNOR / SUPPLIER
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    <TouchableOpacity
                      onPress={() => onChange(null)}
                      className={`px-4 py-2 rounded-md mr-2 border ${
                        !value
                          ? 'bg-primary-900 border-primary-900'
                          : 'bg-white border-secondary-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-widest font-heading ${
                          !value ? 'text-white' : 'text-primary-900'
                        }`}
                      >
                        NONE
                      </Text>
                    </TouchableOpacity>
                    {consignors.map((cons) => (
                      <TouchableOpacity
                        key={cons.id}
                        onPress={() =>
                          onChange(value === cons.id ? null : cons.id)
                        }
                        className={`px-4 py-2 rounded-md mr-2 border ${
                          value === cons.id
                            ? 'bg-primary-900 border-primary-900'
                            : 'bg-white border-secondary-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold uppercase tracking-widest font-heading ${
                            value === cons.id
                              ? 'text-white'
                              : 'text-primary-900'
                          }`}
                        >
                          {cons.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                    DESCRIPTION
                  </Text>
                  <TextInput
                    className="border border-secondary-200 rounded-lg px-4 py-3 bg-secondary-50 text-base min-h-[100px] text-primary-900"
                    placeholder="Optional description..."
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
          </View>

          {/* Section: Pricing */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              PRICING & STOCK
            </Text>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="cost_price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="COST (HPP)"
                      placeholder="0"
                      value={value > 0 ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.cost_price?.message}
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
                      value={value > 0 ? String(value) : ''}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.base_price?.message}
                    />
                  )}
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="current_stock"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="INITIAL STOCK"
                      placeholder="0"
                      value={String(value)}
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
                  name="min_stock_alert"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="ALERT LIMIT"
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
              name="is_stock_active"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  className="flex-row items-center mt-2 mb-4"
                >
                  <View
                    className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                      value
                        ? 'bg-primary-900 border-primary-900'
                        : 'bg-white border-secondary-300'
                    }`}
                  >
                    {value && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <Text className="text-base font-bold font-heading text-primary-900">
                    Track Stock Inventory
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Section: Wholesale (Optional) */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3">
              WHOLESALE TIERS (OPTIONAL)
            </Text>

            {pricingTiers.length > 0 && (
              <View className="mb-4">
                {pricingTiers.map((tier, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between bg-secondary-50 border border-secondary-200 rounded-lg p-3 mb-2"
                  >
                    <View>
                      <Text className="font-bold text-primary-900">
                        {tier.name}
                      </Text>
                      <Text className="text-xs text-secondary-500 font-medium">
                        Min. {tier.min_quantity} pcs → {tier.price}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removePricingTier(index)}>
                      <Text className="text-danger-500 font-bold">REMOVE</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {showTierForm ? (
              <View className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 animate-fade-in-down">
                <Input
                  label="TIER NAME"
                  placeholder="e.g. Grosir"
                  value={newTier.name}
                  onChangeText={(text) =>
                    setNewTier({ ...newTier, name: text })
                  }
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label="MIN QTY"
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
                  <View className="flex-1">
                    <Input
                      label="PRICE"
                      placeholder="0"
                      value={newTier.price > 0 ? String(newTier.price) : ''}
                      onChangeText={(text) =>
                        setNewTier({ ...newTier, price: Number(text) || 0 })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View className="flex-row gap-3 mt-2">
                  <Button
                    title="CANCEL"
                    variant="ghost"
                    size="sm"
                    onPress={() => setShowTierForm(false)}
                    className="flex-1"
                  />
                  <Button
                    title="ADD TIER"
                    size="sm"
                    onPress={addPricingTier}
                    className="flex-1"
                  />
                </View>
              </View>
            ) : (
              <Button
                title="+ ADD WHOLESALE TIER"
                variant="outline"
                fullWidth
                onPress={() => setShowTierForm(true)}
              />
            )}
          </View>
        </ScrollView>

        {/* Floating Submit Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-6 py-4"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="SAVE PRODUCT"
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

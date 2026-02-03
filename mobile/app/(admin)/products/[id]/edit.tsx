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
import { Header, BarcodeScanner } from '@/components/shared';
import {
  Button,
  Card,
  Input,
  Loading,
  ImagePickerInput,
} from '@/components/ui';
import {
  updateProduct,
  getProductById,
  getCategories,
  getConsignors,
} from '@/api/endpoints';
import { Category, Product, Consignor } from '@/api/types';
import { useApi, ImageAsset, useOptimisticMutation } from '@/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/api/client';

// Edit form schema (all optional except changed fields)
const editProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  consignor_id: z.string().nullable().optional(),
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
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const queryClient = useQueryClient();

  // useQuery for fetching product
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: [`/products/${id}`],
    queryFn: ({ queryKey }) => fetcher<Product>({ queryKey }),
    enabled: !!id,
    initialData: () => {
      return queryClient.getQueryData<Product>([`/products/${id}`]);
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['/categories'],
    queryFn: ({ queryKey }) => fetcher<Category[]>({ queryKey }),
  });

  const { data: consignorsData } = useQuery({
    queryKey: ['/consignors'],
    queryFn: ({ queryKey }) => fetcher<Consignor[]>({ queryKey }),
  });

  // Optimistic Mutation
  const { mutate: mutateProduct, isPending: isUpdating } =
    useOptimisticMutation<
      Product,
      Error,
      EditProductFormData & { image?: any; deleteImage?: boolean },
      { previousData: Product | undefined }
    >(
      async (variables) => {
        // Prepare payload
        const payload = {
          name: variables.name,
          barcode: variables.barcode || undefined,
          sku: variables.sku || undefined,
          description: variables.description || undefined,
          category_id: variables.category_id || undefined,
          consignor_id: variables.consignor_id,
          unit: variables.unit,
          base_price: variables.base_price,
          cost_price: variables.cost_price,
          min_stock_alert: variables.min_stock_alert,
          max_stock: variables.max_stock,
          is_active: variables.is_active,
          is_refillable: variables.is_refillable,
          image_url: variables.deleteImage ? '' : undefined,
        };

        const imagePayload = variables.image
          ? {
              uri: variables.image.uri,
              type: variables.image.mimeType || 'image/jpeg',
              name: variables.image.fileName || 'upload.jpg',
            }
          : undefined;

        return updateProduct(id!, payload, imagePayload);
      },
      {
        queryKey: [`/products/${id}`],
        updater: (old: Product | undefined, variables) => {
          if (!old) return old;
          return {
            ...old,
            ...variables,
            // Optimistically handle image? Tricky with file uploads.
            // We'll trust the mutation result or refetch.
            // For now, text fields update instantly.
          };
        },
        onSuccess: () => {
          Alert.alert('Success', 'Product updated successfully', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to update product');
        },
      },
    );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  });

  useEffect(() => {
    if (productData) {
      setProduct(productData);
      reset({
        name: productData.name,
        barcode: productData.barcode || '',
        sku: productData.sku || '',
        description: productData.description || '',
        category_id: productData.category_id || '',
        consignor_id: productData.consignor_id || null,
        unit: productData.unit,
        base_price: productData.base_price,
        cost_price: productData.cost_price,
        min_stock_alert: productData.min_stock_alert,
        max_stock: productData.max_stock,
        is_active: productData.is_active,
        is_refillable: productData.is_refillable,
      });
    }
  }, [productData]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (consignorsData) {
      // Safe unwrap similar to what we did in index
      const list = Array.isArray(consignorsData)
        ? consignorsData
        : (consignorsData as any)?.data || [];
      setConsignors(list);
    }
  }, [consignorsData]);

  // Removed manual loadData

  /* Logic for Image Handling */
  const [newImage, setNewImage] = useState<ImageAsset | null>(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  // Helper to determine what to show in the picker
  // 1. New Local Image
  // 2. Existing Remote Image (if not deleted)
  // 3. Null (Placeholder)
  const displayImageUri = newImage
    ? newImage.uri
    : isImageDeleted
      ? undefined
      : product?.image_url || undefined;

  const handleImageSelected = (image: ImageAsset) => {
    setNewImage(image);
    setIsImageDeleted(false); // Reset delete flag if we pick a new one
  };

  const handleImageCleared = () => {
    setNewImage(null);
    setIsImageDeleted(true); // Mark as deleted
  };

  const onSubmit = async (data: EditProductFormData) => {
    mutateProduct({
      ...data,
      image: newImage,
      deleteImage: isImageDeleted && !newImage,
    });
  };

  if (isProductLoading && !product) {
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
          {/* Image Section */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-3 font-body">
              PRODUCT IMAGE
            </Text>
            <ImagePickerInput
              value={displayImageUri}
              onImageSelected={handleImageSelected}
              onImageCleared={handleImageCleared}
              placeholder="TAP TO UPLOAD"
              aspectRatio={[4, 3]}
            />
          </View>

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

            {/* Barcode Scanner Modal */}
            <BarcodeScanner
              visible={showBarcodeScanner}
              onClose={() => setShowBarcodeScanner(false)}
              onScan={(code) => {
                setValue('barcode', code);
                setShowBarcodeScanner(false);
                Alert.alert('Scanned', `Barcode: ${code}`);
              }}
              title="SCAN BARCODE"
            />

            <View className="flex-row mt-1 gap-3 items-end">
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
              <TouchableOpacity
                onPress={() => setShowBarcodeScanner(true)}
                className="bg-primary-900 h-[52px] w-[52px] rounded-lg items-center justify-center mb-[2px]"
              >
                <Text className="text-white text-xl">📷</Text>
              </TouchableOpacity>
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

            {/* Consignor */}
            <View className="mt-5">
              <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
                CONSIGNOR
              </Text>
              <Controller
                control={control}
                name="consignor_id"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap">
                    <TouchableOpacity
                      onPress={() => onChange(null)}
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
                    {consignors.map((cons) => (
                      <TouchableOpacity
                        key={cons.id}
                        onPress={() =>
                          onChange(value === cons.id ? null : cons.id)
                        }
                        className={`px-4 py-2 rounded-lg mr-2 mb-2 border ${
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
            isLoading={isUpdating}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

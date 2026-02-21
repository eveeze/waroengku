import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import { updateCategory, deleteCategory } from '@/api/endpoints/categories';
import { Category, ApiResponse } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';

/**
 * Category Detail/Edit Screen
 */
export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mutedIconColor = isDark ? '#A1A1AA' : '#71717A';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  // useQuery
  // Fix: Use ApiResponse wrapper and initialData from list cache
  const { data: response, isLoading } = useQuery({
    queryKey: [`/categories/${id}`],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<Category>>({ queryKey }),
    enabled: !!id,
    initialData: () => {
      // Try to find category in the list cache
      const listResponse = queryClient.getQueryData<ApiResponse<Category[]>>([
        '/categories',
      ]);
      const found = listResponse?.data?.find((c) => c.id === id);
      if (found) {
        return {
          success: true,
          data: found,
        };
      }
      return undefined;
    },
  });

  const categoryData = response?.data;

  useEffect(() => {
    if (categoryData) {
      setCategory(categoryData);
      setName(categoryData.name);
      setDescription(categoryData.description || '');
    }
  }, [categoryData]);

  // Optimistic Update
  const { mutate: mutateUpdate, isPending: isUpdating } = useOptimisticMutation(
    async () =>
      updateCategory(id!, {
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    {
      queryKey: [`/categories/${id}`],
      updater: (old: ApiResponse<Category> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            name: name.trim(),
            description: description.trim() || undefined,
            updated_at: new Date().toISOString(),
          },
        };
      },
      onSuccess: () => {
        Alert.alert('Berhasil', 'Kategori berhasil diperbarui', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        // Invalidate list to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['/categories'] });
      },
      onError: (error: Error) => {
        Alert.alert('Gagal', error.message || 'Gagal memperbarui kategori');
      },
    },
  );

  // Optimistic Delete
  const { mutate: mutateDelete } = useOptimisticMutation(
    async () => deleteCategory(id!),
    {
      queryKey: ['/categories'],
      updater: (old: Category[] | undefined) => {
        if (!old) return old;
        return old.filter((c) => c.id !== id);
      },
      onSuccess: () => {
        Alert.alert('Berhasil', 'Kategori berhasil dihapus');
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('Gagal', err.message || 'Gagal menghapus kategori');
      },
    },
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama kategori wajib diisi');
      return;
    }
    mutateUpdate();
  };

  const handleDelete = () => {
    if (category?.product_count && category.product_count > 0) {
      Alert.alert(
        'Tidak Bisa Menghapus',
        `Kategori ini masih memiliki ${category.product_count} produk. Hapus atau pindahkan produk terlebih dahulu.`,
      );
      return;
    }

    Alert.alert('Hapus Kategori', `Yakin ingin menghapus "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => mutateDelete(),
      },
    ]);
  };

  if (isLoading && !category) {
    return <Loading fullScreen message="LOADING..." />;
  }

  // Responsive sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-2xl'
      : 'text-3xl';
  const labelSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const headerPadding = isTablet
    ? 'px-8 pb-8'
    : isSmallPhone
      ? 'px-4 pb-4'
      : 'px-6 pb-6';

  return (
    <View className="flex-1 bg-background">
      {/* Swiss Header */}
      <View
        className={`bg-background border-b border-border ${headerPadding}`}
        style={{ paddingTop: insets.top + (isSmallPhone ? 12 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isSmallPhone ? 'mb-2' : 'mb-4'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
          >
            ← BACK
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${headerSize}`}
        >
          EDIT CATEGORY
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Card className="mb-4 rounded-none border-x-0 border-t-0 p-0 shadow-none">
            <View
              className={`border border-border p-4 bg-muted/30 ${isSmallPhone ? 'p-3' : 'p-4'}`}
            >
              <Text
                className={`font-bold uppercase tracking-wide text-muted-foreground mb-1.5 ${labelSize}`}
              >
                PROPERTIES
              </Text>

              <View className="mb-4">
                <Text
                  className={`font-bold uppercase tracking-wide text-foreground mb-2 ${labelSize}`}
                >
                  CATEGORY NAME *
                </Text>
                <Input
                  placeholder="ENTER CATEGORY NAME"
                  value={name}
                  onChangeText={setName}
                  className="rounded-none bg-background border-border"
                  placeholderTextColor={mutedIconColor}
                />
              </View>

              <View>
                <Text
                  className={`font-bold uppercase tracking-wide text-foreground mb-2 ${labelSize}`}
                >
                  DESCRIPTION
                </Text>
                <TextInput
                  className="border border-border rounded-none px-4 py-3 bg-background text-base text-foreground min-h-[100px]"
                  placeholder="ENTER DESCRIPTION (OPTIONAL)"
                  placeholderTextColor={mutedIconColor}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </Card>

          {category?.product_count !== undefined && (
            <View
              className={`mb-6 flex-row items-center justify-between border border-border bg-muted/30 ${isSmallPhone ? 'p-3' : 'p-4'}`}
            >
              <Text
                className={`font-bold uppercase tracking-wide text-muted-foreground ${labelSize}`}
              >
                LINKED PRODUCTS
              </Text>
              <View className="flex-row items-baseline gap-1">
                <Text
                  className={`font-black text-foreground ${isSmallPhone ? 'text-xl' : 'text-2xl'}`}
                >
                  {category.product_count}
                </Text>
                <Text
                  className={`font-bold text-muted-foreground ${labelSize}`}
                >
                  ITEMS
                </Text>
              </View>
            </View>
          )}

          <Button
            title="DELETE CATEGORY"
            variant="outline"
            className="border-destructive/50 rounded-none"
            textClassName="text-destructive font-bold tracking-widest"
            fullWidth
            onPress={handleDelete}
          />

          <Button
            title="SAVE CHANGES"
            fullWidth
            onPress={handleSubmit}
            isLoading={isUpdating}
            className="rounded-none mt-6 mb-8"
            textClassName="font-black tracking-widest text-lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

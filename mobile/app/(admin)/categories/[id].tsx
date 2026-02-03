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
      updater: (old: ApiResponse<Category[]> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((c) => c.id !== id),
        };
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
    return <Loading fullScreen message="Memuat..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Swiss Header */}
      <View
        className="px-6 pb-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
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
            paddingBottom: insets.bottom + 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Card className="mb-4">
            <Input
              label="Nama Kategori *"
              placeholder="Masukkan nama kategori"
              value={name}
              onChangeText={setName}
            />

            <View className="mt-3">
              <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                Deskripsi
              </Text>
              <TextInput
                className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                placeholder="Deskripsi kategori (opsional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </Card>

          {category?.product_count !== undefined && (
            <Card className="mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-secondary-500">Jumlah Produk</Text>
                <Text className="text-lg font-semibold text-secondary-900">
                  {category.product_count}
                </Text>
              </View>
            </Card>
          )}

          <Button
            title="Hapus Kategori"
            variant="danger"
            fullWidth
            onPress={handleDelete}
          />
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-4 py-3"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="Simpan Perubahan"
            fullWidth
            onPress={handleSubmit}
            isLoading={isUpdating}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '@/api/endpoints/categories';
import { Category } from '@/api/types';
import { useApi } from '@/hooks/useApi';

/**
 * Category Detail/Edit Screen
 */
export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  const { isLoading, execute: fetchCategory } = useApi(() =>
    getCategoryById(id!),
  );

  useEffect(() => {
    loadCategory();
  }, []);

  const loadCategory = async () => {
    const result = await fetchCategory();
    if (result) {
      setCategory(result);
      setName(result.name);
      setDescription(result.description || '');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama kategori wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateCategory(id!, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert('Berhasil', 'Kategori berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal memperbarui kategori',
      );
    } finally {
      setIsSubmitting(false);
    }
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
        onPress: async () => {
          try {
            await deleteCategory(id!);
            Alert.alert('Berhasil', 'Kategori berhasil dihapus');
            router.back();
          } catch (err) {
            Alert.alert(
              'Gagal',
              err instanceof Error ? err.message : 'Gagal menghapus kategori',
            );
          }
        },
      },
    ]);
  };

  if (isLoading && !category) {
    return <Loading fullScreen message="Memuat..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Edit Kategori" onBack={() => router.back()} />

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
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

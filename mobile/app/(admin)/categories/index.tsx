import { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { getCategories, deleteCategory } from '@/api/endpoints/categories';
import { Category } from '@/api/types';
import { Card, Loading, Button } from '@/components/ui';

/**
 * Categories List Screen
 */
export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const { isLoading, execute: fetchCategories } = useApi(getCategories);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await fetchCategories();
    if (result) {
      setCategories(result);
    }
  };

  const handleDelete = (category: Category) => {
    if (category.product_count && category.product_count > 0) {
      Alert.alert(
        'Tidak Bisa Menghapus',
        `Kategori "${category.name}" masih memiliki ${category.product_count} produk. Hapus atau pindahkan produk terlebih dahulu.`
      );
      return;
    }

    Alert.alert(
      'Hapus Kategori',
      `Yakin ingin menghapus "${category.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert('Berhasil', 'Kategori berhasil dihapus');
              loadCategories();
            } catch (err) {
              Alert.alert(
                'Gagal',
                err instanceof Error ? err.message : 'Gagal menghapus kategori'
              );
            }
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/categories/${item.id}`)}
      onLongPress={() => handleDelete(item)}
      className="mb-3"
    >
      <Card>
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-primary-100 rounded-lg items-center justify-center mr-3">
            <Text className="text-lg">🏷️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-secondary-900">
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-secondary-500 mt-0.5" numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          {item.product_count !== undefined && (
            <View className="bg-secondary-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-secondary-600">
                {item.product_count} produk
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Kategori</Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/categories/create')}
            className="bg-white px-4 py-2 rounded-lg"
          >
            <Text className="text-primary-600 font-medium">+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCategories} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-4">🏷️</Text>
              <Text className="text-secondary-500">Tidak ada kategori</Text>
              <Text className="text-secondary-400 mt-1">
                Tap "Tambah" untuk menambah kategori baru
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <Text className="text-center text-secondary-400 text-xs mt-4">
            Tekan lama untuk menghapus kategori
          </Text>
        }
      />
    </View>
  );
}

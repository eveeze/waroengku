import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { getCategories, deleteCategory } from '@/api/endpoints/categories';
import { Category } from '@/api/types';
import { Button } from '@/components/ui';

/**
 * Categories List Screen
 * Swiss Minimalist Refactor
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
        'CANNOT DELETE',
        `Category "${category.name}" has ${category.product_count} products. Please remove or move products first.`,
      );
      return;
    }

    Alert.alert(
      'DELETE CATEGORY',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert('SUCCESS', 'Category deleted successfully');
              loadCategories();
            } catch (err) {
              Alert.alert(
                'FAILED',
                err instanceof Error
                  ? err.message
                  : 'Failed to delete category',
              );
            }
          },
        },
      ],
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/categories/${item.id}`)}
      onLongPress={() => handleDelete(item)}
      className="mb-0 border-b border-secondary-100 bg-white active:bg-secondary-50"
    >
      <View className="px-6 py-5 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-black items-center justify-center mr-4">
            <Text className="text-secondary-400 text-xs">#</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-primary-900 uppercase tracking-wide">
              {item.name}
            </Text>
            {item.description && (
              <Text
                className="text-xs text-secondary-500 mt-1"
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {item.product_count !== undefined && (
          <View className="items-end ml-4">
            <Text className="text-lg font-black text-primary-900">
              {item.product_count}
            </Text>
            <Text className="text-[9px] font-bold text-secondary-400 uppercase tracking-wider">
              Products
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        className="bg-white border-b border-secondary-100 px-6 pb-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-end justify-between">
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-4xl font-black uppercase tracking-tighter text-black">
              CATEGORIES
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/categories/create')}
            className="bg-black px-5 py-3 items-center justify-center"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-widest">
              + NEW
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCategories} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 px-10">
              <Text className="text-secondary-300 font-black text-6xl mb-4">
                🏷️
              </Text>
              <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
                No Categories
              </Text>
              <Text className="text-secondary-500 text-center text-sm">
                Create categories to organize your products.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          categories.length > 0 ? (
            <View className="py-6 items-center border-t border-secondary-50 mt-4">
              <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                Long press to delete category
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

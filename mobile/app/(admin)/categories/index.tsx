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
import { useOptimisticMutation } from '@/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { deleteCategory } from '@/api/endpoints/categories';
import { Category, ApiResponse } from '@/api/types';
import { Button } from '@/components/ui';

/**
 * Categories List Screen
 * Swiss Minimalist Refactor
 */
export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // useQuery - TData must match the actual response body structure
  const {
    data: response,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['/categories'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<Category[]>>({ queryKey }),
  });

  const categories = response?.data || [];

  // Optimistic Delete
  const { mutate: mutateDelete } = useOptimisticMutation(
    async (id: string) => deleteCategory(id),
    {
      queryKey: ['/categories'],
      updater: (old: ApiResponse<Category[]> | undefined, id: string) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((c) => c.id !== id),
        };
      },
      onSuccess: () => {
        Alert.alert('SUCCESS', 'Category deleted successfully');
      },
      onError: (err: Error) => {
        Alert.alert('FAILED', err.message || 'Failed to delete category');
      },
    },
  );

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
          onPress: () => mutateDelete(category.id),
        },
      ],
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/categories/${item.id}`)}
      onLongPress={() => handleDelete(item)}
      className="mb-0 border-b border-border bg-background active:bg-muted"
    >
      <View className="px-6 py-5 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-muted items-center justify-center mr-4">
            <Text className="text-foreground text-xs">#</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-heading font-bold text-foreground uppercase tracking-wide">
              {item.name}
            </Text>
            {item.description && (
              <Text
                className="text-xs text-muted-foreground mt-1 font-body"
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {item.product_count !== undefined && (
          <View className="items-end ml-4">
            <Text className="text-lg font-heading font-black text-foreground tracking-tight">
              {item.product_count}
            </Text>
            <Text className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-body">
              Products
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Header */}
      <View
        className="bg-background border-b border-border px-6 pb-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-end justify-between">
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-body">
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-foreground">
              CATEGORIES
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/categories/create')}
            className="bg-foreground px-5 py-3 items-center justify-center"
          >
            <Text className="text-background font-bold text-xs uppercase tracking-widest font-heading">
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 px-10">
              <Text className="text-muted-foreground font-black text-6xl mb-4">
                🏷️
              </Text>
              <Text className="text-foreground font-bold text-lg text-center uppercase tracking-wide mb-2">
                No Categories
              </Text>
              <Text className="text-muted-foreground text-center text-sm">
                Create categories to organize your products.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          categories.length > 0 ? (
            <View className="py-6 items-center border-t border-border mt-4">
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-body">
                Long press to delete category
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

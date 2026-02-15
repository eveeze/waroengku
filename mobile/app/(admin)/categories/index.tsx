import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOptimisticMutation } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { getCategories, deleteCategory } from '@/api/endpoints/categories';
import { Category, ApiResponse } from '@/api/types';
import { Button } from '@/components/ui';
import { EmptyStateInline } from '@/components/shared';
import { CategoryListInlineSkeleton } from '@/components/skeletons';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

/**
 * Categories List Screen
 * Swiss Minimalist + Small Phone Responsive
 */
export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  // useQuery
  const {
    data: response,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['/categories'],
    queryFn: () => getCategories(),
  });

  const categories = response || [];

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

  // Responsive sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-2xl'
      : 'text-3xl';
  const backSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const nameSize = isTablet
    ? 'text-lg'
    : isSmallPhone
      ? 'text-sm'
      : 'text-base';
  const descSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const countSize = isTablet
    ? 'text-xl'
    : isSmallPhone
      ? 'text-base'
      : 'text-lg';
  const labelSize = isTablet
    ? 'text-[10px]'
    : isSmallPhone
      ? 'text-[8px]'
      : 'text-[9px]';
  const headerPadding = isTablet
    ? 'px-8 pb-8'
    : isSmallPhone
      ? 'px-4 pb-4'
      : 'px-6 pb-6';
  const itemPadding = isTablet
    ? 'px-8 py-6'
    : isSmallPhone
      ? 'px-4 py-4'
      : 'px-6 py-5';
  const iconSize = isTablet
    ? 'w-10 h-10'
    : isSmallPhone
      ? 'w-6 h-6'
      : 'w-8 h-8';

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/categories/${item.id}`)}
      onLongPress={() => handleDelete(item)}
      className="mb-0 border-b border-border bg-background active:bg-muted"
    >
      <View className={`flex-row items-center justify-between ${itemPadding}`}>
        <View className="flex-row items-center flex-1">
          <View
            className={`bg-muted items-center justify-center mr-3 ${iconSize}`}
          >
            <Text className={`text-foreground ${descSize}`}>#</Text>
          </View>
          <View className="flex-1">
            <Text
              className={`font-heading font-bold text-foreground uppercase tracking-wide ${nameSize}`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.description && (
              <Text
                className={`text-muted-foreground mt-0.5 font-body ${descSize}`}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {item.product_count !== undefined && (
          <View className="items-end ml-3">
            <Text
              className={`font-heading font-black text-foreground tracking-tight ${countSize}`}
            >
              {item.product_count}
            </Text>
            <Text
              className={`font-bold text-muted-foreground uppercase tracking-wider font-body ${labelSize}`}
            >
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

      {/* Header - Stacked layout for better spacing */}
      <View
        className={`bg-background border-b border-border ${headerPadding}`}
        style={{
          paddingTop: insets.top + (isSmallPhone ? 12 : isTablet ? 20 : 16),
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-4' : isSmallPhone ? 'mb-2' : 'mb-3'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${backSize}`}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Title and Button in row */}
        <View className="flex-row items-baseline justify-between">
          <Text
            className={`font-heading font-black uppercase tracking-tighter text-foreground ${headerSize}`}
          >
            CATEGORIES
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/categories/create')}
            className={`bg-foreground items-center justify-center ${isTablet ? 'px-5 py-3' : isSmallPhone ? 'px-3 py-2' : 'px-4 py-2.5'}`}
          >
            <Text
              className={`text-background font-bold uppercase tracking-widest font-heading ${isTablet ? 'text-sm' : isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
            >
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
        contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 20 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <CategoryListInlineSkeleton count={6} />
          ) : (
            <EmptyStateInline
              title="No Categories"
              message="Create categories to organize your products."
              icon="🏷️"
              action={{
                label: 'Create Category',
                onPress: () => router.push('/(admin)/categories/create'),
              }}
            />
          )
        }
        ListFooterComponent={
          categories.length > 0 ? (
            <View className="py-4 items-center border-t border-border mt-4">
              <Text
                className={`font-bold text-muted-foreground uppercase tracking-widest font-body ${labelSize}`}
              >
                Long press to delete category
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

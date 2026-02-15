import React from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText, SkeletonBox } from '../ui/Skeleton';
import { SkeletonProductCard, SkeletonProductRow } from '../ui/SkeletonLayouts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / COLUMN_COUNT;

interface ProductListSkeletonProps {
  /** Display mode: grid or list */
  mode?: 'grid' | 'list';
  /** Number of skeleton items to show */
  count?: number;
  /** Show header skeleton */
  showHeader?: boolean;
}

/**
 * Skeleton for product list/grid screens
 * Used in: products/index.tsx, pos/index.tsx
 */
export function ProductListSkeleton({
  mode = 'list',
  count = 6,
  showHeader = true,
}: ProductListSkeletonProps) {
  const insets = useSafeAreaInsets();

  const items = Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  if (mode === 'grid') {
    return (
      <View className="flex-1 bg-background">
        {showHeader && (
          <View
            className="px-6 pb-6 border-b border-border"
            style={{ paddingTop: insets.top + 24 }}
          >
            {/* Title section */}
            <View className="mb-6">
              <SkeletonText width={80} height={10} />
              <View style={{ height: 6 }} />
              <View className="flex-row items-end justify-between">
                <SkeletonText width={150} height={36} />
                <View className="flex-row gap-2">
                  <SkeletonBox width={40} height={40} borderRadius={8} />
                  <SkeletonBox width={60} height={40} borderRadius={8} />
                </View>
              </View>
            </View>

            {/* Search bar */}
            <View className="flex-row gap-3">
              <SkeletonBox
                width="85%"
                height={48}
                borderRadius={8}
                style={{ flex: 1 }}
              />
              <SkeletonBox width={48} height={48} borderRadius={8} />
            </View>
          </View>
        )}

        {/* Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: PADDING,
            gap: GAP,
          }}
        >
          {items.map((item) => (
            <SkeletonProductCard
              key={item.id}
              style={{ width: ITEM_WIDTH, marginBottom: 4 }}
            />
          ))}
        </View>
      </View>
    );
  }

  // List mode
  return (
    <View className="flex-1 bg-background">
      {showHeader && (
        <View
          className="px-6 pb-6 border-b border-border"
          style={{ paddingTop: insets.top + 24 }}
        >
          {/* Title section */}
          <View className="mb-6">
            <SkeletonText width={80} height={10} />
            <View style={{ height: 6 }} />
            <View className="flex-row items-end justify-between">
              <SkeletonText width={150} height={36} />
              <View className="flex-row gap-2">
                <SkeletonBox width={40} height={40} borderRadius={8} />
                <SkeletonBox width={60} height={40} borderRadius={8} />
              </View>
            </View>
          </View>

          {/* Search bar */}
          <View className="flex-row gap-3">
            <SkeletonBox
              width="85%"
              height={48}
              borderRadius={8}
              style={{ flex: 1 }}
            />
            <SkeletonBox width={48} height={48} borderRadius={8} />
          </View>
        </View>
      )}

      {/* List */}
      <View style={{ padding: 24 }}>
        {items.map((item) => (
          <SkeletonProductRow key={item.id} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for product list (no header)
 * Used inside FlatList components
 */
export function ProductListInlineSkeleton({
  count = 4,
  mode = 'list',
}: Pick<ProductListSkeletonProps, 'count' | 'mode'>) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  if (mode === 'grid') {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: GAP,
        }}
      >
        {items.map((item) => (
          <SkeletonProductCard
            key={item.id}
            style={{ width: ITEM_WIDTH, marginBottom: 4 }}
          />
        ))}
      </View>
    );
  }

  return (
    <View>
      {items.map((item) => (
        <SkeletonProductRow key={item.id} />
      ))}
    </View>
  );
}

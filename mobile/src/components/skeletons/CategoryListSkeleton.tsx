import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText, SkeletonBox } from '../ui/Skeleton';
import { SkeletonCategoryCard } from '../ui/SkeletonLayouts';

interface CategoryListSkeletonProps {
  count?: number;
  showHeader?: boolean;
}

/**
 * Skeleton for category list screen
 * Used in: categories/index.tsx
 */
export function CategoryListSkeleton({
  count = 6,
  showHeader = true,
}: CategoryListSkeletonProps) {
  const insets = useSafeAreaInsets();
  const items = Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <View className="flex-1 bg-background">
      {showHeader && (
        <View
          className="px-6 py-6 border-b border-border bg-background"
          style={{ paddingTop: insets.top + 16 }}
        >
          <SkeletonText width={60} height={12} style={{ marginBottom: 16 }} />
          <View className="flex-row justify-between items-end">
            <SkeletonText width={160} height={36} />
            <SkeletonBox width={100} height={36} borderRadius={8} />
          </View>
        </View>
      )}

      <View style={{ padding: 24 }}>
        {items.map((item) => (
          <SkeletonCategoryCard key={item.id} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for category list (no header)
 */
export function CategoryListInlineSkeleton({ count = 4 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <View>
      {items.map((item) => (
        <SkeletonCategoryCard key={item.id} />
      ))}
    </View>
  );
}

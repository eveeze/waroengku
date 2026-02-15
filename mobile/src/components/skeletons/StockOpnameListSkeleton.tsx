import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';
import { SkeletonStockOpnameItem } from '../ui/SkeletonLayouts';

/**
 * Stock Opname List Screen Skeleton
 */
export function StockOpnameListSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 pb-6 border-b border-border"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="flex-row items-center gap-4 mb-4">
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <View>
            <SkeletonText width={90} height={10} />
            <View style={{ height: 4 }} />
            <SkeletonText width={140} height={28} />
          </View>
        </View>

        {/* Action button */}
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Stock Opname List */}
      <View className="flex-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonStockOpnameItem key={i} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for stock opname list
 */
export function StockOpnameListInlineSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStockOpnameItem key={i} />
      ))}
    </View>
  );
}

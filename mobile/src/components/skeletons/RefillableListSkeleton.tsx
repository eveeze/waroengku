import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';
import { SkeletonProductCard } from '../ui/SkeletonLayouts';

/**
 * Refillable List Screen Skeleton
 */
export function RefillableListSkeleton() {
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
            <SkeletonText width={80} height={10} />
            <View style={{ height: 4 }} />
            <SkeletonText width={120} height={28} />
          </View>
        </View>

        {/* Search bar */}
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Refillable Grid */}
      <View className="flex-row flex-wrap gap-4 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ width: '47%' }}>
            <SkeletonProductCard />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for refillable list
 */
export function RefillableListInlineSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <View
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: 16 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: '47%' }}>
          <SkeletonProductCard />
        </View>
      ))}
    </View>
  );
}

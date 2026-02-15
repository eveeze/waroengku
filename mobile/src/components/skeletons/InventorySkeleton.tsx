import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';
import { SkeletonProductRow } from '../ui/SkeletonLayouts';

/**
 * Inventory Screen Skeleton
 */
export function InventorySkeleton() {
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
            <SkeletonText width={130} height={28} />
          </View>
        </View>

        {/* Search bar */}
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Inventory actions */}
      <View className="flex-row gap-4 p-6 border-b border-border">
        <SkeletonBox width="48%" height={80} borderRadius={12} />
        <SkeletonBox width="48%" height={80} borderRadius={12} />
      </View>

      {/* Product List */}
      <View className="flex-1 px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonProductRow key={i} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for inventory list
 */
export function InventoryInlineSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={{ padding: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductRow key={i} />
      ))}
    </View>
  );
}

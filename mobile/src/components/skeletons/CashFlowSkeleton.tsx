import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';
import { SkeletonCashFlowItem } from '../ui/SkeletonLayouts';

/**
 * Cash Flow Screen Skeleton
 */
export function CashFlowSkeleton() {
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
            <SkeletonText width={60} height={10} />
            <View style={{ height: 4 }} />
            <SkeletonText width={120} height={28} />
          </View>
        </View>

        {/* Balance Summary */}
        <View className="bg-muted p-4 rounded-lg">
          <SkeletonText width={80} height={12} />
          <View style={{ height: 8 }} />
          <SkeletonText width="60%" height={36} />
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-4 p-6">
        <SkeletonBox width="48%" height={48} borderRadius={8} />
        <SkeletonBox width="48%" height={48} borderRadius={8} />
      </View>

      {/* Cash Flow List */}
      <View className="flex-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCashFlowItem key={i} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for cash flow list
 */
export function CashFlowInlineSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCashFlowItem key={i} />
      ))}
    </View>
  );
}

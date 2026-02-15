import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText, SkeletonBox } from '../ui/Skeleton';
import { SkeletonCustomerCard } from '../ui/SkeletonLayouts';

interface CustomerListSkeletonProps {
  /** Number of skeleton items */
  count?: number;
  /** Show header */
  showHeader?: boolean;
}

/**
 * Skeleton for customer list screen
 * Used in: customers/index.tsx
 */
export function CustomerListSkeleton({
  count = 6,
  showHeader = true,
}: CustomerListSkeletonProps) {
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
          {/* Back button */}
          <SkeletonText width={60} height={12} style={{ marginBottom: 16 }} />

          {/* Title + Button */}
          <View className="flex-row justify-between items-end mb-4">
            <SkeletonText width={150} height={36} />
            <SkeletonBox width={110} height={36} borderRadius={8} />
          </View>

          {/* Search & Filter */}
          <View className="flex-row gap-3">
            <SkeletonBox
              width="75%"
              height={44}
              borderRadius={8}
              style={{ flex: 1 }}
            />
            <SkeletonBox width={80} height={44} borderRadius={8} />
          </View>
        </View>
      )}

      {/* List */}
      <View style={{ padding: 24 }}>
        {items.map((item) => (
          <SkeletonCustomerCard key={item.id} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for customer list (no header)
 */
export function CustomerListInlineSkeleton({ count = 4 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <View>
      {items.map((item) => (
        <SkeletonCustomerCard key={item.id} />
      ))}
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText, SkeletonBox } from '../ui/Skeleton';
import { SkeletonTransactionRow } from '../ui/SkeletonLayouts';

interface TransactionListSkeletonProps {
  /** Number of skeleton items */
  count?: number;
  /** Show header */
  showHeader?: boolean;
}

/**
 * Skeleton for transaction list screen
 * Used in: transactions/index.tsx
 */
export function TransactionListSkeleton({
  count = 6,
  showHeader = true,
}: TransactionListSkeletonProps) {
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

          {/* Title */}
          <SkeletonText width={120} height={36} style={{ marginBottom: 16 }} />

          {/* Search */}
          <View className="flex-row gap-2 mb-4">
            <SkeletonBox
              width="85%"
              height={48}
              borderRadius={8}
              style={{ flex: 1 }}
            />
            <SkeletonBox width={48} height={48} borderRadius={8} />
          </View>

          {/* Filter chips */}
          <View className="flex-row flex-wrap gap-2">
            <SkeletonBox width={100} height={28} borderRadius={14} />
            <SkeletonBox width={80} height={28} borderRadius={14} />
            <SkeletonBox width={90} height={28} borderRadius={14} />
          </View>
        </View>
      )}

      {/* List */}
      <View>
        {items.map((item) => (
          <SkeletonTransactionRow key={item.id} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for transaction list (no header)
 */
export function TransactionListInlineSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <View>
      {items.map((item) => (
        <SkeletonTransactionRow key={item.id} />
      ))}
    </View>
  );
}

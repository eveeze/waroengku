import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText, SkeletonBox } from '../ui/Skeleton';
import { SkeletonNotificationRow } from '../ui/SkeletonLayouts';

interface NotificationListSkeletonProps {
  count?: number;
  showHeader?: boolean;
}

/**
 * Skeleton for notification list screen
 * Used in: notifications/index.tsx
 */
export function NotificationListSkeleton({
  count = 8,
  showHeader = true,
}: NotificationListSkeletonProps) {
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
            <SkeletonText width={180} height={36} />
            <SkeletonBox width={100} height={32} borderRadius={16} />
          </View>
        </View>
      )}

      <View>
        {items.map((item) => (
          <SkeletonNotificationRow key={item.id} />
        ))}
      </View>
    </View>
  );
}

/**
 * Inline skeleton for notification list (no header)
 */
export function NotificationListInlineSkeleton({
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
        <SkeletonNotificationRow key={item.id} />
      ))}
    </View>
  );
}

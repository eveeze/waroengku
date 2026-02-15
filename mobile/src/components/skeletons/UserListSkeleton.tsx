import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';
import { SkeletonUserCard } from '../ui/SkeletonLayouts';

/**
 * User List Screen Skeleton
 */
export function UserListSkeleton() {
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
            <SkeletonText width={100} height={28} />
          </View>
        </View>

        {/* Search bar */}
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* User List */}
      <ScrollView className="flex-1 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonUserCard key={i} />
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Inline skeleton for user list
 */
export function UserListInlineSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={{ padding: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonUserCard key={i} />
      ))}
    </View>
  );
}

import React from 'react';
import { View, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonText, SkeletonCircle } from '../ui/Skeleton';

/**
 * Daily Report Screen Skeleton
 */
export function DailyReportSkeleton() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
            <SkeletonText width={140} height={28} />
          </View>
        </View>

        {/* Date picker */}
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Summary Section */}
      <View
        className="p-6"
        style={{
          backgroundColor: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
        }}
      >
        <SkeletonText width={100} height={12} style={{ opacity: 0.3 }} />
        <View style={{ height: 8 }} />
        <SkeletonText width="70%" height={36} style={{ opacity: 0.3 }} />
        <View style={{ height: 16 }} />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <SkeletonText width="80%" height={10} style={{ opacity: 0.3 }} />
            <View style={{ height: 4 }} />
            <SkeletonText width="60%" height={24} style={{ opacity: 0.3 }} />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonText width="80%" height={10} style={{ opacity: 0.3 }} />
            <View style={{ height: 4 }} />
            <SkeletonText width="60%" height={24} style={{ opacity: 0.3 }} />
          </View>
        </View>
      </View>

      {/* Hourly breakdown */}
      <View className="p-6">
        <SkeletonText width={120} height={16} />
        <View style={{ height: 16 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <SkeletonText width={60} height={14} />
            <SkeletonText width={80} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Inventory Report Screen Skeleton
 */
export function InventoryReportSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 pb-6 border-b border-border"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="flex-row items-center gap-4">
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <View>
            <SkeletonText width={100} height={10} />
            <View style={{ height: 4 }} />
            <SkeletonText width={160} height={28} />
          </View>
        </View>
      </View>

      {/* Summary cards */}
      <View className="flex-row gap-4 p-6">
        <View className="flex-1 bg-muted p-4 rounded-lg">
          <SkeletonText width="80%" height={12} />
          <View style={{ height: 8 }} />
          <SkeletonText width="60%" height={24} />
        </View>
        <View className="flex-1 bg-muted p-4 rounded-lg">
          <SkeletonText width="80%" height={12} />
          <View style={{ height: 8 }} />
          <SkeletonText width="60%" height={24} />
        </View>
      </View>

      {/* List items */}
      <View className="flex-1 px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} className="py-4 border-b border-border">
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <SkeletonText width="50%" height={16} />
              <SkeletonBox width={60} height={20} borderRadius={4} />
            </View>
            <View style={{ height: 6 }} />
            <SkeletonText width="70%" height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Kasbon Report Screen Skeleton
 */
export function KasbonReportSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 pb-6 border-b border-border"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="flex-row items-center gap-4">
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <View>
            <SkeletonText width={80} height={10} />
            <View style={{ height: 4 }} />
            <SkeletonText width={120} height={28} />
          </View>
        </View>
      </View>

      {/* Total Outstanding */}
      <View className="p-6 bg-muted mx-6 mt-6 rounded-lg">
        <SkeletonText width={120} height={12} />
        <View style={{ height: 8 }} />
        <SkeletonText width="60%" height={32} />
      </View>

      {/* Customer List */}
      <View className="flex-1 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            className="flex-row items-center py-4 border-b border-border"
          >
            <SkeletonCircle size={40} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <SkeletonText width="60%" height={16} />
              <View style={{ height: 4 }} />
              <SkeletonText width="40%" height={12} />
            </View>
            <SkeletonText width={80} height={18} />
          </View>
        ))}
      </View>
    </View>
  );
}

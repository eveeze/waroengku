import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText } from '../ui/Skeleton';
import {
  SkeletonReportSummary,
  SkeletonReportMenuItem,
} from '../ui/SkeletonLayouts';

/**
 * Skeleton for reports hub screen
 * Used in: reports/index.tsx
 */
export function ReportsSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <SkeletonText width={60} height={12} style={{ marginBottom: 16 }} />
        <SkeletonText width={120} height={36} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Summary */}
        <SkeletonReportSummary />

        {/* Menu Label */}
        <SkeletonText width={80} height={12} style={{ marginBottom: 16 }} />

        {/* Menu Items */}
        <SkeletonReportMenuItem />
        <SkeletonReportMenuItem />
        <SkeletonReportMenuItem />
      </ScrollView>
    </View>
  );
}

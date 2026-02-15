import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Skeleton,
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
} from '../ui/Skeleton';
import {
  SkeletonMetricHero,
  SkeletonActionCard,
  SkeletonAlertBadge,
} from '../ui/SkeletonLayouts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Full-page skeleton for Dashboard screen
 * Matches the layout of (admin)/index.tsx
 */
export function DashboardSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View
          className="px-6 pb-6 bg-background"
          style={{ paddingTop: insets.top + 20 }}
        >
          {/* Welcome + Actions */}
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <SkeletonText width={80} height={10} />
              <View style={{ height: 6 }} />
              <SkeletonText width={150} height={36} />
            </View>
            <View className="flex-row items-center gap-2">
              <SkeletonCircle size={40} />
              <SkeletonCircle size={40} />
            </View>
          </View>

          {/* Hero Metric: Today's Sales */}
          <SkeletonMetricHero />
        </View>

        {/* Alerts Ticker */}
        <View className="bg-muted border-b border-border">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
          >
            <SkeletonAlertBadge />
            <SkeletonAlertBadge />
            <SkeletonAlertBadge />
          </ScrollView>
        </View>

        {/* Main Navigation Grid */}
        <View className="px-6 pt-6">
          <SkeletonText width={100} height={12} />
          <View style={{ height: 16 }} />

          {/* POS Primary Action */}
          <SkeletonBox
            width="100%"
            height={160}
            borderRadius={0}
            style={{ marginBottom: 24 }}
          />

          {/* Quick Action Grid */}
          <View className="flex-row flex-wrap gap-4">
            <View style={{ flex: 1, minWidth: 140 }}>
              <SkeletonActionCard />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <SkeletonActionCard />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <SkeletonActionCard />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <SkeletonActionCard />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

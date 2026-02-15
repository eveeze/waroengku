import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonText, SkeletonBox, SkeletonCircle } from '../ui/Skeleton';
import {
  SkeletonDetailImage,
  SkeletonDetailInfo,
  SkeletonFormField,
} from '../ui/SkeletonLayouts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Skeleton for product detail screen
 * Used in: products/[id]/index.tsx
 */
export function ProductDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button overlay area */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 16,
            left: 16,
            zIndex: 10,
          }}
        >
          <SkeletonCircle size={40} />
        </View>

        {/* Image */}
        <SkeletonDetailImage />

        {/* Info */}
        <SkeletonDetailInfo />

        {/* Stats */}
        <View className="px-6 pb-6">
          <View className="flex-row gap-4">
            <SkeletonBox
              width="48%"
              height={80}
              borderRadius={8}
              style={{ flex: 1 }}
            />
            <SkeletonBox
              width="48%"
              height={80}
              borderRadius={8}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Action buttons */}
        <View className="px-6">
          <SkeletonBox
            width="100%"
            height={48}
            borderRadius={8}
            style={{ marginBottom: 12 }}
          />
          <SkeletonBox width="100%" height={48} borderRadius={8} />
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Skeleton for customer detail screen
 * Used in: customers/[id]/index.tsx
 */
export function CustomerDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <SkeletonText width={60} height={12} style={{ marginBottom: 16 }} />
        <SkeletonText width={180} height={32} style={{ marginBottom: 8 }} />
        <SkeletonText width={120} height={14} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          <SkeletonBox
            width="48%"
            height={100}
            borderRadius={12}
            style={{ flex: 1 }}
          />
          <SkeletonBox
            width="48%"
            height={100}
            borderRadius={12}
            style={{ flex: 1 }}
          />
        </View>

        {/* Contact Info */}
        <SkeletonBox
          width="100%"
          height={120}
          borderRadius={12}
          style={{ marginBottom: 24 }}
        />

        {/* Recent Transactions */}
        <SkeletonText width={140} height={14} style={{ marginBottom: 12 }} />
        <SkeletonBox
          width="100%"
          height={80}
          borderRadius={8}
          style={{ marginBottom: 8 }}
        />
        <SkeletonBox
          width="100%"
          height={80}
          borderRadius={8}
          style={{ marginBottom: 8 }}
        />
        <SkeletonBox width="100%" height={80} borderRadius={8} />
      </ScrollView>
    </View>
  );
}

/**
 * Skeleton for transaction detail screen
 * Used in: transactions/[id].tsx
 */
export function TransactionDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <SkeletonText width={60} height={12} style={{ marginBottom: 16 }} />
        <View className="flex-row justify-between items-center">
          <SkeletonText width={140} height={28} />
          <SkeletonBox width={80} height={24} borderRadius={4} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <SkeletonBox
          width="100%"
          height={160}
          borderRadius={0}
          style={{ marginBottom: 24 }}
        />

        {/* Items */}
        <SkeletonText width={60} height={12} style={{ marginBottom: 12 }} />
        <SkeletonBox
          width="100%"
          height={70}
          borderRadius={8}
          style={{ marginBottom: 8 }}
        />
        <SkeletonBox
          width="100%"
          height={70}
          borderRadius={8}
          style={{ marginBottom: 8 }}
        />
        <SkeletonBox
          width="100%"
          height={70}
          borderRadius={8}
          style={{ marginBottom: 24 }}
        />

        {/* Payment Info */}
        <SkeletonBox width="100%" height={120} borderRadius={8} />
      </ScrollView>
    </View>
  );
}

/**
 * Generic form skeleton
 * Used in: create/edit screens
 */
export function FormSkeleton({ fieldCount = 5 }: { fieldCount?: number }) {
  const insets = useSafeAreaInsets();
  const fields = Array.from({ length: fieldCount }, (_, i) => ({
    id: `field-${i}`,
  }));

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <SkeletonText width={60} height={12} style={{ marginBottom: 16 }} />
        <SkeletonText width={180} height={32} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field) => (
          <SkeletonFormField key={field.id} />
        ))}

        {/* Submit button */}
        <View style={{ marginTop: 16 }}>
          <SkeletonBox width="100%" height={52} borderRadius={12} />
        </View>
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { View, ViewStyle, Dimensions, useColorScheme } from 'react-native';
import {
  Skeleton,
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
} from './Skeleton';

/**
 * Pre-built Skeleton Layouts for Common UI Patterns
 * All components support dark/light mode via NativeWind
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme-aware colors
function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    cardBg: isDark ? 'hsl(240, 3.7%, 15.9%)' : 'hsl(240, 4.8%, 95.9%)',
    cardBgWhite: isDark ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 100%)',
    border: isDark ? 'hsl(240, 3.7%, 15.9%)' : 'hsl(240, 5.9%, 90%)',
    foreground: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
  };
}

// ============================================
// Product Skeletons
// ============================================

interface ProductCardSkeletonProps {
  style?: ViewStyle;
}

/** Skeleton for product card in grid view (POS, Products) */
export function SkeletonProductCard({ style }: ProductCardSkeletonProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBgWhite,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Image placeholder */}
      <SkeletonBox height={128} borderRadius={0} />

      {/* Content */}
      <View style={{ padding: 12 }}>
        <SkeletonText width="80%" height={12} />
        <View style={{ height: 8 }} />
        <SkeletonText width="50%" height={16} />
      </View>
    </View>
  );
}

/** Skeleton for product row in list view */
export function SkeletonProductRow({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Image */}
      <SkeletonBox width={64} height={64} borderRadius={0} />

      {/* Content */}
      <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
        <SkeletonText width="70%" height={16} />
        <View style={{ height: 6 }} />
        <SkeletonText width="40%" height={12} />
        <View style={{ height: 8 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBox width={70} height={20} borderRadius={4} />
          <SkeletonBox width={50} height={20} borderRadius={4} />
        </View>
      </View>

      {/* Price */}
      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
        <SkeletonText width={80} height={16} />
      </View>
    </View>
  );
}

// ============================================
// Customer Skeletons
// ============================================

/** Skeleton for customer card */
export function SkeletonCustomerCard({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <SkeletonText width="60%" height={20} />
          <View style={{ height: 8 }} />
          <SkeletonText width="40%" height={12} />
        </View>
        <SkeletonBox width={80} height={24} borderRadius={6} />
      </View>
    </View>
  );
}

// ============================================
// Transaction Skeletons
// ============================================

/** Skeleton for transaction row */
export function SkeletonTransactionRow({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, marginRight: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <SkeletonText width={120} height={18} />
          <View style={{ width: 8 }} />
          <SkeletonBox width={60} height={18} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SkeletonText width={70} height={12} />
          <View style={{ width: 16 }} />
          <SkeletonText width={50} height={12} />
        </View>
        <View style={{ height: 6 }} />
        <SkeletonText width="50%" height={12} />
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <SkeletonText width={90} height={18} />
        <View style={{ height: 6 }} />
        <SkeletonText width={50} height={12} />
      </View>
    </View>
  );
}

// ============================================
// Dashboard & Metric Skeletons
// ============================================

/** Skeleton for large metric display */
export function SkeletonMetricHero({ style }: { style?: ViewStyle }) {
  return (
    <View style={style}>
      <SkeletonText width={100} height={10} />
      <View style={{ height: 8 }} />
      <SkeletonText width="80%" height={48} />
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <SkeletonBox width={100} height={28} borderRadius={4} />
        <SkeletonBox width={140} height={28} borderRadius={4} />
      </View>
    </View>
  );
}

/** Skeleton for quick action card */
export function SkeletonActionCard({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          padding: 20,
          aspectRatio: 1,
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      <SkeletonCircle size={40} />
      <View>
        <SkeletonText width="70%" height={18} />
        <View style={{ height: 6 }} />
        <SkeletonText width="50%" height={12} />
      </View>
    </View>
  );
}

/** Skeleton for alert badge */
export function SkeletonAlertBadge() {
  return (
    <SkeletonBox
      width={120}
      height={32}
      borderRadius={6}
      style={{ marginRight: 12 }}
    />
  );
}

// ============================================
// Report Skeletons
// ============================================

/** Skeleton for report summary card */
export function SkeletonReportSummary({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.foreground,
          padding: 24,
          marginBottom: 32,
        },
        style,
      ]}
    >
      <Skeleton width={120} height={10} style={{ opacity: 0.3 }} />
      <View style={{ height: 8 }} />
      <Skeleton width="70%" height={36} style={{ opacity: 0.3 }} />
      <View style={{ height: 16 }} />
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.2)',
          paddingTop: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Skeleton width={80} height={10} style={{ opacity: 0.3 }} />
          <View style={{ height: 6 }} />
          <Skeleton width={60} height={24} style={{ opacity: 0.3 }} />
        </View>
        <View style={{ flex: 1 }}>
          <Skeleton width={80} height={10} style={{ opacity: 0.3 }} />
          <View style={{ height: 6 }} />
          <Skeleton width={80} height={24} style={{ opacity: 0.3 }} />
        </View>
      </View>
    </View>
  );
}

/** Skeleton for report menu item */
export function SkeletonReportMenuItem({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBgWhite,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          marginBottom: 16,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <SkeletonBox width={60} height={24} borderRadius={4} />
        <SkeletonText width={80} height={16} />
      </View>
      <SkeletonText width="60%" height={18} />
      <View style={{ height: 6 }} />
      <SkeletonText width="80%" height={12} />
    </View>
  );
}

// ============================================
// Category Skeletons
// ============================================

/** Skeleton for category card */
export function SkeletonCategoryCard({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 12,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <SkeletonText width="50%" height={18} />
          <View style={{ height: 6 }} />
          <SkeletonText width="30%" height={12} />
        </View>
        <SkeletonCircle size={24} />
      </View>
    </View>
  );
}

// ============================================
// Notification Skeletons
// ============================================

/** Skeleton for notification row */
export function SkeletonNotificationRow({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          padding: 16,
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <SkeletonCircle size={40} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <SkeletonText width="80%" height={14} />
        <View style={{ height: 6 }} />
        <SkeletonText width="60%" height={12} />
        <View style={{ height: 6 }} />
        <SkeletonText width="30%" height={10} />
      </View>
    </View>
  );
}

// ============================================
// Form Skeletons
// ============================================

/** Skeleton for form input field */
export function SkeletonFormField({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <SkeletonText width={80} height={12} />
      <View style={{ height: 8 }} />
      <SkeletonBox width="100%" height={48} borderRadius={8} />
    </View>
  );
}

// ============================================
// Detail Page Skeletons
// ============================================

/** Skeleton for product detail image */
export function SkeletonDetailImage({ style }: { style?: ViewStyle }) {
  return (
    <SkeletonBox
      width={SCREEN_WIDTH}
      height={300}
      borderRadius={0}
      style={style}
    />
  );
}

/** Skeleton for detail info section */
export function SkeletonDetailInfo({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ padding: 24 }, style]}>
      <SkeletonText width="70%" height={28} />
      <View style={{ height: 8 }} />
      <SkeletonText width="40%" height={14} />
      <View style={{ height: 16 }} />
      <SkeletonText width="50%" height={32} />
      <View style={{ height: 24 }} />
      <SkeletonText width="100%" height={14} lines={3} lastLineWidth={60} />
    </View>
  );
}

// ============================================
// Cash Flow Skeletons
// ============================================

/** Skeleton for cash flow item */
export function SkeletonCashFlowItem({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <SkeletonText width="60%" height={16} />
        <View style={{ height: 6 }} />
        <SkeletonText width="40%" height={12} />
      </View>
      <SkeletonText width={80} height={18} />
    </View>
  );
}

// ============================================
// User & Consignment Skeletons
// ============================================

/** Skeleton for user card */
export function SkeletonUserCard({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <SkeletonCircle size={48} style={{ marginRight: 16 }} />
      <View style={{ flex: 1 }}>
        <SkeletonText width="60%" height={18} />
        <View style={{ height: 6 }} />
        <SkeletonText width="40%" height={12} />
        <View style={{ height: 6 }} />
        <SkeletonBox width={60} height={20} borderRadius={4} />
      </View>
    </View>
  );
}

/** Skeleton for consignment card */
export function SkeletonConsignmentCard({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <SkeletonText width="70%" height={18} />
          <View style={{ height: 6 }} />
          <SkeletonText width="50%" height={12} />
        </View>
        <SkeletonBox width={70} height={24} borderRadius={6} />
      </View>
    </View>
  );
}

// ============================================
// Stock Opname Skeletons
// ============================================

/** Skeleton for stock opname item */
export function SkeletonStockOpnameItem({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBgWhite,
          padding: 16,
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <SkeletonText width="50%" height={16} />
        <SkeletonBox width={60} height={20} borderRadius={4} />
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}>
          <SkeletonText width="80%" height={12} />
          <View style={{ height: 4 }} />
          <SkeletonText width="60%" height={12} />
        </View>
      </View>
    </View>
  );
}

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Enterprise-grade Skeleton Loading Component
 * Provides shimmer animation effect for loading states
 * Supports dark and light mode themes
 */

// Theme colors matching global.css
const THEME_COLORS = {
  light: {
    background: 'hsl(240, 4.8%, 95.9%)', // --muted light
    shimmer: 'rgba(255, 255, 255, 0.4)',
  },
  dark: {
    background: 'hsl(240, 3.7%, 15.9%)', // --muted dark
    shimmer: 'rgba(255, 255, 255, 0.1)',
  },
};

interface SkeletonProps {
  /** Width of the skeleton (number for pixels, string for percentages) */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Make it a circle (overrides borderRadius) */
  circle?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  /** Skeleton variant */
  variant?: 'box' | 'text' | 'circle';
  /** Number of text lines (only for variant='text') */
  lines?: number;
  /** Last line width percentage (only for variant='text') */
  lastLineWidth?: number;
}

const SHIMMER_DURATION = 1200;

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  circle = false,
  style,
  variant = 'box',
  lines = 1,
  lastLineWidth = 60,
}: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION }),
      -1, // Infinite repeat
      false, // Don't reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerProgress.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  // Render multiple lines for text variant
  if (variant === 'text' && lines > 1) {
    return (
      <View style={style}>
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLine
            key={index}
            width={index === lines - 1 ? `${lastLineWidth}%` : '100%'}
            height={height}
            borderRadius={borderRadius}
            animatedStyle={animatedStyle}
            isLast={index === lines - 1}
            backgroundColor={colors.background}
            shimmerColor={colors.shimmer}
          />
        ))}
      </View>
    );
  }

  const computedBorderRadius = circle
    ? typeof height === 'number'
      ? height / 2
      : 50
    : borderRadius;
  const computedWidth = circle ? height : width;

  return (
    <View
      style={[
        styles.skeleton,
        {
          backgroundColor: colors.background,
          width: computedWidth as any,
          height,
          borderRadius: computedBorderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', colors.shimmer, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonLineProps {
  width: number | string;
  height: number;
  borderRadius: number;
  animatedStyle: any;
  isLast: boolean;
  backgroundColor: string;
  shimmerColor: string;
}

function SkeletonLine({
  width,
  height,
  borderRadius,
  animatedStyle,
  isLast,
  backgroundColor,
  shimmerColor,
}: SkeletonLineProps) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          backgroundColor,
          width: width as any,
          height,
          borderRadius,
          marginBottom: isLast ? 0 : 8,
        },
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', shimmerColor, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// Convenience components
export function SkeletonBox({
  width = '100%',
  height = 100,
  borderRadius = 8,
  style,
}: Omit<SkeletonProps, 'variant' | 'lines' | 'circle'>) {
  return (
    <Skeleton
      variant="box"
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
}

export function SkeletonText({
  width = '100%',
  height = 14,
  lines = 1,
  lastLineWidth = 60,
  style,
}: Pick<
  SkeletonProps,
  'width' | 'height' | 'lines' | 'lastLineWidth' | 'style'
>) {
  return (
    <Skeleton
      variant="text"
      width={width}
      height={height}
      lines={lines}
      lastLineWidth={lastLineWidth}
      style={style}
    />
  );
}

export function SkeletonCircle({
  size = 40,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  return <Skeleton circle height={size} style={style} />;
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
  },
  gradient: {
    flex: 1,
    width: '50%',
  },
});

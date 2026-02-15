import { useMemo } from 'react';
import { useWindowDimensions, Platform, PixelRatio } from 'react-native';
import {
  BREAKPOINTS,
  GRID_COLUMNS,
  SPACING_SCALE,
  FONT_SCALE,
  LAYOUT,
} from '@/constants/responsive';

/**
 * Device type based on screen width
 */
export type DeviceType = 'small' | 'phone' | 'tablet' | 'large';

/**
 * Layout mode for content organization
 */
export type LayoutMode = 'compact' | 'regular' | 'expanded';

/**
 * Responsive breakpoint flags
 */
export interface Breakpoints {
  isSmall: boolean; // < 375px
  isMedium: boolean; // 375-768px
  isLarge: boolean; // 768-1024px
  isXLarge: boolean; // > 1024px
  isTablet: boolean; // >= 768px
  isPhone: boolean; // < 768px
}

/**
 * Responsive dimension values
 */
export interface ResponsiveDimensions {
  width: number;
  height: number;
  deviceType: DeviceType;
  layoutMode: LayoutMode;
  breakpoints: Breakpoints;

  // Grid
  gridColumns: 2 | 3 | 4;

  // Scaling
  spacing: number; // Multiplier for spacing
  fontScale: number; // Multiplier for fonts

  // Screen padding
  screenPadding: number;
  gap: number;

  // Utility functions
  getItemWidth: (columns?: number, gap?: number, padding?: number) => number;
  getResponsiveValue: <T>(phone: T, tablet: T, large?: T) => T;
  scaledSize: (baseSize: number) => number;
  scaledFont: (baseSize: number) => number;

  // Responsive class helpers (for NativeWind)
  rClass: (phoneClass: string, tabletClass?: string) => string;
}

/**
 * useResponsive Hook
 *
 * Provides responsive values and utilities for adapting layouts
 * across different screen sizes and device types.
 *
 * @example
 * ```tsx
 * const { isTablet, gridColumns, getItemWidth, scaledFont } = useResponsive();
 *
 * return (
 *   <FlatList
 *     numColumns={gridColumns}
 *     key={`grid-${gridColumns}`}
 *     renderItem={({ item }) => (
 *       <View style={{ width: getItemWidth() }}>
 *         <Text style={{ fontSize: scaledFont(16) }}>{item.name}</Text>
 *       </View>
 *     )}
 *   />
 * );
 * ```
 */
export function useResponsive(): ResponsiveDimensions {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // Determine device type
    const deviceType: DeviceType =
      width < BREAKPOINTS.SM
        ? 'small'
        : width < BREAKPOINTS.LG
          ? 'phone'
          : width < BREAKPOINTS.XL
            ? 'tablet'
            : 'large';

    // Breakpoint flags
    const breakpoints: Breakpoints = {
      isSmall: width < BREAKPOINTS.SM,
      isMedium: width >= BREAKPOINTS.SM && width < BREAKPOINTS.LG,
      isLarge: width >= BREAKPOINTS.LG && width < BREAKPOINTS.XL,
      isXLarge: width >= BREAKPOINTS.XL,
      isTablet: width >= BREAKPOINTS.LG,
      isPhone: width < BREAKPOINTS.LG,
    };

    // Layout mode
    const layoutMode: LayoutMode =
      width < BREAKPOINTS.SM
        ? 'compact'
        : width < BREAKPOINTS.LG
          ? 'regular'
          : 'expanded';

    // Grid columns based on device
    const gridColumns: 2 | 3 | 4 =
      width < BREAKPOINTS.LG
        ? GRID_COLUMNS.phone
        : width < BREAKPOINTS.XL
          ? GRID_COLUMNS.tabletPortrait
          : GRID_COLUMNS.tabletLandscape;

    // Scaling factors
    const spacing =
      deviceType === 'small'
        ? SPACING_SCALE.small
        : deviceType === 'tablet'
          ? SPACING_SCALE.tablet
          : deviceType === 'large'
            ? SPACING_SCALE.large
            : SPACING_SCALE.phone;

    const fontScale =
      deviceType === 'small'
        ? FONT_SCALE.small
        : deviceType === 'tablet'
          ? FONT_SCALE.tablet
          : deviceType === 'large'
            ? FONT_SCALE.large
            : FONT_SCALE.phone;

    // Layout values
    const screenPadding = breakpoints.isTablet
      ? LAYOUT.screenPadding.tablet
      : LAYOUT.screenPadding.phone;

    const gap = breakpoints.isTablet ? LAYOUT.gap.tablet : LAYOUT.gap.phone;

    /**
     * Calculate item width for grid layouts
     */
    const getItemWidth = (
      columns: number = gridColumns,
      itemGap: number = gap,
      padding: number = screenPadding,
    ): number => {
      const totalGaps = (columns - 1) * itemGap;
      const availableWidth = width - padding * 2 - totalGaps;
      return Math.floor(availableWidth / columns);
    };

    /**
     * Get responsive value based on device type
     */
    const getResponsiveValue = <T>(phone: T, tablet: T, large?: T): T => {
      if (breakpoints.isXLarge && large !== undefined) return large;
      if (breakpoints.isTablet) return tablet;
      return phone;
    };

    /**
     * Scale a size value based on device type
     */
    const scaledSize = (baseSize: number): number => {
      return Math.round(baseSize * spacing);
    };

    /**
     * Scale a font size based on device type
     * Uses PixelRatio for consistent scaling across devices
     */
    const scaledFont = (baseSize: number): number => {
      const scaled = baseSize * fontScale;
      // Ensure fonts are not scaled beyond reasonable limits
      const maxScale = Platform.OS === 'web' ? 1.3 : 1.25;
      const minScale = 0.85;
      const finalScale = Math.min(Math.max(fontScale, minScale), maxScale);
      return Math.round(baseSize * finalScale);
    };

    /**
     * Helper to get responsive class names (NativeWind)
     */
    const rClass = (phoneClass: string, tabletClass?: string): string => {
      if (breakpoints.isTablet && tabletClass) {
        return tabletClass;
      }
      return phoneClass;
    };

    return {
      width,
      height,
      deviceType,
      layoutMode,
      breakpoints,
      gridColumns,
      spacing,
      fontScale,
      screenPadding,
      gap,
      getItemWidth,
      getResponsiveValue,
      scaledSize,
      scaledFont,
      rClass,
    };
  }, [width, height]);
}

/**
 * Hook to get just the device type (lightweight alternative)
 */
export function useDeviceType(): DeviceType {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    if (width < BREAKPOINTS.SM) return 'small';
    if (width < BREAKPOINTS.LG) return 'phone';
    if (width < BREAKPOINTS.XL) return 'tablet';
    return 'large';
  }, [width]);
}

/**
 * Hook to check if device is tablet
 */
export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINTS.LG;
}

export default useResponsive;

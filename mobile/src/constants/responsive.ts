/**
 * Responsive Constants
 * Breakpoints and scaling values for responsive design
 */

// Screen width breakpoints (in pixels)
export const BREAKPOINTS = {
  XS: 320, // Small phones
  SM: 375, // Regular phones
  MD: 414, // Large phones
  LG: 768, // Tablets portrait
  XL: 1024, // Tablets landscape
} as const;

// Grid column configurations
export const GRID_COLUMNS = {
  phone: 2,
  tabletPortrait: 3,
  tabletLandscape: 4,
} as const;

// Spacing multipliers for different device sizes
export const SPACING_SCALE = {
  small: 0.85,
  phone: 1,
  tablet: 1.25,
  large: 1.5,
} as const;

// Font scale multipliers
export const FONT_SCALE = {
  small: 0.9,
  phone: 1,
  tablet: 1.15,
  large: 1.25,
} as const;

// Minimum touch target size (accessibility)
export const MIN_TOUCH_TARGET = 44;

// Default gap and padding values
export const LAYOUT = {
  screenPadding: {
    phone: 16,
    tablet: 24,
  },
  gap: {
    phone: 12,
    tablet: 16,
  },
  maxContentWidth: 1200, // Max width for very large screens
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

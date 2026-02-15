import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

/**
 * Enhanced Empty State Component
 * Enterprise-grade empty state with variants, actions, and animations
 */

type EmptyStateVariant = 'info' | 'warning' | 'error' | 'success';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  /** Main title */
  title: string;
  /** Optional description message */
  message?: string;
  /** Icon - can be emoji string or Feather icon name */
  icon?: string;
  /** Feather icon name (overrides icon if provided) */
  featherIcon?: keyof typeof Feather.glyphMap;
  /** Style variant */
  variant?: EmptyStateVariant;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Additional container styles */
  style?: ViewStyle;
  /** Compact mode for inline use */
  compact?: boolean;
}

const variantStyles: Record<
  EmptyStateVariant,
  { iconBg: string; iconColor: string; titleColor: string }
> = {
  info: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    titleColor: 'text-warning',
  },
  error: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
  success: {
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-600 dark:text-green-400',
  },
};

const defaultIcons: Record<EmptyStateVariant, string> = {
  info: '📭',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

export function EmptyState({
  title,
  message,
  icon,
  featherIcon,
  variant = 'info',
  action,
  secondaryAction,
  style,
  compact = false,
}: EmptyStateProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  const containerPadding = compact ? 'p-4' : 'p-8';
  const iconSize = compact ? 'text-3xl' : 'text-5xl';
  const titleSize = compact ? 'text-base' : 'text-lg';

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className={`flex-1 items-center justify-center ${containerPadding}`}
      style={style}
    >
      {/* Icon */}
      <View className={`${styles.iconBg} rounded-full p-4 mb-4`}>
        {featherIcon ? (
          <Feather
            name={featherIcon}
            size={compact ? 28 : 40}
            color={
              variant === 'error'
                ? '#ef4444'
                : variant === 'warning'
                  ? '#f59e0b'
                  : variant === 'success'
                    ? '#22c55e'
                    : '#71717a'
            }
          />
        ) : (
          <Text className={iconSize}>{displayIcon}</Text>
        )}
      </View>

      {/* Title */}
      <Text
        className={`${titleSize} font-bold ${styles.titleColor} text-center mb-2 uppercase tracking-wide`}
      >
        {title}
      </Text>

      {/* Message */}
      {message && (
        <Text className="text-muted-foreground text-center leading-5 mb-6 px-4 max-w-xs">
          {message}
        </Text>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <View className="flex-row gap-3 mt-2">
          {secondaryAction && (
            <TouchableOpacity
              onPress={secondaryAction.onPress}
              className="px-5 py-3 rounded-lg border border-border bg-background"
              activeOpacity={0.7}
            >
              <Text className="text-foreground font-bold text-xs uppercase tracking-widest">
                {secondaryAction.label}
              </Text>
            </TouchableOpacity>
          )}

          {action && (
            <TouchableOpacity
              onPress={action.onPress}
              className="px-5 py-3 rounded-lg bg-foreground"
              activeOpacity={0.7}
            >
              <Text className="text-background font-bold text-xs uppercase tracking-widest">
                {action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

/**
 * Inline empty state for lists (smaller, no animation)
 */
export function EmptyStateInline({
  title,
  message,
  icon = '📭',
  action,
}: Pick<EmptyStateProps, 'title' | 'message' | 'icon' | 'action'>) {
  return (
    <View className="items-center py-12 opacity-70">
      <Text className="text-3xl mb-3">{icon}</Text>
      <Text className="text-base font-bold text-foreground text-center uppercase tracking-wide mb-1">
        {title}
      </Text>
      {message && (
        <Text className="text-sm text-muted-foreground text-center px-8 mb-4">
          {message}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          className="px-4 py-2 rounded-lg bg-foreground mt-2"
          activeOpacity={0.7}
        >
          <Text className="text-background font-bold text-xs uppercase tracking-widest">
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Error state with retry action
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      message={message}
      variant="error"
      featherIcon="alert-circle"
      action={onRetry ? { label: 'Try Again', onPress: onRetry } : undefined}
    />
  );
}

/**
 * Loading failed state
 */
export function LoadingFailedState({
  message = 'Failed to load data',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title="Loading Failed"
      message={message}
      variant="error"
      featherIcon="wifi-off"
      action={onRetry ? { label: 'Retry', onPress: onRetry } : undefined}
    />
  );
}

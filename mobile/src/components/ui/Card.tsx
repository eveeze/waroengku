import React from 'react';
import { View, ViewProps, Text, TouchableOpacity } from 'react-native';

/**
 * Card Component
 * Reusable card container with optional header
 */

interface CardAction {
  title: string;
  onPress: () => void;
}

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  actions?: CardAction[];  // Array of action buttons
}

export function Card({
  title,
  subtitle,
  action,
  actions,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={`
        bg-white rounded-xl shadow-sm
        border border-secondary-100
        ${className || ''}
      `}
      {...props}
    >
      {(title || subtitle || action || actions) && (
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-secondary-100">
          <View className="flex-1">
            {title && (
              <Text className="text-lg font-semibold text-secondary-900">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-sm text-secondary-500 mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
          <View className="flex-row items-center">
            {actions?.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className="ml-2"
              >
                <Text className="text-primary-600 font-medium">{item.title}</Text>
              </TouchableOpacity>
            ))}
            {action}
          </View>
        </View>
      )}
      <View className="p-4">{children}</View>
    </View>
  );
}

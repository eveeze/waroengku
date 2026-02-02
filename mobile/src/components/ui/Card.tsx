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
  actions?: CardAction[]; // Array of action buttons
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
        bg-white rounded-xl
        border border-secondary-200
        ${className || ''}
      `}
      {...props}
    >
      {(title || subtitle || action || actions) && (
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-secondary-100">
          <View className="flex-1">
            {title && (
              <Text className="text-xl font-heading font-black uppercase tracking-tight text-primary-900">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 font-body mt-1">
                {subtitle}
              </Text>
            )}
          </View>
          <View className="flex-row items-center">
            {actions?.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className="ml-3 px-3 py-1.5 bg-secondary-50 rounded-md border border-secondary-200"
              >
                <Text className="text-xs font-bold text-primary-900 uppercase tracking-widest font-heading">
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
            {action}
          </View>
        </View>
      )}
      <View className="p-5">{children}</View>
    </View>
  );
}

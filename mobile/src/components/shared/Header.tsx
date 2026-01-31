import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Header Component
 * App header with title and optional actions
 */

interface HeaderAction {
  icon: string;
  onPress: () => void;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  actions?: HeaderAction[];  // Array of action buttons
  onBack?: () => void;
}

export function Header({
  title,
  subtitle,
  leftAction,
  rightAction,
  actions,
  onBack,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-primary-600 px-4 pb-4"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left Action / Back Button */}
        <View className="w-10">
          {leftAction || (onBack && (
            <TouchableOpacity
              onPress={onBack}
              className="p-2 -ml-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-white text-2xl">←</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <View className="flex-1 items-center">
          <Text className="text-white text-xl font-bold">{title}</Text>
          {subtitle && (
            <Text className="text-primary-200 text-sm mt-0.5">{subtitle}</Text>
          )}
        </View>

        {/* Right Action */}
        <View className="flex-row items-center">
          {actions?.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              className="p-2 ml-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-white text-lg">{action.icon}</Text>
            </TouchableOpacity>
          ))}
          {rightAction}
        </View>
      </View>
    </View>
  );
}

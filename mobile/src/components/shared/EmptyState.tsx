import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
}

export function EmptyState({ title, message, icon = '📭' }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-4xl mb-4">{icon}</Text>
      <Text className="text-lg font-bold text-secondary-900 text-center mb-2">
        {title}
      </Text>
      {message && (
        <Text className="text-secondary-500 text-center leading-5">
          {message}
        </Text>
      )}
    </View>
  );
}

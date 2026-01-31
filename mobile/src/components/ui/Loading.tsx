import React from 'react';
import { View, ActivityIndicator, Text, Modal } from 'react-native';

/**
 * Loading Component
 * Full screen or inline loading indicator
 */

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function Loading({
  message = 'Memuat...',
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const content = (
    <View className="items-center justify-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      {message && (
        <Text className="text-secondary-600 mt-3 text-base">{message}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-xl px-8 py-6 items-center">
            {content}
          </View>
        </View>
      </Modal>
    );
  }

  if (fullScreen) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center">
        {content}
      </View>
    );
  }

  return <View className="py-8">{content}</View>;
}

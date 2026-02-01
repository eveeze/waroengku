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
  message,
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const content = (
    <View className="items-center justify-center">
      <ActivityIndicator
        size={fullScreen || overlay ? 'large' : 'small'}
        color="#18181b"
      />
      {message && (
        <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mt-4">
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible animationType="fade">
        <View className="flex-1 bg-white/90 items-center justify-center">
          {content}
        </View>
      </Modal>
    );
  }

  if (fullScreen) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        {content}
      </View>
    );
  }

  return <View className="py-6">{content}</View>;
}

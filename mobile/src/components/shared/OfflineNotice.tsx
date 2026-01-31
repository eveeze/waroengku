import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStore } from '@/stores/networkStore';

/**
 * Offline Notice Component
 * Displays a warning when the app is offline
 */
export function OfflineNotice() {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const insets = useSafeAreaInsets();

  // Consider offline if isConnected is false or internet is explicitly not reachable
  const isOffline = !isConnected || isInternetReachable === false;

  if (!isOffline) return null;

  return (
    <View
      className="absolute top-0 left-0 right-0 bg-danger-500 z-50 items-center justify-center p-2"
      style={{ paddingTop: Platform.OS === 'ios' ? insets.top : 30 }}
    >
      <Text className="text-white text-xs font-semibold">
        Tidak ada koneksi internet. Mode Offline.
      </Text>
    </View>
  );
}

import { create } from 'zustand';
import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
  setupListener: () => () => void;
  checkConnection: () => Promise<void>;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true, // Default to true optimistically
  isInternetReachable: true,
  type: null,

  setupListener: () => {
    // On Web, use browser's online/offline events
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        set({ isConnected: true, isInternetReachable: true, type: 'wifi' });
      };
      const handleOffline = () => {
        set({ isConnected: false, isInternetReachable: false, type: 'none' });
      };

      // Set initial state
      if (typeof navigator !== 'undefined') {
        set({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: navigator.onLine ? 'wifi' : 'none',
        });
      }

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // On native, use NetInfo
    return NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        type: state.type,
      });
    });
  },

  checkConnection: async () => {
    // On Web, use browser's navigator.onLine
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined') {
        set({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: navigator.onLine ? 'wifi' : 'none',
        });
      }
      return;
    }

    // On native, use NetInfo
    const state = await NetInfo.fetch();
    set({
      isConnected: state.isConnected ?? true,
      isInternetReachable: state.isInternetReachable ?? true,
      type: state.type,
    });
  },
}));

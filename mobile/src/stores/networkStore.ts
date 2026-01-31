import { create } from 'zustand';
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
    return NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        type: state.type,
      });
    });
  },

  checkConnection: async () => {
    const state = await NetInfo.fetch();
    set({
      isConnected: state.isConnected ?? true,
      isInternetReachable: state.isInternetReachable ?? true,
      type: state.type,
    });
  },
}));

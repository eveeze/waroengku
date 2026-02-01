import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/constants/config';

/**
 * Storage Utility
 * Uses SecureStore for sensitive data (tokens)
 * Uses AsyncStorage for non-sensitive data
 */

import { Platform } from 'react-native';

// Secure Storage (for tokens and sensitive data)
// On Web, SecureStore is not available, so we fallback to AsyncStorage (Standard LocalStorage)
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

// Regular Storage (for non-sensitive data)
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },
};

// Token Storage Helpers
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(config.storage.accessToken);
  },

  async setAccessToken(token: string): Promise<void> {
    await secureStorage.setItem(config.storage.accessToken, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(config.storage.refreshToken);
  },

  async setRefreshToken(token: string): Promise<void> {
    await secureStorage.setItem(config.storage.refreshToken, token);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(config.storage.accessToken),
      secureStorage.removeItem(config.storage.refreshToken),
    ]);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
    ]);
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'API_CACHE_';
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const apiCache = {
  /**
   * Generate cache key from URL and params
   */
  getKey: (url: string, params?: any): string => {
    let sortedParams = {};
    if (params && typeof params === 'object') {
      try {
        sortedParams = Object.keys(params)
          .sort()
          .reduce((r: any, k) => ((r[k] = params[k]), r), {});
      } catch (e) {
        sortedParams = params;
      }
    } else if (params) {
      sortedParams = { value: params };
    }

    return `${CACHE_PREFIX}${url}_${JSON.stringify(sortedParams)}`;
  },

  /**
   * Save data to cache
   */
  set: async <T>(
    key: string,
    data: T,
    ttl: number = DEFAULT_TTL,
  ): Promise<void> => {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  },

  /**
   * Get data from cache
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      const item: CacheItem<T> = JSON.parse(value);
      const now = Date.now();

      // Check if expired
      if (now - item.timestamp > item.ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  },

  /**
   * Clear all API cache
   */
  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

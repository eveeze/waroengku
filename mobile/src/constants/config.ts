import Constants from 'expo-constants';

/**
 * App Configuration
 * Environment variables and constants
 */
export const config = {
  // API Configuration
  api: {
    baseUrl: Constants.expoConfig?.extra?.apiUrl || 
             process.env.EXPO_PUBLIC_API_URL || 
             'http://localhost:8080',
    version: process.env.EXPO_PUBLIC_API_VERSION || '/api/v1',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // App Information
  app: {
    name: process.env.EXPO_PUBLIC_APP_NAME || 'Warungku Admin',
    version: Constants.expoConfig?.version || '1.0.0',
  },

  // Storage Keys
  storage: {
    accessToken: 'warungku_access_token',
    refreshToken: 'warungku_refresh_token',
    user: 'warungku_user',
  },

  // Rate Limiting
  rateLimit: {
    maxRequests: 1000, // per minute as per backend
    retryAfter: 1000, // 1 second
  },
} as const;

export type Config = typeof config;

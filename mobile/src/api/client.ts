import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { config } from '@/constants/config';
import { tokenStorage } from '@/utils/storage';
import { apiCache } from '@/utils/cache';
import { ApiError } from './types';

/**
 * API Client
 * Axios instance with interceptors for auth, error handling, rate limiting, and offline caching
 * Based on MOBILE_DEV_GUIDE.md best practices
 */

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${config.api.baseUrl}${config.api.version}`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 - Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${config.api.baseUrl}/auth/refresh`,
          { refresh_token: refreshToken },
        );

        const { access_token, refresh_token: newRefreshToken } =
          response.data.data;

        // Save new tokens
        await tokenStorage.setTokens(access_token, newRefreshToken);

        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // Clear tokens and let the app handle logout
        await tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 429 - Rate Limited (Retry after 1 second)
    if (error.response?.status === 429) {
      await new Promise((resolve) =>
        setTimeout(resolve, config.rateLimit.retryAfter),
      );
      return apiClient(originalRequest);
    }

    // Format error message
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Terjadi kesalahan';

    return Promise.reject(new Error(errorMessage));
  },
);

export default apiClient;

// Helper for making API calls with proper typing AND caching support
export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  // Check network status
  const networkState = await NetInfo.fetch();
  const isConnected =
    networkState.isConnected && networkState.isInternetReachable !== false;

  // Create cache key for GET requests
  const cacheKey = method === 'get' ? apiCache.getKey(url, params) : '';

  // 1. Offline Strategy: Try cache first if offline
  if (!isConnected && method === 'get') {
    const cachedData = await apiCache.get<T>(cacheKey);
    if (cachedData) {
      console.log(`[Offline] Serving ${url} from cache`);
      return cachedData;
    }
    throw new Error('Tidak ada koneksi internet. Data belum tersedia offline.');
  }

  // 2. Online Strategy: Try fetch, cache on success, fallback to cache on network error
  try {
    const response = await apiClient.request<{ data: T }>({
      method,
      url,
      data,
      params,
    });

    // Save to cache if GET and successful
    if (method === 'get') {
      // Note: We only cache the 'data' part, which is T
      apiCache.set(cacheKey, response.data.data);
    }

    return response.data.data;
  } catch (error) {
    // If network error (not 4xx/5xx response, but actual connection error), try fallback to cache
    if (method === 'get') {
      const isNetworkError = !axios.isAxiosError(error) || !error.response;
      if (isNetworkError) {
        const cachedData = await apiCache.get<T>(cacheKey);
        if (cachedData) {
          console.log(`[Network Error] Fallback serving ${url} from cache`);
          return cachedData;
        }
      }
    }

    // Re-throw if no cache fallback available
    throw error;
  }
}

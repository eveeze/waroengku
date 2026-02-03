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

/**
 * Helper to make API calls with consistent error handling
 * (Restored for backward compatibility with endpoints)
 */
export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: any,
  params?: any,
): Promise<T> {
  try {
    const response = await apiClient.request<any, { data: { data: T } }>({
      method,
      url,
      data,
      params,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

// ETag Cache Map
export const etagCache = new Map<string, string>();

/**
 * Generic Fetcher for React Query with ETag support
 * @param url - The endpoint URL
 * @param params - Optional query parameters
 */
export async function fetcher<T>({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<T> {
  const [url, params] = queryKey as [string, Record<string, unknown>?];
  const cacheKey = apiCache.getKey(url, params);
  const existingEtag = etagCache.get(cacheKey);

  const headers: Record<string, string> = {};
  if (existingEtag) {
    headers['If-None-Match'] = existingEtag;
  }

  try {
    const response = await apiClient.get<{ data: T }>(url, {
      params,
      headers,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 304,
    });

    // Handle 304 Not Modified
    if (response.status === 304) {
      // In a real browser this is handled automatically, but with Axios/RN
      // we might need to rely on our own cache or let React Query handle existing data.
      // However, React Query expects data to be returned.
      // If we used a custom cache for *offline*, we could fetch from there.
      // But typically React Query "staleTime" handles the "don't fetch if fresh" part.
      // 304 is for "Server says it hasn't changed".

      // If we get 304, we should ideally return the *currently cached data*.
      // Since we don't have easy access to React Query's internal cache here *inside* the fetcher
      // (circular dependency if we import queryClient), strictly speaking,
      // we can throw a specific error or signal to React Query to keep using previous data.
      // BUT, Axios often treats 304 as success if validateStatus allows it.

      // OPTION: We rely on `apiCache` (from existing code) as our "Persistent Store" for 304 fallbacks.
      const cachedData = await apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      // If no cache but 304? Should not happen if logic is correct.
      // If it happens, we return 'undefined' or throw?
      // Let's return the response.data.data (which might be empty?).
      // Usually 304 body is empty.
      // Fallback: throw to trigger retry? No.
      throw new Error('Data unmodified but no local cache found.');
    }

    // Success (200) - Update ETag
    const newEtag = response.headers['etag'];
    if (newEtag) {
      etagCache.set(cacheKey, newEtag);
    }

    // Also update our offline cache
    apiCache.set(cacheKey, response.data.data);

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 304) {
      // Just in case axios throws on 304 despite validateStatus
      const cachedData = await apiCache.get<T>(cacheKey);
      if (cachedData) return cachedData;
    }
    throw error;
  }
}

/**
 * Fetcher that returns the FULL response body (not just .data.data).
 * Essential for endpoints with pagination metadata.
 */
export async function fetchWithCache<T>({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<T> {
  const [url, params] = queryKey as [string, Record<string, unknown>?];
  const cacheKey = apiCache.getKey(url, params);
  const existingEtag = etagCache.get(cacheKey);

  const headers: Record<string, string> = {};
  if (existingEtag) {
    headers['If-None-Match'] = existingEtag;
  }

  try {
    const response = await apiClient.get<T>(url, {
      params,
      headers,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 304,
    });

    if (response.status === 304) {
      const cachedData = await apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      throw new Error('Cache mismatch: 304 received but no local data.');
    }

    const newEtag = response.headers['etag'];
    if (newEtag) {
      etagCache.set(cacheKey, newEtag);
    }

    // Cache the FULL response data (including meta etc)
    apiCache.set(cacheKey, response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 304) {
      const cachedData = await apiCache.get<T>(cacheKey);
      if (cachedData) return cachedData;
    }
    throw error;
  }
}

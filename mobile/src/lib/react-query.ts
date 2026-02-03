import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (replaced cacheTime in v5)
      refetchOnWindowFocus: false, // React Native doesn't strictly have window focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

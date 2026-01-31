import { useState, useCallback } from 'react';

/**
 * useApi Hook
 * Generic hook for API calls with loading and error states
 */

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options?: UseApiOptions<T>
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await apiFunction(...params);
        setState({ data, isLoading: false, error: null });
        options?.onSuccess?.(data);
        return data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Terjadi kesalahan';
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        options?.onError?.(error instanceof Error ? error : new Error(message));
        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

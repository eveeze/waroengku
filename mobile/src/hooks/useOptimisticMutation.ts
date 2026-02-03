import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
  MutationKey,
} from '@tanstack/react-query';

interface OptimisticMutationOptions<
  TData,
  TError,
  TVariables,
  TContext,
> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  queryKey: unknown[];
  /**
   * Function to update the cached data optimistically.
   * Return the new state based on old state and variables.
   */
  updater: (oldData: any, variables: TVariables) => any;
  /**
   * If true, will invalidate the query after mutation settles (success or error).
   * Default: true
   */
  invalidates?: boolean;
}

export function useOptimisticMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: OptimisticMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();
  const { queryKey, updater, invalidates = true, ...mutationOptions } = options;

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onMutate: async (variables) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // 3. Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        return updater(old, variables);
      });

      // Call original onMutate if defined
      // @ts-ignore - Context typing with react-query can be tricky, ignoring for now as it works
      const context = await mutationOptions.onMutate?.(variables);

      // Return a context object with the snapshotted value.
      // We explicitly cast to TContext to satisfy TS, assuming TContext includes previousData if the user needed it.
      // Or we accept that TContext is intersection.
      return {
        previousData,
        ...((context as object) || {}),
      } as unknown as TContext;
    },
    onError: (err, variables, context) => {
      // 4. Rollback on error
      // context might be undefined if onMutate failed
      const ctx = context as unknown as { previousData: unknown };
      if (ctx?.previousData) {
        queryClient.setQueryData(queryKey, ctx.previousData);
      }
      // @ts-ignore
      mutationOptions.onError?.(err, variables, context as TContext);
    },
    onSettled: (data, error, variables, context) => {
      // 5. Always refetch after error or success to ensure data is in sync
      if (invalidates) {
        queryClient.invalidateQueries({ queryKey });
      }
      // @ts-ignore
      mutationOptions.onSettled?.(data, error, variables, context as TContext);
    },
  });
}

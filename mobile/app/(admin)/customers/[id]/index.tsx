import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { deleteCustomer } from '@/api/endpoints/customers';
import { Button, Loading } from '@/components/ui';
import { Customer, KasbonSummary, ApiResponse } from '@/api/types';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: isLoadingCustomer,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: [`/customers/${id}`],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<Customer>>({ queryKey }),
    enabled: !!id,
    initialData: () => {
      // Find in infinite query cache
      const queries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['/customers'] });
      for (const query of queries) {
        const state = query.state.data as any; // InfiniteData<PaginatedResponse<Customer>>
        if (state?.pages) {
          for (const page of state.pages) {
            const found = page.data.find((c: Customer) => c.id === id);
            if (found) return { success: true, data: found };
          }
        }
      }
      return undefined;
    },
  });

  const customer = response?.data;

  const {
    data: kasbonSummaryResponse,
    isLoading: isLoadingKasbon,
    refetch: refetchKasbon,
  } = useQuery({
    queryKey: [`/kasbon/customers/${id}/summary`],
    queryFn: ({ queryKey }) => fetchWithCache<any>({ queryKey }),
    enabled: !!id,
  });

  const kasbonSummary = kasbonSummaryResponse?.data as
    | KasbonSummary
    | undefined;

  const isLoading = isLoadingCustomer || isLoadingKasbon;

  const handleRefresh = () => {
    refetchCustomer();
    refetchKasbon();
  };

  const { mutate: mutateDelete } = useMutation({
    mutationFn: async () => deleteCustomer(id!),
    onSuccess: async () => {
      // 1. Clear physical async storage cache ONLY for customers
      try {
        const { apiCache } = await import('@/utils/cache');
        await apiCache.clearByPrefix('/customers');
      } catch (e) {
        // ignore
      }

      // 2. Optimistic Update directly on onSuccess (Scenario A)
      // This strictly removes the deleted ID from the React Query memory
      queryClient.setQueriesData(
        { queryKey: ['/customers'] },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter(
                (c: Customer) => String(c.id) !== String(id),
              ),
            })),
          };
        },
      );

      // 3. Remove the detail query for this specific customer so it doesn't linger
      queryClient.removeQueries({ queryKey: ['/customers', id] });

      // Navigate back
      router.back();
      setTimeout(() => {
        Alert.alert('SUCCESS', 'Customer deleted successfully');
      }, 100);
    },
    onError: (err: Error) => {
      Alert.alert('ERROR', err.message || 'Failed to delete customer');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'DELETE ITEM',
      `Are you sure you want to delete "${customer?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => mutateDelete(undefined),
        },
      ],
    );
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  if (isLoading && !customer) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loading />
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text>Customer not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const hasDebt = (customer.current_debt || 0) > 0;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Swiss Header */}
      <View
        className="px-6 pb-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ← Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/(admin)/customers/${id}/edit`)}
            className="bg-muted px-3 py-1.5 rounded-full"
          >
            <Text className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              EDIT
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground leading-tight">
          {customer.name}
        </Text>
        <Text className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-wide">
          {customer.phone || 'No Phone'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Debt Card */}
        <View
          className={`p-6 rounded-none mb-8 border ${hasDebt ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-muted border-border'}`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-widest mb-1 ${hasDebt ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            Outstanding Debt (Kasbon)
          </Text>
          <Text
            className={`text-3xl font-black tracking-tighter ${hasDebt ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}
          >
            {formatCurrency(kasbonSummary?.current_balance || 0)}
          </Text>
          <View className="mt-4 pt-4 border-t border-border dark:border-red-900/30">
            <View className="flex-row justify-between mb-1">
              <Text className="text-muted-foreground text-xs font-bold uppercase">
                Limit
              </Text>
              <Text className="font-bold text-foreground">
                {formatCurrency(kasbonSummary?.credit_limit || 0)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground text-xs font-bold uppercase">
                Remaining
              </Text>
              <Text className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(kasbonSummary?.remaining_credit || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="mb-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Details
          </Text>
          <View className="mb-4">
            <Text className="text-xs text-muted-foreground font-bold uppercase mb-1">
              Address
            </Text>
            <Text className="text-base font-bold text-foreground">
              {customer.address || '-'}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted-foreground font-bold uppercase mb-1">
              Notes
            </Text>
            <Text className="text-base font-bold text-foreground">
              {customer.notes || '-'}
            </Text>
          </View>
        </View>

        {/* Actions - Kasbon Related */}
        <View className="gap-3">
          <Button
            title="KASBON HISTORY"
            variant="outline"
            fullWidth
            onPress={() => router.push(`/(admin)/customers/${id}/kasbon`)}
          />
          <View className="h-2" />
          <Button
            title="TRANSACTION HISTORY"
            variant="outline"
            fullWidth
            onPress={() => router.push(`/(admin)/customers/${id}/transactions`)}
          />
          {hasDebt && (
            <Button
              title="RECORD PAYMENT"
              fullWidth
              onPress={() => router.push(`/(admin)/customers/${id}/payment`)}
            />
          )}
          <View className="h-4" />
          <Button
            title="DELETE CUSTOMER"
            variant="danger"
            fullWidth
            onPress={handleDelete}
          />
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

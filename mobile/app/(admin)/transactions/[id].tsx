import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import {
  cancelTransaction,
  generateSnapToken,
  manualVerifyPayment,
} from '@/api/endpoints';
import { Transaction, PaginatedResponse, TransactionItem } from '@/api/types';
import { Button, Loading } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    data: transaction,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`/transactions/${id}`],
    queryFn: async ({ queryKey }) => {
      const result = await fetchWithCache<{ data: Transaction }>({ queryKey });
      return result.data;
    },
    enabled: !!id,
    initialData: () => {
      // Search in infinite query cache
      const queries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['/transactions'] });
      for (const query of queries) {
        const state = query.state.data as any; // InfiniteData<PaginatedResponse>
        if (state?.pages) {
          for (const page of state.pages) {
            const found = page.data.find((t: Transaction) => t.id === id);
            if (found) return found;
          }
        }
      }
      return undefined;
    },
  });

  // Optimistic Cancel
  const { mutate: mutateCancel, isPending: isCancelling } =
    useOptimisticMutation(async () => cancelTransaction(id!), {
      queryKey: [`/transactions/${id}`],
      updater: (old: Transaction | undefined) => {
        if (!old) return old;
        return { ...old, status: 'cancelled' };
      },
      onSuccess: () => {
        Alert.alert('SUCCESS', 'Transaction cancelled.');
        queryClient.invalidateQueries({ queryKey: ['/transactions'] }); // Invalidate list
      },
      onError: (err: Error) => Alert.alert('FAILED', err.message),
    });

  // Retry Payment (Not optimistic usually, as it returns a token)
  // We'll keep standard logic for this
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetryPayment = async () => {
    if (!transaction) return;
    setIsRetrying(true);
    try {
      // Assuming generateSnapToken is an async function returning { redirect_url ... }
      // Ideally we should import useApi or just call it directly since we don't need caching for this action
      // But standard way is to just call the function.
      const token = await generateSnapToken({
        order_id: transaction.invoice_number,
        gross_amount: transaction.total_amount,
      });

      if (token && token.redirect_url) {
        Linking.openURL(token.redirect_url);
      } else {
        Alert.alert('Error', 'Could not generate payment link');
      }
    } catch {
      Alert.alert('Error', 'Failed to initiate payment');
    } finally {
      setIsRetrying(false);
    }
  };

  // Manual Verify (Optimistic?)
  // Yes, we can optimistically update status to 'settlement' (completed)
  const { mutate: mutateVerify, isPending: isVerifying } =
    useOptimisticMutation(
      async (notes: string) => manualVerifyPayment(id!, { notes }),
      {
        queryKey: [`/transactions/${id}`],
        updater: (old: Transaction | undefined) => {
          if (!old) return old;
          return { ...old, status: 'completed' }; // settlement maps to completed usually
        },
        onSuccess: () => {
          Alert.alert('Success', 'Payment verified manually.');
          queryClient.invalidateQueries({ queryKey: ['/transactions'] });
        },
        onError: (err: Error) =>
          Alert.alert('Error', 'Failed to verify payment.'),
      },
    );

  const handleManualVerify = () => {
    Alert.prompt(
      'MANUAL VERIFY',
      'Enter notes/ref number for verification:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: (notes?: string) =>
            mutateVerify(notes || 'Manual verification by admin'),
        },
      ],
      'plain-text',
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'VOID TRANSACTION',
      'This will return items to stock. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Void',
          style: 'destructive',
          onPress: () => mutateCancel(),
        },
      ],
    );
  };

  if (isLoading && !transaction) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Loading message="Fetching Receipt..." />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Transaction not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const formatCurrency = (amount: number | string | undefined | null) => {
    const value = parseFloat(String(amount || 0));
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(isNaN(value) ? 0 : value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          RECEIPT
        </Text>
        <Text className="text-secondary-400 font-bold uppercase tracking-widest text-xs mt-1">
          #{transaction.invoice_number}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Status Badge */}
        <View className="flex-row justify-between items-center mb-8 border-b border-black pb-4">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500 mb-1">
              Date
            </Text>
            <Text className="text-sm font-bold text-primary-900">
              {formatDate(transaction.created_at)}
            </Text>
          </View>
          <View
            className={`px-3 py-1 border ${
              transaction.status === 'completed'
                ? 'bg-black border-black'
                : transaction.status === 'cancelled'
                  ? 'bg-white border-red-600'
                  : 'bg-white border-orange-500'
            }`}
          >
            <Text
              className={`text-xs font-black uppercase tracking-widest ${
                transaction.status === 'completed'
                  ? 'text-white'
                  : transaction.status === 'cancelled'
                    ? 'text-red-600'
                    : 'text-orange-500'
              }`}
            >
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View className="mb-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-900 mb-4">
            Purchased Items
          </Text>

          {transaction.items &&
            transaction.items.map((item: TransactionItem, index: number) => (
              <View
                key={index}
                className="flex-row justify-between py-3 border-b border-secondary-100 last:border-0"
              >
                <View className="flex-1 pr-4">
                  <Text className="font-bold text-primary-900 text-sm uppercase mb-1">
                    {item.product_name}
                  </Text>
                  <Text className="text-xs text-secondary-500 font-medium">
                    {item.quantity} {item.unit} x{' '}
                    {formatCurrency(item.unit_price || 0)}
                  </Text>
                </View>
                <Text className="font-bold text-primary-900 text-sm">
                  {formatCurrency(item.total_amount || 0)}
                </Text>
              </View>
            ))}
        </View>

        {/* Totals Section */}
        <View className="bg-secondary-50 p-6 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider">
              Subtotal
            </Text>
            <Text className="text-primary-900 font-bold text-sm">
              {formatCurrency(transaction.subtotal)}
            </Text>
          </View>

          {transaction.discount_amount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider">
                Discount
              </Text>
              <Text className="text-primary-900 font-bold text-sm">
                -{formatCurrency(transaction.discount_amount)}
              </Text>
            </View>
          )}

          {transaction.tax_amount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider">
                Tax
              </Text>
              <Text className="text-primary-900 font-bold text-sm">
                {formatCurrency(transaction.tax_amount)}
              </Text>
            </View>
          )}

          <View className="border-t border-secondary-200 my-4 pt-4 flex-row justify-between items-center">
            <Text className="text-lg font-black text-primary-900 uppercase tracking-tighter">
              Total
            </Text>
            <Text className="text-2xl font-black text-black">
              {formatCurrency(transaction.total_amount)}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider">
              Payment Method
            </Text>
            <Text className="text-primary-900 font-bold text-xs uppercase">
              {transaction.payment_method}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider">
              Cashier
            </Text>
            <Text className="text-primary-900 font-bold text-xs uppercase">
              {transaction.cashier_name || 'System'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          {transaction.status === 'pending' && (
            <>
              {/* Retry Online Payment */}
              {(transaction.payment_method === 'qris' ||
                transaction.payment_method === 'transfer') && (
                <Button
                  title="RETRY PAYMENT"
                  onPress={handleRetryPayment}
                  isLoading={isRetrying}
                />
              )}

              {/* Manual Verify */}
              <Button
                title="MANUAL VERIFY (ADMIN)"
                variant="outline"
                onPress={handleManualVerify}
                isLoading={isVerifying}
              />
            </>
          )}

          {transaction.status === 'completed' && (
            <View className="">
              <Button
                title="VOID TRANSACTION"
                variant="outline"
                className="border-red-600"
                textClassName="text-red-600"
                onPress={handleCancel}
                isLoading={isCancelling}
              />
              <Text className="text-center text-[10px] text-secondary-400 mt-3 font-bold uppercase tracking-widest">
                Authentication Required for Voiding
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

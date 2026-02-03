import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { recordKasbonPayment, getKasbonSummary } from '@/api/endpoints/kasbon';
import { getCustomerById } from '@/api/endpoints/customers';
import { Button, Loading } from '@/components/ui';
import { Customer, KasbonSummary } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';

export default function RecordPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { data: customer } = useQuery({
    queryKey: [`/customers/${id}`],
    queryFn: ({ queryKey }) => fetchWithCache<Customer>({ queryKey }),
    enabled: !!id,
  });

  const { data: summary } = useQuery({
    queryKey: [`/kasbon/customers/${id}/summary`],
    queryFn: ({ queryKey }) => fetchWithCache<KasbonSummary>({ queryKey }),
    enabled: !!id,
  });

  const { mutate: mutatePayment, isPending } = useOptimisticMutation(
    async (payAmount: number) =>
      recordKasbonPayment(id!, {
        amount: payAmount,
        notes: notes || undefined,
        created_by: 'App User', // Should come from auth store ideally
      }),
    {
      queryKey: [`/kasbon/customers/${id}/summary`], // Update summary immediately?
      // Also invalidate history
      invalidates: true,
      // additionalInvalidations removed as it's not supported.
      // We use queryClient.invalidateQueries in onSuccess instead.
      updater: (old: KasbonSummary | undefined, payAmount: number) => {
        if (!old) return old;
        return {
          ...old,
          current_balance: old.current_balance - payAmount,
          remaining_credit: old.remaining_credit + payAmount, // Assuming limit static
          total_payment: (old.total_payment || 0) + payAmount,
        };
      },
      onSuccess: () => {
        // Invalidate other related queries
        queryClient.invalidateQueries({
          queryKey: [`/kasbon/customers/${id}/history`],
        });
        queryClient.invalidateQueries({ queryKey: [`/customers/${id}`] });
        queryClient.invalidateQueries({ queryKey: ['/customers'] });

        Alert.alert('SUCCESS', 'Payment recorded successfully');
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('ERROR', err.message || 'Failed to record payment');
      },
    },
  );

  const handleSubmit = () => {
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    if (summary && amountNum > summary.current_balance) {
      Alert.alert(
        'WARNING',
        `Payment exceeds debt ${formatCurrency(summary.current_balance)}. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Pay Anyway', onPress: () => mutatePayment(amountNum) },
        ],
      );
      return;
    }

    mutatePayment(amountNum);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const setFullPayment = () => {
    if (summary) {
      setAmount(String(summary.current_balance));
    }
  };

  if (!customer || !summary) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Loading />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Swiss Header */}
      <View
        className="px-6 pb-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          PAY DEBT
        </Text>
        <Text className="text-secondary-500 text-xs font-bold mt-1 uppercase tracking-wide">
          {customer.name}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View className="bg-secondary-50 p-6 mb-8 border border-secondary-100">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
              Current Outstanding
            </Text>
            <Text className="text-4xl font-black text-red-600 tracking-tighter">
              {formatCurrency(summary.current_balance)}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
              Payment Amount
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 border border-secondary-200 p-4">
                <TextInput
                  className="font-black text-2xl text-primary-900"
                  placeholder="0"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              <TouchableOpacity
                onPress={setFullPayment}
                className="bg-black px-4 py-4 justify-center"
              >
                <Text className="text-white font-bold uppercase tracking-widest text-xs">
                  Full
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
              Notes (Optional)
            </Text>
            <TextInput
              className="border border-secondary-200 p-4 font-bold text-primary-900 h-24"
              multiline
              textAlignVertical="top"
              placeholder="e.g. Bank Transfer"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <Button
            title="CONFIRM PAYMENT"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            isLoading={isPending}
            disabled={!amount || Number(amount) <= 0}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

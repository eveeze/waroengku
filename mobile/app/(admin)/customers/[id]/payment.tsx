import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import { recordKasbonPayment, getKasbonSummary } from '@/api/endpoints/kasbon';
import { getCustomerById } from '@/api/endpoints/customers';
import { useApi } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/authStore';
import { Customer, KasbonSummary } from '@/api/types';

/**
 * Record Payment Screen
 */
export default function RecordPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [summary, setSummary] = useState<KasbonSummary | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading, execute: fetchCustomer } = useApi(() => getCustomerById(id!));
  const { execute: fetchSummary } = useApi(() => getKasbonSummary(id!));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cust, sum] = await Promise.all([fetchCustomer(), fetchSummary()]);
    if (cust) setCustomer(cust);
    if (sum) setSummary(sum);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async () => {
    const amountNum = Number(amount);

    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Masukkan jumlah pembayaran yang valid');
      return;
    }

    if (summary && amountNum > summary.current_balance) {
      Alert.alert(
        'Peringatan',
        `Pembayaran melebihi hutang. Hutang saat ini: ${formatCurrency(
          summary.current_balance
        )}`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Lanjutkan',
            onPress: () => submitPayment(amountNum),
          },
        ]
      );
      return;
    }

    await submitPayment(amountNum);
  };

  const submitPayment = async (amountNum: number) => {
    try {
      setIsSubmitting(true);

      await recordKasbonPayment(id!, {
        amount: amountNum,
        notes: notes || undefined,
        created_by: user?.name || 'System',
      });

      Alert.alert('Berhasil', 'Pembayaran berhasil dicatat', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal mencatat pembayaran'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setFullPayment = () => {
    if (summary) {
      setAmount(String(summary.current_balance));
    }
  };

  if (isLoading && !customer) {
    return <Loading fullScreen message="Memuat..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Catat Pembayaran" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Customer Info */}
          {customer && summary && (
            <Card className="mb-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-2xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-secondary-900">
                    {customer.name}
                  </Text>
                  <Text className="text-sm text-secondary-500">
                    {customer.phone || 'No phone'}
                  </Text>
                </View>
              </View>

              <View className="mt-4 bg-danger-50 rounded-lg p-4">
                <Text className="text-center text-secondary-500 mb-1">
                  Total Hutang Saat Ini
                </Text>
                <Text className="text-center text-2xl font-bold text-danger-600">
                  {formatCurrency(summary.current_balance)}
                </Text>
              </View>
            </Card>
          )}

          {/* Payment Form */}
          <Card title="Detail Pembayaran" className="mb-4">
            <View className="mb-4">
              <Text className="text-sm font-medium text-secondary-700 mb-2">
                Jumlah Pembayaran *
              </Text>
              <View className="flex-row items-center">
                <View className="flex-1 flex-row items-center bg-white border border-secondary-300 rounded-lg px-4 mr-2">
                  <Text className="text-secondary-400 mr-2">Rp</Text>
                  <TextInput
                    className="flex-1 py-3 text-lg font-semibold"
                    placeholder="0"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />
                </View>
                <Button
                  title="Lunas"
                  size="sm"
                  variant="outline"
                  onPress={setFullPayment}
                />
              </View>
              {amount && (
                <Text className="text-sm text-secondary-500 mt-2">
                  Terbilang: {formatCurrency(Number(amount) || 0)}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-secondary-700 mb-2">
                Catatan
              </Text>
              <TextInput
                className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                placeholder="cth: Bayar via transfer BCA"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          </Card>

          {/* Summary Preview */}
          {summary && amount && (
            <Card title="Ringkasan" className="mb-4">
              <View className="flex-row justify-between items-center py-2 border-b border-secondary-100">
                <Text className="text-secondary-500">Hutang Saat Ini</Text>
                <Text className="text-danger-600">
                  {formatCurrency(summary.current_balance)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-b border-secondary-100">
                <Text className="text-secondary-500">Pembayaran</Text>
                <Text className="text-green-600 font-medium">
                  - {formatCurrency(Number(amount) || 0)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-secondary-700 font-medium">Sisa Hutang</Text>
                <Text className="text-xl font-bold text-secondary-900">
                  {formatCurrency(
                    Math.max(0, summary.current_balance - (Number(amount) || 0))
                  )}
                </Text>
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-4 py-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            title="Simpan Pembayaran"
            fullWidth
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={!amount || Number(amount) <= 0}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

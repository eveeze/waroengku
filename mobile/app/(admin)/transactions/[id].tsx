import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getTransaction, cancelTransaction } from '@/api/endpoints';
import { Transaction } from '@/api/types';
import { Header } from '@/components/shared';
import { Card, Button, Loading } from '@/components/ui';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const { isLoading, execute: fetchTransaction } = useApi(() =>
    getTransaction(id!),
  );
  const { isLoading: isCancelling, execute: doCancel } = useApi(() =>
    cancelTransaction(id!),
  );

  useEffect(() => {
    if (id) {
      fetchTransaction().then((data) => {
        if (data) setTransaction(data);
      });
    }
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Batalkan Transaksi', 'Stok akan dikembalikan. Lanjutkan?', [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Ya, Batalkan',
        style: 'destructive',
        onPress: async () => {
          try {
            await doCancel();
            Alert.alert('Sukses', 'Transaksi dibatalkan');
            router.back();
          } catch (err) {
            Alert.alert('Gagal', (err as Error).message);
          }
        },
      },
    ]);
  };

  if (isLoading || !transaction) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header title="Detail Transaksi" onBack={() => router.back()} />
        <Loading message="Memuat detail..." />
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Detail Transaksi" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Status Card */}
        <Card className="mb-4">
          <View className="items-center mb-2">
            <Text className="text-secondary-500 font-medium">Invoice</Text>
            <Text className="text-xl font-bold text-secondary-900">
              {transaction.invoice_number}
            </Text>
          </View>
          <View className="bg-secondary-100 p-3 rounded-lg flex-row justify-between items-center">
            <Text className="text-secondary-600">Status</Text>
            <Text
              className={`font-bold capitalize ${
                transaction.status === 'completed'
                  ? 'text-green-600'
                  : transaction.status === 'cancelled'
                    ? 'text-red-600'
                    : 'text-orange-600'
              }`}
            >
              {transaction.status}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2 px-1">
            <Text className="text-secondary-500 text-xs">Tanggal</Text>
            <Text className="text-secondary-700 text-xs">
              {formatDate(transaction.created_at)}
            </Text>
          </View>
          <View className="flex-row justify-between mt-1 px-1">
            <Text className="text-secondary-500 text-xs">Kasir</Text>
            <Text className="text-secondary-700 text-xs">
              {transaction.cashier_name || '-'}
            </Text>
          </View>
        </Card>

        {/* Items */}
        <Card title="Daftar Item" className="mb-4">
          {transaction.items.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between py-2 border-b border-secondary-100 last:border-0"
            >
              <View className="flex-1">
                <Text className="font-medium text-secondary-900">
                  {item.product_name}
                </Text>
                <Text className="text-xs text-secondary-500 text-right">
                  {item.quantity} {item.unit} x{' '}
                  {formatCurrency(item.unit_price || 0)}
                </Text>
              </View>
              <Text className="font-bold text-secondary-900 ml-4">
                {formatCurrency(item.subtotal || 0)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Payment Details */}
        <Card title="Rincian Pembayaran" className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-secondary-600">Subtotal</Text>
            <Text className="text-secondary-900 font-medium">
              {formatCurrency(transaction.total_amount)}
            </Text>
          </View>
          {transaction.discount_amount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-green-600">Diskon</Text>
              <Text className="text-green-600 font-medium">
                -{formatCurrency(transaction.discount_amount)}
              </Text>
            </View>
          )}
          {transaction.tax_amount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-secondary-600">Pajak</Text>
              <Text className="text-secondary-900 font-medium">
                {formatCurrency(transaction.tax_amount)}
              </Text>
            </View>
          )}
          <View className="border-t border-secondary-200 my-2 pt-2 flex-row justify-between">
            <Text className="text-lg font-bold text-secondary-900">Total</Text>
            <Text className="text-lg font-bold text-primary-700">
              {formatCurrency(transaction.final_amount)}
            </Text>
          </View>

          <View className="bg-secondary-50 p-3 rounded mt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-secondary-500 text-xs">
                Metode Pembayaran
              </Text>
              <Text className="text-secondary-900 font-medium capitalize">
                {transaction.payment_method}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-secondary-500 text-xs">Uang Diterima</Text>
              <Text className="text-secondary-900 font-medium">
                {formatCurrency(transaction.amount_paid)}
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-secondary-500 text-xs">Kembalian</Text>
              <Text className="text-secondary-900 font-medium">
                {formatCurrency(transaction.change_amount)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        {transaction.status === 'completed' && (
          <Button
            title="Batalkan Transaksi"
            variant="outline"
            className="border-danger-200"
            textClassName="text-danger-500"
            onPress={handleCancel}
            loading={isCancelling}
          />
        )}
      </ScrollView>
    </View>
  );
}

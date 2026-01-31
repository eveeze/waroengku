import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getCustomerById, deleteCustomer } from '@/api/endpoints/customers';
import { getKasbonSummary } from '@/api/endpoints/kasbon';
import { Header } from '@/components/shared';
import { Card, Button, Loading } from '@/components/ui';
import { Customer, KasbonSummary } from '@/api/types';

/**
 * Customer Detail Screen
 */
export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [kasbonSummary, setKasbonSummary] = useState<KasbonSummary | null>(null);

  const { isLoading, execute: fetchCustomer } = useApi(() =>
    getCustomerById(id!)
  );
  const { execute: fetchKasbon } = useApi(() => getKasbonSummary(id!));

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const [cust, kasbon] = await Promise.all([fetchCustomer(), fetchKasbon()]);
    if (cust) setCustomer(cust);
    if (kasbon) setKasbonSummary(kasbon);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = () => {
    Alert.alert('Hapus Pelanggan', `Yakin ingin menghapus "${customer?.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCustomer(id!);
            Alert.alert('Berhasil', 'Pelanggan berhasil dihapus');
            router.back();
          } catch (err) {
            Alert.alert(
              'Gagal',
              err instanceof Error ? err.message : 'Gagal menghapus pelanggan'
            );
          }
        },
      },
    ]);
  };

  if (isLoading && !customer) {
    return <Loading fullScreen message="Memuat..." />;
  }

  if (!customer) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="text-secondary-500">Pelanggan tidak ditemukan</Text>
        <Button
          title="Kembali"
          variant="outline"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    );
  }

  const hasDebt = customer.current_balance > 0;

  return (
    <View className="flex-1 bg-secondary-50">
      <Header
        title="Detail Pelanggan"
        onBack={() => router.back()}
        actions={[
          {
            icon: '✏️',
            onPress: () => router.push(`/(admin)/customers/${id}/edit`),
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
      >
        {/* Customer Info */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mr-4">
              <Text className="text-3xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-secondary-900">
                {customer.name}
              </Text>
              {customer.phone && (
                <TouchableOpacity>
                  <Text className="text-primary-600">{customer.phone}</Text>
                </TouchableOpacity>
              )}
              <View
                className={`self-start px-2 py-0.5 rounded-full mt-1 ${
                  customer.is_active ? 'bg-green-100' : 'bg-secondary-100'
                }`}
              >
                <Text
                  className={`text-xs ${
                    customer.is_active ? 'text-green-700' : 'text-secondary-500'
                  }`}
                >
                  {customer.is_active ? '● Aktif' : '○ Nonaktif'}
                </Text>
              </View>
            </View>
          </View>

          {customer.address && (
            <View className="bg-secondary-50 rounded-lg p-3">
              <Text className="text-sm text-secondary-500 mb-1">📍 Alamat</Text>
              <Text className="text-secondary-900">{customer.address}</Text>
            </View>
          )}

          {customer.notes && (
            <View className="bg-secondary-50 rounded-lg p-3 mt-2">
              <Text className="text-sm text-secondary-500 mb-1">📝 Catatan</Text>
              <Text className="text-secondary-900">{customer.notes}</Text>
            </View>
          )}
        </Card>

        {/* Kasbon Summary */}
        <Card title="Ringkasan Kasbon" className="mb-4">
          {kasbonSummary ? (
            <>
              <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
                <Text className="text-secondary-500">Total Hutang</Text>
                <Text className="text-xl font-bold text-danger-600">
                  {formatCurrency(kasbonSummary.current_balance)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
                <Text className="text-secondary-500">Limit Kredit</Text>
                <Text className="text-base text-secondary-700">
                  {formatCurrency(kasbonSummary.credit_limit)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3 border-b border-secondary-100">
                <Text className="text-secondary-500">Sisa Limit</Text>
                <Text
                  className={`text-base font-medium ${
                    kasbonSummary.remaining_credit > 0
                      ? 'text-green-600'
                      : 'text-danger-600'
                  }`}
                >
                  {formatCurrency(kasbonSummary.remaining_credit)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-secondary-500">Total Pembayaran</Text>
                <Text className="text-base text-green-600">
                  {formatCurrency(kasbonSummary.total_payment)}
                </Text>
              </View>

              {/* Quick Actions */}
              <View className="flex-row mt-4">
                <Button
                  title="Riwayat"
                  variant="outline"
                  size="small"
                  onPress={() => router.push(`/(admin)/customers/${id}/kasbon`)}
                  className="flex-1 mr-2"
                />
                {hasDebt && (
                  <Button
                    title="Bayar"
                    size="small"
                    onPress={() => router.push(`/(admin)/customers/${id}/payment`)}
                    className="flex-1 ml-2"
                  />
                )}
              </View>
            </>
          ) : (
            <View className="items-center py-4">
              <Text className="text-secondary-500">Tidak ada data kasbon</Text>
            </View>
          )}
        </Card>

        {/* Actions */}
        <View className="space-y-3">
          <Button
            title="Lihat Riwayat Kasbon"
            variant="primary"
            fullWidth
            onPress={() => router.push(`/(admin)/customers/${id}/kasbon`)}
          />
          {hasDebt && (
            <Button
              title="Catat Pembayaran"
              variant="outline"
              fullWidth
              onPress={() => router.push(`/(admin)/customers/${id}/payment`)}
              className="mt-3"
            />
          )}
          <Button
            title="Hapus Pelanggan"
            variant="danger"
            fullWidth
            onPress={handleDelete}
            className="mt-3"
          />
        </View>
      </ScrollView>
    </View>
  );
}

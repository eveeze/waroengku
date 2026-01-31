import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getKasbonReport } from '@/api/endpoints/reports';
import { Header } from '@/components/shared';
import { Card, Loading } from '@/components/ui';
import { KasbonCustomerSummary } from '@/api/types';

/**
 * Kasbon Report Screen
 * Shows customer debt summary
 */
export default function KasbonReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: report,
    isLoading,
    error,
    execute: fetchReport,
  } = useApi(getKasbonReport);

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderCustomer = ({ item }: { item: KasbonCustomerSummary }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/customers/${item.customer_id}`)}
      className="mb-3"
    >
      <Card>
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
            <Text className="text-lg">👤</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-secondary-900">
              {item.customer_name}
            </Text>
            {item.phone && (
              <Text className="text-sm text-secondary-500">{item.phone}</Text>
            )}
            <Text className="text-xs text-secondary-400 mt-0.5">
              Terakhir: {formatDate(item.last_transaction_date)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-bold text-red-600">
              {formatCurrency(item.total_debt)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && !report) {
    return <Loading fullScreen message="Memuat laporan..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Laporan Kasbon" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchReport} />
        }
      >
        {error && (
          <View className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-danger-700">
              Gagal memuat laporan: {error}
            </Text>
          </View>
        )}

        {report && (
          <>
            {/* Summary Stats */}
            <Card className="mb-4 bg-red-50 border-red-100">
              <View className="items-center py-2">
                <Text className="text-red-600 text-sm">Total Piutang</Text>
                <Text className="text-3xl font-bold text-red-800 mt-1">
                  {formatCurrency(report.total_outstanding)}
                </Text>
              </View>
            </Card>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Card>
                  <View className="items-center">
                    <Text className="text-secondary-500 text-sm">
                      Total Pelanggan
                    </Text>
                    <Text className="text-2xl font-bold text-secondary-900 mt-1">
                      {report.total_customers}
                    </Text>
                  </View>
                </Card>
              </View>
              <View className="flex-1 ml-2">
                <Card className="bg-orange-50 border-orange-100">
                  <View className="items-center">
                    <Text className="text-orange-600 text-sm">
                      Dengan Hutang
                    </Text>
                    <Text className="text-2xl font-bold text-orange-800 mt-1">
                      {report.customers_with_debt}
                    </Text>
                  </View>
                </Card>
              </View>
            </View>

            {/* Customer List */}
            <Text className="text-lg font-semibold text-secondary-900 mb-3">
              Pelanggan dengan Hutang
            </Text>

            {report.summaries && report.summaries.length > 0 ? (
              report.summaries
                .sort((a, b) => b.total_debt - a.total_debt)
                .map((customer) => (
                  <View key={customer.customer_id}>
                    {renderCustomer({ item: customer })}
                  </View>
                ))
            ) : (
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">🎉</Text>
                <Text className="text-secondary-500 text-lg">
                  Semua pelanggan lunas!
                </Text>
                <Text className="text-secondary-400 mt-1">
                  Tidak ada piutang yang belum dibayar
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

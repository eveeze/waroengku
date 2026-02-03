import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import {
  KasbonCustomerSummary,
  KasbonReportData,
  ApiResponse,
} from '@/api/types';
import { Loading } from '@/components/ui';

export default function KasbonReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: response,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['/reports/kasbon'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<KasbonReportData>>({ queryKey }),
  });

  const report = response?.data;

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
      className="mb-0 border-b border-secondary-100 bg-white active:bg-secondary-50"
    >
      <View className="flex-row items-center p-4">
        <View className="flex-1">
          <Text className="text-base font-bold text-primary-900 uppercase tracking-tight">
            {item.customer_name}
          </Text>
          <Text className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider mt-1">
            Last Tx: {formatDate(item.last_transaction_date)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-black text-red-600">
            {formatCurrency(item.total_debt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          RECEIVABLES
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#000"
          />
        }
      >
        {error && (
          <View className="bg-black p-4 mb-6 mx-6 mt-6">
            <Text className="text-white font-bold uppercase tracking-wide text-xs">
              Error loading kasbon report
            </Text>
          </View>
        )}

        {report && (
          <>
            {/* Summary Stats */}
            <View className="p-6 bg-secondary-50 border-b border-secondary-100">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500 mb-2">
                Total Outstanding Debt
              </Text>
              <Text className="text-4xl font-black text-red-600 mb-6">
                {formatCurrency(report.total_outstanding)}
              </Text>

              <View className="flex-row items-center space-x-8">
                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500">
                    Total Customers
                  </Text>
                  <Text className="text-xl font-bold text-primary-900">
                    {report.total_customers}
                  </Text>
                </View>
                <View className="ml-8">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-500">
                    With Debt
                  </Text>
                  <Text className="text-xl font-bold text-red-600">
                    {report.customers_with_debt}
                  </Text>
                </View>
              </View>
            </View>

            {/* Customer List Header */}
            <View className="px-6 py-4 bg-white border-b border-secondary-100 mt-2">
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-900">
                Debtor List
              </Text>
            </View>

            {report.summaries && report.summaries.length > 0 ? (
              report.summaries
                .sort((a, b) => b.total_debt - a.total_debt)
                .map((customer) => (
                  <View key={customer.customer_id}>
                    {renderCustomer({ item: customer })}
                  </View>
                ))
            ) : (
              <View className="items-center py-20 px-10">
                <Text className="text-secondary-300 font-black text-6xl mb-4">
                  🎉
                </Text>
                <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
                  All Clear!
                </Text>
                <Text className="text-secondary-500 text-center text-sm">
                  No outstanding debts from customers.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

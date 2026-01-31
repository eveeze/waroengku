import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getTransactions } from '@/api/endpoints';
import { Transaction, TransactionListParams } from '@/api/types';
import { Header, EmptyState } from '@/components/shared';
import { Card, Loading } from '@/components/ui';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { isLoading, execute: fetchTransactions } = useApi(
    (params: TransactionListParams) => getTransactions(params),
  );

  const loadTransactions = useCallback(async (pageNum = 1, append = false) => {
    try {
      const result = await fetchTransactions({ page: pageNum, per_page: 20 });
      if (result) {
        if (append) {
          setTransactions((prev) => [...prev, ...result.data]);
        } else {
          setTransactions(result.data);
        }
        setHasMore(pageNum < result.meta.total_pages);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-secondary-600 bg-secondary-50';
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/transactions/${item.id}`)}
    >
      <Card className="mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="font-bold text-secondary-900">
              {item.invoice_number}
            </Text>
            <Text className="text-secondary-500 text-xs">
              {formatDate(item.created_at)}
            </Text>
          </View>
          <Text
            className={`text-xs px-2 py-1 rounded font-medium capitalize ${getStatusColor(item.status)}`}
          >
            {item.status}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-secondary-600 text-sm">
              {item.customer_name || 'Pelanggan Umum'}
            </Text>
            <Text className="text-xs text-secondary-400 capitalize">
              {item.payment_method}
            </Text>
          </View>
          <Text className="font-bold text-primary-700 text-lg">
            {formatCurrency(item.final_amount)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Riwayat Transaksi" onBack={() => router.back()} />

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="Belum ada transaksi"
              message="Transaksi penjualan akan muncul di sini"
            />
          ) : null
        }
        ListFooterComponent={isLoading ? <Loading message="" /> : null}
        onEndReached={() => {
          if (!isLoading && hasMore) {
            setPage((p) => p + 1);
            loadTransactions(page + 1, true);
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={() => {
              setPage(1);
              loadTransactions(1, false);
            }}
          />
        }
      />
    </View>
  );
}

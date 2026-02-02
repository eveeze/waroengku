import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getTransactions } from '@/api/endpoints';
import { Transaction, TransactionListParams } from '@/api/types';
import { Loading } from '@/components/ui';

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
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-secondary-600';
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/transactions/${item.id}`)}
      className="border-b border-secondary-100 bg-white active:bg-secondary-50"
    >
      <View className="px-6 py-5 flex-row justify-between items-center">
        <View>
          <Text className="font-heading font-bold text-primary-900 uppercase tracking-tight text-base mb-1">
            {item.invoice_number}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-secondary-500 font-bold uppercase tracking-wider mr-2 font-body">
              {formatDate(item.created_at)} • {formatTime(item.created_at)}
            </Text>
            <Text className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest font-body">
              | {item.payment_method}
            </Text>
          </View>
          <Text className="text-secondary-600 text-xs mt-1 font-medium font-body">
            {item.customer_name || 'Guest Customer'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-heading font-black text-primary-900 text-lg tracking-tight">
            {formatCurrency(item.final_amount)}
          </Text>
          <Text
            className={`text-[10px] font-bold uppercase tracking-widest mt-1 font-body ${getStatusStyle(item.status)}`}
          >
            {item.status}
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
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 font-body">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-black">
          HISTORY
        </Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 opacity-50">
              <Text className="text-6xl mb-4">📜</Text>
              <Text className="text-lg font-bold uppercase tracking-widest text-secondary-900">
                No Transactions
              </Text>
            </View>
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
            tintColor="#000"
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

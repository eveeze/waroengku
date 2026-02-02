import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getKasbonHistory, getKasbonSummary } from '@/api/endpoints/kasbon';
import { getCustomerById } from '@/api/endpoints/customers';
import { Header } from '@/components/shared';
import { Card, Button, Loading } from '@/components/ui';
import { KasbonEntry, KasbonSummary, Customer } from '@/api/types';

/**
 * Kasbon History Screen
 */
export default function KasbonHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [summary, setSummary] = useState<KasbonSummary | null>(null);
  const [entries, setEntries] = useState<KasbonEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'debt' | 'payment'>('all');

  const { isLoading, execute: fetchHistory } = useApi(
    (params: { page?: number; per_page?: number; type?: 'debt' | 'payment' }) =>
      getKasbonHistory(id!, params),
  );
  const { execute: fetchSummary } = useApi(() => getKasbonSummary(id!));
  const { execute: fetchCustomer } = useApi(() => getCustomerById(id!));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cust, sum] = await Promise.all([fetchCustomer(), fetchSummary()]);
    if (cust) setCustomer(cust);
    if (sum) setSummary(sum);
    loadEntries(1, false);
  };

  const loadEntries = async (pageNum = 1, append = false) => {
    const params = {
      page: pageNum,
      per_page: 20,
      type: filter === 'all' ? undefined : filter,
    };

    try {
      const result = await fetchHistory(params);
      if (result) {
        if (append) {
          setEntries((prev) => [...prev, ...result.data]);
        } else {
          setEntries(result.data);
        }
        setHasMore(pageNum < result.meta.total_pages);
      }
    } catch {}
  };

  const handleRefresh = () => {
    setPage(1);
    loadEntries(1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadEntries(nextPage, true);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'debt' | 'payment') => {
    setFilter(newFilter);
    setPage(1);
    setTimeout(() => loadEntries(1, false), 100);
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEntry = ({ item }: { item: KasbonEntry }) => {
    const isDebt = item.type === 'debt';

    return (
      <Card className="mb-3">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              isDebt ? 'bg-danger-100' : 'bg-green-100'
            }`}
          >
            <Text className="text-lg">{isDebt ? '📤' : '📥'}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-heading font-bold text-secondary-900 text-base">
              {isDebt ? 'Kasbon' : 'Pembayaran'}
            </Text>
            <Text className="text-[10px] text-secondary-500 font-body font-medium mt-0.5">
              {formatDate(item.created_at)}
            </Text>
            {item.notes && (
              <Text className="text-sm text-secondary-600 mt-1">
                {item.notes}
              </Text>
            )}
          </View>
          <Text
            className={`text-base font-heading font-black tracking-tight ${
              isDebt ? 'text-danger-600' : 'text-green-600'
            }`}
          >
            {isDebt ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Riwayat Kasbon" onBack={() => router.back()} />

      <View className="px-4 pt-4">
        {/* Customer & Summary Card */}
        {customer && summary && (
          <Card className="mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                <Text className="text-lg">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-heading font-black text-lg text-secondary-900 mb-0.5">
                  {customer.name}
                </Text>
                <Text className="text-xs text-secondary-500 font-body">
                  {customer.phone || 'No phone'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-heading font-black text-danger-600 tracking-tight">
                  {formatCurrency(summary.current_balance)}
                </Text>
                <Text className="text-xs text-secondary-500 font-bold uppercase tracking-widest font-body">
                  Total Hutang
                </Text>
              </View>
            </View>

            {summary.current_balance > 0 && (
              <Button
                title="Catat Pembayaran"
                size="sm"
                fullWidth
                onPress={() => router.push(`/(admin)/customers/${id}/payment`)}
              />
            )}
          </Card>
        )}

        {/* Filter Tabs */}
        <View className="flex-row mb-4">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'debt', label: 'Kasbon' },
            { key: 'payment', label: 'Pembayaran' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() =>
                handleFilterChange(item.key as 'all' | 'debt' | 'payment')
              }
              className={`px-4 py-2 rounded-full mr-2 ${
                filter === item.key ? 'bg-primary-600' : 'bg-white'
              }`}
            >
              <Text
                className={`font-bold text-xs uppercase tracking-wider font-body ${filter === item.key ? 'text-white' : 'text-secondary-700'}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Entries List */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-12">
              <Text className="text-4xl mb-4">📋</Text>
              <Text className="text-secondary-500">Belum ada riwayat</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && entries.length > 0 ? (
            <View className="py-4">
              <Loading message="Memuat..." />
            </View>
          ) : null
        }
      />
    </View>
  );
}

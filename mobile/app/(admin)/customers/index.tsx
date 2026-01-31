import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { getCustomers } from '@/api/endpoints/customers';
import { Customer, CustomerListParams } from '@/api/types';
import { Card, Loading } from '@/components/ui';

/**
 * Customers List Screen
 */
export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  const { isLoading, execute: fetchCustomers } = useApi(
    (params: CustomerListParams) => getCustomers(params)
  );

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = useCallback(
    async (searchTerm = search, pageNum = 1, append = false) => {
      const params: CustomerListParams = {
        page: pageNum,
        per_page: 20,
        search: searchTerm || undefined,
        has_debt: showDebtOnly || undefined,
      };

      try {
        const result = await fetchCustomers(params);
        if (result) {
          if (append) {
            setCustomers((prev) => [...prev, ...result.data]);
          } else {
            setCustomers(result.data);
          }
          setHasMore(pageNum < result.meta.total_pages);
        }
      } catch {}
    },
    [search, showDebtOnly]
  );

  const handleSearch = () => {
    setPage(1);
    loadCustomers(search, 1, false);
  };

  const handleRefresh = () => {
    setPage(1);
    loadCustomers(search, 1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCustomers(search, nextPage, true);
    }
  };

  const toggleDebtFilter = () => {
    setShowDebtOnly(!showDebtOnly);
    setPage(1);
    setTimeout(() => loadCustomers(search, 1, false), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderCustomer = ({ item }: { item: Customer }) => {
    const hasDebt = item.current_balance > 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/customers/${item.id}`)}
        className="mb-3"
      >
        <Card>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Text className="text-xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-secondary-900">
                {item.name}
              </Text>
              {item.phone && (
                <Text className="text-sm text-secondary-500">{item.phone}</Text>
              )}
            </View>
            <View className="items-end">
              {hasDebt ? (
                <>
                  <Text className="text-base font-bold text-danger-600">
                    {formatCurrency(item.current_balance)}
                  </Text>
                  <Text className="text-xs text-danger-500">Hutang</Text>
                </>
              ) : (
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-green-700">Lunas</Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-xl font-bold">Pelanggan</Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/customers/create')}
            className="bg-white px-4 py-2 rounded-lg"
          >
            <Text className="text-primary-600 font-medium">+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-lg px-4">
          <Text className="mr-2">🔍</Text>
          <TextInput
            className="flex-1 py-3 text-base"
            placeholder="Cari pelanggan..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Filter */}
        <View className="flex-row mt-3">
          <TouchableOpacity
            onPress={toggleDebtFilter}
            className={`px-4 py-2 rounded-full mr-2 ${
              showDebtOnly ? 'bg-white' : 'bg-primary-500'
            }`}
          >
            <Text
              className={showDebtOnly ? 'text-primary-600' : 'text-white'}
            >
              {showDebtOnly ? '✓ Punya Hutang' : 'Punya Hutang'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
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
              <Text className="text-5xl mb-4">👥</Text>
              <Text className="text-secondary-500 text-lg">
                Tidak ada pelanggan
              </Text>
              <Text className="text-secondary-400 mt-1">
                Tap "Tambah" untuk menambah pelanggan baru
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && customers.length > 0 ? (
            <View className="py-4">
              <Loading message="Memuat..." />
            </View>
          ) : null
        }
      />
    </View>
  );
}

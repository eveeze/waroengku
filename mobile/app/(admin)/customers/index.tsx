import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { getCustomers } from '@/api/endpoints/customers';
import { Customer, CustomerListParams } from '@/api/types';
import { Loading } from '@/components/ui';

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  const { isLoading, execute: fetchCustomers } = useApi(
    (params: CustomerListParams) => getCustomers(params),
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
    [search, showDebtOnly],
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
        className="mb-0 border-b border-secondary-100 bg-white active:bg-secondary-50"
      >
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-sm font-bold text-primary-900 mb-1">
              {item.name}
            </Text>
            <Text className="text-secondary-500 text-xs">
              {item.phone || 'No phone'}
            </Text>
          </View>

          <View className="items-end">
            {hasDebt ? (
              <View className="items-end">
                <Text className="font-black text-danger-600 text-sm">
                  {formatCurrency(item.current_balance)}
                </Text>
                <Text className="text-[10px] font-bold text-danger-500 uppercase tracking-wide">
                  Debt
                </Text>
              </View>
            ) : (
              <Text className="text-[10px] font-bold text-secondary-300 uppercase tracking-widest">
                No Debt
              </Text>
            )}
          </View>

          <Text className="text-secondary-300 ml-4 text-lg">→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View
        className="bg-white border-b border-secondary-100 px-6 pb-6 sticky"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-end justify-between mb-6">
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-4xl font-black uppercase tracking-tighter text-black">
              MEMBERS
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/customers/create')}
            className="bg-black px-5 py-3 rounded-none items-center justify-center"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-widest">
              + NEW MEMBER
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-secondary-50 border border-secondary-200 px-4 h-12 justify-center">
            <TextInput
              className="flex-1 text-base font-medium text-primary-900"
              placeholder="Search members..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholderTextColor="#A1A1AA"
            />
          </View>
          <TouchableOpacity
            onPress={toggleDebtFilter}
            className={`px-4 justify-center border ${
              showDebtOnly
                ? 'bg-black border-black'
                : 'bg-white border-secondary-200'
            }`}
          >
            <Text
              className={`font-bold text-xs uppercase tracking-wide ${showDebtOnly ? 'text-white' : 'text-secondary-500'}`}
            >
              {showDebtOnly ? 'Has Debt' : 'Filter Debt'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 px-10">
              <Text className="text-secondary-300 font-black text-6xl mb-4">
                👥
              </Text>
              <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
                No Members Found
              </Text>
              <Text className="text-secondary-500 text-center text-sm">
                Start by adding a new member to the system.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && customers.length > 0 ? (
            <View className="py-6">
              <Loading message="" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

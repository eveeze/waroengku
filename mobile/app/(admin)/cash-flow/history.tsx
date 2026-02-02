import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getCashFlows } from '@/api/endpoints';
import { CashFlowEntry } from '@/api/types';
import { Loading } from '@/components/ui';

export default function CashFlowHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);

  const { isLoading, execute: fetchHistory } = useApi(getCashFlows);

  const loadData = async () => {
    const data = await fetchHistory();
    if (data) setEntries(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const renderItem = ({ item }: { item: CashFlowEntry }) => (
    <View className="flex-row justify-between items-center py-4 border-b border-secondary-100">
      <View>
        <Text className="font-bold text-primary-900 uppercase">
          {item.description || item.type}
        </Text>
        <Text className="text-secondary-500 text-xs mt-1">
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-black text-lg ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
        >
          {item.type === 'income' ? '+' : '-'}
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(item.amount)}
        </Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">
          {item.created_by}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-heading uppercase tracking-tighter text-black">
          History
        </Text>
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text className="text-center text-secondary-500 mt-10">
              No history found
            </Text>
          ) : null
        }
      />
    </View>
  );
}

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
import { getConsignors } from '@/api/endpoints';
import { Consignor } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function ConsignorListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [consignors, setConsignors] = useState<Consignor[]>([]);

  const { isLoading, execute: fetchConsignors } = useApi(getConsignors);

  const loadData = async () => {
    const data = await fetchConsignors();
    if (data) setConsignors(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const renderItem = ({ item }: { item: Consignor }) => (
    <View className="bg-secondary-50 p-4 rounded-xl mb-3 border border-secondary-100">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="font-heading text-xl text-primary-900 uppercase tracking-tight">
            {item.name}
          </Text>
          <Text className="text-secondary-500 text-xs font-bold mt-1">
            {item.phone}
          </Text>
        </View>
        <View
          className={`px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100' : 'bg-secondary-200'}`}
        >
          <Text
            className={`text-[10px] font-bold uppercase ${item.is_active ? 'text-green-700' : 'text-secondary-500'}`}
          >
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      {item.bank_name && (
        <View className="mt-2 pt-2 border-t border-secondary-200">
          <Text className="text-secondary-500 text-xs">
            {item.bank_name} - {item.bank_account}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white flex-row justify-between items-end"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-4xl font-heading uppercase tracking-tighter text-black">
            Consignment
          </Text>
          <Text className="text-secondary-500 text-xs font-bold mt-1">
            Manage Suppliers (Titip Jual)
          </Text>
        </View>
        <Button
          title="ADD NEW"
          size="sm"
          onPress={() => router.push('/(admin)/consignment/create')}
        />
      </View>

      <FlatList
        data={consignors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-10">
              <Text className="text-secondary-500 font-bold">
                No consignors found.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

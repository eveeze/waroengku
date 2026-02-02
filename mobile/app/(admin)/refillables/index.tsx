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
import { getRefillableContainers } from '@/api/endpoints';
import { RefillableContainer } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function RefillablesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [containers, setContainers] = useState<RefillableContainer[]>([]);

  const { isLoading, execute: fetchContainers } = useApi(
    getRefillableContainers,
  );

  const loadData = async () => {
    const data = await fetchContainers();
    if (data) setContainers(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const renderItem = ({ item }: { item: RefillableContainer }) => (
    <View className="bg-secondary-50 p-4 rounded-xl mb-4 border border-secondary-200">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="font-heading text-xl text-primary-900 uppercase tracking-tight">
            {item.container_type}
          </Text>
          <Text className="text-secondary-500 text-xs font-bold mt-1">
            Ref ID: {item.id.substring(0, 8)}...
          </Text>
        </View>
        <Button
          title="ADJUST"
          size="sm"
          variant="outline"
          onPress={() =>
            router.push({
              pathname: '/(admin)/refillables/adjust',
              params: {
                id: item.id,
                name: item.container_type,
                current_empty: item.empty_count.toString(),
                current_full: item.full_count.toString(),
              },
            })
          }
        />
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-white p-3 rounded-lg border border-red-100 items-center">
          <Text className="text-red-500 font-bold text-[10px] uppercase tracking-widest mb-1">
            Empty (Void)
          </Text>
          <Text className="text-2xl font-black text-red-900">
            {item.empty_count}
          </Text>
        </View>
        <View className="flex-1 bg-white p-3 rounded-lg border border-green-100 items-center">
          <Text className="text-green-500 font-bold text-[10px] uppercase tracking-widest mb-1">
            Full (Ready)
          </Text>
          <Text className="text-2xl font-black text-green-900">
            {item.full_count}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
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
        <Text className="text-4xl font-heading uppercase tracking-tighter text-black">
          Refillables
        </Text>
        <Text className="text-secondary-500 text-xs font-bold mt-1">
          Track Gallons & Gas Cylinders
        </Text>
      </View>

      <FlatList
        data={containers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text className="text-center text-secondary-500 mt-10">
              No containers found.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

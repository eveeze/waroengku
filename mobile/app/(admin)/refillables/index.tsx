import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { RefillableContainer } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function RefillablesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: containers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/refillables'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<RefillableContainer[]>({ queryKey }),
  });

  const renderItem = ({ item }: { item: RefillableContainer }) => (
    <View className="bg-secondary-50 p-5 rounded-none mb-4 border border-secondary-100">
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="font-heading text-2xl text-primary-900 uppercase tracking-tighter font-black">
            {item.container_type}
          </Text>
          <Text className="text-secondary-400 text-[10px] font-bold mt-1 uppercase tracking-widest">
            Ref: {item.id.substring(0, 8)}
          </Text>
        </View>
        <Button
          title="ADJUST STOCK"
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
        <View className="flex-1 bg-white p-4 items-center border border-red-100 shadow-sm">
          <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">
            Empty (Void)
          </Text>
          <Text className="text-4xl font-black text-red-600 tracking-tighter">
            {item.empty_count}
          </Text>
        </View>
        <View className="flex-1 bg-white p-4 items-center border border-green-100 shadow-sm">
          <Text className="text-green-600 font-black text-[10px] uppercase tracking-widest mb-1">
            Full (Ready)
          </Text>
          <Text className="text-4xl font-black text-green-700 tracking-tighter">
            {item.full_count}
          </Text>
        </View>
      </View>
    </View>
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
        <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-black">
          REFILLABLES
        </Text>
        <Text className="text-secondary-500 text-xs font-bold mt-1 uppercase tracking-widest">
          Track Gallons & Gas Cylinders
        </Text>
      </View>

      <FlatList
        data={containers || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text className="text-center text-secondary-500 mt-10 font-bold uppercase tracking-widest">
              No containers found.
            </Text>
          ) : null
        }
        ListFooterComponent={
          isLoading ? <Loading message="Loading..." /> : null
        }
      />
    </View>
  );
}

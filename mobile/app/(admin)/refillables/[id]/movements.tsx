import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getRefillableMovements } from '@/api/endpoints';
import { RefillableMovement } from '@/api/types';
import { Loading } from '@/components/ui';

export default function RefillableMovementsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const insets = useSafeAreaInsets();

  const {
    data: movements,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/refillables', id, 'movements'],
    queryFn: () => getRefillableMovements(id),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const renderItem = ({ item }: { item: RefillableMovement }) => (
    <View className="bg-white p-4 border-b border-gray-100 flex-row justify-between items-start">
      <View className="flex-1 mr-4">
        <View className="flex-row items-center mb-1">
          <View className="bg-gray-100 px-2 py-0.5 mr-2">
            <Text className="text-[10px] uppercase font-bold text-gray-500">
              {item.actor_name || 'System'}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text className="text-gray-800 font-medium">
          {item.notes || 'No notes'}
        </Text>
      </View>
      <View className="items-end">
        {item.empty_change !== 0 && (
          <Text
            className={`font-mono font-bold ${
              item.empty_change > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            Empty: {item.empty_change > 0 ? '+' : ''}
            {item.empty_change}
          </Text>
        )}
        {item.full_change !== 0 && (
          <Text
            className={`font-mono font-bold ${
              item.full_change > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            Full: {item.full_change > 0 ? '+' : ''}
            {item.full_change}
          </Text>
        )}
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
        <Text className="text-secondary-500 font-bold uppercase text-xs mb-1 tracking-widest">
          Movement History
        </Text>
        <Text className="text-3xl font-black uppercase text-primary-900 tracking-tighter">
          {name || 'Unknown'}
        </Text>
      </View>

      <FlatList
        data={movements || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-8 items-center">
              <Text className="text-secondary-400 font-bold uppercase tracking-widest text-center">
                No movements found.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? <Loading message="Loading history..." /> : null
        }
      />
    </View>
  );
}

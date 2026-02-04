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
    <View className="bg-background p-4 border-b border-border flex-row justify-between items-start">
      <View className="flex-1 mr-4">
        <View className="flex-row items-center mb-1">
          <View className="bg-muted px-2 py-0.5 mr-2">
            <Text className="text-[10px] uppercase font-bold text-muted-foreground">
              {item.actor_name || 'System'}
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text className="text-foreground font-medium">
          {item.notes || 'No notes'}
        </Text>
      </View>
      <View className="items-end">
        {item.empty_change !== 0 && (
          <Text
            className={`font-mono font-bold ${
              item.empty_change > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            Empty: {item.empty_change > 0 ? '+' : ''}
            {item.empty_change}
          </Text>
        )}
        {item.full_change !== 0 && (
          <Text
            className={`font-mono font-bold ${
              item.full_change > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-muted-foreground font-bold uppercase text-xs mb-1 tracking-widest">
          Movement History
        </Text>
        <Text className="text-3xl font-black uppercase text-foreground tracking-tighter">
          {name || 'Unknown'}
        </Text>
      </View>

      <FlatList
        data={movements || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#888"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-8 items-center">
              <Text className="text-muted-foreground font-bold uppercase tracking-widest text-center">
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

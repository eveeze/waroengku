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
import { fetcher } from '@/api/client';
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
    queryFn: ({ queryKey }) => fetcher<RefillableContainer[]>({ queryKey }),
  });

  const renderItem = ({ item }: { item: RefillableContainer }) => (
    <View className="bg-muted p-5 rounded-none mb-4 border border-border">
      <View className="flex-row justify-between items-start mb-6">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(admin)/refillables/[id]/movements',
              params: { id: item.id, name: item.container_type },
            })
          }
        >
          <Text className="font-heading text-2xl text-foreground uppercase tracking-tighter font-black">
            {item.container_type}
          </Text>
          <Text className="text-muted-foreground text-[10px] font-bold mt-1 uppercase tracking-widest">
            Ref: {item.id.substring(0, 8)} • Tap for History
          </Text>
        </TouchableOpacity>
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
        <View className="flex-1 bg-background dark:bg-red-900/10 p-4 items-center border border-border dark:border-red-900/30 shadow-sm">
          <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">
            Empty (Void)
          </Text>
          <Text className="text-4xl font-black text-red-600 dark:text-red-400 tracking-tighter">
            {item.empty_count}
          </Text>
        </View>
        <View className="flex-1 bg-background dark:bg-green-900/10 p-4 items-center border border-border dark:border-green-900/30 shadow-sm">
          <Text className="text-green-600 font-black text-[10px] uppercase tracking-widest mb-1">
            Full (Ready)
          </Text>
          <Text className="text-4xl font-black text-green-700 dark:text-green-400 tracking-tighter">
            {item.full_count}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ← Back
            </Text>
          </TouchableOpacity>
          <Button
            title="+ NEW CONTAINER"
            size="sm"
            onPress={() => router.push('/(admin)/refillables/create')}
          />
        </View>
        <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-foreground">
          REFILLABLES
        </Text>
        <Text className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-widest">
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
            <Text className="text-center text-muted-foreground mt-10 font-bold uppercase tracking-widest">
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

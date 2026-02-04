import React, { useCallback } from 'react';
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
import { Consignor, ApiResponse } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function ConsignorListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/consignors'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<Consignor[]>>({ queryKey }),
  });

  const consignors = response?.data || [];

  const renderItem = ({ item }: { item: Consignor }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/consignment/${item.id}`)}
      className="bg-card p-4 rounded-xl mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="font-heading text-xl text-foreground uppercase tracking-tight">
            {item.name}
          </Text>
          <Text className="text-muted-foreground text-xs font-bold mt-1">
            {item.phone}
          </Text>
        </View>
        <View
          className={`px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}
        >
          <Text
            className={`text-[10px] font-bold uppercase ${item.is_active ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}
          >
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      {item.bank_name && (
        <View className="mt-2 pt-2 border-t border-border">
          <Text className="text-muted-foreground text-xs">
            {item.bank_name} - {item.bank_account}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background flex-row justify-between items-end"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-foreground">
            CONSIGNMENT
          </Text>
          <Text className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-wide">
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
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#888"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-10">
              <Text className="text-muted-foreground font-bold">
                No consignors found.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

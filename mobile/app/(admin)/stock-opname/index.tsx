import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getOpnameSessions, startOpnameSession } from '@/api/endpoints';
import { OpnameSession } from '@/api/types';
import { Loading, Button } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';

export default function StockOpnameListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: sessions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/opname-sessions'],
    queryFn: ({ queryKey }) => fetchWithCache<OpnameSession[]>({ queryKey }),
  });

  const { mutate: mutateCreate, isPending: isCreating } = useOptimisticMutation(
    async (payload: any) => startOpnameSession(payload),
    {
      queryKey: ['/opname-sessions'],
      updater: (old: OpnameSession[] | undefined, variables: any) => {
        // Optimistic update
        const optimisticSession: OpnameSession = {
          id: 'optimistic-' + Date.now(),
          session_number: 'PENDING',
          status: 'active',
          created_by: variables.created_by,
          notes: variables.notes,
          created_at: new Date().toISOString(),
        };
        if (!old) return [optimisticSession];
        return [optimisticSession, ...old];
      },
      onSuccess: (data) => {
        if (data) {
          router.push(`/(admin)/stock-opname/${data.id}`);
        }
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to start new session');
      },
    },
  );

  const handleCreate = () => {
    mutateCreate({
      created_by: 'Admin', // TODO: Auth
      notes: 'Session started from mobile',
    });
  };

  const renderItem = ({ item }: { item: OpnameSession }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/stock-opname/${item.id}`)}
      className="bg-secondary-50 p-4 rounded-none mb-3 border border-secondary-100 flex-row justify-between items-center"
    >
      <View>
        <Text className="font-body font-black text-lg text-primary-900 uppercase tracking-tight">
          Session #{item.session_number}
        </Text>
        <Text className="text-secondary-500 font-body text-xs font-bold mt-1 tracking-wide uppercase">
          {new Date(item.created_at).toLocaleDateString()} • {item.created_by}
        </Text>
      </View>
      <View
        className={`px-3 py-1 ${item.status === 'active' ? 'bg-black' : 'bg-secondary-300'}`}
      >
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest font-body">
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Swiss Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <View className="flex-row justify-between items-end">
          <Text className="text-4xl font-black uppercase tracking-tighter text-black">
            STOCK OPNAME
          </Text>
          <Button
            title="NEW SESSION"
            size="sm"
            onPress={handleCreate}
            isLoading={isCreating}
          />
        </View>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-12 bg-secondary-50 p-8 border border-secondary-100">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-secondary-900 font-black uppercase tracking-wide mb-1">
                No sessions found
              </Text>
              <Text className="text-secondary-500 text-xs font-bold uppercase tracking-widest">
                Start a new session to begin accounting
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

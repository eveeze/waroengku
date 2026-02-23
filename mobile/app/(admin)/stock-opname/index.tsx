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
import { useResponsive } from '@/hooks/useResponsive';
import { fetchWithCache } from '@/api/client';
import { startOpnameSession } from '@/api/endpoints';
import { OpnameSession, ApiResponse } from '@/api/types';
import { Button } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';
import { StockOpnameListInlineSkeleton } from '@/components/skeletons';
import { EmptyStateInline } from '@/components/shared';

export default function StockOpnameListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/opname-sessions'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<OpnameSession[]>>({ queryKey }),
  });

  const sessions = response?.data || [];

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
      className={`bg-muted rounded-none border border-border flex-row justify-between items-center ${
        isTablet ? 'p-6 mb-5' : 'p-4 mb-3'
      }`}
    >
      <View>
        <Text
          className={`font-body font-black text-foreground uppercase tracking-tight ${
            isTablet ? 'text-2xl' : 'text-lg'
          }`}
        >
          Session #{item.session_number}
        </Text>
        <Text
          className={`text-muted-foreground font-body font-bold mt-1 tracking-wide uppercase ${
            isTablet ? 'text-sm' : 'text-xs'
          }`}
        >
          {new Date(item.created_at).toLocaleDateString()} • {item.created_by}
        </Text>
      </View>
      <View
        className={`px-3 py-1 ${
          item.status === 'active'
            ? 'bg-foreground'
            : 'bg-transparent border border-border'
        }`}
      >
        <Text
          className={`font-bold uppercase tracking-widest font-body ${
            isTablet ? 'text-xs' : 'text-[10px]'
          } ${item.status === 'active' ? 'text-background' : 'text-foreground'}`}
        >
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className={`border-b border-border bg-background ${isTablet ? 'px-8 py-8' : 'px-6 py-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-5' : 'mb-4'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            ← BACK
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text
              className={`font-heading font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-3xl'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              STOCK OPNAME
            </Text>
            <Text
              className={`text-muted-foreground font-bold mt-1 uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-[10px]'}`}
            >
              Manage Inventory
            </Text>
          </View>
          <Button
            title="+ NEW"
            size={isTablet ? 'md' : 'sm'}
            className="rounded-full px-5 bg-foreground items-center justify-center flex-shrink-0"
            textClassName="text-background font-black tracking-widest"
            onPress={handleCreate}
            isLoading={isCreating}
          />
        </View>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: screenPadding,
          paddingBottom: insets.bottom + 40,
          maxWidth: isTablet ? 800 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#888"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <StockOpnameListInlineSkeleton count={5} />
          ) : (
            <EmptyStateInline
              title="No Sessions Found"
              message="Start a new session to begin accounting."
              icon="📋"
              action={{
                label: 'New Session',
                onPress: handleCreate,
              }}
            />
          )
        }
      />
    </View>
  );
}

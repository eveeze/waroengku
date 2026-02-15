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
import { useResponsive } from '@/hooks/useResponsive';
import { fetcher } from '@/api/client';
import { RefillableContainer } from '@/api/types';
import { Button } from '@/components/ui';
import { RefillableListInlineSkeleton } from '@/components/skeletons';
import { EmptyStateInline } from '@/components/shared';

export default function RefillablesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const {
    data: containers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/refillables'],
    queryFn: ({ queryKey }) => fetcher<RefillableContainer[]>({ queryKey }),
  });

  const renderItem = ({ item }: { item: RefillableContainer }) => (
    <View
      className={`bg-muted rounded-none border border-border ${isTablet ? 'p-6 mb-5' : 'p-5 mb-4'}`}
    >
      <View
        className={`flex-row justify-between items-start ${isTablet ? 'mb-8' : 'mb-6'}`}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(admin)/refillables/[id]/movements',
              params: { id: item.id, name: item.container_type },
            })
          }
        >
          <Text
            className={`font-heading text-foreground uppercase tracking-tighter font-black ${isTablet ? 'text-3xl' : 'text-2xl'}`}
          >
            {item.container_type}
          </Text>
          <Text
            className={`text-muted-foreground font-bold mt-1 uppercase tracking-widest ${isTablet ? 'text-xs' : 'text-[10px]'}`}
          >
            Ref: {item.id.substring(0, 8)} • Tap for History
          </Text>
        </TouchableOpacity>
        <Button
          title="ADJUST STOCK"
          size={isTablet ? 'md' : 'sm'}
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

      <View className={`flex-row ${isTablet ? 'gap-6' : 'gap-4'}`}>
        <View
          className={`flex-1 bg-background dark:bg-red-900/10 items-center border border-border dark:border-red-900/30 shadow-sm ${isTablet ? 'p-5' : 'p-4'}`}
        >
          <Text
            className={`text-red-500 font-black uppercase tracking-widest mb-1 ${isTablet ? 'text-xs' : 'text-[10px]'}`}
          >
            Empty (Void)
          </Text>
          <Text
            className={`font-black text-red-600 dark:text-red-400 tracking-tighter ${isTablet ? 'text-5xl' : 'text-4xl'}`}
          >
            {item.empty_count}
          </Text>
        </View>
        <View
          className={`flex-1 bg-background dark:bg-green-900/10 items-center border border-border dark:border-green-900/30 shadow-sm ${isTablet ? 'p-5' : 'p-4'}`}
        >
          <Text
            className={`text-green-600 font-black uppercase tracking-widest mb-1 ${isTablet ? 'text-xs' : 'text-[10px]'}`}
          >
            Full (Ready)
          </Text>
          <Text
            className={`font-black text-green-700 dark:text-green-400 tracking-tighter ${isTablet ? 'text-5xl' : 'text-4xl'}`}
          >
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
        className={`border-b border-border bg-background ${isTablet ? 'px-8 py-8' : 'px-6 py-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <View
          className={`flex-row justify-between items-center ${isTablet ? 'mb-5' : 'mb-4'}`}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text
              className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Button
            title="+ NEW CONTAINER"
            size={isTablet ? 'md' : 'sm'}
            onPress={() => router.push('/(admin)/refillables/create')}
          />
        </View>
        <Text
          className={`font-heading font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-4xl'}`}
        >
          REFILLABLES
        </Text>
        <Text
          className={`text-muted-foreground font-bold mt-1 uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-xs'}`}
        >
          Track Gallons & Gas Cylinders
        </Text>
      </View>

      <FlatList
        data={containers || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: screenPadding,
          maxWidth: isTablet ? 800 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <RefillableListInlineSkeleton count={4} />
          ) : (
            <EmptyStateInline
              title="No Containers"
              message="Add containers to track gallons & gas cylinders."
              icon="🪣"
              action={{
                label: 'Add Container',
                onPress: () => router.push('/(admin)/refillables/create'),
              }}
            />
          )
        }
      />
    </View>
  );
}

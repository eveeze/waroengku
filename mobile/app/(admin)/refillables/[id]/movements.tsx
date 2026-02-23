import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useResponsive } from '@/hooks/useResponsive';
import { getRefillableMovements } from '@/api/endpoints';
import { RefillableMovement } from '@/api/types';
import { Loading } from '@/components/ui';

export default function RefillableMovementsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;
  const isSmallPhone = breakpoints.isSmall;

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
    <View
      className={`bg-background border-b border-border flex-row justify-between items-start ${
        isTablet ? 'p-6' : 'p-4'
      }`}
    >
      <View className="flex-1 mr-4">
        <View className="flex-row items-center mb-1">
          <View className="bg-muted px-2 py-0.5 mr-2">
            <Text
              className={`uppercase font-bold text-muted-foreground ${
                isTablet ? 'text-xs' : 'text-[10px]'
              }`}
            >
              {item.actor_name || 'System'}
            </Text>
          </View>
          <Text
            className={`text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text
          className={`text-foreground font-medium ${isTablet ? 'text-lg' : 'text-base'}`}
        >
          {item.notes || 'No notes'}
        </Text>
      </View>
      <View className="items-end">
        {item.empty_change !== 0 && (
          <Text
            className={`font-mono font-bold ${
              isTablet ? 'text-lg' : 'text-base'
            } ${
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
              isTablet ? 'text-lg' : 'text-base'
            } ${
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
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className={`border-b border-border bg-background ${
          isTablet ? 'px-8 py-8' : 'px-6 py-6'
        }`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-5' : 'mb-4'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${
              isTablet ? 'text-sm' : 'text-xs'
            }`}
          >
            ← BACK
          </Text>
        </TouchableOpacity>
        <Text
          className={`text-muted-foreground font-bold uppercase tracking-widest ${
            isTablet ? 'text-sm mb-2' : 'text-xs mb-1'
          }`}
        >
          Movement History
        </Text>
        <Text
          className={`font-black uppercase text-foreground tracking-tighter ${
            isTablet ? 'text-5xl' : 'text-3xl'
          }`}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {name || 'Unknown'}
        </Text>
      </View>

      <FlatList
        data={movements || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: isTablet ? 32 : 16,
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
          !isLoading ? (
            <View className={`p-8 items-center ${isTablet ? 'mt-10' : 'mt-5'}`}>
              <Text
                className={`text-muted-foreground font-bold uppercase tracking-widest text-center ${
                  isTablet ? 'text-sm' : 'text-xs'
                }`}
              >
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

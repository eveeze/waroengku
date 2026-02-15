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
import { useResponsive } from '@/hooks/useResponsive';
import { fetchWithCache } from '@/api/client';
import { Consignor, ApiResponse } from '@/api/types';
import { Button } from '@/components/ui';
import { ConsignmentListInlineSkeleton } from '@/components/skeletons';
import { EmptyStateInline } from '@/components/shared';

export default function ConsignorListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;

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
      className={`bg-card rounded-xl border border-border ${isTablet ? 'p-5 mb-4' : 'p-4 mb-3'}`}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text
            className={`font-heading text-foreground uppercase tracking-tight ${isTablet ? 'text-2xl' : 'text-xl'}`}
          >
            {item.name}
          </Text>
          <Text
            className={`text-muted-foreground font-bold mt-1 ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            {item.phone}
          </Text>
        </View>
        <View
          className={`px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}
        >
          <Text
            className={`font-bold uppercase ${item.is_active ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'} ${isTablet ? 'text-xs' : 'text-[10px]'}`}
          >
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      {item.bank_name && (
        <View className="mt-2 pt-2 border-t border-border">
          <Text
            className={`text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
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
        className={`border-b border-border bg-background flex-row justify-between items-end ${isTablet ? 'px-8 py-8' : 'px-6 py-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            className={isTablet ? 'mb-5' : 'mb-4'}
          >
            <Text
              className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Text
            className={`font-heading font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-4xl'}`}
          >
            CONSIGNMENT
          </Text>
          <Text
            className={`text-muted-foreground font-bold mt-1 uppercase tracking-wide ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            Manage Suppliers (Titip Jual)
          </Text>
        </View>
        <Button
          title="ADD NEW"
          size={isTablet ? 'md' : 'sm'}
          onPress={() => router.push('/(admin)/consignment/create')}
        />
      </View>

      <FlatList
        data={consignors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: screenPadding,
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
            <ConsignmentListInlineSkeleton count={5} />
          ) : (
            <EmptyStateInline
              title="No Consignors"
              message="Add suppliers for consignment (titip jual)."
              icon="🧳"
              action={{
                label: 'Add Consignor',
                onPress: () => router.push('/(admin)/consignment/create'),
              }}
            />
          )
        }
      />
    </View>
  );
}

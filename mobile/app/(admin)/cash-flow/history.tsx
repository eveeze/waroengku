import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { useResponsive } from '@/hooks/useResponsive';
import { getCashFlows } from '@/api/endpoints';
import { CashFlowEntry } from '@/api/types';
import { Loading } from '@/components/ui';

export default function CashFlowHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;
  const isSmallPhone = breakpoints.isSmall;

  const [entries, setEntries] = useState<CashFlowEntry[]>([]);

  const { isLoading, execute: fetchHistory } = useApi(getCashFlows);

  const loadData = async () => {
    const response = await fetchHistory();
    if (response) {
      const rawData = response as any;
      const entriesArray = Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
          ? rawData
          : [];

      setEntries(entriesArray);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const renderItem = ({ item }: { item: CashFlowEntry }) => (
    <View
      className={`flex-row justify-between items-center border-b border-border ${
        isTablet ? 'py-6 px-4' : 'py-4'
      }`}
    >
      <View>
        <Text
          className={`font-bold text-foreground uppercase ${
            isTablet ? 'text-lg' : isSmallPhone ? 'text-xs' : 'text-base'
          }`}
        >
          {item.description || item.type}
        </Text>
        <Text
          className={`text-muted-foreground mt-1 ${isTablet ? 'text-sm' : 'text-xs'}`}
        >
          {new Date(item.created_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-black ${
            isTablet ? 'text-2xl' : isSmallPhone ? 'text-base' : 'text-lg'
          } ${
            item.type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {item.type === 'income' ? '+' : '-'}
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(item.amount)}
        </Text>
        <Text
          className={`font-bold uppercase tracking-widest text-muted-foreground ${
            isTablet ? 'text-xs mt-1' : 'text-[10px]'
          }`}
        >
          {item.created_by}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      <View
        className={`border-b border-border bg-background ${
          isTablet ? 'px-8 py-8' : 'px-6 py-6'
        }`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-4' : 'mb-3'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${
              isTablet ? 'text-xs' : 'text-[10px]'
            }`}
          >
            ← BACK
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${
            isTablet ? 'text-5xl' : 'text-4xl'
          }`}
        >
          HISTORY
        </Text>
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: isTablet ? 32 : 24,
          paddingBottom: insets.bottom + 40,
          maxWidth: isTablet ? 720 : undefined,
          alignSelf: 'center',
          width: '100%',
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            tintColor="#888"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text
              className={`text-center text-muted-foreground mt-10 ${
                isTablet ? 'text-lg' : 'text-sm'
              }`}
            >
              No history found
            </Text>
          ) : null
        }
      />
    </View>
  );
}

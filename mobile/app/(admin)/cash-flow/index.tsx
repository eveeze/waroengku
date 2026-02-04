import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getCurrentSession } from '@/api/endpoints';
import { DrawerSession, ApiResponse } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function CashFlowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/cash-flow/session/current'],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<DrawerSession>>({ queryKey }),
  });

  const session = response?.data;

  // Removed manual loadData and useFocusEffect in favor of useQuery
  // useQuery will auto-refetch on focus by default in React Query v5 (if configured)
  // or we can use useFocusEffect to refetch if needed, but standard query is usually enough.
  // Actually, for React Native, focus refetching often needs setup or useFocusEffect + refetch.
  // Let's add explicit refetch on focus for safety.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (isLoading && !session) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loading message="Checking Register Status..." />
      </View>
    );
  }

  const isOpen = session && session.status === 'open';

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border flex-row justify-between items-end bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-foreground">
            CASH REGISTER
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/cash-flow/history')}
          className="bg-muted px-4 py-2 rounded-full"
        >
          <Text className="font-bold text-xs uppercase text-foreground">
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Status Card */}
        <View
          className={`p-6 rounded-2xl mb-8 ${isOpen ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted border border-border'}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold uppercase tracking-widest text-muted-foreground text-xs">
              Current Status
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${isOpen ? 'bg-green-500' : 'bg-muted'}`}
            >
              <Text className="text-white dark:text-foreground text-[10px] font-black uppercase tracking-widest">
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          {isOpen ? (
            <View>
              <Text className="text-5xl font-heading text-foreground mb-1">
                {formatCurrency(
                  session.actual_balance || session.opening_balance,
                )}
              </Text>
              <Text className="text-xs font-bold text-muted-foreground text-right">
                Est. Cash in Drawer
              </Text>

              <View className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground font-medium">
                    Opening Balance
                  </Text>
                  <Text className="font-bold text-foreground">
                    {formatCurrency(session.opening_balance)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground font-medium">
                    Opened At
                  </Text>
                  <Text className="font-bold text-foreground text-xs">
                    {formatDate(session.opened_at)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground font-medium">
                    Opened By
                  </Text>
                  <Text className="font-bold text-foreground">
                    {session.opened_by}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-4">
              <Text className="text-lg font-bold text-foreground mb-2">
                Register is Closed
              </Text>
              <Text className="text-muted-foreground text-center">
                Open the register to start processing transactions and recording
                cash flow.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <Text className="font-bold uppercase tracking-widest text-foreground text-xs mb-4">
          Actions
        </Text>

        <View className="gap-4">
          {!isOpen ? (
            <Button
              title="OPEN REGISTER"
              size="lg"
              onPress={() => router.push('/(admin)/cash-flow/open')}
            />
          ) : (
            <>
              <Button
                title="RECORD EXPENSE / IN"
                variant="outline"
                onPress={() => router.push('/(admin)/cash-flow/record')}
              />
              <Button
                title="CLOSE REGISTER"
                variant="danger"
                className="mt-4"
                onPress={() => router.push('/(admin)/cash-flow/close')}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

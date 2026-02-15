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
import { useResponsive } from '@/hooks/useResponsive';
import { fetchWithCache } from '@/api/client';
import { getCurrentSession } from '@/api/endpoints';
import { DrawerSession, ApiResponse } from '@/api/types';
import { Button } from '@/components/ui';
import { CashFlowSkeleton } from '@/components/skeletons';

export default function CashFlowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;

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
    return <CashFlowSkeleton />;
  }

  const isOpen = session && session.status === 'open';

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className={`border-b border-border flex-row justify-between items-end bg-background ${isTablet ? 'px-8 py-8' : 'px-6 py-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            className={isTablet ? 'mb-5' : 'mb-4'}
          >
            <Text
              className={`text-muted-foreground font-bold uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-xs'}`}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Text
            className={`font-heading font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-4xl'}`}
          >
            CASH REGISTER
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/cash-flow/history')}
          className={`bg-muted rounded-full ${isTablet ? 'px-5 py-3' : 'px-4 py-2'}`}
        >
          <Text
            className={`font-bold uppercase text-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: screenPadding,
          maxWidth: isTablet ? 720 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Status Card */}
        <View
          className={`rounded-2xl ${isTablet ? 'p-8 mb-10' : 'p-6 mb-8'} ${isOpen ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted border border-border'}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
            >
              Current Status
            </Text>
            <View
              className={`rounded-full ${isTablet ? 'px-4 py-1.5' : 'px-3 py-1'} ${isOpen ? 'bg-green-500' : 'bg-muted'}`}
            >
              <Text
                className={`text-white dark:text-foreground font-black uppercase tracking-widest ${isTablet ? 'text-xs' : 'text-[10px]'}`}
              >
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
        <Text
          className={`font-bold uppercase tracking-widest text-foreground mb-4 ${isTablet ? 'text-sm' : 'text-xs'}`}
        >
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

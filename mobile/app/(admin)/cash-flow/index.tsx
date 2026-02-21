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
        className={`border-b border-border bg-background ${isTablet ? 'px-8 py-8' : 'px-6 py-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <View className="flex-row justify-between items-end">
          <View>
            <TouchableOpacity
              onPress={() => router.back()}
              className={isTablet ? 'mb-4' : 'mb-3'}
            >
              <Text
                className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${isTablet ? 'text-xs' : 'text-[10px]'}`}
              >
                ← BACK
              </Text>
            </TouchableOpacity>
            <Text
              className={`font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-3xl'}`}
            >
              CASH REGISTER
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/cash-flow/history')}
            className={`border border-border items-center justify-center ${isTablet ? 'px-5 py-3' : 'px-4 py-2'}`}
          >
            <Text
              className={`font-bold uppercase tracking-widest text-foreground font-body ${isTablet ? 'text-xs' : 'text-[10px]'}`}
            >
              HISTORY
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: isTablet ? 32 : 24,
          paddingBottom: insets.bottom + 40,
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
          className={`border border-border ${isTablet ? 'p-8 mb-10' : 'p-6 mb-8'} ${isOpen ? 'bg-muted/10' : 'bg-muted/30'}`}
        >
          <View className="flex-row justify-between items-center mb-6 border-b border-border pb-4">
            <Text
              className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${isTablet ? 'text-xs' : 'text-[10px]'}`}
            >
              CURRENT STATUS
            </Text>
            <View
              className={`border items-center justify-center px-3 py-1 ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted border-border'}`}
            >
              <Text
                className={`font-black uppercase tracking-widest ${isTablet ? 'text-[10px]' : 'text-[9px]'} ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
              >
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          {isOpen ? (
            <View>
              <Text
                className={`font-black text-foreground tracking-tighter mb-1 ${isTablet ? 'text-6xl' : 'text-4xl'}`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatCurrency(
                  session.actual_balance || session.opening_balance,
                )}
              </Text>
              <Text
                className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${isTablet ? 'text-xs mt-2' : 'text-[10px] mt-1'}`}
              >
                EST. CASH IN DRAWER
              </Text>

              <View className="mt-8 pt-6 border-t border-border gap-4">
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    OPENING BALANCE
                  </Text>
                  <Text className="text-sm font-black text-foreground">
                    {formatCurrency(session.opening_balance)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    OPENED AT
                  </Text>
                  <Text className="text-xs font-bold text-foreground">
                    {formatDate(session.opened_at).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    OPENED BY
                  </Text>
                  <Text className="text-sm font-black text-foreground uppercase">
                    {session.opened_by}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-6">
              <Text className="text-xl font-black uppercase tracking-tight text-foreground mb-3">
                REGISTER IS CLOSED
              </Text>
              <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground text-center leading-relaxed px-4">
                OPEN THE REGISTER TO START PROCESSING TRANSACTIONS AND RECORDING
                CASH FLOW.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <Text
          className={`font-bold uppercase tracking-widest text-muted-foreground mb-6 font-body ${isTablet ? 'text-xs' : 'text-[10px]'}`}
        >
          QUICK ACTIONS
        </Text>

        <View className="gap-4">
          {!isOpen ? (
            <Button
              title="OPEN REGISTER"
              fullWidth
              onPress={() => router.push('/(admin)/cash-flow/open')}
              className="rounded-none mt-2"
              textClassName="font-black tracking-widest text-lg"
            />
          ) : (
            <>
              <Button
                title="RECORD EXPENSE / IN"
                variant="outline"
                fullWidth
                onPress={() => router.push('/(admin)/cash-flow/record')}
                className="rounded-none"
                textClassName="font-black tracking-widest"
              />
              <Button
                title="CLOSE REGISTER"
                variant="danger"
                fullWidth
                className="rounded-none mt-4"
                textClassName="font-black tracking-widest"
                onPress={() => router.push('/(admin)/cash-flow/close')}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

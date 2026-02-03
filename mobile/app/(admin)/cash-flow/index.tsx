import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getCurrentSession } from '@/api/endpoints';
import { DrawerSession } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function CashFlowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/cash-flow/session/current'],
    queryFn: ({ queryKey }) => fetchWithCache<DrawerSession>({ queryKey }),
  });

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
      <View className="flex-1 bg-white items-center justify-center">
        <Loading message="Checking Register Status..." />
      </View>
    );
  }

  const isOpen = session && session.status === 'open';

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 flex-row justify-between items-end bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs">
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-black">
            CASH REGISTER
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/cash-flow/history')}
          className="bg-secondary-100 px-4 py-2 rounded-full"
        >
          <Text className="font-bold text-xs uppercase text-secondary-900">
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
          className={`p-6 rounded-2xl mb-8 ${isOpen ? 'bg-green-50 border border-green-200' : 'bg-secondary-50 border border-secondary-200'}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold uppercase tracking-widest text-secondary-500 text-xs">
              Current Status
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${isOpen ? 'bg-green-500' : 'bg-secondary-500'}`}
            >
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          {isOpen ? (
            <View>
              <Text className="text-5xl font-heading text-primary-900 mb-1">
                {formatCurrency(
                  session.actual_balance || session.opening_balance,
                )}
              </Text>
              <Text className="text-xs font-bold text-secondary-500 text-right">
                Est. Cash in Drawer
              </Text>

              <View className="mt-6 pt-6 border-t border-green-200">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-secondary-600 font-medium">
                    Opening Balance
                  </Text>
                  <Text className="font-bold text-primary-900">
                    {formatCurrency(session.opening_balance)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-secondary-600 font-medium">
                    Opened At
                  </Text>
                  <Text className="font-bold text-primary-900 text-xs">
                    {formatDate(session.opened_at)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600 font-medium">
                    Opened By
                  </Text>
                  <Text className="font-bold text-primary-900">
                    {session.opened_by}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-4">
              <Text className="text-lg font-bold text-secondary-900 mb-2">
                Register is Closed
              </Text>
              <Text className="text-secondary-500 text-center">
                Open the register to start processing transactions and recording
                cash flow.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <Text className="font-bold uppercase tracking-widest text-secondary-900 text-xs mb-4">
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

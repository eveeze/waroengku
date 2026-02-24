import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { closeDrawer, getCurrentSession, getCashFlows } from '@/api/endpoints';
import { Button, Input, Loading } from '@/components/ui';
import { CashFlowEntry } from '@/api/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useResponsive } from '@/hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CloseDrawerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading: isLoadingSession,
    execute: fetchSession,
  } = useApi(getCurrentSession);

  const { data: flowsRes, isLoading: isLoadingFlows } = useQuery({
    queryKey: ['cashFlowEntries', session?.id], // Keep using session for backwards compat in query
    queryFn: () => getCashFlows({ session_id: session?.id, per_page: 200 }),
    enabled: !!session?.id,
  });

  const { isLoading, execute: submitClose } = useApi(closeDrawer);

  const cashFlows: CashFlowEntry[] = Array.isArray(flowsRes?.data)
    ? flowsRes.data
    : Array.isArray(flowsRes)
      ? flowsRes
      : [];
  const totalIncome = cashFlows
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = cashFlows
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const expectedCash = session
    ? session.opening_balance + totalIncome - totalExpense
    : 0;

  useEffect(() => {
    fetchSession();
  }, []);

  const handleClose = async () => {
    if (!amount || !session) return;

    try {
      await submitClose({
        session_id: session.id,
        closing_balance: Number(amount),
        closed_by: 'Admin', // TODO: Get from auth context
      });
      queryClient.invalidateQueries({ queryKey: ['cashFlowCurrentSession'] });
      router.back();
      Alert.alert('Success', 'Register closed successfully');
    } catch {
      Alert.alert('Error', 'Failed to close register');
    }
  };

  if (isLoadingSession) return <Loading />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: isTablet ? 40 : 24,
          paddingTop: insets.top + (isTablet ? 40 : 24),
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className={`w-full ${isTablet ? 'max-w-md self-center' : ''}`}>
          <Text
            className={`font-black uppercase text-center mb-8 text-foreground ${isTablet ? 'text-4xl' : 'text-3xl'}`}
          >
            CLOSE REGISTER
          </Text>

          <View
            className={`border border-border p-6 mb-8 ${isTablet ? 'p-8 pb-10' : ''}`}
          >
            <Text className="text-center font-bold tracking-widest uppercase text-xs text-muted-foreground mb-3">
              EXPECTED CASH
            </Text>
            <Text
              className={`text-center font-black text-foreground ${isTablet ? 'text-5xl' : 'text-4xl'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(expectedCash)}
            </Text>
          </View>

          <Input
            label="ACTUAL CLOSING CASH"
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />

          <View className="gap-3 mt-10">
            <Button
              title="CLOSE REGISTER"
              variant="danger"
              onPress={handleClose}
              isLoading={isLoading}
            />
            <Button
              title="CANCEL"
              variant="outline"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
import { closeDrawer, getCurrentSession } from '@/api/endpoints';
import { Button, Input, Loading } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CloseDrawerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const [amount, setAmount] = useState('');

  const {
    data: session,
    isLoading: isLoadingSession,
    execute: fetchSession,
  } = useApi(getCurrentSession);
  const { isLoading, execute: submitClose } = useApi(closeDrawer);

  useEffect(() => {
    fetchSession();
  }, []);

  const handleClose = async () => {
    if (!amount || !session) return;

    try {
      await submitClose({
        session_id: session.id,
        closing_balance: Number(amount),
        closed_by: 'Admin', // TODO: Auth
      });
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
            >
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(session?.actual_balance || 0)}
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

import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { closeDrawer, getCurrentSession } from '@/api/endpoints';
import { Button, Input, Loading } from '@/components/ui';

export default function CloseDrawerScreen() {
  const router = useRouter();
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
    <View className="flex-1 bg-background p-6 justify-center">
      <Text className="text-2xl font-black uppercase text-center mb-6 text-foreground">
        Close Register
      </Text>

      <View className="bg-muted p-4 rounded-lg mb-6">
        <Text className="text-center text-muted-foreground font-bold uppercase text-xs">
          Expected Cash
        </Text>
        <Text className="text-center text-2xl font-black text-foreground">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
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

      <View className="gap-3 mt-6">
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
  );
}

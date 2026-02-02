import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { openDrawer } from '@/api/endpoints';
import { Button, Input } from '@/components/ui';

export default function OpenDrawerScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { isLoading, execute: submitOpen } = useApi(openDrawer);

  const handleOpen = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter opening balance');
      return;
    }

    try {
      await submitOpen({
        opening_balance: Number(amount),
        opened_by: 'Admin', // TODO: Get from auth context
        notes: notes,
      });
      router.back();
      Alert.alert('Success', 'Register opened successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to open register');
    }
  };

  return (
    <View
      className="flex-1 bg-white p-6 justify-center"
      style={{ marginBottom: 100 }}
    >
      <Text className="text-2xl font-black uppercase text-center mb-6">
        Open Register
      </Text>

      <Input
        label="OPENING BALANCE"
        placeholder="0"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        autoFocus
      />

      <Input
        label="NOTES (OPTIONAL)"
        placeholder="e.g. Shift start..."
        value={notes}
        onChangeText={setNotes}
      />

      <View className="gap-3 mt-6">
        <Button
          title="OPEN REGISTER"
          onPress={handleOpen}
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

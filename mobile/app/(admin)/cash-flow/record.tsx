import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { recordCashFlow, getCashFlowCategories } from '@/api/endpoints';
import { Button, Input, Loading } from '@/components/ui';

export default function RecordCashFlowScreen() {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // TODO: Add Category Selection
  // const { data: categories } = useApi(getCashFlowCategories, { executeOnMount: true });

  const { isLoading, execute: submitRecord } = useApi(recordCashFlow);

  const handleSubmit = async () => {
    if (!amount) return;

    try {
      await submitRecord({
        category_id: 'general', // Placeholder/Default
        type,
        amount: Number(amount),
        description,
        created_by: 'Admin',
      });
      router.back();
      Alert.alert('Success', 'Recorded successfully');
    } catch {
      Alert.alert('Error', 'Failed to record');
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-black uppercase text-center mb-6">
        Record Cash Flow
      </Text>

      <View className="flex-row gap-4 mb-6">
        <Button
          title="EXPENSE (OUT)"
          variant={type === 'expense' ? 'danger' : 'outline'}
          className="flex-1"
          onPress={() => setType('expense')}
        />
        <Button
          title="INCOME (IN)"
          variant={type === 'income' ? 'primary' : 'outline'}
          className="flex-1"
          onPress={() => setType('income')}
        />
      </View>

      <Input
        label="AMOUNT"
        placeholder="0"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        autoFocus
      />

      <Input
        label="DESCRIPTION"
        placeholder="e.g. Buying supplies..."
        value={description}
        onChangeText={setDescription}
      />

      <View className="gap-3 mt-6">
        <Button title="SAVE" onPress={handleSubmit} isLoading={isLoading} />
        <Button
          title="CANCEL"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

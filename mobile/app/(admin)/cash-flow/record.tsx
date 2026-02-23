import React, { useState } from 'react';
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
import { recordCashFlow } from '@/api/endpoints';
import { Button, Input, Loading } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecordCashFlowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

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
            RECORD CASH
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

          <View className="mt-4">
            <Input
              label="DESCRIPTION"
              placeholder="e.g. Buying supplies..."
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View className="gap-3 mt-10">
            <Button title="SAVE" onPress={handleSubmit} isLoading={isLoading} />
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

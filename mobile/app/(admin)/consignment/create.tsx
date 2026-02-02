import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { createConsignor } from '@/api/endpoints';
import { Button, Input } from '@/components/ui';

export default function CreateConsignorScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const { isLoading, execute: submitCreate } = useApi(createConsignor);

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Name and Phone are required');
      return;
    }

    try {
      await submitCreate({
        name,
        phone,
        bank_name: bankName || undefined,
        bank_account: bankAccount || undefined,
      });
      router.back();
      Alert.alert('Success', 'Consignor added successfully');
    } catch {
      Alert.alert('Error', 'Failed to add consignor');
    }
  };

  return (
    <View
      className="flex-1 bg-white p-6 justify-center"
      style={{ marginBottom: 100 }}
    >
      <Text className="text-2xl font-black uppercase text-center mb-6">
        Add Consignor
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="NAME"
          placeholder="Supplier Name"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Input
          label="PHONE NUMBER"
          placeholder="08..."
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View className="h-4" />
        <Text className="text-secondary-500 font-bold text-xs uppercase mb-2">
          Bank Details (Optional)
        </Text>

        <Input
          label="BANK NAME"
          placeholder="e.g. BCA, Mandiri"
          value={bankName}
          onChangeText={setBankName}
        />

        <Input
          label="ACCOUNT NUMBER"
          placeholder="123..."
          keyboardType="numeric"
          value={bankAccount}
          onChangeText={setBankAccount}
        />

        <View className="gap-3 mt-8">
          <Button
            title="SAVE SUPPLIER"
            onPress={handleSave}
            isLoading={isLoading}
          />
          <Button
            title="CANCEL"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

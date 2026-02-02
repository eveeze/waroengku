import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { adjustRefillableStock } from '@/api/endpoints';
import { Button, Input } from '@/components/ui';

export default function AdjustRefillableScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    current_empty: string;
    current_full: string;
  }>();

  const [emptyChange, setEmptyChange] = useState('');
  const [fullChange, setFullChange] = useState('');
  const [notes, setNotes] = useState('');

  const { isLoading, execute: submitAdjust } = useApi(adjustRefillableStock);

  const handleAdjust = async () => {
    if (!emptyChange && !fullChange) {
      Alert.alert('Error', 'Please enter at least one change value');
      return;
    }

    try {
      await submitAdjust({
        container_id: params.id!,
        empty_change: Number(emptyChange || 0),
        full_change: Number(fullChange || 0),
        notes,
      });
      router.back();
      Alert.alert('Success', 'Stock updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const getPreview = (current: string, change: string) => {
    const curr = Number(current || 0);
    const chg = Number(change || 0);
    const result = curr + chg;
    return result < 0 ? 0 : result;
  };

  return (
    <View
      className="flex-1 bg-white p-6 justify-center"
      style={{ marginBottom: 100 }}
    >
      <Text className="text-secondary-500 font-bold uppercase text-xs text-center mb-1">
        Adjusting Stock For
      </Text>
      <Text className="text-3xl font-heading uppercase text-center mb-8 text-primary-900">
        {params.name}
      </Text>

      <View className="flex-row gap-4 mb-4">
        {/* Empty Column */}
        <View className="flex-1">
          <View className="bg-red-50 p-3 rounded-t-lg border-x border-t border-red-100 items-center">
            <Text className="text-red-500 font-bold text-[10px] uppercase">
              Empty
            </Text>
            <Text className="text-xl font-black text-red-900">
              {params.current_empty}
            </Text>
          </View>
          <View className="bg-white border-x border-b border-secondary-200 p-2 rounded-b-lg">
            <Input
              placeholder="+/-"
              keyboardType="numeric" // Ideally allows negative, but RN numeric keyboard is tricky. Users might need to type '-' first or use a toggle.
              // For simplicity, we just use text input that accepts logic.
              // In a real app, explicit Add/Remove buttons are better.
              value={emptyChange}
              onChangeText={setEmptyChange}
              className="text-center"
            />
            <Text className="text-center text-[10px] text-secondary-400 mt-1">
              New: {getPreview(params.current_empty!, emptyChange)}
            </Text>
          </View>
        </View>

        {/* Full Column */}
        <View className="flex-1">
          <View className="bg-green-50 p-3 rounded-t-lg border-x border-t border-green-100 items-center">
            <Text className="text-green-500 font-bold text-[10px] uppercase">
              Full
            </Text>
            <Text className="text-xl font-black text-green-900">
              {params.current_full}
            </Text>
          </View>
          <View className="bg-white border-x border-b border-secondary-200 p-2 rounded-b-lg">
            <Input
              placeholder="+/-"
              keyboardType="numeric"
              value={fullChange}
              onChangeText={setFullChange}
              className="text-center"
            />
            <Text className="text-center text-[10px] text-secondary-400 mt-1">
              New: {getPreview(params.current_full!, fullChange)}
            </Text>
          </View>
        </View>
      </View>

      <Input
        label="NOTES / REASON"
        placeholder="e.g. Broken, Supplier Delivery..."
        value={notes}
        onChangeText={setNotes}
      />

      <View className="gap-3 mt-6">
        <Button
          title="CONFIRM ADJUSTMENT"
          onPress={handleAdjust}
          isLoading={isLoading}
        />
        <Button
          title="CANCEL"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>

      <Text className="text-center text-secondary-400 text-[10px] mt-4 px-8">
        Use negative numbers (e.g. -5) to reduce stock. Positive numbers add
        stock.
      </Text>
    </View>
  );
}

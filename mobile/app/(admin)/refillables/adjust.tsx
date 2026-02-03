import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { adjustRefillableStock } from '@/api/endpoints';
import { RefillableContainer } from '@/api/types';
import { Button, Input } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';

export default function AdjustRefillableScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    current_empty: string;
    current_full: string;
  }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [emptyChange, setEmptyChange] = useState('');
  const [fullChange, setFullChange] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: mutateAdjust, isPending: isLoading } = useOptimisticMutation(
    async (data: any) => adjustRefillableStock(data),
    {
      queryKey: ['/refillables'],
      updater: (old: RefillableContainer[] | undefined, variables: any) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id === variables.container_id) {
            return {
              ...c,
              empty_count: Math.max(0, c.empty_count + variables.empty_change),
              full_count: Math.max(0, c.full_count + variables.full_change),
            };
          }
          return c;
        });
      },
      onSuccess: () => {
        Alert.alert('Success', 'Stock updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to update stock');
      },
    },
  );

  const handleAdjust = () => {
    const eChange = Number(emptyChange || 0);
    const fChange = Number(fullChange || 0);

    if (eChange === 0 && fChange === 0) {
      Alert.alert('Error', 'Please enter at least one change value');
      return;
    }

    mutateAdjust({
      container_id: params.id!,
      empty_change: eChange,
      full_change: fChange,
      notes,
    });
  };

  const getPreview = (current: string, change: string) => {
    const curr = Number(current || 0);
    const chg = Number(change || 0);
    const result = curr + chg;
    return result < 0 ? 0 : result;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header (Minimal) */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-secondary-500 font-bold uppercase text-xs mb-1 tracking-widest">
          Adjusting Stock For
        </Text>
        <Text className="text-3xl font-black uppercase text-primary-900 tracking-tighter">
          {params.name}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View className="flex-row gap-4 mb-4">
            {/* Empty Column */}
            <View className="flex-1">
              <View className="bg-red-50 p-4 rounded-none border border-red-100 items-center mb-2">
                <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">
                  Empty
                </Text>
                <Text className="text-3xl font-black text-red-900">
                  {params.current_empty}
                </Text>
              </View>
              <View>
                <Input
                  placeholder="+/-"
                  keyboardType="numeric"
                  value={emptyChange}
                  onChangeText={setEmptyChange}
                  className="text-center font-bold text-lg"
                />
                <Text className="text-center text-[10px] text-secondary-500 mt-1 font-bold uppercase tracking-wide">
                  New: {getPreview(params.current_empty!, emptyChange)}
                </Text>
              </View>
            </View>

            {/* Full Column */}
            <View className="flex-1">
              <View className="bg-green-50 p-4 rounded-none border border-green-100 items-center mb-2">
                <Text className="text-green-600 font-black text-[10px] uppercase tracking-widest mb-1">
                  Full
                </Text>
                <Text className="text-3xl font-black text-green-700">
                  {params.current_full}
                </Text>
              </View>
              <View>
                <Input
                  placeholder="+/-"
                  keyboardType="numeric"
                  value={fullChange}
                  onChangeText={setFullChange}
                  className="text-center font-bold text-lg"
                />
                <Text className="text-center text-[10px] text-secondary-500 mt-1 font-bold uppercase tracking-wide">
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

          <View className="gap-3 mt-8">
            <Button
              title="CONFIRM ADJUSTMENT"
              onPress={handleAdjust}
              isLoading={isLoading}
            />
          </View>

          <Text className="text-center text-secondary-400 text-[10px] mt-6 px-8 font-bold uppercase tracking-wide leading-relaxed">
            Use negative numbers (e.g. -5) to reduce stock. Positive numbers add
            stock.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Helper for header back button
import { TouchableOpacity } from 'react-native';

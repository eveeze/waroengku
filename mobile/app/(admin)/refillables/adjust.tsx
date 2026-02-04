import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { adjustRefillableStock } from '@/api/endpoints';
import { RefillableContainer } from '@/api/types';
import { Button, Input } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';

type AdjustMode = 'add' | 'reduce';

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

  const [mode, setMode] = useState<AdjustMode>('add');
  const [emptyAmount, setEmptyAmount] = useState('');
  const [fullAmount, setFullAmount] = useState('');
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
    const eAmount = Number(emptyAmount || 0);
    const fAmount = Number(fullAmount || 0);

    if (eAmount === 0 && fAmount === 0) {
      Alert.alert('Error', 'Please enter at least one amount');
      return;
    }

    const multiplier = mode === 'reduce' ? -1 : 1;

    mutateAdjust({
      container_id: params.id!,
      empty_change: eAmount * multiplier,
      full_change: fAmount * multiplier,
      notes,
    });
  };

  const getPreview = (current: string, amount: string) => {
    const curr = Number(current || 0);
    const amt = Number(amount || 0);
    const multiplier = mode === 'reduce' ? -1 : 1;
    const result = curr + amt * multiplier;
    return result < 0 ? 0 : result;
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-muted-foreground font-bold uppercase text-xs mb-1 tracking-widest">
          Adjusting Stock For
        </Text>
        <Text className="text-3xl font-black uppercase text-foreground tracking-tighter">
          {params.name}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Mode Toggle */}
          <View className="flex-row gap-4 mb-6">
            <Button
              title="+ Add Stock"
              variant={mode === 'add' ? 'primary' : 'outline'}
              onPress={() => setMode('add')}
              className="flex-1"
            />
            <Button
              title="- Reduce Stock"
              variant={mode === 'reduce' ? 'danger' : 'outline'}
              onPress={() => setMode('reduce')}
              className="flex-1"
            />
          </View>

          <View className="flex-row gap-4 mb-4">
            {/* Empty Column */}
            <View className="flex-1">
              <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-none border border-red-100 dark:border-red-900/30 items-center mb-2">
                <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">
                  Empty
                </Text>
                <Text className="text-3xl font-black text-red-900 dark:text-red-400">
                  {params.current_empty}
                </Text>
              </View>
              <View>
                <Input
                  placeholder="0"
                  keyboardType="numeric"
                  value={emptyAmount}
                  onChangeText={setEmptyAmount}
                  className={`text-center font-bold text-lg ${
                    mode === 'reduce' ? 'text-red-600' : 'text-green-600'
                  }`}
                />
                <Text className="text-center text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wide">
                  New: {getPreview(params.current_empty!, emptyAmount)}
                </Text>
              </View>
            </View>

            {/* Full Column */}
            <View className="flex-1">
              <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-none border border-green-100 dark:border-green-900/30 items-center mb-2">
                <Text className="text-green-600 font-black text-[10px] uppercase tracking-widest mb-1">
                  Full
                </Text>
                <Text className="text-3xl font-black text-green-700 dark:text-green-400">
                  {params.current_full}
                </Text>
              </View>
              <View>
                <Input
                  placeholder="0"
                  keyboardType="numeric"
                  value={fullAmount}
                  onChangeText={setFullAmount}
                  className={`text-center font-bold text-lg ${
                    mode === 'reduce' ? 'text-red-600' : 'text-green-600'
                  }`}
                />
                <Text className="text-center text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wide">
                  New: {getPreview(params.current_full!, fullAmount)}
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
              title={
                mode === 'add' ? 'ADD SELECTED STOCK' : 'REDUCE SELECTED STOCK'
              }
              variant={mode === 'reduce' ? 'danger' : 'primary'}
              onPress={handleAdjust}
              isLoading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

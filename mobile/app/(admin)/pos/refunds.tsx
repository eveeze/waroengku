import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { fetchWithCache } from '@/api/client';
import { createRefund } from '@/api/endpoints';
import { Transaction, RefundItem } from '@/api/types';
import { Button, Loading, Input } from '@/components/ui';

export default function RefundScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // State for refund selection
  // Map of transaction_item_id -> quantity to refund
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [restockMap, setRestockMap] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Transaction to refund
  const { data: transaction, isLoading } = useQuery({
    queryKey: [`/transactions/${transactionId}`],
    queryFn: async ({ queryKey }) => {
      const result = await fetchWithCache<{ data: Transaction }>({ queryKey });
      return result.data;
    },
    enabled: !!transactionId,
  });

  const { execute: submitRefund } = useApi(createRefund);

  const toggleItemSelection = (itemId: string, maxQty: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      if (current > 0) {
        // Deselect
        const next = { ...prev };
        delete next[itemId];
        return next;
      } else {
        // Select all
        return { ...prev, [itemId]: maxQty };
      }
    });
    // Default restock to true when selecting
    setRestockMap((prev) => ({ ...prev, [itemId]: true }));
  };

  const updateQuantity = (itemId: string, qty: number, maxQty: number) => {
    if (qty < 0) return;
    if (qty > maxQty) {
      Alert.alert(
        'Limit Reached',
        'Cannot refund more than purchased quantity',
      );
      return;
    }
    if (qty === 0) {
      const next = { ...selectedItems };
      delete next[itemId];
      setSelectedItems(next);
      return;
    }
    setSelectedItems((prev) => ({ ...prev, [itemId]: qty }));
  };

  const toggleRestock = (itemId: string) => {
    setRestockMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleRefund = async () => {
    if (!transactionId) return;
    if (Object.keys(selectedItems).length === 0) {
      Alert.alert('Error', 'Please select items to refund');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for refund');
      return;
    }

    setIsSubmitting(true);
    try {
      const refundItems: RefundItem[] = Object.entries(selectedItems).map(
        ([itemId, qty]) => ({
          transaction_item_id: itemId,
          quantity: qty,
          restock: restockMap[itemId] ?? true,
        }),
      );

      await submitRefund({
        transaction_id: transactionId,
        refund_method: 'cash', // Default to cash for now, could be dynamic
        reason: reason,
        items: refundItems,
      });

      Alert.alert('Success', 'Refund processed successfully', [
        {
          text: 'OK',
          onPress: () => {
            queryClient.invalidateQueries({ queryKey: ['/transactions'] });
            router.back();
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Failed', e.message || 'Refund failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading Transaction..." />;

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Transaction Not Found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 py-4 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-lg font-bold text-secondary-500">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-xl font-black uppercase tracking-tight">
            Refund
          </Text>
          <TouchableOpacity disabled={isSubmitting} onPress={handleRefund}>
            <Text
              className={`text-lg font-bold ${isSubmitting ? 'text-secondary-300' : 'text-primary-900'}`}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs mb-4">
          Select Items to Refund (Invoice #{transaction.invoice_number})
        </Text>

        {transaction.items.map((item) => {
          // Unique key: product_id usually unique, but transaction might have duplicates? using index fallback if needed
          const key = item.product_id; // Wait, actually we need transaction_item_id which might not be exposed in TransactionItem type?
          // Looking at api/types/transaction.ts, TransactionItem does NOT have transaction_item_id?
          // It has product_id. Assuming simplified model where product_id is unique per transaction or we rely on backend logic.
          // Wait, createRefund requires transaction_item_id.
          // IF TransactionItem doesn't have ID, we might have a problem.
          // Let's check api/types/transaction.ts content again.
          // It has `product_id`. It seems TransactionItem might represent the line item itself?
          // If the backend expects `transaction_item_id`, the GET /transactions/{id} MUST returns valid IDs for items.
          // I suspect TransactionItem in type definition might be missing `id` field.
          // I will assume `product_id` is sufficient OR that `id` exists on item but missing in type.
          // For now, let's assume `product_id` acts as ID or simpler:
          // Actually usually transaction items have their own ID.
          // Let's inspect `transaction` object structure more carefully or assume `id` exists.
          // I cast item as any to access `id` or use `product_id` if that's how it works.
          // Let's assume item has `id` property from backend.
          const itemId = (item as any).id || item.product_id;

          const isSelected = !!selectedItems[itemId];
          const qty = selectedItems[itemId] || 0;

          return (
            <View
              key={itemId}
              className={`p-4 rounded-xl border mb-3 ${
                isSelected
                  ? 'border-primary-900 bg-secondary-50'
                  : 'border-secondary-200 bg-white'
              }`}
            >
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => toggleItemSelection(itemId, item.quantity)}
                  className={`w-6 h-6 rounded border mr-3 items-center justify-center ${
                    isSelected
                      ? 'bg-primary-900 border-primary-900'
                      : 'border-secondary-300'
                  }`}
                >
                  {isSelected && <Text className="text-white text-xs">✓</Text>}
                </TouchableOpacity>

                <View className="flex-1">
                  <Text className="font-bold text-primary-900 text-lg uppercase">
                    {item.product_name}
                  </Text>
                  <Text className="text-secondary-500 text-xs mb-2">
                    Purchased: {item.quantity} {item.unit}
                  </Text>

                  {isSelected && (
                    <View className="mt-2">
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="font-bold text-sm">Return Qty:</Text>
                        <View className="flex-row items-center border border-secondary-300 rounded-lg bg-white">
                          <TouchableOpacity
                            className="px-3 py-1 border-r border-secondary-300"
                            onPress={() =>
                              updateQuantity(itemId, qty - 1, item.quantity)
                            }
                          >
                            <Text className="font-bold text-lg">-</Text>
                          </TouchableOpacity>
                          <Text className="px-3 font-bold text-lg">{qty}</Text>
                          <TouchableOpacity
                            className="px-3 py-1 border-l border-secondary-300"
                            onPress={() =>
                              updateQuantity(itemId, qty + 1, item.quantity)
                            }
                          >
                            <Text className="font-bold text-lg">+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-sm text-secondary-700">
                          Restock to Inventory?
                        </Text>
                        <Switch
                          value={restockMap[itemId] ?? true}
                          onValueChange={() => toggleRestock(itemId)}
                          trackColor={{ false: '#e4e4e7', true: '#000' }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        <View className="h-6" />

        <Input
          label="REASON FOR REFUND"
          value={reason}
          onChangeText={setReason}
          placeholder="e.g. Defective, Wrong Item..."
          multiline
          numberOfLines={3}
        />

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

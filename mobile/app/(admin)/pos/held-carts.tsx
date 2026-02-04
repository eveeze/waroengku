import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import {
  getHeldCarts,
  resumeCart,
  discardCart,
  getProductById,
} from '@/api/endpoints';
import { HeldCart } from '@/api/types';
import { useCartStore } from '@/stores/cartStore';

export default function HeldCartsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, setCustomer, clearCart } = useCartStore();
  const [carts, setCarts] = useState<HeldCart[]>([]);

  const { execute: fetchCarts, isLoading } = useApi(getHeldCarts);
  const { execute: resume, isLoading: isResuming } = useApi(resumeCart);
  const { execute: discard, isLoading: isDiscarding } = useApi(discardCart);

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    const result = await fetchCarts();
    if (result) setCarts(result);
  };

  const handleResume = async (cartId: string) => {
    try {
      const cart = await resume(cartId);
      if (cart && cart.items) {
        clearCart();

        // Fetch all products in parallel
        const productPromises = cart.items.map((item) =>
          getProductById(item.product_id)
            .then((product) => ({ product, quantity: item.quantity }))
            .catch(() => null),
        );

        const results = await Promise.all(productPromises);
        let successCount = 0;

        results.forEach((result) => {
          if (result && result.product) {
            addItem(result.product, result.quantity);
            successCount++;
          }
        });

        if (successCount > 0) {
          router.back();
          Alert.alert('Cart Resumed', `${successCount} items restored.`);
        } else {
          Alert.alert(
            'Error',
            'Could not restore items (Products might be deleted).',
          );
        }
      }
    } catch {}
  };

  const handleDiscard = async (cartId: string) => {
    Alert.alert('Discard Cart', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await discard(cartId);
          loadCarts();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="px-6 py-4 border-b border-secondary-100 flex-row items-center gap-4"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold uppercase tracking-tight">
          Held Carts
        </Text>
      </View>

      <FlatList
        data={carts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View className="bg-white border border-secondary-200 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="font-bold text-lg">
                {item.held_at
                  ? new Date(item.held_at).toLocaleTimeString()
                  : 'Unknown Time'}
              </Text>
              <Text className="text-secondary-500 font-medium">
                {item.items.length} Items
              </Text>
            </View>
            <Text className="text-secondary-500 mb-4">
              Held by: {item.held_by}
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleDiscard(item.id)}
                className="flex-1 bg-secondary-100 py-3 rounded-lg items-center"
              >
                <Text className="font-bold text-secondary-700">Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleResume(item.id)}
                className="flex-1 bg-black py-3 rounded-lg items-center"
              >
                <Text className="font-bold text-white">Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Text className="text-secondary-400 font-bold">
                No Held Carts
              </Text>
            </View>
          ) : (
            <ActivityIndicator className="mt-10" />
          )
        }
      />
    </View>
  );
}

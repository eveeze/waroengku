import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  Platform,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { adjustStock, searchProductByBarcode } from '@/api/endpoints';
import { Input } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';
import { Product } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';

export default function AdjustScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'increase' | 'decrease'>('decrease');
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (code: string = barcodeInput) => {
    if (!code) return;
    setIsSearching(true);
    try {
      const found = await searchProductByBarcode(code);
      if (found) {
        setProduct(found);
      } else {
        Alert.alert('Not Found', 'Product not found');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to search product');
    } finally {
      setIsSearching(false);
    }
  };

  const handleScan = (code: string) => {
    if (!showScanner) return;
    setShowScanner(false);
    setBarcodeInput(code);
    handleSearch(code);
  };

  const { mutate: mutateAdjust, isPending } = useOptimisticMutation(
    async () => {
      const qty = Number(quantity) * (type === 'decrease' ? -1 : 1);
      return adjustStock({
        product_id: product!.id,
        quantity: qty,
        reason: reason || 'Manual adjustment',
      });
    },
    {
      queryKey: ['/products'], // General cache
      updater: (old: Product[] | undefined) => {
        return old;
      },
      onSuccess: () => {
        // Invalidate specific product cache
        if (product) {
          queryClient.invalidateQueries({
            queryKey: [`/products/${product.id}`],
          });
        }

        if (Platform.OS === 'android') {
          ToastAndroid.show('Stock updated successfully', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Stock updated');
        }
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to adjust stock');
      },
    },
  );

  const handleSubmit = () => {
    if (!product || !quantity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    mutateAdjust(undefined);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      {/* Swiss Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </Pressable>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          ADJUST STOCK
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Product Selection */}
        <View className="mb-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
            Target Product
          </Text>

          {!product ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input
                  placeholder="Scan or Type Barcode"
                  value={barcodeInput}
                  onChangeText={setBarcodeInput}
                  onSubmitEditing={() => handleSearch(barcodeInput)}
                />
              </View>
              <Pressable
                onPress={() => setShowScanner(true)}
                className="w-12 h-12 bg-black items-center justify-center border border-black"
              >
                <Text className="text-white text-xl">📷</Text>
              </Pressable>
            </View>
          ) : (
            <View className="bg-secondary-50 p-6 border border-secondary-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="font-heading font-black text-2xl uppercase text-primary-900 leading-tight mb-1">
                    {product.name}
                  </Text>
                  <Text className="text-secondary-500 font-bold uppercase text-xs tracking-wider">
                    Current: {product.current_stock}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setProduct(null);
                    setBarcodeInput('');
                    setQuantity('');
                  }}
                  className="bg-secondary-200 px-3 py-1.5"
                >
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-secondary-900">
                    CHANGE
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {product && (
          <View className="animate-fade-in-down">
            <View className="mb-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
                Action
              </Text>
              <View className="flex-row gap-4">
                <Pressable
                  onPress={() => setType('decrease')}
                  className={`flex-1 py-4 border-2 items-center justify-center rounded-lg ${
                    type === 'decrease'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-white border-secondary-100'
                  }`}
                >
                  <Text
                    className={`font-black uppercase tracking-wide ${
                      type === 'decrease'
                        ? 'text-red-600'
                        : 'text-secondary-400'
                    }`}
                  >
                    REMOVE (-)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setType('increase')}
                  className={`flex-1 py-4 border-2 items-center justify-center rounded-lg ${
                    type === 'increase'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-secondary-100'
                  }`}
                >
                  <Text
                    className={`font-black uppercase tracking-wide ${
                      type === 'increase'
                        ? 'text-green-600'
                        : 'text-secondary-400'
                    }`}
                  >
                    ADD (+)
                  </Text>
                </Pressable>
              </View>
            </View>

            <Input
              label="QUANTITY"
              placeholder="0"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />

            <View className="h-4" />

            <Input
              label="REASON"
              placeholder="e.g. Damaged, Expired..."
              value={reason}
              onChangeText={setReason}
            />

            <View className="h-8" />

            <Pressable
              onPress={handleSubmit}
              disabled={isPending}
              className={`py-4 items-center justify-center rounded-xl bg-primary-900 ${
                isPending ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-white font-bold text-lg uppercase tracking-widest">
                {isPending ? 'Saving...' : 'Confirm Adjustment'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

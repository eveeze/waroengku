import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import {
  adjustStock,
  searchProductByBarcode,
  getProductById,
} from '@/api/endpoints';
import { Button, Input } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';
import { Product } from '@/api/types';

export default function AdjustScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'increase' | 'decrease'>('decrease'); // 'increase' is rare for adjustment, usually correction
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  const { execute: submitAdjust, isLoading: isSubmitting } =
    useApi(adjustStock);
  const { execute: searchProduct, isLoading: isSearching } = useApi(
    searchProductByBarcode,
  );

  const handleScan = async (code: string) => {
    setShowScanner(false);
    setBarcodeInput(code);
    const found = await searchProduct(code);
    if (found) setProduct(found);
    else Alert.alert('Not Found', 'Product not found');
  };

  const handleSearch = async () => {
    if (!barcodeInput) return;
    const found = await searchProduct(barcodeInput);
    if (found) setProduct(found);
    else Alert.alert('Not Found', 'Product not found');
  };

  const handleSubmit = async () => {
    if (!product || !quantity || !reason) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // adjustStock expects a delta number. Positive adds stock, negative removes.
    const delta = Number(quantity) * (type === 'decrease' ? -1 : 1);

    try {
      await submitAdjust({
        product_id: product.id,
        quantity: delta,
        reason: reason,
      });

      Alert.alert('Success', 'Stock adjusted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to adjust stock');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      <View
        className="px-6 py-4 border-b border-secondary-100 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="font-bold text-lg">Close</Text>
        </TouchableOpacity>
        <Text className="font-bold text-lg">ADJUST STOCK</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Product Selection */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase text-secondary-500 mb-2">
            Target Product
          </Text>

          {!product ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input
                  placeholder="Scan/Type Barcode"
                  value={barcodeInput}
                  onChangeText={setBarcodeInput}
                  onSubmitEditing={handleSearch}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowScanner(true)}
                className="w-12 h-12 bg-black rounded-lg items-center justify-center"
              >
                <Text className="text-white text-xl">📷</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-secondary-50 p-4 rounded-lg flex-row justify-between items-center">
              <View>
                <Text className="font-bold text-lg">{product.name}</Text>
                <Text className="text-secondary-500">
                  Current Stock: {product.current_stock}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setProduct(null);
                  setBarcodeInput('');
                }}
              >
                <Text className="text-danger-600 font-bold">CHANGE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {product && (
          <View className="animate-fade-in-down">
            <Text className="text-xs font-bold uppercase text-secondary-500 mb-2">
              Adjust Type
            </Text>
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity
                onPress={() => setType('decrease')}
                className={`flex-1 py-3 rounded-lg border items-center ${type === 'decrease' ? 'bg-danger-50 border-danger-500' : 'bg-white border-secondary-200'}`}
              >
                <Text
                  className={`${type === 'decrease' ? 'text-danger-700 font-bold' : 'text-secondary-500'}`}
                >
                  REMOVE (-)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setType('increase')}
                className={`flex-1 py-3 rounded-lg border items-center ${type === 'increase' ? 'bg-green-50 border-green-500' : 'bg-white border-secondary-200'}`}
              >
                <Text
                  className={`${type === 'increase' ? 'text-green-700 font-bold' : 'text-secondary-500'}`}
                >
                  ADD (+)
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="QUANTITY"
              placeholder="0"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />

            <Input
              label="REASON"
              placeholder="e.g. Broken, Lost, Found..."
              value={reason}
              onChangeText={setReason}
            />

            <Button
              title="CONFIRM ADJUSTMENT"
              size="lg"
              className="mt-4"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              variant={type === 'decrease' ? 'danger' : 'primary'}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

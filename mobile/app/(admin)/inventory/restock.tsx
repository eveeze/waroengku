import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import {
  restockProduct,
  searchProductByBarcode,
  getProductById,
} from '@/api/endpoints';
import { Button, Input, Loading } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';
import { Product } from '@/api/types';

export default function RestockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  const { execute: submitRestock, isLoading: isSubmitting } =
    useApi(restockProduct);
  const { execute: searchProduct, isLoading: isSearching } = useApi(
    searchProductByBarcode,
  );

  const handleScan = async (code: string) => {
    if (!showScanner) return;
    setShowScanner(false);
    setBarcodeInput(code);
    const found = await searchProduct(code);
    if (found) {
      setProduct(found);
      setCostPrice(String(found.cost_price)); // Pre-fill with current cost
    } else {
      Alert.alert('Not Found', 'Product not found');
    }
  };

  const handleSearch = async () => {
    if (!barcodeInput) return;
    const found = await searchProduct(barcodeInput);
    if (found) {
      setProduct(found);
      setCostPrice(String(found.cost_price));
    } else {
      Alert.alert('Not Found', 'Product not found');
    }
  };

  const handleSubmit = async () => {
    if (!product || !quantity) return;

    try {
      await submitRestock({
        product_id: product.id,
        quantity: Number(quantity),
        cost_per_unit: Number(costPrice),
        supplier: supplier || undefined,
        notes: notes || undefined,
      });

      Alert.alert('Success', 'Restock recorded successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to restock');
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
        <Text className="font-bold text-lg">RESTOCK</Text>
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
            <Input
              label="QUANTITY ADDED"
              placeholder="0"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />

            <Input
              label="UNIT COST (IDR)"
              placeholder="0"
              keyboardType="numeric"
              value={costPrice}
              onChangeText={setCostPrice}
            />

            <Input
              label="SUPPLIER (Optional)"
              placeholder="e.g. Toko Sebelah"
              value={supplier}
              onChangeText={setSupplier}
            />

            <Input
              label="NOTES (Optional)"
              placeholder="Additional info..."
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-4 py-4 rounded-xl items-center justify-center bg-primary-900 ${
                isSubmitting ? 'opacity-50' : ''
              }`}
            >
              {isSubmitting ? (
                <Text className="text-white font-bold">LOADING...</Text>
              ) : (
                <Text className="text-white font-bold text-lg tracking-tight">
                  CONFIRM RESTOCK
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { restockProduct, searchProductByBarcode } from '@/api/endpoints';
import { Button, Input } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';
import { Product } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';

export default function RestockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
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
        setCostPrice(String(found.cost_price));
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

  const { mutate: mutateRestock, isPending } = useOptimisticMutation(
    async () => {
      return restockProduct({
        product_id: product!.id,
        quantity: Number(quantity),
        cost_per_unit: Number(costPrice),
        supplier: supplier || undefined,
        notes: notes || undefined,
      });
    },
    {
      queryKey: ['/products'],
      updater: (old: Product[] | undefined) => {
        return old;
      },
      onSuccess: () => {
        if (product) {
          queryClient.invalidateQueries({
            queryKey: [`/products/${product.id}`],
          });
        }

        if (Platform.OS === 'android') {
          ToastAndroid.show('Restock successful', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Restock successful');
        }
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to restock');
      },
    },
  );

  const handleSubmit = () => {
    if (!product || !quantity) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    mutateRestock(undefined);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      {/* Swiss Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
          RESTOCK
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Product Selection */}
        <View className="mb-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
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
              <TouchableOpacity
                onPress={() => setShowScanner(true)}
                className="w-12 h-12 bg-foreground items-center justify-center border border-foreground"
              >
                <Text className="text-background text-xl">📷</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-muted p-6 border border-border">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="font-heading font-black text-2xl uppercase text-foreground leading-tight mb-1">
                    {product.name}
                  </Text>
                  <Text className="text-muted-foreground font-bold uppercase text-xs tracking-wider">
                    Current: {product.current_stock}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setProduct(null);
                    setBarcodeInput('');
                    setQuantity('');
                  }}
                  className="bg-muted px-3 py-1.5"
                >
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    CHANGE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {product && (
          <View className="animate-fade-in-down">
            <Input
              label="QUANTITY ADDED *"
              placeholder="0"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />

            <View className="h-4" />

            <Input
              label="UNIT COST (IDR)"
              placeholder="0"
              keyboardType="numeric"
              value={costPrice}
              onChangeText={setCostPrice}
              helperText="Cost per item"
            />

            <View className="h-4" />

            <Input
              label="SUPPLIER (OPTIONAL)"
              placeholder="Store Name"
              value={supplier}
              onChangeText={setSupplier}
            />

            <View className="h-4" />

            <Input
              label="NOTES"
              placeholder="Additional info..."
              value={notes}
              onChangeText={setNotes}
            />

            <View className="h-8" />

            <Button
              title="CONFIRM RESTOCK"
              size="lg"
              fullWidth
              onPress={handleSubmit}
              isLoading={isPending}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

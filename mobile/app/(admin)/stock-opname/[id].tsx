import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import {
  getOpnameSession,
  recordOpnameCount,
  cancelOpnameSession,
} from '@/api/endpoints';
import { OpnameSession } from '@/api/types';
import { Loading, Button, Input, BarcodeScanner } from '@/components/ui';

export default function StockOpnameSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState<OpnameSession | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Manual Input State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productCode, setProductCode] = useState(''); // Identifier
  const [qty, setQty] = useState('');

  const { isLoading, execute: fetchSession } = useApi(() =>
    getOpnameSession(id!),
  );
  const { isLoading: isSubmitting, execute: submitCount } = useApi(
    (data: any) => recordOpnameCount(id!, data),
  );
  const { isLoading: isCancelling, execute: doCancel } = useApi(() =>
    cancelOpnameSession(id!),
  );

  useEffect(() => {
    if (id) loadSession();
  }, [id]);

  const loadSession = async () => {
    const data = await fetchSession();
    if (data) setSession(data);
  };

  const handleScan = (data: string) => {
    setProductCode(data);
    setShowScanner(false);
    // Ideally we'd fetch product name here to show confirmation,
    // but for now we just let user input quantity.
  };

  const handleManualSubmit = async () => {
    if (!productCode || !qty) {
      Alert.alert('Error', 'Please enter Product ID/Barcode and Quantity');
      return;
    }

    try {
      await submitCount({
        product_id: productCode, // Assuming barcode can work as ID or backend handles lookup
        physical_stock: Number(qty),
        counted_by: 'Admin',
        notes: 'Manual Entry',
      });

      Alert.alert('Success', 'Count Recorded');
      setProductCode('');
      setQty('');
      setBarcodeInput('');
    } catch {
      Alert.alert(
        'Error',
        'Failed to record count. Ensure Product ID is valid.',
      );
    }
  };

  const handleCancelSession = () => {
    Alert.alert('Cancel Session', 'Are you sure? This cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await doCancel();
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !session) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Loading message="Loading Session..." />
      </View>
    );
  }

  const isActive = session.status === 'active';

  return (
    <View className="flex-1 bg-white">
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 font-body">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-3xl font-heading font-black uppercase tracking-tighter text-black">
          Session #{session.session_number}
        </Text>
        <View className="flex-row items-center mt-2 gap-2">
          <View
            className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-secondary-500'}`}
          >
            <Text className="text-white text-[10px] font-bold uppercase font-body tracking-wider">
              {session.status}
            </Text>
          </View>
          <Text className="text-secondary-500 text-xs font-bold font-body">
            {session.created_by}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {isActive ? (
          <View>
            <View className="bg-secondary-50 p-6 rounded-2xl mb-8 border border-secondary-200">
              <Text className="text-center font-heading font-black uppercase text-xl mb-4 text-primary-900 tracking-tight">
                Record Count
              </Text>

              {!productCode ? (
                <View className="flex-row gap-2 mb-4">
                  <View className="flex-1">
                    <Input
                      placeholder="Scan or Enter Barcode"
                      value={barcodeInput}
                      onChangeText={setBarcodeInput}
                      onSubmitEditing={() => setProductCode(barcodeInput)}
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
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-bold uppercase text-secondary-500">
                      Product
                    </Text>
                    <TouchableOpacity onPress={() => setProductCode('')}>
                      <Text className="text-red-500 font-bold text-xs">
                        CHANGE
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-lg font-bold text-primary-900 bg-white p-3 rounded border border-secondary-200 text-center">
                    {productCode}
                  </Text>
                </View>
              )}

              {productCode && (
                <View>
                  <Input
                    label="PHYSICAL COUNT"
                    placeholder="0"
                    keyboardType="numeric"
                    value={qty}
                    onChangeText={setQty}
                    autoFocus
                  />
                  <Button
                    title="SUBMIT COUNT"
                    className="mt-4"
                    onPress={handleManualSubmit}
                    isLoading={isSubmitting}
                  />
                </View>
              )}
            </View>

            <View className="gap-3">
              <Button
                title="VIEW VARIANCE REPORT & FINALIZE"
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/stock-opname/variance',
                    params: { id: session.id },
                  })
                }
              />
              <Button
                title="CANCEL SESSION"
                variant="ghost"
                textClassName="text-red-500"
                onPress={handleCancelSession}
              />
            </View>
          </View>
        ) : (
          <View className="items-center py-10">
            <Text className="text-secondary-500 font-bold mb-4">
              Session is {session.status}
            </Text>
            <Button
              title="VIEW REPORT"
              onPress={() =>
                router.push({
                  pathname: '/(admin)/stock-opname/variance',
                  params: { id: session.id },
                })
              }
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

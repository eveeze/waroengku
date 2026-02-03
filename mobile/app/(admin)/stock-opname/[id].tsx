import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { recordOpnameCount, cancelOpnameSession } from '@/api/endpoints';
import { OpnameSession } from '@/api/types';
import { Loading, Button, Input } from '@/components/ui';
import { BarcodeScanner } from '@/components/shared';
import { useOptimisticMutation } from '@/hooks';

export default function StockOpnameSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productCode, setProductCode] = useState('');
  const [qty, setQty] = useState('');

  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`/opname-sessions/${id}`],
    queryFn: ({ queryKey }) => fetchWithCache<OpnameSession>({ queryKey }),
    enabled: !!id,
  });

  const { mutate: mutateCount, isPending: isSubmitting } =
    useOptimisticMutation(
      async () =>
        recordOpnameCount(id!, {
          product_id: productCode,
          physical_stock: Number(qty),
          counted_by: 'Admin',
          notes: 'Manual Entry',
        }),
      {
        queryKey: [`/opname-sessions/${id}`],
        updater: (old: OpnameSession | undefined) => old,
        invalidates: true,
        onSuccess: () => {
          if (Platform.OS === 'android') {
            ToastAndroid.show('Count Recorded', ToastAndroid.SHORT);
          } else {
            Alert.alert('Success', 'Count Recorded');
          }
          setProductCode('');
          setQty('');
          setBarcodeInput('');
          queryClient.invalidateQueries({
            queryKey: [`/opname-sessions/${id}/variance`],
          });
        },
        onError: (err: Error) => {
          Alert.alert('Error', err.message || 'Failed to record count');
        },
      },
    );

  const { mutate: mutateCancel, isPending: isCancelling } =
    useOptimisticMutation(async () => cancelOpnameSession(id!), {
      queryKey: ['/opname-sessions'],
      updater: (old: any) => old,
      onSuccess: () => {
        Alert.alert('Session Cancelled');
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to cancel session');
      },
    });

  const handleScan = (data: string) => {
    setProductCode(data);
    setShowScanner(false);
  };

  const handleManualSubmit = () => {
    if (!productCode || !qty) {
      Alert.alert('Error', 'Please enter Product Barcode and Quantity');
      return;
    }
    mutateCount(undefined);
  };

  const handleCancelSession = () => {
    Alert.alert('Cancel Session', 'Are you sure? This cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => mutateCancel(undefined),
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
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-3xl font-black uppercase tracking-tighter text-black">
          SESSION #{session.session_number}
        </Text>
        <View className="flex-row items-center mt-2 gap-2">
          <View
            className={`px-2 py-0.5 ${isActive ? 'bg-black' : 'bg-secondary-500'}`}
          >
            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
              {session.status}
            </Text>
          </View>
          <Text className="text-secondary-500 text-xs font-bold uppercase tracking-widest">
            {session.created_by}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isActive ? (
          <View>
            <View className="bg-secondary-50 p-6 rounded-none mb-8 border border-secondary-100">
              <Text className="text-center font-black uppercase text-xl mb-4 text-primary-900 tracking-tight">
                Record Count
              </Text>

              {!productCode ? (
                <View className="flex-row gap-2 mb-4">
                  <View className="flex-1">
                    <Input
                      placeholder="Scan/Type Barcode"
                      value={barcodeInput}
                      onChangeText={setBarcodeInput}
                      onSubmitEditing={() => setProductCode(barcodeInput)}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowScanner(true)}
                    className="w-12 h-12 bg-black items-center justify-center"
                  >
                    <Text className="text-white text-xl">📷</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-bold uppercase text-secondary-500 tracking-widest">
                      Product
                    </Text>
                    <TouchableOpacity onPress={() => setProductCode('')}>
                      <Text className="text-red-600 font-bold text-xs uppercase tracking-widest">
                        CHANGE
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-2xl font-black text-primary-900 bg-white p-4 border border-secondary-200 text-center uppercase tracking-tight">
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
                textClassName="text-red-600 font-bold uppercase tracking-widest"
                onPress={handleCancelSession}
                isLoading={isCancelling}
              />
            </View>
          </View>
        ) : (
          <View className="items-center py-10">
            <Text className="text-secondary-500 font-bold mb-4 uppercase tracking-widest">
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

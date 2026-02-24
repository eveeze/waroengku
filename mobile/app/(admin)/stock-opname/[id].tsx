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
import { useResponsive } from '@/hooks/useResponsive';

export default function StockOpnameSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productCode, setProductCode] = useState('');
  const [qty, setQty] = useState('');

  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`/stock-opname/sessions/${id}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetchWithCache<{ data: OpnameSession }>({ queryKey });
      return res.data;
    },
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
        queryKey: [`/stock-opname/sessions/${id}`],
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
            queryKey: [`/stock-opname/sessions/${id}/variance`],
          });
        },
        onError: (err: Error) => {
          Alert.alert('Error', err.message || 'Failed to record count');
        },
      },
    );

  const { mutate: mutateCancel, isPending: isCancelling } =
    useOptimisticMutation(async () => cancelOpnameSession(id!), {
      queryKey: ['/stock-opname/sessions'],
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
      <View className="flex-1 bg-background items-center justify-center">
        <Loading message="Loading Session..." />
      </View>
    );
  }

  const isActive = session.status === 'in_progress';

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
        className={`border-b border-border bg-background ${
          isTablet ? 'px-8 py-8' : 'px-6 py-6'
        }`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-4' : 'mb-3'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${
              isTablet ? 'text-xs' : 'text-[10px]'
            }`}
          >
            ← BACK
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${
            isTablet ? 'text-5xl' : 'text-3xl'
          }`}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          SESSION #{session.session_number}
        </Text>
        <View className="flex-row flex-wrap items-center mt-2 gap-2 pr-2">
          <View
            className={`px-2 py-0.5 ${isActive ? 'bg-foreground' : 'bg-muted-foreground'}`}
          >
            <Text className="text-background text-[10px] font-bold uppercase tracking-widest">
              {session.status}
            </Text>
          </View>
          <Text
            className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-shrink"
            numberOfLines={2}
          >
            {session.created_by}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: isTablet ? 40 : 24,
          paddingBottom: insets.bottom + 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#888"
          />
        }
      >
        <View className={`w-full ${isTablet ? 'max-w-xl self-center' : ''}`}>
          {isActive ? (
            <View>
              <View className="bg-muted p-6 rounded-none mb-8 border border-border">
                <Text className="text-center font-black uppercase text-xl mb-4 text-foreground tracking-tight">
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
                        className={`font-body font-bold ${isTablet ? 'text-lg py-3' : 'text-sm py-2'}`}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowScanner(true)}
                      className={`bg-foreground items-center justify-center rounded-lg border border-border ${
                        isTablet ? 'w-14 h-14' : 'w-11 h-11'
                      }`}
                    >
                      <Text className="text-background text-xl">📷</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Product
                      </Text>
                      <TouchableOpacity onPress={() => setProductCode('')}>
                        <Text className="text-destructive font-bold text-xs uppercase tracking-widest">
                          CHANGE
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-black text-foreground bg-background p-4 border border-border text-center uppercase tracking-tight">
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
                      className={isTablet ? 'text-3xl' : 'text-2xl'}
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
                  textClassName="text-destructive font-bold uppercase tracking-widest"
                  onPress={handleCancelSession}
                  isLoading={isCancelling}
                />
              </View>
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="text-muted-foreground font-bold mb-4 uppercase tracking-widest">
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
        </View>
      </ScrollView>
    </View>
  );
}

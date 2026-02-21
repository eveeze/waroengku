import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { useCartStore } from '@/stores/cartStore';
import { createTransaction, getCustomers } from '@/api/endpoints';
import { Customer, CreateTransactionRequest } from '@/api/types';
import { Button, Input } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints, screenPadding } = useResponsive();
  const isTablet = breakpoints.isTablet;
  const {
    items,
    customer,
    getTotal,
    updateQuantity,
    setCustomer,
    clearCart,
    validateCart,
    isValidating,
    validationResult,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'kasbon' | 'transfer' | 'qris'
  >('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  // API Hooks
  const { execute: submitTransaction, isLoading: isSubmitting } =
    useApi(createTransaction);
  const { execute: fetchCustomers } = useApi(getCustomers);

  // Validate cart on mount to get latest prices/discounts
  useEffect(() => {
    validateCart();
  }, []);

  // Calculate change
  const totalAmount = getTotal();
  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - totalAmount);
  // Allow exact payment or more.
  const isInsufficient = paymentMethod === 'cash' && paid < totalAmount;

  const handleProcessPayment = async () => {
    if (items.length === 0) return;

    if (paymentMethod === 'cash' && paid < totalAmount) {
      Alert.alert('Error', 'Insufficient payment');
      return;
    }

    if (paymentMethod === 'kasbon' && !customer) {
      Alert.alert('Error', 'Please select a customer for Kasbon');
      return;
    }

    const payload: CreateTransactionRequest = {
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        notes: i.notes,
      })),
      customer_id: customer?.id,
      payment_method: paymentMethod,
      amount_paid: paymentMethod === 'cash' ? paid : totalAmount,
      notes: notes,
    };

    try {
      const result = await submitTransaction(payload);
      if (result) {
        Alert.alert(
          'SUCCESS',
          paymentMethod === 'cash'
            ? `Change: ${formatCurrency(result.change_amount)}`
            : 'Transaction completed.',
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.back();
              },
            },
          ],
        );
      }
    } catch (err) {
      Alert.alert('Failed', (err as Error).message);
    }
  };

  const loadCustomers = async () => {
    const result = await fetchCustomers({
      search: customerSearch,
      per_page: 20,
    });
    if (result) {
      setCustomerList(result.data);
    }
  };

  useEffect(() => {
    if (showCustomerModal) {
      loadCustomers();
    }
  }, [showCustomerModal, customerSearch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          maxWidth: isTablet ? 720 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
      >
        {/* Header Area */}
        <View
          className={`bg-background border-b border-border ${isTablet ? 'px-8 pb-8' : 'px-6 pb-6'}`}
          style={{ paddingTop: insets.top + (isTablet ? 28 : 24) }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className={isTablet ? 'mb-8' : 'mb-6'}
          >
            <Text
              className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
            >
              ← Back to POS
            </Text>
          </TouchableOpacity>

          <Text
            className={`text-muted-foreground font-bold uppercase tracking-widest mb-2 ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            Total Amount
          </Text>
          <Text
            className={`font-black tracking-tighter text-foreground leading-tight ${isTablet ? 'text-6xl' : 'text-5xl'}`}
          >
            {formatCurrency(totalAmount)}
          </Text>

          {validationResult?.total_discount ? (
            <Text
              className={`text-green-600 font-bold mt-2 ${isTablet ? 'text-lg' : 'text-base'}`}
            >
              Discount Applied: -
              {formatCurrency(validationResult.total_discount)}
            </Text>
          ) : null}
        </View>

        <View className={isTablet ? 'p-8' : 'p-6'}>
          {/* Customer Section */}
          <TouchableOpacity
            onPress={() => setShowCustomerModal(true)}
            className={`flex-row items-center justify-between border-b border-border ${isTablet ? 'py-5 mb-10' : 'py-4 mb-8'}`}
          >
            <View>
              <Text
                className={`font-bold uppercase tracking-widest text-muted-foreground mb-1 ${isTablet ? 'text-sm' : 'text-xs'}`}
              >
                Customer
              </Text>
              <Text
                className={`font-bold text-foreground ${isTablet ? 'text-2xl' : 'text-xl'}`}
              >
                {customer ? customer.name : 'Walk-In Customer'}
              </Text>
            </View>
            <Text
              className={`text-muted-foreground ${isTablet ? 'text-3xl' : 'text-2xl'}`}
            >
              →
            </Text>
          </TouchableOpacity>

          {/* Payment Method */}
          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Payment Method
            </Text>
            <View className="flex-row gap-3">
              {['cash', 'qris'].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method as any)}
                  className={`flex-1 items-center justify-center py-4 rounded-lg border-2 ${
                    paymentMethod === method
                      ? 'bg-foreground border-foreground'
                      : 'bg-background border-border'
                  }`}
                >
                  <Text
                    className={`font-black uppercase tracking-wider ${
                      paymentMethod === method
                        ? 'text-background'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-3 mt-3">
              {['transfer', 'kasbon'].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method as any)}
                  className={`flex-1 items-center justify-center py-4 rounded-lg border-2 ${
                    paymentMethod === method
                      ? 'bg-foreground border-foreground'
                      : 'bg-background border-border'
                  }`}
                >
                  <Text
                    className={`font-black uppercase tracking-wider ${
                      paymentMethod === method
                        ? 'text-background'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cash specific input */}
          {paymentMethod === 'cash' && (
            <View className="mb-8 animate-fade-in-down">
              <Input
                label="CASH RECEIVED"
                placeholder="0"
                keyboardType="numeric"
                value={amountPaid}
                onChangeText={setAmountPaid}
                className="text-2xl font-bold h-16"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-4"
              >
                {[10000, 20000, 50000, 100000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmountPaid(String(amt))}
                    className="bg-muted px-4 py-2 rounded-full mr-2 border border-border"
                  >
                    <Text className="text-foreground font-bold text-xs">
                      {formatCurrency(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {paid > 0 && (
                <View className="mt-4 p-4 bg-muted rounded-lg border border-border flex-row justify-between items-center">
                  <Text className="text-muted-foreground font-bold uppercase text-xs tracking-wider">
                    Change Due
                  </Text>
                  <Text
                    className={`text-xl font-black ${change < 0 ? 'text-danger-600' : 'text-foreground'}`}
                  >
                    {formatCurrency(change)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Order Summary */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Order Items ({items.length})
            </Text>
            {items.map((item) => (
              <View
                key={item.product.id}
                className="flex-row justify-between py-3 border-b border-border"
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-muted h-8 w-8 rounded items-center justify-center">
                    <Text className="font-bold text-foreground">
                      {item.quantity}x
                    </Text>
                  </View>
                  <View>
                    <Text className="font-bold text-foreground text-sm">
                      {item.product.name}
                    </Text>
                    {item.tierName && (
                      <Text className="text-[10px] text-green-600 font-bold uppercase">
                        {item.tierName}
                      </Text>
                    )}
                  </View>
                </View>
                <Text className="font-bold text-foreground">
                  {formatCurrency(
                    item.subtotal || item.product.base_price * item.quantity,
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              NOTES
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 bg-muted text-base font-medium text-foreground"
              placeholder="Add transaction notes..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <Button
            title={`PAY ${formatCurrency(totalAmount)}`}
            fullWidth
            size="lg"
            onPress={handleProcessPayment}
            isLoading={isSubmitting}
            disabled={isInsufficient}
            className="mt-10 mb-8"
          />
        </View>
      </ScrollView>

      {/* Customer Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="px-6 py-4 border-b border-secondary-100 flex-row justify-between items-center">
            <Text className="text-xl font-black tracking-tight text-primary-900">
              SELECT CUSTOMER
            </Text>
            <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
              <Text className="font-bold text-danger-600">CLOSE</Text>
            </TouchableOpacity>
          </View>

          <View className="p-4 border-b border-secondary-100">
            <Input
              placeholder="Search name or phone..."
              value={customerSearch}
              onChangeText={setCustomerSearch}
            />
          </View>

          <FlatList
            data={customerList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 50 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-6 py-4 border-b border-secondary-100 active:bg-secondary-50"
                onPress={() => {
                  setCustomer(item);
                  setShowCustomerModal(false);
                }}
              >
                <Text className="font-bold text-lg text-primary-900">
                  {item.name}
                </Text>
                <Text className="text-secondary-500 font-medium">
                  {item.phone}
                </Text>
                {item.current_debt > 0 && (
                  <Text className="text-danger-600 text-xs font-bold mt-1">
                    DEBT: {formatCurrency(item.current_debt)}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                className="px-6 py-5 border-b border-secondary-100 bg-secondary-50"
                onPress={() => {
                  setCustomer(null);
                  setShowCustomerModal(false);
                }}
              >
                <Text className="font-bold text-primary-900 text-lg">
                  Walk-In Customer (Non-Member)
                </Text>
                <Text className="text-secondary-500 text-sm">
                  General Transaction
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

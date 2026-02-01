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
import { useCartStore } from '@/stores/cartStore';
import { createTransaction, getCustomers } from '@/api/endpoints';
import { Customer, CreateTransactionRequest } from '@/api/types';
import { Button, Input } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-white">
      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Area */}
        <View
          className="px-6 pb-6 bg-white border-b border-secondary-100"
          style={{ paddingTop: insets.top + 24 }}
        >
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
              ← Back to POS
            </Text>
          </TouchableOpacity>

          <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs mb-2">
            Total Amount
          </Text>
          <Text className="text-5xl font-black tracking-tighter text-primary-900 leading-tight">
            {formatCurrency(totalAmount)}
          </Text>

          {validationResult?.total_discount ? (
            <Text className="text-green-600 font-bold mt-2">
              Discount Applied: -
              {formatCurrency(validationResult.total_discount)}
            </Text>
          ) : null}
        </View>

        <View className="p-6">
          {/* Customer Section */}
          <TouchableOpacity
            onPress={() => setShowCustomerModal(true)}
            className="flex-row items-center justify-between py-4 border-b border-secondary-100 mb-8"
          >
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-1">
                Customer
              </Text>
              <Text className="text-xl font-bold text-primary-900">
                {customer ? customer.name : 'Walk-In Customer'}
              </Text>
            </View>
            <Text className="text-2xl text-secondary-300">→</Text>
          </TouchableOpacity>

          {/* Payment Method */}
          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-3">
              Payment Method
            </Text>
            <View className="flex-row gap-3">
              {['cash', 'qris'].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method as any)}
                  className={`flex-1 items-center justify-center py-4 rounded-lg border-2 ${
                    paymentMethod === method
                      ? 'bg-black border-black'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`font-black uppercase tracking-wider ${
                      paymentMethod === method
                        ? 'text-white'
                        : 'text-secondary-400'
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
                      ? 'bg-black border-black'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`font-black uppercase tracking-wider ${
                      paymentMethod === method
                        ? 'text-white'
                        : 'text-secondary-400'
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
                    className="bg-secondary-100 px-4 py-2 rounded-full mr-2 border border-secondary-200"
                  >
                    <Text className="text-primary-900 font-bold text-xs">
                      {formatCurrency(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {paid > 0 && (
                <View className="mt-4 p-4 bg-secondary-50 rounded-lg border border-secondary-100 flex-row justify-between items-center">
                  <Text className="text-secondary-600 font-bold uppercase text-xs tracking-wider">
                    Change Due
                  </Text>
                  <Text
                    className={`text-xl font-black ${change < 0 ? 'text-danger-600' : 'text-primary-900'}`}
                  >
                    {formatCurrency(change)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Order Summary */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-3">
              Order Items ({items.length})
            </Text>
            {items.map((item) => (
              <View
                key={item.product.id}
                className="flex-row justify-between py-3 border-b border-secondary-100"
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-secondary-100 h-8 w-8 rounded items-center justify-center">
                    <Text className="font-bold text-secondary-600">
                      {item.quantity}x
                    </Text>
                  </View>
                  <View>
                    <Text className="font-bold text-primary-900 text-sm">
                      {item.product.name}
                    </Text>
                    {item.tierName && (
                      <Text className="text-[10px] text-green-600 font-bold uppercase">
                        {item.tierName}
                      </Text>
                    )}
                  </View>
                </View>
                <Text className="font-bold text-secondary-900">
                  {formatCurrency(
                    item.subtotal || item.product.base_price * item.quantity,
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
              NOTES
            </Text>
            <TextInput
              className="border border-secondary-200 rounded-lg px-4 py-3 bg-secondary-50 text-base font-medium"
              placeholder="Add transaction notes..."
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-6 py-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          title={`PAY ${formatCurrency(totalAmount)}`}
          fullWidth
          size="lg"
          onPress={handleProcessPayment}
          isLoading={isSubmitting}
          disabled={isInsufficient}
        />
      </View>

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
                {item.current_balance > 0 && (
                  <Text className="text-danger-600 text-xs font-bold mt-1">
                    DEBT: {formatCurrency(item.current_balance)}
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

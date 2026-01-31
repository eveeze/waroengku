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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '@/stores/cartStore';
import { createTransaction, getCustomers } from '@/api/endpoints';
import { Customer, CreateTransactionRequest } from '@/api/types';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    items,
    customer,
    getTotal,
    updateQuantity,
    removeItem,
    setCustomer,
    clearCart,
    validateCart,
    validationResult,
    isValidating,
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
  const { execute: fetchCustomers, isLoading: isLoadingCustomers } =
    useApi(getCustomers);

  // Validate cart on mount to get latest prices/discounts
  useEffect(() => {
    validateCart();
  }, []);

  // Calculate change
  const totalAmount = getTotal();
  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - totalAmount);
  const isInsufficient = paymentMethod === 'cash' && paid < totalAmount;

  const handleProcessPayment = async () => {
    if (items.length === 0) return;

    if (paymentMethod === 'cash' && paid < totalAmount) {
      Alert.alert('Error', 'Pembayaran kurang');
      return;
    }

    if (paymentMethod === 'kasbon' && !customer) {
      Alert.alert('Error', 'Pilih pelanggan untuk pembayaran Kasbon');
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
      amount_paid: paid,
      notes: notes,
    };

    try {
      const result = await submitTransaction(payload);
      if (result) {
        Alert.alert(
          'Transaksi Berhasil',
          `Kembalian: ${formatCurrency(result.change_amount)}`,
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
      Alert.alert('Gagal', (err as Error).message);
    }
  };

  const loadCustomers = async () => {
    const result = await fetchCustomers({
      search: customerSearch,
      per_page: 10,
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
    <View className="flex-1 bg-secondary-50">
      <Header title="Checkout" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Customer Section */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-secondary-500 text-xs font-semibold uppercase">
                Pelanggan
              </Text>
              <Text className="text-lg font-medium text-secondary-900 mt-1">
                {customer ? customer.name : 'Umum (Non-Member)'}
              </Text>
              {customer && (
                <Text className="text-secondary-500 text-sm">
                  {customer.phone}
                </Text>
              )}
            </View>
            <Button
              title={customer ? 'Ganti' : 'Pilih'}
              size="small"
              variant="outline"
              onPress={() => setShowCustomerModal(true)}
            />
          </View>
        </Card>

        {/* Cart Items */}
        <Card title={`Daftar Belanja (${items.length})`} className="mb-4">
          {isValidating && (
            <Text className="text-xs text-primary-600 mb-2">
              Memeriksa harga terbaru...
            </Text>
          )}
          {items.map((item) => (
            <View
              key={item.product.id}
              className="flex-row py-3 border-b border-secondary-100 last:border-0"
            >
              <View className="flex-1">
                <Text className="font-medium text-secondary-900">
                  {item.product.name}
                </Text>
                <Text className="text-xs text-secondary-500">
                  {formatCurrency(item.serverPrice || item.product.base_price)}{' '}
                  x {item.quantity}
                </Text>
                {item.tierName && (
                  <Text className="text-[10px] text-green-600 bg-green-50 self-start px-1 rounded mt-1">
                    {item.tierName}
                  </Text>
                )}
              </View>

              {/* Qty Controls */}
              <View className="flex-row items-center mr-3">
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="w-8 h-8 rounded-full bg-secondary-100 items-center justify-center"
                >
                  <Text className="text-lg">-</Text>
                </TouchableOpacity>
                <Text className="mx-3 font-medium text-lg">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center"
                >
                  <Text className="text-lg text-primary-700">+</Text>
                </TouchableOpacity>
              </View>

              <Text className="font-bold text-secondary-900 min-w-[80px] text-right">
                {formatCurrency(
                  item.subtotal || item.product.base_price * item.quantity,
                )}
              </Text>
            </View>
          ))}

          {/* Total Section */}
          <View className="mt-4 pt-4 border-t border-secondary-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-secondary-600">Subtotal</Text>
              <Text className="font-semibold text-secondary-900">
                {formatCurrency(getTotal())}
              </Text>
            </View>
            {validationResult?.total_discount ? (
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-green-600">Total Diskon</Text>
                <Text className="font-semibold text-green-600">
                  -{formatCurrency(validationResult.total_discount)}
                </Text>
              </View>
            ) : null}
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-lg font-bold text-secondary-900">
                Total Bayar
              </Text>
              <Text className="text-2xl font-bold text-primary-700">
                {formatCurrency(getTotal())}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payment Method */}
        <Card title="Metode Pembayaran" className="mb-4">
          <View className="flex-row flex-wrap">
            {['cash', 'kasbon', 'transfer', 'qris'].map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => setPaymentMethod(method as any)}
                className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                  paymentMethod === method
                    ? 'bg-primary-50 border-primary-500'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`capitalize ${
                    paymentMethod === method
                      ? 'text-primary-700 font-bold'
                      : 'text-secondary-600'
                  }`}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cash Input */}
          {paymentMethod === 'cash' && (
            <View className="mt-4">
              <Input
                label="Jumlah Uang Diterima"
                placeholder="0"
                keyboardType="numeric"
                value={amountPaid}
                onChangeText={setAmountPaid}
                leftIcon={<Text className="text-secondary-500">Rp</Text>}
              />

              <View className="flex-row justify-between mt-2 bg-secondary-50 p-3 rounded-lg">
                <Text className="text-secondary-600">Kembalian</Text>
                <Text
                  className={`font-bold text-lg ${change < 0 ? 'text-danger-600' : 'text-green-600'}`}
                >
                  {formatCurrency(change)}
                </Text>
              </View>

              {/* Quick Money Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
              >
                {[10000, 20000, 50000, 100000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmountPaid(String(amt))}
                    className="bg-secondary-200 px-3 py-1.5 rounded-full mr-2"
                  >
                    <Text className="text-secondary-700 text-xs">
                      {formatCurrency(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Notes */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-secondary-700 mb-1.5">
              Catatan
            </Text>
            <TextInput
              className="border border-secondary-200 rounded-lg px-4 py-2 bg-white"
              placeholder="Catatan transaksi (opsional)"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View
        className="bg-white border-t border-secondary-200 p-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          title={`Bayar ${formatCurrency(getTotal())}`}
          fullWidth
          size="lg"
          onPress={handleProcessPayment}
          loading={isSubmitting}
          disabled={isInsufficient}
        />
      </View>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="bg-white border-b border-secondary-200 px-4 py-4 flex-row justify-between items-center">
            <Text className="text-lg font-bold">Pilih Pelanggan</Text>
            <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
              <Text className="text-primary-600 font-medium">Tutup</Text>
            </TouchableOpacity>
          </View>
          <View className="p-4 border-b border-secondary-100">
            <TextInput
              className="bg-secondary-100 rounded-lg px-4 py-2"
              placeholder="Cari nama / no hp..."
              value={customerSearch}
              onChangeText={setCustomerSearch}
            />
          </View>
          <FlatList
            data={customerList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-4 py-4 border-b border-secondary-100"
                onPress={() => {
                  setCustomer(item);
                  setShowCustomerModal(false);
                }}
              >
                <Text className="font-semibold text-secondary-900">
                  {item.name}
                </Text>
                <Text className="text-secondary-500 text-sm">{item.phone}</Text>
                {item.current_balance > 0 && (
                  <Text className="text-danger-600 text-xs mt-1">
                    Hutang: {formatCurrency(item.current_balance)}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                className="px-4 py-4 border-b border-secondary-100 bg-secondary-50"
                onPress={() => {
                  setCustomer(null);
                  setShowCustomerModal(false);
                }}
              >
                <Text className="font-semibold text-primary-600">
                  Umum (Non-Member)
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

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
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { useCartStore } from '@/stores/cartStore';
import { createTransaction, getCustomers } from '@/api/endpoints';
import { chargeQris } from '@/api/endpoints/payments';
import {
  Customer,
  CreateTransactionRequest,
  QrisChargeResponse,
} from '@/api/types';
import { Button, Input } from '@/components/ui';
import { QrisPaymentModal } from '@/components/shared';
import { useApi } from '@/hooks/useApi';

type PaymentMethod = 'cash' | 'kasbon' | 'transfer' | 'qris';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'cash', label: 'CASH', icon: '💵' },
  { key: 'qris', label: 'QRIS', icon: '📱' },
  { key: 'transfer', label: 'TRANSFER', icon: '🏦' },
  { key: 'kasbon', label: 'KASBON', icon: '📝' },
];

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000];

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { breakpoints, screenPadding, scaledSize, scaledFont } =
    useResponsive();
  const isTablet = breakpoints.isTablet;
  const isSmall = breakpoints.isSmall;
  const {
    items,
    customer,
    getTotal,
    setCustomer,
    clearCart,
    validateCart,
    validationResult,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Customer modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  // QRIS modal
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisTransactionId, setQrisTransactionId] = useState('');
  const [qrisChargeData, setQrisChargeData] =
    useState<QrisChargeResponse | null>(null);

  // API hooks
  const { execute: submitTransaction, isLoading: isSubmitting } =
    useApi(createTransaction);
  const { execute: fetchCustomers } = useApi(getCustomers);

  // Validate cart on mount
  useEffect(() => {
    validateCart();
  }, []);

  // Totals
  const totalAmount = getTotal();
  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - totalAmount);
  const isInsufficient =
    paymentMethod === 'cash' && paid < totalAmount && paid > 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  // ── Customer loading ────────────────────────────────────
  const loadCustomers = async () => {
    const result = await fetchCustomers({
      search: customerSearch,
      per_page: 20,
      is_active: true,
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

  // ── Process payment per method ──────────────────────────
  const handleProcessPayment = async () => {
    if (items.length === 0) return;

    // ── CASH ──
    if (paymentMethod === 'cash') {
      if (paid < totalAmount) {
        Alert.alert('Insufficient', 'Cash received is less than total amount');
        return;
      }
      try {
        const result = await submitTransaction({
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            notes: i.notes,
          })),
          payment_method: 'cash',
          amount_paid: paid,
          customer_id: customer?.id,
          notes,
        });
        if (result) {
          Alert.alert(
            'SUCCESS',
            `Payment received!\nChange: ${formatCurrency(result.change_amount)}`,
            [{ text: 'OK', onPress: finishTransaction }],
          );
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        if (errorMsg.includes('no open drawer session')) {
          Alert.alert(
            'Laci Kasir Belum Dibuka',
            'Silakan buka Sesi Laci Kasir (Open Register) terlebih dahulu di menu Cash Flow sebelum menerima pembayaran Tunai!',
          );
        } else {
          Alert.alert('Failed', errorMsg);
        }
      }
      return;
    }

    // ── KASBON ──
    if (paymentMethod === 'kasbon') {
      if (!customer) {
        Alert.alert('Required', 'Please select a customer for Kasbon payment');
        return;
      }
      if (
        customer.credit_limit &&
        customer.credit_limit > 0 &&
        customer.current_debt !== undefined
      ) {
        const remaining = customer.credit_limit - (customer.current_debt || 0);
        if (totalAmount > remaining) {
          Alert.alert(
            'Credit Limit',
            `Remaining: ${formatCurrency(remaining)}\nTotal: ${formatCurrency(totalAmount)}\n\nProceed anyway?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Proceed', onPress: () => submitKasbon() },
            ],
          );
          return;
        }
      }
      await submitKasbon();
      return;
    }

    // ── TRANSFER ──
    if (paymentMethod === 'transfer') {
      Alert.alert(
        'Confirm Transfer',
        `Has the transfer of ${formatCurrency(totalAmount)} been received?`,
        [
          { text: 'Not Yet', style: 'cancel' },
          {
            text: 'Yes, Received',
            onPress: async () => {
              try {
                const result = await submitTransaction({
                  items: items.map((i) => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    notes: i.notes,
                  })),
                  payment_method: 'transfer',
                  amount_paid: totalAmount,
                  customer_id: customer?.id,
                  notes,
                });
                if (result) {
                  Alert.alert('SUCCESS', 'Transfer payment recorded', [
                    { text: 'OK', onPress: finishTransaction },
                  ]);
                }
              } catch (err) {
                Alert.alert('Failed', (err as Error).message);
              }
            },
          },
        ],
      );
      return;
    }

    // ── QRIS ──
    if (paymentMethod === 'qris') {
      try {
        const result = await submitTransaction({
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            notes: i.notes,
          })),
          payment_method: 'qris',
          amount_paid: 0,
          customer_id: customer?.id,
          notes,
        });

        if (result) {
          const chargeResult = await chargeQris({
            transaction_id: result.id,
          });

          // Debug: log QRIS data for Midtrans Payment Simulator
          console.log('══════════════════════════════════════════');
          console.log('🔳 QRIS CHARGE RESPONSE');
          console.log('══════════════════════════════════════════');
          console.log('Payment ID:', chargeResult.payment_id);
          console.log('Order ID:', chargeResult.order_id);
          console.log('Expiry:', chargeResult.expiry_time);
          console.log('──────────────────────────────────────────');
          console.log('📋 COPY THIS TO MIDTRANS SIMULATOR:');
          console.log(chargeResult.qr_code_url);
          console.log('══════════════════════════════════════════');

          setQrisTransactionId(result.id);
          setQrisChargeData(chargeResult);
          setShowQrisModal(true);
        }
      } catch (err) {
        Alert.alert('Failed', (err as Error).message);
      }
      return;
    }
  };

  const submitKasbon = async () => {
    try {
      const result = await submitTransaction({
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        payment_method: 'kasbon',
        amount_paid: 0,
        customer_id: customer?.id,
        notes,
      });
      if (result) {
        Alert.alert(
          'SUCCESS',
          `Kasbon for ${customer?.name}\nAmount: ${formatCurrency(totalAmount)}`,
          [{ text: 'OK', onPress: finishTransaction }],
        );
      }
    } catch (err) {
      Alert.alert('Failed', (err as Error).message);
    }
  };

  const finishTransaction = () => {
    clearCart();
    router.back();
  };

  const handleQrisSuccess = () => {
    setShowQrisModal(false);
    finishTransaction();
  };

  const handleQrisClose = () => {
    setShowQrisModal(false);
    Alert.alert(
      'Transaction Pending',
      'The QRIS transaction is still pending. Payment can still be completed later.',
      [{ text: 'OK' }],
    );
  };

  const getButtonLabel = () => {
    switch (paymentMethod) {
      case 'cash':
        return `PAY ${formatCurrency(totalAmount)}`;
      case 'kasbon':
        return `KASBON ${formatCurrency(totalAmount)}`;
      case 'transfer':
        return `TRANSFER ${formatCurrency(totalAmount)}`;
      case 'qris':
        return `QRIS ${formatCurrency(totalAmount)}`;
    }
  };

  const isButtonDisabled = () => {
    if (isSubmitting) return true;
    if (paymentMethod === 'cash' && paid < totalAmount) return true;
    if (paymentMethod === 'kasbon' && !customer) return true;
    return false;
  };

  // Responsive sizes
  const px = screenPadding;
  const methodBtnSize = Math.floor((screenWidth - px * 2 - 12) / 2); // 2 cols with gap

  // ── Render ──────────────────────────────────────────────
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          maxWidth: isTablet ? 600 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
      >
        {/* ── Header — Total ── */}
        <View
          style={{
            paddingTop: insets.top + scaledSize(16),
            paddingHorizontal: px,
            paddingBottom: scaledSize(16),
            borderBottomWidth: 1,
            borderColor: 'rgba(128,128,128,0.15)',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: scaledSize(12) }}
          >
            <Text
              className="font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontSize: scaledFont(10) }}
            >
              ← BACK TO POS
            </Text>
          </TouchableOpacity>

          <Text
            className="text-muted-foreground font-bold uppercase tracking-widest"
            style={{ fontSize: scaledFont(10), marginBottom: 2 }}
          >
            Total Amount
          </Text>
          <Text
            className="font-black tracking-tighter text-foreground"
            style={{
              fontSize: scaledFont(isSmall ? 28 : 34),
              lineHeight: scaledFont(isSmall ? 32 : 38),
            }}
          >
            {formatCurrency(totalAmount)}
          </Text>

          {validationResult?.total_discount ? (
            <Text
              className="text-green-600 font-bold"
              style={{ fontSize: scaledFont(12), marginTop: 4 }}
            >
              Discount: -{formatCurrency(validationResult.total_discount)}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: px, paddingTop: scaledSize(16) }}>
          {/* ── Customer Section ── */}
          <TouchableOpacity
            onPress={() => setShowCustomerModal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: scaledSize(10),
              marginBottom: scaledSize(16),
              borderBottomWidth: 1,
              borderColor: 'rgba(128,128,128,0.15)',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                className="font-bold uppercase tracking-widest text-muted-foreground"
                style={{ fontSize: scaledFont(9), marginBottom: 2 }}
              >
                Customer {paymentMethod === 'kasbon' ? '(Required)' : ''}
              </Text>
              <Text
                className="font-bold text-foreground"
                style={{ fontSize: scaledFont(15) }}
                numberOfLines={1}
              >
                {customer ? customer.name : 'Walk-In Customer'}
              </Text>
              {customer && paymentMethod === 'kasbon' && (
                <Text
                  className="text-muted-foreground font-bold"
                  style={{ fontSize: scaledFont(10), marginTop: 2 }}
                >
                  Debt: {formatCurrency(customer.current_debt || 0)}
                  {customer.credit_limit
                    ? ` / Limit: ${formatCurrency(customer.credit_limit)}`
                    : ''}
                </Text>
              )}
            </View>
            <Text className="text-muted-foreground" style={{ fontSize: 18 }}>
              →
            </Text>
          </TouchableOpacity>

          {/* ── Payment Method ── */}
          <View style={{ marginBottom: scaledSize(16) }}>
            <Text
              className="font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontSize: scaledFont(9), marginBottom: scaledSize(8) }}
            >
              Payment Method
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: scaledSize(8),
              }}
            >
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.key}
                  onPress={() => setPaymentMethod(method.key)}
                  style={{
                    width: methodBtnSize,
                    paddingVertical: scaledSize(10),
                    borderRadius: scaledSize(8),
                    borderWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor:
                      paymentMethod === method.key
                        ? 'hsl(var(--foreground))'
                        : 'rgba(128,128,128,0.2)',
                    backgroundColor:
                      paymentMethod === method.key
                        ? 'hsl(var(--foreground))'
                        : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: scaledFont(14), marginBottom: 2 }}>
                    {method.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: scaledFont(10),
                      fontWeight: '900',
                      letterSpacing: 1,
                    }}
                    className={
                      paymentMethod === method.key
                        ? 'text-background'
                        : 'text-muted-foreground'
                    }
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Cash Input ── */}
          {paymentMethod === 'cash' && (
            <View style={{ marginBottom: scaledSize(16) }}>
              <Input
                label="CASH RECEIVED"
                placeholder="0"
                keyboardType="numeric"
                value={amountPaid}
                onChangeText={setAmountPaid}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: scaledSize(8) }}
              >
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmountPaid(String(amt))}
                    style={{
                      paddingHorizontal: scaledSize(10),
                      paddingVertical: scaledSize(6),
                      borderRadius: 999,
                      marginRight: scaledSize(6),
                      borderWidth: 1,
                      borderColor:
                        paid === amt
                          ? 'hsl(var(--foreground))'
                          : 'rgba(128,128,128,0.2)',
                      backgroundColor:
                        paid === amt ? 'hsl(var(--foreground))' : 'transparent',
                    }}
                  >
                    <Text
                      style={{ fontSize: scaledFont(10), fontWeight: '700' }}
                      className={
                        paid === amt ? 'text-background' : 'text-foreground'
                      }
                    >
                      {formatCurrency(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setAmountPaid(String(totalAmount))}
                  style={{
                    paddingHorizontal: scaledSize(10),
                    paddingVertical: scaledSize(6),
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor:
                      paid === totalAmount
                        ? 'hsl(var(--foreground))'
                        : 'rgba(128,128,128,0.2)',
                    backgroundColor:
                      paid === totalAmount
                        ? 'hsl(var(--foreground))'
                        : 'transparent',
                  }}
                >
                  <Text
                    style={{ fontSize: scaledFont(10), fontWeight: '700' }}
                    className={
                      paid === totalAmount
                        ? 'text-background'
                        : 'text-foreground'
                    }
                  >
                    EXACT
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {paid > 0 && (
                <View
                  style={{
                    marginTop: scaledSize(10),
                    padding: scaledSize(10),
                    borderRadius: scaledSize(8),
                    borderWidth: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderColor: isInsufficient
                      ? 'rgba(239,68,68,0.3)'
                      : 'rgba(128,128,128,0.2)',
                    backgroundColor: isInsufficient
                      ? 'rgba(239,68,68,0.05)'
                      : 'rgba(128,128,128,0.05)',
                  }}
                >
                  <Text
                    className="text-muted-foreground font-bold uppercase tracking-wider"
                    style={{ fontSize: scaledFont(9) }}
                  >
                    {isInsufficient ? 'Insufficient' : 'Change Due'}
                  </Text>
                  <Text
                    style={{ fontSize: scaledFont(16), fontWeight: '900' }}
                    className={
                      isInsufficient ? 'text-red-500' : 'text-foreground'
                    }
                  >
                    {formatCurrency(change)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Kasbon Info ── */}
          {paymentMethod === 'kasbon' && (
            <View
              style={{
                marginBottom: scaledSize(16),
                padding: scaledSize(10),
                borderRadius: scaledSize(8),
                borderWidth: 1,
                borderColor: 'rgba(234,179,8,0.25)',
                backgroundColor: 'rgba(234,179,8,0.05)',
              }}
            >
              <Text
                style={{
                  fontSize: scaledFont(10),
                  fontWeight: '700',
                  color: '#b45309',
                  marginBottom: 2,
                }}
              >
                ⚠ KASBON (CREDIT)
              </Text>
              <Text
                style={{
                  fontSize: scaledFont(11),
                  fontWeight: '600',
                  color: '#a16207',
                }}
              >
                {customer
                  ? `Debt will be recorded for ${customer.name}`
                  : 'Select a customer first to proceed'}
              </Text>
            </View>
          )}

          {/* ── Transfer Info ── */}
          {paymentMethod === 'transfer' && (
            <View
              style={{
                marginBottom: scaledSize(16),
                padding: scaledSize(10),
                borderRadius: scaledSize(8),
                borderWidth: 1,
                borderColor: 'rgba(59,130,246,0.25)',
                backgroundColor: 'rgba(59,130,246,0.05)',
              }}
            >
              <Text
                style={{
                  fontSize: scaledFont(10),
                  fontWeight: '700',
                  color: '#1d4ed8',
                  marginBottom: 2,
                }}
              >
                🏦 BANK TRANSFER
              </Text>
              <Text
                style={{
                  fontSize: scaledFont(11),
                  fontWeight: '600',
                  color: '#2563eb',
                }}
              >
                Confirm that transfer has been received before processing
              </Text>
            </View>
          )}

          {/* ── QRIS Info ── */}
          {paymentMethod === 'qris' && (
            <View
              style={{
                marginBottom: scaledSize(16),
                padding: scaledSize(10),
                borderRadius: scaledSize(8),
                borderWidth: 1,
                borderColor: 'rgba(147,51,234,0.25)',
                backgroundColor: 'rgba(147,51,234,0.05)',
              }}
            >
              <Text
                style={{
                  fontSize: scaledFont(10),
                  fontWeight: '700',
                  color: '#7c3aed',
                  marginBottom: 2,
                }}
              >
                📱 QRIS PAYMENT
              </Text>
              <Text
                style={{
                  fontSize: scaledFont(11),
                  fontWeight: '600',
                  color: '#8b5cf6',
                }}
              >
                A QR code will be generated for the customer to scan
              </Text>
            </View>
          )}

          {/* ── Order Summary ── */}
          <View>
            <Text
              className="font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontSize: scaledFont(9), marginBottom: scaledSize(8) }}
            >
              Order Items ({items.length})
            </Text>
            {items.map((item) => (
              <View
                key={item.product.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: scaledSize(8),
                  borderBottomWidth: 1,
                  borderColor: 'rgba(128,128,128,0.1)',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scaledSize(8),
                    flex: 1,
                  }}
                >
                  <View
                    className="bg-muted"
                    style={{
                      width: scaledSize(26),
                      height: scaledSize(26),
                      borderRadius: scaledSize(4),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      className="font-bold text-foreground"
                      style={{ fontSize: scaledFont(11) }}
                    >
                      {item.quantity}x
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      className="font-bold text-foreground"
                      style={{ fontSize: scaledFont(12) }}
                      numberOfLines={1}
                    >
                      {item.product.name}
                    </Text>
                    {item.tierName && (
                      <Text
                        className="text-green-600 font-bold uppercase"
                        style={{ fontSize: scaledFont(8) }}
                      >
                        {item.tierName}
                      </Text>
                    )}
                  </View>
                </View>
                <Text
                  className="font-bold text-foreground"
                  style={{ fontSize: scaledFont(12) }}
                >
                  {formatCurrency(
                    item.subtotal || item.product.base_price * item.quantity,
                  )}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Notes ── */}
          <View style={{ marginTop: scaledSize(14) }}>
            <Text
              className="font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontSize: scaledFont(9), marginBottom: scaledSize(4) }}
            >
              Notes
            </Text>
            <TextInput
              className="border border-border bg-muted text-foreground"
              style={{
                borderRadius: scaledSize(8),
                paddingHorizontal: scaledSize(10),
                paddingVertical: scaledSize(8),
                fontSize: scaledFont(13),
                fontWeight: '500',
              }}
              placeholder="Add transaction notes..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* ── Submit Button ── */}
          <Button
            title={getButtonLabel()}
            fullWidth
            size="lg"
            onPress={handleProcessPayment}
            isLoading={isSubmitting}
            disabled={isButtonDisabled()}
            className="mt-6 mb-6"
          />
        </View>
      </ScrollView>

      {/* ── Customer Selection Modal ── */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background">
          <View
            className="border-b border-border"
            style={{
              paddingHorizontal: px,
              paddingVertical: scaledSize(12),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              className="font-black tracking-tight text-foreground"
              style={{ fontSize: scaledFont(16) }}
            >
              SELECT CUSTOMER
            </Text>
            <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
              <Text
                className="font-bold text-red-500"
                style={{ fontSize: scaledFont(12) }}
              >
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="border-b border-border"
            style={{ padding: scaledSize(10) }}
          >
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
                className="border-b border-border active:bg-muted"
                style={{
                  paddingHorizontal: px,
                  paddingVertical: scaledSize(10),
                }}
                onPress={() => {
                  setCustomer(item);
                  setShowCustomerModal(false);
                }}
              >
                <Text
                  className="font-bold text-foreground"
                  style={{ fontSize: scaledFont(14) }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-muted-foreground font-medium"
                  style={{ fontSize: scaledFont(12) }}
                >
                  {item.phone}
                </Text>
                {item.current_debt > 0 && (
                  <Text
                    className="text-red-500 font-bold"
                    style={{ fontSize: scaledFont(10), marginTop: 2 }}
                  >
                    DEBT: {formatCurrency(item.current_debt)}
                    {item.credit_limit
                      ? ` / LIMIT: ${formatCurrency(item.credit_limit)}`
                      : ''}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                className="border-b border-border bg-muted"
                style={{
                  paddingHorizontal: px,
                  paddingVertical: scaledSize(12),
                }}
                onPress={() => {
                  setCustomer(null);
                  setShowCustomerModal(false);
                }}
              >
                <Text
                  className="font-bold text-foreground"
                  style={{ fontSize: scaledFont(14) }}
                >
                  Walk-In Customer
                </Text>
                <Text
                  className="text-muted-foreground"
                  style={{ fontSize: scaledFont(11) }}
                >
                  General Transaction
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      </Modal>

      {/* ── QRIS Payment Modal ── */}
      <QrisPaymentModal
        visible={showQrisModal}
        transactionId={qrisTransactionId}
        totalAmount={totalAmount}
        chargeData={qrisChargeData}
        onSuccess={handleQrisSuccess}
        onClose={handleQrisClose}
      />
    </View>
  );
}

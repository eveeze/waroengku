import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { getQrisPaymentStatus } from '@/api/endpoints/payments';
import { QrisChargeResponse, QrisStatusValue } from '@/api/types';
import { chargeQris } from '@/api/endpoints/payments';
import QRCode from 'react-native-qrcode-svg';

/** Detect if qr_code_url is a URL or raw QRIS/EMVCo string */
const isUrl = (str: string) => /^https?:\/\//i.test(str);

const POLL_INTERVAL_MS = 5000;

interface QrisPaymentModalProps {
  visible: boolean;
  transactionId: string;
  totalAmount: number;
  chargeData: QrisChargeResponse | null;
  onSuccess: () => void;
  onClose: () => void;
}

type ScreenState = 'loading' | 'qr' | 'success' | 'expired' | 'failed';

export default function QrisPaymentModal({
  visible,
  transactionId,
  totalAmount,
  chargeData,
  onSuccess,
  onClose,
}: QrisPaymentModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { scaledSize, scaledFont, screenPadding, breakpoints } =
    useResponsive();

  const [screen, setScreen] = useState<ScreenState>('loading');
  const [qrData, setQrData] = useState<QrisChargeResponse | null>(chargeData);
  const [statusText, setStatusText] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive QR size — 60% of screen width, max 280, min 180
  const qrSize = Math.min(280, Math.max(180, Math.floor(screenWidth * 0.6)));
  const px = screenPadding;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  // ── Countdown timer ─────────────────────────────────────
  const startCountdown = useCallback((expiryTimeStr: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    const tick = () => {
      const now = Date.now();
      const expiry = new Date(expiryTimeStr.replace(' ', 'T') + 'Z').getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setScreen('expired');
      }
    };

    tick();
    countdownRef.current = setInterval(tick, 1000);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Polling ─────────────────────────────────────────────
  const checkStatus = useCallback(
    async (paymentId: string): Promise<QrisStatusValue | null> => {
      try {
        const res = await getQrisPaymentStatus(paymentId);
        return res.status;
      } catch {
        return null;
      }
    },
    [],
  );

  const handleStatusResult = useCallback((status: QrisStatusValue | null) => {
    if (!status) return;
    if (status === 'settlement' || status === 'capture') {
      stopPolling();
      setScreen('success');
    } else if (status === 'expire') {
      stopPolling();
      setScreen('expired');
    } else if (status === 'cancel' || status === 'deny') {
      stopPolling();
      setStatusText(
        status === 'cancel' ? 'Payment cancelled' : 'Payment denied',
      );
      setScreen('failed');
    }
  }, []);

  const startPolling = useCallback(
    (paymentId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const status = await checkStatus(paymentId);
        handleStatusResult(status);
      }, POLL_INTERVAL_MS);
    },
    [checkStatus, handleStatusResult],
  );

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // ── Manual check ────────────────────────────────────────
  const handleManualCheck = async () => {
    if (!qrData) return;
    setIsChecking(true);
    const status = await checkStatus(qrData.payment_id);
    handleStatusResult(status);
    if (status === 'pending') {
      setStatusText('Still waiting for payment...');
      setTimeout(() => setStatusText(''), 2000);
    }
    setIsChecking(false);
  };

  // ── Regenerate QR ───────────────────────────────────────
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newCharge = await chargeQris({ transaction_id: transactionId });
      setQrData(newCharge);
      startCountdown(newCharge.expiry_time);
      startPolling(newCharge.payment_id);
      setScreen('qr');
    } catch (err) {
      Alert.alert('Error', (err as Error).message || 'Failed to regenerate QR');
    }
    setIsRegenerating(false);
  };

  // ── Init on open ────────────────────────────────────────
  useEffect(() => {
    if (visible && chargeData) {
      setQrData(chargeData);
      setScreen('qr');
      startCountdown(chargeData.expiry_time);
      startPolling(chargeData.payment_id);
    }
    return () => stopPolling();
  }, [visible, chargeData]);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  // ── Shared button style ─────────────────────────────────
  const primaryBtnStyle = {
    paddingVertical: scaledSize(12),
    borderRadius: scaledSize(10),
    alignItems: 'center' as const,
    marginBottom: scaledSize(8),
  };

  // ── Render: QR Screen ───────────────────────────────────
  const renderQrScreen = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: px,
      }}
    >
      {/* Amount */}
      <Text
        className="text-muted-foreground font-bold uppercase tracking-widest"
        style={{ fontSize: scaledFont(9), marginBottom: 2 }}
      >
        Total Pembayaran
      </Text>
      <Text
        className="text-foreground font-black tracking-tighter"
        style={{ fontSize: scaledFont(26), marginBottom: scaledSize(20) }}
      >
        {formatCurrency(totalAmount)}
      </Text>

      {/* QR Code */}
      <View
        style={{
          backgroundColor: '#fff',
          padding: scaledSize(10),
          borderRadius: scaledSize(14),
          marginBottom: scaledSize(14),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {qrData?.qr_code_url ? (
          isUrl(qrData.qr_code_url) ? (
            <Image
              source={{ uri: qrData.qr_code_url }}
              style={{ width: qrSize, height: qrSize }}
              resizeMode="contain"
            />
          ) : (
            <QRCode
              value={qrData.qr_code_url}
              size={qrSize}
              backgroundColor="#fff"
              color="#000"
            />
          )
        ) : (
          <View
            style={{
              width: qrSize,
              height: qrSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>

      {/* Timer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: scaledSize(12),
        }}
      >
        <Text
          className="text-muted-foreground font-bold uppercase tracking-wider"
          style={{ fontSize: scaledFont(9), marginRight: scaledSize(6) }}
        >
          Expires in
        </Text>
        <View
          className="bg-muted border border-border"
          style={{
            paddingHorizontal: scaledSize(8),
            paddingVertical: scaledSize(3),
            borderRadius: 999,
          }}
        >
          <Text
            className={secondsLeft < 60 ? 'text-red-500' : 'text-foreground'}
            style={{ fontSize: scaledFont(12), fontWeight: '900' }}
          >
            {formatTime(secondsLeft)}
          </Text>
        </View>
      </View>

      {/* Status */}
      {statusText ? (
        <Text
          className="text-muted-foreground font-bold"
          style={{ fontSize: scaledFont(11), marginBottom: scaledSize(10) }}
        >
          {statusText}
        </Text>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: scaledSize(10),
          }}
        >
          <ActivityIndicator size="small" color="#888" />
          <Text
            className="text-muted-foreground font-bold uppercase tracking-wider"
            style={{ fontSize: scaledFont(9), marginLeft: scaledSize(6) }}
          >
            Waiting for payment...
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View style={{ width: '100%', maxWidth: 320 }}>
        <TouchableOpacity
          onPress={handleManualCheck}
          disabled={isChecking}
          className="bg-foreground"
          style={primaryBtnStyle}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text
              className="text-background font-black uppercase tracking-widest"
              style={{ fontSize: scaledFont(11) }}
            >
              Check Status
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            stopPolling();
            onClose();
          }}
          style={{ paddingVertical: scaledSize(8), alignItems: 'center' }}
        >
          <Text
            className="text-muted-foreground font-bold uppercase tracking-widest"
            style={{ fontSize: scaledFont(9) }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Render: Success ─────────────────────────────────────
  const renderSuccessScreen = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: px,
      }}
    >
      <Text style={{ fontSize: scaledFont(40), marginBottom: scaledSize(14) }}>
        ✅
      </Text>
      <Text
        className="text-foreground font-black tracking-tighter uppercase"
        style={{ fontSize: scaledFont(22), marginBottom: scaledSize(4) }}
      >
        Payment Received
      </Text>
      <Text
        className="text-muted-foreground font-bold"
        style={{ fontSize: scaledFont(12), marginBottom: scaledSize(20) }}
      >
        QRIS payment of {formatCurrency(totalAmount)} successful
      </Text>
      <View style={{ width: '100%', maxWidth: 320 }}>
        <TouchableOpacity
          onPress={onSuccess}
          className="bg-foreground"
          style={primaryBtnStyle}
        >
          <Text
            className="text-background font-black uppercase tracking-widest"
            style={{ fontSize: scaledFont(11) }}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Render: Expired ─────────────────────────────────────
  const renderExpiredScreen = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: px,
      }}
    >
      <Text style={{ fontSize: scaledFont(40), marginBottom: scaledSize(14) }}>
        ⏰
      </Text>
      <Text
        className="text-foreground font-black tracking-tighter uppercase"
        style={{ fontSize: scaledFont(22), marginBottom: scaledSize(4) }}
      >
        QR Expired
      </Text>
      <Text
        className="text-muted-foreground font-bold"
        style={{
          fontSize: scaledFont(12),
          marginBottom: scaledSize(20),
          textAlign: 'center',
        }}
      >
        The QR code has expired.{'\n'}Generate a new one to continue.
      </Text>
      <View style={{ width: '100%', maxWidth: 320 }}>
        <TouchableOpacity
          onPress={handleRegenerate}
          disabled={isRegenerating}
          className="bg-foreground"
          style={primaryBtnStyle}
        >
          {isRegenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text
              className="text-background font-black uppercase tracking-widest"
              style={{ fontSize: scaledFont(11) }}
            >
              Generate New QR
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            stopPolling();
            onClose();
          }}
          style={{ paddingVertical: scaledSize(8), alignItems: 'center' }}
        >
          <Text
            className="text-muted-foreground font-bold uppercase tracking-widest"
            style={{ fontSize: scaledFont(9) }}
          >
            Cancel Transaction
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Render: Failed ──────────────────────────────────────
  const renderFailedScreen = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: px,
      }}
    >
      <Text style={{ fontSize: scaledFont(40), marginBottom: scaledSize(14) }}>
        ❌
      </Text>
      <Text
        className="text-foreground font-black tracking-tighter uppercase"
        style={{ fontSize: scaledFont(22), marginBottom: scaledSize(4) }}
      >
        Payment Failed
      </Text>
      <Text
        className="text-muted-foreground font-bold"
        style={{ fontSize: scaledFont(12), marginBottom: scaledSize(20) }}
      >
        {statusText || 'The payment was not completed.'}
      </Text>
      <View style={{ width: '100%', maxWidth: 320 }}>
        <TouchableOpacity
          onPress={() => {
            stopPolling();
            onClose();
          }}
          className="bg-foreground"
          style={primaryBtnStyle}
        >
          <Text
            className="text-background font-black uppercase tracking-widest"
            style={{ fontSize: scaledFont(11) }}
          >
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Render: Loading ─────────────────────────────────────
  const renderLoading = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
      <Text
        className="text-muted-foreground font-bold uppercase tracking-widest"
        style={{ fontSize: scaledFont(9), marginTop: scaledSize(10) }}
      >
        Generating QR Code...
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {screen === 'loading' && renderLoading()}
        {screen === 'qr' && renderQrScreen()}
        {screen === 'success' && renderSuccessScreen()}
        {screen === 'expired' && renderExpiredScreen()}
        {screen === 'failed' && renderFailedScreen()}
      </View>
    </Modal>
  );
}

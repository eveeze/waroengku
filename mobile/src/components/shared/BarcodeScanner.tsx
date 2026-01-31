import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Barcode Scanner Component
 * Full-screen modal for scanning barcodes
 */

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string, type: string) => void;
  title?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export function BarcodeScanner({
  visible,
  onClose,
  onScan,
  title = 'Scan Barcode',
}: BarcodeScannerProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setLastScannedCode(null);
    }
  }, [visible]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || result.data === lastScannedCode) return;

    setScanned(true);
    setLastScannedCode(result.data);
    onScan(result.data, result.type);
  };

  const handleRescan = () => {
    setScanned(false);
    setLastScannedCode(null);
  };

  if (!permission) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View
          className="absolute top-0 left-0 right-0 z-10 bg-black/50"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center justify-between px-4 py-4">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-white text-lg">✕</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">{title}</Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Camera View */}
        {!permission.granted ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-4xl mb-4">📷</Text>
            <Text className="text-white text-lg text-center mb-4">
              Izin kamera diperlukan untuk memindai barcode
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              className="bg-primary-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Izinkan Kamera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'qr',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
                'code93',
              ],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        )}

        {/* Scan Frame Overlay */}
        {permission.granted && (
          <View className="absolute inset-0 items-center justify-center">
            {/* Top overlay */}
            <View
              className="absolute top-0 left-0 right-0 bg-black/50"
              style={{ height: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2 }}
            />
            {/* Bottom overlay */}
            <View
              className="absolute bottom-0 left-0 right-0 bg-black/50"
              style={{ height: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2 }}
            />
            {/* Left overlay */}
            <View
              className="absolute left-0 bg-black/50"
              style={{
                top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
                width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
                height: SCAN_AREA_SIZE,
              }}
            />
            {/* Right overlay */}
            <View
              className="absolute right-0 bg-black/50"
              style={{
                top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
                width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
                height: SCAN_AREA_SIZE,
              }}
            />

            {/* Scan frame */}
            <View
              className="border-2 border-white rounded-lg"
              style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }}
            >
              {/* Corner indicators */}
              <View className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
              <View className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
              <View className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
              <View className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
            </View>

            {/* Instruction */}
            <Text className="text-white text-center mt-6 px-8">
              Arahkan kamera ke barcode produk
            </Text>
          </View>
        )}

        {/* Scanned Result Footer */}
        {scanned && lastScannedCode && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 py-6"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-secondary-200 rounded-full mb-4" />
              <Text className="text-green-500 text-4xl mb-2">✓</Text>
              <Text className="text-lg font-semibold text-secondary-900">
                Barcode Terdeteksi
              </Text>
            </View>

            <View className="bg-secondary-100 rounded-lg px-4 py-3 mb-4">
              <Text className="text-center text-secondary-900 font-mono text-lg">
                {lastScannedCode}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                onPress={handleRescan}
                className="flex-1 bg-secondary-100 py-3 rounded-lg mr-2"
              >
                <Text className="text-secondary-700 text-center font-semibold">
                  Scan Ulang
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-primary-600 py-3 rounded-lg ml-2"
              >
                <Text className="text-white text-center font-semibold">
                  Selesai
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

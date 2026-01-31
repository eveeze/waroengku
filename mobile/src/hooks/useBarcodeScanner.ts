import { useState, useEffect, useRef } from 'react';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { Alert } from 'react-native';

/**
 * Custom hook for barcode scanning functionality
 */

export interface UseBarcodeOptions {
  onScan?: (barcode: string, type: string) => void;
  scanInterval?: number; // milliseconds between scans
}

export function useBarcodeScanner(options: UseBarcodeOptions = {}) {
  const { onScan, scanInterval = 2000 } = options;
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const lastScanTime = useRef<number>(0);

  const hasPermission = permission?.granted ?? false;
  const canAskAgain = permission?.canAskAgain ?? true;

  const requestCameraPermission = async (): Promise<boolean> => {
    if (hasPermission) return true;

    const result = await requestPermission();

    if (!result.granted) {
      Alert.alert(
        'Izin Kamera Diperlukan',
        'Untuk memindai barcode, aplikasi membutuhkan akses ke kamera.',
        [{ text: 'OK' }],
      );
      return false;
    }

    return result.granted;
  };

  const startScanning = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setIsScanning(true);
      setLastScannedCode(null);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    const now = Date.now();

    // Prevent multiple scans of same code within interval
    if (
      result.data === lastScannedCode &&
      now - lastScanTime.current < scanInterval
    ) {
      return;
    }

    lastScanTime.current = now;
    setLastScannedCode(result.data);

    if (onScan) {
      onScan(result.data, result.type);
    }
  };

  const resetScanner = () => {
    setLastScannedCode(null);
    lastScanTime.current = 0;
  };

  return {
    hasPermission,
    canAskAgain,
    isScanning,
    lastScannedCode,
    requestCameraPermission,
    startScanning,
    stopScanning,
    handleBarcodeScanned,
    resetScanner,
  };
}

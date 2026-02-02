import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button as RNButton,
  Modal,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
}

export function BarcodeScanner({
  visible,
  onClose,
  onScan,
  title = 'Scan Barcode', // Default title
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lastScanRef = useRef<number>(0);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      lastScanRef.current = 0;
    }
  }, [visible]);

  // Handle permissions
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.message}>
            We need your permission to show the camera
          </Text>
          <RNButton onPress={requestPermission} title="grant permission" />
          <RNButton onPress={onClose} title="close" />
        </View>
      </Modal>
    );
  }

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    const now = Date.now();
    // Throttle scans: ignore if already scanned OR if less than 1.5s passed since last scan
    if (scanned || now - lastScanRef.current < 1500) return;

    lastScanRef.current = now;
    setScanned(true);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate();
    }

    onScan(result.data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'],
          }}
        >
          <View style={styles.overlay}>
            {/* Header / Title */}
            <View style={styles.header}>
              <Text style={styles.headerText}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Target Box */}
            <View style={styles.centerRegion}>
              <View style={styles.scannerBox} />
              <Text style={styles.hintText}>Align barcode within frame</Text>
            </View>

            {/* Bottom spacer or controls could go here */}
            <View style={styles.footer} />
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  closeText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 12,
  },
  centerRegion: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBox: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#00ff00', // Green for visibility
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginBottom: 20,
  },
  hintText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  footer: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});

import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

/**
 * Custom hook for image picking functionality
 */

export interface ImageAsset {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface UseImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    allowsEditing = true,
    aspect = [4, 3],
    quality = 0.8,
    base64 = false,
  } = options;

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi membutuhkan akses ke kamera dan galeri untuk mengambil foto.',
          [{ text: 'OK' }],
        );
        return false;
      }
    }
    return true;
  };

  const pickFromGallery = async (): Promise<ImageAsset | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing,
        aspect,
        quality,
        base64,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const imageAsset: ImageAsset = {
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType ?? undefined,
          fileName: asset.fileName ?? undefined,
          fileSize: asset.fileSize ?? undefined,
        };
        setImage(imageAsset);
        setIsLoading(false);
        return imageAsset;
      }

      setIsLoading(false);
      return null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil gambar';
      setError(message);
      setIsLoading(false);
      return null;
    }
  };

  const takePhoto = async (): Promise<ImageAsset | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing,
        aspect,
        quality,
        base64,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const imageAsset: ImageAsset = {
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType ?? undefined,
          fileName: asset.fileName ?? undefined,
          fileSize: asset.fileSize ?? undefined,
        };
        setImage(imageAsset);
        setIsLoading(false);
        return imageAsset;
      }

      setIsLoading(false);
      return null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil foto';
      setError(message);
      setIsLoading(false);
      return null;
    }
  };

  const clearImage = () => {
    setImage(null);
    setError(null);
  };

  const showPickerOptions = () => {
    Alert.alert('Pilih Gambar', 'Ambil gambar dari mana?', [
      { text: 'Kamera', onPress: takePhoto },
      { text: 'Galeri', onPress: pickFromGallery },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  return {
    image,
    isLoading,
    error,
    pickFromGallery,
    takePhoto,
    clearImage,
    showPickerOptions,
  };
}

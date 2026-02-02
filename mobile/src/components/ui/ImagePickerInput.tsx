import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useImagePicker, ImageAsset } from '@/hooks/useImagePicker';

/**
 * Image Picker Component
 * Reusable component for picking images from camera or gallery
 */

interface ImagePickerInputProps {
  value?: string | null;
  onImageSelected?: (image: ImageAsset) => void;
  onImageCleared?: () => void;
  placeholder?: string;
  aspectRatio?: [number, number];
  className?: string;
}

export function ImagePickerInput({
  value,
  onImageSelected,
  onImageCleared,
  placeholder = 'Tap untuk pilih gambar',
  aspectRatio = [4, 3],
  className = '',
}: ImagePickerInputProps) {
  const { image, isLoading, pickFromGallery, takePhoto, clearImage } =
    useImagePicker({
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    });

  const displayUri = image?.uri || value;

  const handlePickImage = () => {
    Alert.alert('Pilih Gambar', 'Ambil gambar dari mana?', [
      {
        text: 'Kamera',
        onPress: async () => {
          const result = await takePhoto();
          if (result && onImageSelected) {
            onImageSelected(result);
          }
        },
      },
      {
        text: 'Galeri',
        onPress: async () => {
          const result = await pickFromGallery();
          if (result && onImageSelected) {
            onImageSelected(result);
          }
        },
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleClearImage = () => {
    clearImage();
    if (onImageCleared) {
      onImageCleared();
    }
  };

  return (
    <View className={`${className}`}>
      <TouchableOpacity
        onPress={handlePickImage}
        disabled={isLoading}
        className="border-2 border-dashed border-secondary-300 rounded-xl overflow-hidden bg-secondary-50"
        style={{ aspectRatio: aspectRatio[0] / aspectRatio[1] }}
      >
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={(e) => console.log('Picker Error:', e.nativeEvent.error)}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-2">📷</Text>
            <Text className="text-secondary-500 text-center px-4">
              {isLoading ? 'Memuat...' : placeholder}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {displayUri && (
        <View className="flex-row mt-2">
          <TouchableOpacity
            onPress={handlePickImage}
            className="flex-1 bg-primary-50 py-2 rounded-lg mr-1"
          >
            <Text className="text-primary-600 text-center text-sm font-medium">
              Ganti Gambar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearImage}
            className="flex-1 bg-danger-50 py-2 rounded-lg ml-1"
          >
            <Text className="text-danger-600 text-center text-sm font-medium">
              Hapus
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

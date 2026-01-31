import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/shared';
import { Button, Card, Input } from '@/components/ui';
import { categorySchema, CategoryFormData } from '@/utils/validation';
import { createCategory } from '@/api/endpoints/categories';

/**
 * Create Category Screen
 */
export default function CreateCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);

      await createCategory({
        name: data.name,
        description: data.description || undefined,
      });

      Alert.alert('Berhasil', 'Kategori berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal menambahkan kategori'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Tambah Kategori" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card className="mb-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Kategori *"
                  placeholder="Masukkan nama kategori"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                    Deskripsi
                  </Text>
                  <TextInput
                    className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                    placeholder="Deskripsi kategori (opsional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            />
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-4 py-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            title="Simpan Kategori"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

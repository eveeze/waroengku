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
import { customerSchema, CustomerFormData } from '@/utils/validation';
import { createCustomer } from '@/api/endpoints/customers';

/**
 * Create Customer Screen
 */
export default function CreateCustomerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
      credit_limit: 0,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);

      await createCustomer({
        name: data.name,
        phone: data.phone || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        credit_limit: data.credit_limit || 0,
      });

      Alert.alert('Berhasil', 'Pelanggan berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal menambahkan pelanggan'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Tambah Pelanggan" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card title="Informasi Pelanggan" className="mb-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Pelanggan *"
                  placeholder="Masukkan nama pelanggan"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="No. Telepon"
                  placeholder="08xxxxxxxxxx"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                    Alamat
                  </Text>
                  <TextInput
                    className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                    placeholder="Alamat pelanggan (opsional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              )}
            />
          </Card>

          <Card title="Pengaturan Kredit" className="mb-4">
            <Controller
              control={control}
              name="credit_limit"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Limit Kredit (Kasbon)"
                  placeholder="0"
                  value={value > 0 ? String(value) : ''}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  leftIcon={<Text className="text-secondary-400">Rp</Text>}
                  helperText="Batas maksimal hutang pelanggan"
                />
              )}
            />
          </Card>

          <Card title="Catatan" className="mb-4">
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                  placeholder="Catatan tambahan (opsional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
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
            title="Simpan Pelanggan"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

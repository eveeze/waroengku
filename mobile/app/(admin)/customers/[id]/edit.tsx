import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/shared';
import { Button, Card, Input, Loading } from '@/components/ui';
import { getCustomerById, updateCustomer } from '@/api/endpoints/customers';
import { Customer } from '@/api/types';
import { useApi } from '@/hooks/useApi';

/**
 * Edit Customer Screen
 */
export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { isLoading, execute: fetchCustomer } = useApi(() =>
    getCustomerById(id!),
  );

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    const customer = await fetchCustomer();
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
      setCreditLimit(
        customer.credit_limit > 0 ? String(customer.credit_limit) : '',
      );
      setIsActive(customer.is_active);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama pelanggan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateCustomer(id!, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        credit_limit: Number(creditLimit) || 0,
        is_active: isActive,
      });

      Alert.alert('Berhasil', 'Pelanggan berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal memperbarui pelanggan',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="Memuat..." />;
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Edit Pelanggan" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Card title="Informasi Pelanggan" className="mb-4">
            <Input
              label="Nama Pelanggan *"
              placeholder="Masukkan nama pelanggan"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="No. Telepon"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <View>
              <Text className="text-sm font-medium text-secondary-700 mb-1.5">
                Alamat
              </Text>
              <TextInput
                className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
                placeholder="Alamat pelanggan (opsional)"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
              />
            </View>
          </Card>

          <Card title="Pengaturan Kredit" className="mb-4">
            <Input
              label="Limit Kredit (Kasbon)"
              placeholder="0"
              value={creditLimit}
              onChangeText={setCreditLimit}
              keyboardType="numeric"
              leftIcon={<Text className="text-secondary-400">Rp</Text>}
              helperText="Batas maksimal hutang pelanggan"
            />
          </Card>

          <Card title="Catatan" className="mb-4">
            <TextInput
              className="border border-secondary-200 rounded-lg px-4 py-3 bg-white text-base"
              placeholder="Catatan tambahan (opsional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </Card>

          <Card title="Status" className="mb-4">
            <TouchableOpacity
              onPress={() => setIsActive(!isActive)}
              className="flex-row items-center justify-between"
            >
              <View>
                <Text className="text-secondary-900 font-medium">
                  Pelanggan Aktif
                </Text>
                <Text className="text-secondary-500 text-sm">
                  Nonaktifkan jika pelanggan sudah tidak berlangganan
                </Text>
              </View>
              <View
                className={`w-12 h-6 rounded-full p-1 ${
                  isActive ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
              >
                <View
                  className={`w-4 h-4 rounded-full bg-white ${
                    isActive ? 'ml-auto' : ''
                  }`}
                />
              </View>
            </TouchableOpacity>
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-4 py-3"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="Simpan Perubahan"
            fullWidth
            onPress={handleSubmit}
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

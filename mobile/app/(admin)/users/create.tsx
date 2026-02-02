import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { registerUserSchema, RegisterUserFormData } from '@/utils/validation';
// PASTIKAN IMPORT INI KE users.ts YANG BARU
import { createUser } from '@/api/endpoints/users';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access + Management' },
  { value: 'cashier', label: 'Cashier', description: 'POS & Transactions' },
  { value: 'inventory', label: 'Inventory', description: 'Stock & Products' },
];

export default function CreateUserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'cashier',
    },
  });

  const onSubmit = async (data: RegisterUserFormData) => {
    try {
      setIsSubmitting(true);

      // Nembak ke POST /api/v1/users lewat function createUser
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      Alert.alert('BERHASIL', 'Akun user berhasil dibuat.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'GAGAL',
        error instanceof Error ? error.message : 'Gagal membuat user',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          USER BARU
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 180,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-6">
              Informasi Akun
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <Input
                    label="NAMA LENGKAP *"
                    placeholder="Masukkan nama lengkap"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <Input
                    label="ALAMAT EMAIL *"
                    placeholder="user@example.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <Input
                    label="PASSWORD *"
                    placeholder="Min. 6 karakter"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={errors.password?.message}
                  />
                </View>
              )}
            />
          </View>

          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-6">
              Pilih Role
            </Text>
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      onPress={() => onChange(role.value as any)}
                      className={`flex-row items-center p-4 mb-3 border ${
                        value === role.value
                          ? 'border-black bg-black'
                          : 'border-secondary-200 bg-white'
                      }`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`font-bold uppercase tracking-wide text-sm ${value === role.value ? 'text-white' : 'text-primary-900'}`}
                        >
                          {role.label}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${value === role.value ? 'text-secondary-400' : 'text-secondary-500'}`}
                        >
                          {role.description}
                        </Text>
                      </View>
                      {value === role.value && (
                        <Text className="text-white text-lg font-bold">✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-6 py-4"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="SIMPAN AKUN USER"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

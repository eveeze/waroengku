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
import { Header } from '@/components/shared';
import { Button, Card, Input } from '@/components/ui';
import { registerUserSchema, RegisterUserFormData } from '@/utils/validation';
import { registerUser } from '@/api/endpoints/auth';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Akses penuh ke semua fitur', icon: '👑' },
  { value: 'cashier', label: 'Kasir', description: 'Akses POS dan transaksi', icon: '💵' },
  { value: 'inventory', label: 'Gudang', description: 'Akses stok dan inventori', icon: '📦' },
];

/**
 * Create User Screen
 */
export default function CreateUserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'cashier',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterUserFormData) => {
    try {
      setIsSubmitting(true);

      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      Alert.alert('Berhasil', 'User berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal menambahkan user'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Tambah User" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Info */}
          <Card title="Informasi User" className="mb-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Lengkap *"
                  placeholder="Masukkan nama lengkap"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email *"
                  placeholder="contoh@email.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password *"
                  placeholder="Minimal 6 karakter"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />
          </Card>

          {/* Role Selection */}
          <Card title="Pilih Role" className="mb-4">
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      onPress={() => onChange(role.value as 'admin' | 'cashier' | 'inventory')}
                      className={`flex-row items-center p-4 rounded-lg mb-2 border-2 ${
                        value === role.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-secondary-200 bg-white'
                      }`}
                    >
                      <Text className="text-2xl mr-3">{role.icon}</Text>
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${
                            value === role.value
                              ? 'text-primary-700'
                              : 'text-secondary-900'
                          }`}
                        >
                          {role.label}
                        </Text>
                        <Text className="text-sm text-secondary-500">
                          {role.description}
                        </Text>
                      </View>
                      {value === role.value && (
                        <View className="w-6 h-6 bg-primary-600 rounded-full items-center justify-center">
                          <Text className="text-white text-xs">✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  {errors.role && (
                    <Text className="text-danger-500 text-sm mt-1">
                      {errors.role.message}
                    </Text>
                  )}
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
            title="Simpan User"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

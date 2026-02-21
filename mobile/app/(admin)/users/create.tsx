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
import { createUser } from '@/api/endpoints/users';
import { useOptimisticMutation } from '@/hooks';
import { User, UserListResponse } from '@/api/types';

const roles = [
  { value: 'cashier', label: 'Cashier', description: 'POS & Transactions' },
  { value: 'inventory', label: 'Inventory', description: 'Stock & Products' },
];

export default function CreateUserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const { mutate: mutateCreate, isPending: isSubmitting } =
    useOptimisticMutation(
      async (data: RegisterUserFormData) => createUser(data),
      {
        queryKey: ['/users', { page: 1 }],
        updater: (
          old: UserListResponse | undefined,
          newData: RegisterUserFormData,
        ) => {
          // Optimistic update for list
          const optimisticUser: User = {
            id: 'temp-' + Date.now(),
            name: newData.name,
            email: newData.email,
            role: newData.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (!old)
            return {
              data: [optimisticUser],
              meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
            };
          return {
            ...old,
            data: [optimisticUser, ...old.data],
          };
        },
        onSuccess: () => {
          Alert.alert('BERHASIL', 'Akun user berhasil dibuat.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (error: Error) => {
          Alert.alert('GAGAL', error.message || 'Gagal membuat user');
        },
      },
    );

  const onSubmit = (data: RegisterUserFormData) => {
    mutateCreate(data);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
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
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
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
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
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
                          ? 'border-foreground bg-foreground'
                          : 'border-border bg-background'
                      }`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`font-bold uppercase tracking-wide text-sm ${value === role.value ? 'text-background' : 'text-foreground'}`}
                        >
                          {role.label}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${value === role.value ? 'text-background/80' : 'text-muted-foreground'}`}
                        >
                          {role.description}
                        </Text>
                      </View>
                      {value === role.value && (
                        <Text className="text-background text-lg font-bold">
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <Button
            title="SIMPAN AKUN USER"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            className="mt-6 mb-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

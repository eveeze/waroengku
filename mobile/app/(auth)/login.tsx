import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/utils/validation';
import { Button, Input } from '@/components/ui';

/**
 * Login Screen
 * Admin login with email and password
 */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data.email, data.password);
      router.replace('/(admin)');
    } catch (err) {
      // Error is handled by the store
      Alert.alert(
        'Login Gagal',
        err instanceof Error ? err.message : 'Terjadi kesalahan'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary-600"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center pt-12 pb-8">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🏪</Text>
          </View>
          <Text className="text-white text-3xl font-bold">Warungku</Text>
          <Text className="text-primary-200 text-base mt-2">
            Admin Dashboard
          </Text>
        </View>

        {/* Login Form */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
          <Text className="text-2xl font-bold text-secondary-900 mb-2">
            Selamat Datang!
          </Text>
          <Text className="text-secondary-500 mb-8">
            Masuk untuk mengelola warung Anda
          </Text>

          {/* Error Message */}
          {error && (
            <View className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-3 mb-4">
              <Text className="text-danger-700">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="admin@warung.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Masukkan password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text className="text-secondary-500">
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                }
              />
            )}
          />

          {/* Login Button */}
          <Button
            title="Masuk"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size="lg"
            className="mt-4"
          />

          {/* Dev Credentials Hint */}
          <View className="mt-8 p-4 bg-secondary-50 rounded-lg">
            <Text className="text-xs text-secondary-500 text-center">
              💡 Test Credentials (Development)
            </Text>
            <Text className="text-xs text-secondary-400 text-center mt-1">
              Email: admin@warung.com | Password: password
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

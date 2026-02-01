import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
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
 * Swiss Minimalist Design Refactor
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
        'LOGIN FAILED',
        err instanceof Error ? err.message : 'An error occurred',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 32,
        }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        {/* Header / Logo */}
        <View className="mb-16 mt-8">
          <View className="w-16 h-16 bg-black mb-6 items-center justify-center">
            <Text className="text-4xl">⚓</Text>
          </View>
          <Text className="text-5xl font-black text-black tracking-tighter uppercase mb-2">
            WARUNGKU
          </Text>
          <Text className="text-lg font-bold text-secondary-400 tracking-widest uppercase">
            Management System
          </Text>
        </View>

        {/* Login Form */}
        <View className="flex-1">
          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-100 p-4 mb-8">
              <Text className="text-red-600 font-bold uppercase tracking-wider text-xs mb-1">
                Error
              </Text>
              <Text className="text-red-800 font-medium">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-6">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="EMAIL ADDRESS"
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
          </View>

          {/* Password Input */}
          <View className="mb-10">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="PASSWORD"
                  placeholder="Enter your password"
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
                      <Text className="text-secondary-500 font-bold text-xs uppercase tracking-wider">
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </Text>
                    </TouchableOpacity>
                  }
                />
              )}
            />
          </View>

          {/* Login Button */}
          <Button
            title="AUTHENTICATE"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size="lg"
          />

          {/* Dev Credentials Hint */}
          <View className="mt-12 pt-8 border-t border-secondary-100">
            <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest text-center mb-2">
              Development Access
            </Text>
            <TouchableOpacity
              className="bg-secondary-50 p-3 items-center justify-center border border-secondary-200"
              onPress={() => {
                // Optional: fast fill helper could go here
              }}
            >
              <Text className="font-mono text-xs text-secondary-600">
                admin@warung.com / password
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center opacity-50">
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400">
            POWERED BY EVEEZE
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

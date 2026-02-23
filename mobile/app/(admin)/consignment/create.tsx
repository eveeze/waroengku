import React from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createConsignor } from '@/api/endpoints';
import { Button, Input } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';
import { useResponsive } from '@/hooks/useResponsive';
import { ApiResponse, Consignor } from '@/api/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateConsignorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      bank_name: '',
      bank_account: '',
    },
  });

  const { mutate: mutateCreate, isPending } = useOptimisticMutation(
    async (data: FormData) =>
      createConsignor({
        name: data.name,
        phone: data.phone,
        bank_name: data.bank_name || undefined,
        bank_account: data.bank_account || undefined,
      }),
    {
      queryKey: ['/consignors'],
      updater: (old: any, newData: FormData) => {
        const optimisticConsignor: Consignor = {
          id: 'temp-' + Date.now(),
          name: newData.name,
          phone: newData.phone,

          bank_name: newData.bank_name || undefined,
          bank_account: newData.bank_account || undefined,

          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (!old) {
          return [optimisticConsignor];
        }

        // if array directly
        if (Array.isArray(old)) {
          return [...old, optimisticConsignor];
        }

        // if wrapped in Object (e.g. ApiResponse)
        return {
          ...old,
          data: [...(old.data || []), optimisticConsignor],
        };
      },
      invalidates: true,
      onSuccess: () => {
        Alert.alert('Success', 'Consignor added successfully');
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to add consignor');
      },
    },
  );

  const onSubmit = (data: FormData) => {
    mutateCreate(data);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className={`border-b border-border bg-background ${isTablet ? 'px-8 py-8' : 'px-6 py-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-5' : 'mb-4'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-4xl'}`}
        >
          ADD CONSIGNOR
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: isTablet ? 40 : 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View className={`w-full ${isTablet ? 'max-w-md self-center' : ''}`}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="NAME *"
                  placeholder="Supplier Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  className="rounded-none"
                />
              )}
            />

            <View className="h-4" />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="PHONE NUMBER *"
                  placeholder="08..."
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  className="rounded-none"
                />
              )}
            />

            <View className="h-8" />
            <Text className="text-muted-foreground font-bold text-xs uppercase mb-4">
              Bank Details (Optional)
            </Text>

            <Controller
              control={control}
              name="bank_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="BANK NAME"
                  placeholder="e.g. BCA, Mandiri"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <View className="h-4" />

            <Controller
              control={control}
              name="bank_account"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="ACCOUNT NUMBER"
                  placeholder="123..."
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <View className="h-8" />

            <Button
              title="SAVE SUPPLIER"
              onPress={handleSubmit(onSubmit)}
              isLoading={isPending}
              size="lg"
              className="rounded-none mt-6 mb-8"
              textClassName="font-black tracking-widest text-lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

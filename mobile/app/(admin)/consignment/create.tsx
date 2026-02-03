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
      updater: (old: any) => old, // No optimistic update for create, relying on invalidation
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          ADD CONSIGNOR
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
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
              />
            )}
          />

          <View className="h-8" />
          <Text className="text-secondary-500 font-bold text-xs uppercase mb-4">
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
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

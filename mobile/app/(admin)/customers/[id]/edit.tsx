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
  Switch,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchWithCache } from '@/api/client';
import { getCustomerById, updateCustomer } from '@/api/endpoints/customers';
import { Customer } from '@/api/types';
import { Button, Input, Loading } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  credit_limit: z.string().optional(), // We'll parse to number
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: customer, isLoading } = useQuery({
    queryKey: [`/customers/${id}`],
    queryFn: ({ queryKey }) => fetchWithCache<Customer>({ queryKey }),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
      credit_limit: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
        credit_limit:
          customer.credit_limit > 0 ? String(customer.credit_limit) : '',
        is_active: customer.is_active,
      });
    }
  }, [customer, reset]);

  const { mutate: mutateUpdate, isPending: isUpdating } = useOptimisticMutation(
    async (data: FormData) =>
      updateCustomer(id!, {
        name: data.name,
        phone: data.phone || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        credit_limit: Number(data.credit_limit) || 0,
        is_active: data.is_active,
      }),
    {
      queryKey: [`/customers/${id}`],
      updater: (old: Customer | undefined, newData: FormData) => {
        if (!old) return undefined; // Should not happen if data loaded
        return {
          ...old,
          name: newData.name,
          phone: newData.phone || undefined,
          address: newData.address || undefined,
          notes: newData.notes || undefined,
          credit_limit: Number(newData.credit_limit) || 0,
          is_active: newData.is_active,
        } as Customer;
      },
      onSuccess: () => {
        Alert.alert('SUCCESS', 'Customer updated successfully');
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('ERROR', err.message || 'Failed to update customer');
      },
    },
  );

  const onSubmit = (data: FormData) => {
    mutateUpdate(data);
  };

  const currentIsActive = watch('is_active');

  if (isLoading || !customer) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Loading />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Swiss Header */}
      <View
        className="px-6 pb-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
          EDIT CUSTOMER
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="FULL NAME *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                className="rounded-none h-14"
              />
            )}
          />

          <View className="h-4" />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="PHONE NUMBER"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                className="rounded-none h-14"
              />
            )}
          />

          <View className="h-4" />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Address
                </Text>
                <TextInput
                  className="border border-border bg-secondary p-4 font-bold text-foreground rounded-none h-24"
                  multiline
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  textAlignVertical="top"
                />
              </View>
            )}
          />

          <View className="h-4" />

          <Controller
            control={control}
            name="credit_limit"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="CREDIT LIMIT (RP)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                helperText="Maximum allowed debt (Kasbon)"
                className="rounded-none h-14"
              />
            )}
          />

          <View className="h-4" />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Notes
                </Text>
                <TextInput
                  className="border border-border bg-secondary p-4 font-bold text-foreground rounded-none h-24"
                  multiline
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  textAlignVertical="top"
                  placeholder="Additional notes..."
                />
              </View>
            )}
          />

          <View className="h-4" />

          {/* Active Status Switch */}
          <View className="flex-row justify-between items-center py-4 border-t border-b border-border">
            <Text className="text-sm font-bold uppercase tracking-wide text-foreground">
              Customer Active
            </Text>
            <Switch
              value={currentIsActive}
              onValueChange={(val) => setValue('is_active', val)}
              trackColor={{ false: '#e5e7eb', true: '#16a34a' }}
            />
          </View>

          <View className="h-8" />

          <Button
            title="SAVE CHANGES"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isUpdating}
            className="rounded-none h-14"
            textClassName="font-black tracking-widest text-lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

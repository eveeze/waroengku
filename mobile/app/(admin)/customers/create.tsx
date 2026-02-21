import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { customerSchema, CustomerFormData } from '@/utils/validation';
import { createCustomer } from '@/api/endpoints/customers';

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

      Alert.alert('SUCCESS', 'Customer added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'FAILED',
        error instanceof Error ? error.message : 'Could not add customer',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
          ADD MEMBER
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
              Basic Info
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <Input
                    label="FULL NAME *"
                    placeholder="Enter customer name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    className="rounded-none h-14"
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <Input
                    label="PHONE NUMBER"
                    placeholder="08xxxxxxxxxx"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    className="rounded-none h-14"
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Address
                  </Text>
                  <TextInput
                    className="border border-border rounded-none px-4 py-3 bg-muted text-base font-medium min-h-[80px] text-foreground"
                    placeholder="Customer address (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            />
          </View>

          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Financial Limits
            </Text>
            <Controller
              control={control}
              name="credit_limit"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="CREDIT LIMIT (KASBON)"
                  placeholder="0"
                  value={value > 0 ? String(value) : ''}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  leftIcon={
                    <Text className="text-muted-foreground font-bold">Rp</Text>
                  }
                  helperText="Maximum debt allowed for this customer"
                  className="rounded-none h-14"
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Notes
            </Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-border rounded-none px-4 py-3 bg-muted text-base font-medium min-h-[80px] text-foreground"
                  placeholder="Additional notes..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </View>

          <Button
            title="SAVE MEMBER"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            className="mt-8 mb-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

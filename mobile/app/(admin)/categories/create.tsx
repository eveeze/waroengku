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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { categorySchema, CategoryFormData } from '@/utils/validation';
import { createCategory } from '@/api/endpoints/categories';
import { Category, ApiResponse } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { mutate: mutateCreate, isPending: isCreating } = useOptimisticMutation(
    async (data: CategoryFormData) =>
      createCategory({
        name: data.name,
        description: data.description || undefined,
      }),
    {
      queryKey: ['/categories'],
      updater: (old: ApiResponse<Category[]> | undefined, newData) => {
        const optimisticCategory: Category = {
          id: 'temp-' + Date.now(),
          name: newData.name,
          description: newData.description || '',
          product_count: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          parent_id: undefined,
        };

        // If query hasn't run yet, initialize structure
        if (!old) {
          return {
            success: true,
            data: [optimisticCategory],
          };
        }

        // Append to existing data list
        return {
          ...old,
          data: [...old.data, optimisticCategory],
        };
      },
      invalidates: true,
      onSuccess: () => {
        Alert.alert('SUCCESS', 'Category has been created.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (error: Error) => {
        Alert.alert('FAILED', error.message || 'Could not create category');
      },
    },
  );

  const onSubmit = (data: CategoryFormData) => {
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
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
          NEW CATEGORY
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
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
            Category Details
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-6">
                <Input
                  label="CATEGORY NAME *"
                  placeholder="E.g. Beverages, Snacks"
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
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-6">
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Description
                </Text>
                <TextInput
                  className="border border-border rounded-none px-4 py-3 bg-muted text-base font-medium min-h-[100px] text-foreground"
                  placeholder="What is this category for?"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          />
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-4"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="CREATE CATEGORY"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isCreating}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

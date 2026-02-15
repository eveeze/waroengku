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
import { useWindowDimensions, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mutedIconColor = isDark ? '#A1A1AA' : '#71717A';

  // Responsive sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-2xl'
      : 'text-3xl';
  const labelSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const inputHeight = isTablet ? 'h-14' : isSmallPhone ? 'h-10' : 'h-12';
  const headerPadding = isTablet
    ? 'px-8 pb-8'
    : isSmallPhone
      ? 'px-4 pb-4'
      : 'px-6 pb-6';

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
        className={`bg-background border-b border-border ${headerPadding}`}
        style={{ paddingTop: insets.top + (isSmallPhone ? 12 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isSmallPhone ? 'mb-2' : 'mb-4'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground font-body ${isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
          >
            ← BACK
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${headerSize}`}
        >
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
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className={`border border-border bg-muted/30 ${isSmallPhone ? 'p-4' : 'p-6'}`}
          >
            <Text
              className={`font-bold uppercase tracking-widest text-muted-foreground mb-6 ${labelSize}`}
            >
              CATEGORY DETAILS
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-6">
                  <Text
                    className={`font-bold uppercase tracking-wide text-foreground mb-2 ${labelSize}`}
                  >
                    CATEGORY NAME *
                  </Text>
                  <Input
                    placeholder="E.G. BEVERAGES"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    className={`rounded-none bg-background border-border ${inputHeight}`}
                    placeholderTextColor={mutedIconColor}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text
                    className={`font-bold uppercase tracking-wide text-foreground mb-2 ${labelSize}`}
                  >
                    DESCRIPTION
                  </Text>
                  <TextInput
                    className="border border-border rounded-none px-4 py-3 bg-background text-base text-foreground min-h-[100px]"
                    placeholder="ENTER DESCRIPTION (OPTIONAL)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={mutedIconColor}
                    textAlignVertical="top"
                  />
                </View>
              )}
            />
          </View>

          <Button
            title="CREATE CATEGORY"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            isLoading={isCreating}
            className="rounded-none h-14 mt-6 mb-8"
            textClassName="font-black tracking-widest text-lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

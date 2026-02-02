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

export default function CreateCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);

      await createCategory({
        name: data.name,
        description: data.description || undefined,
      });

      // Show success alert
      Alert.alert('SUCCESS', 'Category has been created.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'FAILED',
        error instanceof Error ? error.message : 'Could not create category',
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-6">
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
                <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
                  Description
                </Text>
                <TextInput
                  className="border border-secondary-200 rounded-none px-4 py-3 bg-secondary-50 text-base font-medium min-h-[100px]"
                  placeholder="What is this category for?"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
          />
        </ScrollView>

        {/* Submit Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-6 py-4"
          style={{ paddingBottom: insets.bottom + 90 }}
        >
          <Button
            title="CREATE CATEGORY"
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

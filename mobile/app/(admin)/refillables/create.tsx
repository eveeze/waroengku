import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createRefillableContainer } from '@/api/endpoints';
import { Product } from '@/api/types';
import { Button, Input, Loading } from '@/components/ui';

export default function CreateRefillableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [containerType, setContainerType] = useState('');
  const [emptyCount, setEmptyCount] = useState('');
  const [fullCount, setFullCount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalVisible, setProductModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products for selection
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/products', searchQuery],
    queryFn: () => getProducts({ per_page: 50, search: searchQuery }),
    placeholderData: (previousData) => previousData,
  });

  const { mutate: createContainer, isPending: isCreating } = useMutation({
    mutationFn: createRefillableContainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/refillables'] });
      Alert.alert('Success', 'Refillable container created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Failed to create container');
    },
  });

  const handleCreate = () => {
    if (!containerType || !selectedProduct) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    createContainer({
      product_id: selectedProduct.id,
      container_type: containerType,
      empty_count: Number(emptyCount || 0),
      full_count: Number(fullCount || 0),
      notes,
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="p-4 border-b border-border bg-background active:bg-muted"
      onPress={() => {
        setSelectedProduct(item);
        setProductModalVisible(false);
      }}
    >
      <Text className="font-bold text-foreground">{item.name}</Text>
      <Text className="text-xs text-muted-foreground">
        {item.sku || 'No SKU'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-3xl font-black uppercase text-foreground tracking-tighter">
          NEW CONTAINER
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Container Type Name */}
          <Input
            label="CONTAINER NAME"
            placeholder="e.g. Galon Aqua, Gas 3kg"
            value={containerType}
            onChangeText={setContainerType}
          />

          {/* Product Selection */}
          <View className="mb-6">
            <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
              LINKED PRODUCT
            </Text>
            <TouchableOpacity
              onPress={() => setProductModalVisible(true)}
              className="bg-muted border border-border p-4 rounded-none"
            >
              <Text
                className={`font-bold ${
                  selectedProduct ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {selectedProduct ? selectedProduct.name : 'Select Product...'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Initial Stock */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Input
                label="INITIAL EMPTY"
                placeholder="0"
                keyboardType="numeric"
                value={emptyCount}
                onChangeText={setEmptyCount}
              />
            </View>
            <View className="flex-1">
              <Input
                label="INITIAL FULL"
                placeholder="0"
                keyboardType="numeric"
                value={fullCount}
                onChangeText={setFullCount}
              />
            </View>
          </View>

          <Input
            label="NOTES (OPTIONAL)"
            placeholder="e.g. Initial stock take"
            value={notes}
            onChangeText={setNotes}
          />

          <View className="mt-8">
            <Button
              title="CREATE CONTAINER"
              onPress={handleCreate}
              isLoading={isCreating}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Product Selection Modal */}
      <Modal
        visible={isProductModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background pt-6">
          <View className="px-4 pb-4 border-b border-border">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-heading font-black text-xl text-foreground">
                SELECT PRODUCT
              </Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <Text className="text-blue-600 font-bold">Close</Text>
              </TouchableOpacity>
            </View>
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
          {isLoadingProducts ? (
            <Loading message="Loading products..." />
          ) : (
            <FlatList
              data={productsData?.data || []}
              keyExtractor={(item) => item.id}
              renderItem={renderProductItem}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

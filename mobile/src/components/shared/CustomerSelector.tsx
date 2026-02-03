import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Customer } from '@/api/types';
import { getCustomers } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { Input } from '@/components/ui';

interface CustomerSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: Customer | null) => void;
  title?: string;
}

export function CustomerSelector({
  visible,
  onClose,
  onSelect,
  title = 'SELECT CUSTOMER',
}: CustomerSelectorProps) {
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Customer[]>([]);
  const { execute: fetchCustomers, isLoading } = useApi(getCustomers);

  const loadCustomers = async () => {
    const result = await fetchCustomers({
      search,
      per_page: 20,
    });
    if (result) {
      setList(result.data);
    }
  };

  useEffect(() => {
    if (visible) {
      loadCustomers();
    }
  }, [visible, search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="px-6 py-4 border-b border-secondary-100 flex-row justify-between items-center">
          <Text className="text-xl font-black tracking-tight text-primary-900">
            {title}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="font-bold text-danger-600">CLOSE</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4 border-b border-secondary-100">
          <Input
            placeholder="Search name or phone..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading && list.length === 0 ? (
          <View className="p-8">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 50 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-6 py-4 border-b border-secondary-100 active:bg-secondary-50"
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text className="font-bold text-lg text-primary-900">
                  {item.name}
                </Text>
                <Text className="text-secondary-500 font-medium">
                  {item.phone}
                </Text>
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                className="px-6 py-5 border-b border-secondary-100 bg-secondary-50"
                onPress={() => {
                  onSelect(null);
                  onClose();
                }}
              >
                <Text className="font-bold text-primary-900 text-lg">
                  All Customers
                </Text>
                <Text className="text-secondary-500 text-sm">
                  Clear Filter / Walk-In
                </Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </Modal>
  );
}

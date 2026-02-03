import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Button } from '@/components/ui';
import { Customer } from '@/api/types';

export interface FilterState {
  status: string | null;
  payment_method: string | null;
  date_from: string;
  date_to: string;
  customer: Customer | null;
}

interface TransactionFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  currentFilters: FilterState;
  onOpenCustomerSelector: () => void;
}

const STATUS_OPTIONS = ['pending', 'completed', 'cancelled'];
const PAYMENT_OPTIONS = ['cash', 'kasbon', 'transfer', 'qris'];

const DATE_PRESETS = [
  { label: 'TODAY', days: 0 },
  { label: 'YESTERDAY', days: 1 },
  { label: 'LAST 7 DAYS', days: 7 },
  { label: 'THIS MONTH', days: 30 },
];

export function TransactionFilterModal({
  visible,
  onClose,
  onApply,
  onClear,
  currentFilters,
  onOpenCustomerSelector,
}: TransactionFilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const applyDatePreset = (preset: (typeof DATE_PRESETS)[0]) => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from = to;

    if (preset.label === 'YESTERDAY') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setFilters((prev) => ({ ...prev, date_from: yStr, date_to: yStr }));
      return;
    }

    if (preset.label === 'THIS MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const fStr = firstDay.toISOString().split('T')[0];
      setFilters((prev) => ({ ...prev, date_from: fStr, date_to: to }));
      return;
    }

    if (preset.days > 0) {
      const past = new Date(today);
      past.setDate(past.getDate() - preset.days);
      const pStr = past.toISOString().split('T')[0];
      setFilters((prev) => ({ ...prev, date_from: pStr, date_to: to }));
    } else {
      // Today
      setFilters((prev) => ({ ...prev, date_from: to, date_to: to }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 py-4 border-b border-secondary-100 flex-row justify-between items-center bg-white sticky top-0 z-10">
          <Text className="text-2xl font-black tracking-tight text-primary-900 uppercase">
            Filters
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-secondary-100 px-3 py-1 rounded-full"
          >
            <Text className="font-bold text-secondary-900 text-xs">CLOSE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          {/* Customer Section */}
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-3">
              Customer Context
            </Text>
            <TouchableOpacity
              onPress={() => {
                onClose(); // Close this modal to prevent stacking issues
                setTimeout(onOpenCustomerSelector, 300); // Slight delay for smooth transition
              }}
              className="flex-row items-center justify-between p-4 bg-secondary-50 border border-secondary-200 rounded-2xl active:bg-secondary-100 active:border-primary-900"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-secondary-200 h-10 w-10 rounded-full items-center justify-center">
                  <Text className="text-lg">👤</Text>
                </View>
                <View>
                  <Text className="text-xs font-bold text-secondary-500 uppercase">
                    Selected
                  </Text>
                  <Text
                    className={`text-base font-bold ${filters.customer ? 'text-primary-900' : 'text-secondary-400'}`}
                  >
                    {filters.customer ? filters.customer.name : 'All Customers'}
                  </Text>
                </View>
              </View>
              <Text className="text-secondary-400 text-xs font-bold">
                CHANGE →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Range Section - Improvements */}
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-3">
              Time Period
            </Text>

            {/* Presets */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {DATE_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => applyDatePreset(preset)}
                  className="mr-2 bg-secondary-100 px-4 py-2 rounded-xl border border-secondary-200 active:bg-black active:border-black"
                >
                  <Text className="text-[10px] font-bold text-primary-900 uppercase">
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-secondary-400 mb-1 ml-1">
                  FROM
                </Text>
                <TextInput
                  className="border-b-2 border-secondary-100 p-2 text-lg font-bold text-primary-900"
                  placeholder="YYYY-MM-DD"
                  value={filters.date_from}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, date_from: text }))
                  }
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-secondary-400 mb-1 ml-1">
                  TO
                </Text>
                <TextInput
                  className="border-b-2 border-secondary-100 p-2 text-lg font-bold text-primary-900"
                  placeholder="YYYY-MM-DD"
                  value={filters.date_to}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, date_to: text }))
                  }
                />
              </View>
            </View>
          </View>

          {/* Status Section */}
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-3">
              Status
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      status: prev.status === status ? null : status,
                    }))
                  }
                  className={`px-4 py-3 rounded-xl border-2 ${
                    filters.status === status
                      ? 'bg-black border-black'
                      : 'bg-white border-secondary-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase ${
                      filters.status === status
                        ? 'text-white'
                        : 'text-primary-900'
                    }`}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method Section */}
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-3">
              Payment Method
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {PAYMENT_OPTIONS.map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      payment_method:
                        prev.payment_method === method ? null : method,
                    }))
                  }
                  className={`px-4 py-3 rounded-xl border-2 ${
                    filters.payment_method === method
                      ? 'bg-black border-black'
                      : 'bg-white border-secondary-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase ${
                      filters.payment_method === method
                        ? 'text-white'
                        : 'text-primary-900'
                    }`}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="p-6 border-t border-secondary-100 bg-white gap-3 mb-8">
          <Button title="APPLY FILTERS" onPress={handleApply} size="lg" />
          <TouchableOpacity onPress={handleClear} className="items-center py-3">
            <Text className="font-bold text-xs text-danger-600 uppercase tracking-widest">
              Clear All Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

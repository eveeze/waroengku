import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      title: 'Restock Products',
      subtitle: 'Add stock from suppliers',
      icon: '📦',
      route: '/(admin)/inventory/restock',
      color: 'bg-blue-50',
    },
    {
      title: 'Stock Adjustment',
      subtitle: 'Correct stock discrepancies',
      icon: '🔧',
      route: '/(admin)/inventory/adjust',
      color: 'bg-orange-50',
    },
    {
      title: 'Stock Opname',
      subtitle: 'Full inventory counting',
      icon: '📋',
      route: '/(admin)/stock-opname', // This will be created in Phase 4, but linking it here is fine
      color: 'bg-purple-50',
    },
    {
      title: 'Inventory Reports',
      subtitle: 'Valuation & Low Stock',
      icon: '📊',
      route: '/(admin)/reports/inventory',
      color: 'bg-gray-50',
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <View
        className="px-6 pb-6 border-b border-secondary-100"
        style={{ paddingTop: insets.top + 24 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-secondary-500 font-bold uppercase tracking-widest text-xs">
            ← BACK TO DASHBOARD
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black tracking-tighter text-primary-900">
          INVENTORY
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row flex-wrap gap-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="w-[47%] mb-4"
              onPress={() => router.push(item.route as any)}
            >
              <Card className={`${item.color} border-0 h-40 justify-between`}>
                <Text className="text-3xl">{item.icon}</Text>
                <View>
                  <Text className="font-bold text-lg leading-6 mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-secondary-500">
                    {item.subtitle}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      label: 'Inventory',
      icon: '🏭',
      route: '/(admin)/inventory',
      desc: 'Restock & Stock Opname',
    },
    {
      label: 'Customers',
      icon: '👥',
      route: '/(admin)/customers',
      desc: 'Manage Member Database',
    },
    {
      label: 'Categories',
      icon: '🏷️',
      route: '/(admin)/categories',
      desc: 'Product Categories',
    },
    {
      label: 'Users',
      icon: '🛡️',
      route: '/(admin)/users',
      desc: 'App Users & Permissions',
    },
    {
      label: 'Reports',
      icon: '📈',
      route: '/(admin)/reports',
      desc: 'Detailed Analytics',
    },
    {
      label: 'Cash Flow',
      icon: '💰',
      route: '/(admin)/cash-flow',
      desc: 'Petty Cash & Sessions',
    },
    {
      label: 'Refillables',
      icon: '💧',
      route: '/(admin)/refillables',
      desc: 'Gallon & Gas Stock',
    },
    {
      label: 'Stock Opname',
      icon: '📋',
      route: '/(admin)/stock-opname',
      desc: 'Stock Counting',
    },
    {
      label: 'Consignment',
      icon: '🤝',
      route: '/(admin)/consignment',
      desc: 'Titip Jual Suppliers',
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View
        className="px-6 py-8 bg-white border-b border-secondary-100"
        style={{ paddingTop: insets.top + 20 }}
      >
        <Text className="text-4xl font-heading uppercase tracking-tighter text-black">
          Menu
        </Text>
        <Text className="text-secondary-500 text-sm font-bold mt-1 font-body">
          All Applications
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View className="gap-3">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 flex-row items-center gap-4"
            >
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center border border-secondary-100">
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-heading text-lg text-primary-900 uppercase">
                  {item.label}
                </Text>
                <Text className="text-xs text-secondary-500 font-bold font-body">
                  {item.desc}
                </Text>
              </View>
              <Text className="text-secondary-300">→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

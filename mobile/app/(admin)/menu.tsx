import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useThemeStore } from '@/stores/themeStore';

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
    <View className="flex-1 bg-background">
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View
        className="px-6 py-8 bg-background border-b border-border flex-row justify-between items-end"
        style={{ paddingTop: insets.top + 20 }}
      >
        <View>
          <Text className="text-4xl font-heading uppercase tracking-tighter text-foreground">
            Menu
          </Text>
          <Text className="text-muted-foreground text-sm font-bold mt-1 font-body">
            All Applications
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View className="gap-3">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="bg-muted p-4 rounded-xl border border-border flex-row items-center gap-4 active:opacity-70"
            >
              <View className="w-12 h-12 bg-background rounded-full items-center justify-center border border-border">
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-heading text-lg text-foreground uppercase">
                  {item.label}
                </Text>
                <Text className="text-xs text-muted-foreground font-bold font-body">
                  {item.desc}
                </Text>
              </View>
              <Text className="text-muted-foreground">→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

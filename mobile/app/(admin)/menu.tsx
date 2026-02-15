import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '@/stores/themeStore';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, setTheme } = useThemeStore();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FAFAFA' : '#18181B';
  const mutedIconColor = isDark ? '#A1A1AA' : '#71717A';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const menuItems: {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    route: string;
    desc: string;
  }[] = [
    {
      label: 'Inventory',
      icon: 'layers',
      route: '/(admin)/inventory',
      desc: 'Restock & Stock Opname',
    },
    {
      label: 'Customers',
      icon: 'users',
      route: '/(admin)/customers',
      desc: 'Manage Member Database',
    },
    {
      label: 'Categories',
      icon: 'tag',
      route: '/(admin)/categories',
      desc: 'Product Categories',
    },
    {
      label: 'Users',
      icon: 'shield',
      route: '/(admin)/users',
      desc: 'App Users & Permissions',
    },
    {
      label: 'Reports',
      icon: 'bar-chart-2',
      route: '/(admin)/reports',
      desc: 'Detailed Analytics',
    },
    {
      label: 'Cash Flow',
      icon: 'dollar-sign',
      route: '/(admin)/cash-flow',
      desc: 'Petty Cash & Sessions',
    },
    {
      label: 'Refillables',
      icon: 'droplet',
      route: '/(admin)/refillables',
      desc: 'Gallon & Gas Stock',
    },
    {
      label: 'Stock Opname',
      icon: 'clipboard',
      route: '/(admin)/stock-opname',
      desc: 'Stock Counting',
    },
    {
      label: 'Consignment',
      icon: 'truck',
      route: '/(admin)/consignment',
      desc: 'Titip Jual Suppliers',
    },
  ];

  // Responsive sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-3xl'
      : 'text-4xl';
  const subtitleSize = isTablet
    ? 'text-base'
    : isSmallPhone
      ? 'text-xs'
      : 'text-sm';
  const labelSize = isTablet
    ? 'text-xl'
    : isSmallPhone
      ? 'text-base'
      : 'text-lg';
  const descSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const iconContainerSize = isTablet
    ? 'w-12 h-12'
    : isSmallPhone
      ? 'w-9 h-9'
      : 'w-10 h-10';
  const iconSize = isTablet ? 24 : isSmallPhone ? 16 : 20;
  const headerPadding = isTablet
    ? 'px-8 py-8'
    : isSmallPhone
      ? 'px-4 py-5'
      : 'px-6 py-6';
  const itemPadding = isTablet ? 'p-5' : isSmallPhone ? 'p-3' : 'p-4';
  const screenPadding = isTablet ? 24 : isSmallPhone ? 12 : 16;
  const gap = isTablet ? 12 : isSmallPhone ? 8 : 10;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View
        className={`bg-background border-b border-border flex-row justify-between items-end ${headerPadding}`}
        style={{
          paddingTop: insets.top + (isSmallPhone ? 16 : isTablet ? 24 : 20),
        }}
      >
        <View>
          <Text
            className={`font-heading uppercase tracking-tighter text-foreground ${headerSize}`}
          >
            Menu
          </Text>
          <Text
            className={`text-muted-foreground font-bold mt-1 font-body ${subtitleSize}`}
          >
            All Applications
          </Text>
        </View>
        {/* Theme toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          className={`bg-muted border border-border items-center justify-center ${isSmallPhone ? 'w-8 h-8' : 'w-10 h-10'}`}
        >
          <Feather
            name={theme === 'dark' ? 'sun' : 'moon'}
            size={isSmallPhone ? 14 : 18}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: screenPadding,
          paddingBottom: BOTTOM_NAV_HEIGHT + 20,
        }}
      >
        <View style={{ gap }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className={`bg-muted border border-border flex-row items-center active:opacity-70 ${itemPadding}`}
              style={{ gap: isSmallPhone ? 10 : 14 }}
            >
              <View
                className={`bg-background items-center justify-center border border-border ${iconContainerSize}`}
              >
                <Feather name={item.icon} size={iconSize} color={iconColor} />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold text-foreground uppercase tracking-tight ${labelSize}`}
                >
                  {item.label}
                </Text>
                <Text
                  className={`text-muted-foreground font-medium font-body ${descSize}`}
                  numberOfLines={1}
                >
                  {item.desc}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={isSmallPhone ? 14 : 18}
                color={mutedIconColor}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

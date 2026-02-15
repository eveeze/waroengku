import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#FAFAFA' : '#18181B';

  const menuItems = [
    {
      title: 'Restock',
      subtitle: 'Add stock from suppliers',
      icon: 'package' as const,
      route: '/(admin)/inventory/restock',
    },
    {
      title: 'Adjust',
      subtitle: 'Correct discrepancies',
      icon: 'sliders' as const,
      route: '/(admin)/inventory/adjust',
    },
    {
      title: 'Opname',
      subtitle: 'Full inventory count',
      icon: 'clipboard' as const,
      route: '/(admin)/stock-opname',
    },
    {
      title: 'Reports',
      subtitle: 'Valuation & Low Stock',
      icon: 'pie-chart' as const,
      route: '/(admin)/reports/inventory',
    },
  ];

  // Responsive sizes
  const headerSize = isTablet
    ? 'text-5xl'
    : isSmallPhone
      ? 'text-2xl'
      : 'text-3xl';
  const backSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const titleSize = isTablet
    ? 'text-lg'
    : isSmallPhone
      ? 'text-sm'
      : 'text-base';
  const subtitleSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-[10px]'
      : 'text-xs';
  const iconSize = isTablet ? 28 : isSmallPhone ? 20 : 24;
  const cardHeight = isTablet ? 160 : isSmallPhone ? 100 : 120;
  const cardPadding = isTablet ? 'p-5' : isSmallPhone ? 'p-3' : 'p-4';
  const headerPadding = isTablet
    ? 'px-8 pb-6'
    : isSmallPhone
      ? 'px-4 pb-4'
      : 'px-6 pb-5';
  const screenPadding = isTablet ? 24 : isSmallPhone ? 12 : 16;
  const gap = isTablet ? 16 : isSmallPhone ? 8 : 12;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      <View
        className={`border-b border-border bg-background ${headerPadding}`}
        style={{
          paddingTop: insets.top + (isSmallPhone ? 12 : isTablet ? 20 : 16),
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-4' : isSmallPhone ? 'mb-2' : 'mb-3'}
        >
          <Text
            className={`text-muted-foreground font-bold uppercase tracking-widest ${backSize}`}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${headerSize}`}
        >
          INVENTORY
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: screenPadding,
          paddingBottom: BOTTOM_NAV_HEIGHT + 20,
          maxWidth: isTablet ? 800 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '100%' : undefined,
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{ width: isTablet ? '30%' : '47%' }}
              onPress={() => router.push(item.route as any)}
            >
              <Card
                className={`bg-muted border-0 justify-between ${cardPadding}`}
                style={{ height: cardHeight }}
              >
                <Feather name={item.icon} size={iconSize} color={iconColor} />
                <View>
                  <Text
                    className={`font-bold text-foreground uppercase tracking-tight ${titleSize}`}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className={`text-muted-foreground ${subtitleSize}`}
                    numberOfLines={1}
                  >
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

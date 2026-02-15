import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

/**
 * Premium Bottom Navigation - Black & White Swiss Minimalist
 * Uses SafeAreaView wrapper for Android software nav buttons
 */
export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Black & White theme only
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    foreground: isDark ? '#FAFAFA' : '#18181B',
    mutedForeground: isDark ? '#71717A' : '#A1A1AA',
    border: isDark ? '#27272A' : '#E4E4E7',
  };

  // Route Config
  const visibleRoutes = ['index', 'products', 'pos', 'transactions', 'menu'];

  // Hide on POS
  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName === 'pos') {
    return null;
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (!visibleRoutes.includes(route.name)) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Icon Mapping
          let iconName: keyof typeof Feather.glyphMap = 'circle';
          switch (route.name) {
            case 'index':
              iconName = 'home';
              break;
            case 'products':
              iconName = 'box';
              break;
            case 'pos':
              iconName = 'zap';
              break;
            case 'transactions':
              iconName = 'file-text';
              break;
            case 'menu':
              iconName = 'menu';
              break;
          }

          // POS Button (Center) - Black/White inverted
          if (route.name === 'pos') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.85}
                style={[
                  styles.posButton,
                  { backgroundColor: colors.foreground },
                ]}
              >
                <Feather name="zap" size={24} color={colors.background} />
              </TouchableOpacity>
            );
          }

          // Standard Tab
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.tabInner}>
                <Feather
                  name={iconName}
                  size={22}
                  color={isFocused ? colors.foreground : colors.mutedForeground}
                />
                {/* Active Indicator - Small dot */}
                {isFocused && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: colors.foreground },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// Export nav height for screen padding
export const BOTTOM_NAV_HEIGHT = 72;

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  posButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

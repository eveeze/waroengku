import React from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
  Text, // fallback
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// Screen Dimensions
const { width } = Dimensions.get('window');

/**
 * Premium "Awwwards" Worthy Bottom Navigation
 * Floating Dock Style
 */
export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Route Config
  const visibleRoutes = ['index', 'products', 'pos', 'transactions', 'menu'];

  // HIDE TAB BAR ON POS SCREEN
  // If the currently active tab is 'pos', we hide the bottom bar completely
  // to give full screen real estate to the POS interface.
  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName === 'pos') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 0 : 20) },
      ]}
      pointerEvents="box-none"
    >
      <View className="flex-row items-center bg-white dark:bg-zinc-900 w-[90%] h-[72px] rounded-3xl px-2 mb-2 shadow-lg shadow-black/10 border border-zinc-100 dark:border-white/10">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Filter hidden routes
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

          // Icon Selection
          let iconName: keyof typeof Feather.glyphMap = 'circle';

          // "asak menu lognya hamburger di logo warungku" -> Menu is Hamburger
          switch (route.name) {
            case 'index':
              iconName = 'home';
              break;
            case 'products':
              iconName = 'package'; // Stock/Box
              break;
            case 'pos':
              iconName = 'zap'; // Fast/Action
              break;
            case 'transactions':
              iconName = 'file-text'; // History/Receipt
              break;
            case 'menu':
              iconName = 'menu'; // Hamburger
              break;
          }

          // Special Center Button (POS)
          if (route.name === 'pos') {
            return (
              <View key={route.key} style={styles.posButtonContainer}>
                <TouchableOpacity
                  onPress={onPress}
                  onLongPress={onLongPress}
                  activeOpacity={0.9}
                  className={`w-16 h-16 rounded-full items-center justify-center border-4 border-white dark:border-zinc-950 shadow-lg shadow-black/30 ${
                    isFocused
                      ? 'bg-zinc-800 dark:bg-zinc-200 scale-105'
                      : 'bg-black dark:bg-white'
                  }`}
                >
                  <Feather
                    name={iconName}
                    size={28}
                    className="text-white dark:text-black ml-[1px]"
                  />
                </TouchableOpacity>
              </View>
            );
          }

          // Standard Tab
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 h-full items-center justify-center"
              activeOpacity={0.7}
            >
              <View
                className={`p-2 rounded-xl ${
                  isFocused ? 'bg-black/5 dark:bg-white/10' : ''
                }`}
              >
                <Feather
                  name={iconName}
                  size={24}
                  color={
                    isFocused
                      ? Platform.OS === 'ios'
                        ? '#000'
                        : '#000'
                      : '#A1A1AA'
                  } // We handle color via class if possible, but Icon expects prop string. passing explicit color for now logic
                  className={
                    isFocused
                      ? 'text-primary dark:text-primary-foreground'
                      : 'text-zinc-400'
                  }
                />
              </View>
              {isFocused && (
                <View className="absolute bottom-3 w-1 h-1 rounded-full bg-black dark:bg-white" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  dock: {
    // Styling moved to className
  },
  // ... other styles removed/simplified
  posButtonContainer: {
    width: 72,
    height: 72,
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

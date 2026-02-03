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

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 0 : 20) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.dock}>
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
                  style={[
                    styles.posButton,
                    isFocused && styles.posButtonFocused,
                  ]}
                >
                  <Feather
                    name={iconName}
                    size={28}
                    color="white"
                    style={{ marginLeft: 1 }} // Optical centering
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
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, isFocused && styles.iconActive]}
              >
                <Feather
                  name={iconName}
                  size={24}
                  color={isFocused ? '#000000' : '#A1A1AA'} // Black vs Zinc-400
                />
              </View>
              {isFocused && <View style={styles.activeDot} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: width - 40, // Floating with margin
    height: 72,
    borderRadius: 24, // Soft rounded corners
    paddingHorizontal: 8,
    marginBottom: 10,
    // Premium Shadows
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  iconActive: {
    backgroundColor: 'rgba(0,0,0,0.05)', // Subtle backdrop for active
  },
  activeDot: {
    position: 'absolute',
    bottom: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  },
  posButtonContainer: {
    width: 72,
    height: 72,
    top: -20, // Lifted
    alignItems: 'center',
    justifyContent: 'center',
  },
  posButton: {
    width: 64,
    height: 64,
    backgroundColor: '#000000',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // Button Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  posButtonFocused: {
    transform: [{ scale: 1.05 }],
    backgroundColor: '#1a1a1a',
  },
});

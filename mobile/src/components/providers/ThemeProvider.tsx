import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { themes } from '@/utils/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeContext = createContext<{
  theme: 'light' | 'dark';
}>({
  theme: 'dark', // Default to dark as requested
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { colorScheme } = useColorScheme();
  // NativeWind useColorScheme returns the resolved scheme (light/dark)
  // If undefined, fallback to 'light' (standard system default) or maybe 'dark' if we want to be safe, but typically 'light' is safe default.
  // Actually, let's fallback to 'dark' since the user prefers dark, but it should technically update instanty.
  const activeTheme = colorScheme || 'light';

  return (
    <ThemeContext.Provider value={{ theme: activeTheme }}>
      <View style={themes[activeTheme]} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

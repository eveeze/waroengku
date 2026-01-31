import { Stack } from 'expo-router';

/**
 * Reports Stack Layout
 */
export default function ReportsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="daily" />
      <Stack.Screen name="kasbon" />
      <Stack.Screen name="inventory" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

/**
 * Product Detail Layout
 */
export default function ProductDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="pricing" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

/**
 * Customer Detail Layout
 */
export default function CustomerDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="kasbon" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="transactions" />
    </Stack>
  );
}

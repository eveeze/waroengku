import { Stack } from 'expo-router';

/**
 * Customers Stack Layout
 */
export default function CustomersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/edit" />
      <Stack.Screen name="[id]/kasbon" />
      <Stack.Screen name="[id]/payment" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="restock" options={{ presentation: 'modal' }} />
      <Stack.Screen name="adjust" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

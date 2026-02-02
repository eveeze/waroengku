import { Stack } from 'expo-router';

export default function StockOpnameLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="variance" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

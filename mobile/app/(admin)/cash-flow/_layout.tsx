import { Stack } from 'expo-router';

export default function CashFlowLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="open" options={{ presentation: 'modal' }} />
      <Stack.Screen name="close" options={{ presentation: 'modal' }} />
      <Stack.Screen name="history" />
      <Stack.Screen name="record" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

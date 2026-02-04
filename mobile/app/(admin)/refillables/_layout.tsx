import { Stack } from 'expo-router';

export default function RefillablesLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="adjust" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/movements" />
    </Stack>
  );
}

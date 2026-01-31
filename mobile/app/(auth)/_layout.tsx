import { Stack } from 'expo-router';

/**
 * Auth Layout
 * Layout for unauthenticated screens (login, register)
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}

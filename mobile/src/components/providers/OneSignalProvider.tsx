/**
 * OneSignal Push Notification Provider
 * Best Practices Implementation for Android
 */
import { useEffect, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import {
  LogLevel,
  OneSignal,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
} from 'react-native-onesignal';
import Constants from 'expo-constants';

// Get OneSignal App ID from environment or constants
const ONESIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ||
  Constants.expoConfig?.extra?.oneSignalAppId ||
  'YOUR_ONESIGNAL_APP_ID'; // Replace with your App ID

interface OneSignalProviderProps {
  children: React.ReactNode;
}

export function OneSignalProvider({ children }: OneSignalProviderProps) {
  const router = useRouter();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once and only on native platforms
    if (isInitialized.current || Platform.OS === 'web') {
      return;
    }

    // Validate App ID
    if (ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') {
      console.warn(
        '[OneSignal] App ID not configured. Set EXPO_PUBLIC_ONESIGNAL_APP_ID in .env',
      );
      return;
    }

    isInitialized.current = true;

    // Enable verbose logging in development
    if (__DEV__) {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    }

    // Initialize OneSignal
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Request notification permission (Android auto-grants, but good practice)
    OneSignal.Notifications.requestPermission(true);

    // Handle notification clicks
    OneSignal.Notifications.addEventListener(
      'click',
      (event: NotificationClickEvent) => {
        console.log('[OneSignal] Notification clicked:', event);

        const data = event.notification.additionalData as Record<string, any>;

        if (data) {
          // Navigate based on notification type
          switch (data.type) {
            case 'low_stock':
              if (data.product_id) {
                router.push(`/(admin)/products/${data.product_id}` as any);
              } else {
                router.push('/(admin)/products' as any);
              }
              break;

            case 'new_transaction':
              if (data.transaction_id) {
                router.push(
                  `/(admin)/transactions/${data.transaction_id}` as any,
                );
              } else {
                router.push('/(admin)/transactions' as any);
              }
              break;

            default:
              // Default: open notifications screen
              router.push('/(admin)/notifications' as any);
          }
        } else {
          // No data: open notifications screen
          router.push('/(admin)/notifications' as any);
        }
      },
    );

    // Handle foreground notifications (show in-app)
    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      (event: NotificationWillDisplayEvent) => {
        console.log('[OneSignal] Foreground notification:', event);
        // Display the notification (default behavior)
        event.preventDefault();
        event.getNotification().display();
      },
    );

    // Log subscription changes
    OneSignal.User.pushSubscription.addEventListener(
      'change',
      (subscription) => {
        console.log('[OneSignal] Subscription changed:', subscription);
      },
    );

    return () => {
      // Cleanup listeners
      OneSignal.Notifications.removeEventListener('click', () => {});
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        () => {},
      );
    };
  }, [router]);

  return <>{children}</>;
}

/**
 * Login user to OneSignal (call after successful auth)
 * Links notifications to your backend user ID
 */
export const oneSignalLogin = (userId: string) => {
  if (Platform.OS === 'web') return;

  try {
    OneSignal.login(userId);
    console.log('[OneSignal] User logged in:', userId);
  } catch (error) {
    console.error('[OneSignal] Login error:', error);
  }
};

/**
 * Logout user from OneSignal (call on logout)
 */
export const oneSignalLogout = () => {
  if (Platform.OS === 'web') return;

  try {
    OneSignal.logout();
    console.log('[OneSignal] User logged out');
  } catch (error) {
    console.error('[OneSignal] Logout error:', error);
  }
};

/**
 * Get current player/subscription ID
 */
export const getOneSignalPlayerId = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;

  try {
    const id = await OneSignal.User.pushSubscription.getIdAsync();
    return id || null;
  } catch (error) {
    console.error('[OneSignal] Get player ID error:', error);
    return null;
  }
};

import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/api/endpoints';
import { Notification } from '@/api/types';
import { EmptyState } from '@/components/shared';
import { NotificationListInlineSkeleton } from '@/components/skeletons';
import { BOTTOM_NAV_HEIGHT } from '@/components/navigation/BottomTabBar';

/**
 * Notifications Screen
 * Swiss Minimalist Design - Responsive
 */
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();

  // Responsive sizing
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FAFAFA' : '#18181B';
  const mutedIconColor = isDark ? '#A1A1AA' : '#71717A';

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['/notifications'],
    queryFn: () => getNotifications({ limit: 50 }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
    },
  });

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    // Navigate based on notification type
    if (notification.type === 'low_stock' && notification.data?.product_id) {
      router.push(`/(admin)/products/${notification.data.product_id}`);
    } else if (
      notification.type === 'new_transaction' &&
      notification.data?.transaction_id
    ) {
      router.push(`/(admin)/transactions/${notification.data.transaction_id}`);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    Alert.alert(
      'Mark All as Read',
      `Mark ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: () => markAllReadMutation.mutate(),
        },
      ],
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type: string): keyof typeof Feather.glyphMap => {
    switch (type) {
      case 'low_stock':
        return 'alert-triangle';
      case 'new_transaction':
        return 'shopping-cart';
      default:
        return 'bell';
    }
  };

  // Responsive sizes
  const headerPadding = isTablet
    ? 'px-8 pb-5'
    : isSmallPhone
      ? 'px-3 pb-2'
      : 'px-5 pb-3';
  const headerSize = isTablet
    ? 'text-3xl'
    : isSmallPhone
      ? 'text-lg'
      : 'text-xl';
  const labelSize = isTablet
    ? 'text-xs'
    : isSmallPhone
      ? 'text-[8px]'
      : 'text-[10px]';
  const titleSize = isTablet
    ? 'text-lg'
    : isSmallPhone
      ? 'text-sm'
      : 'text-base';
  const messageSize = isTablet
    ? 'text-sm'
    : isSmallPhone
      ? 'text-xs'
      : 'text-sm';
  const timeSize = isTablet
    ? 'text-xs'
    : isSmallPhone
      ? 'text-[8px]'
      : 'text-[10px]';
  const itemPadding = isTablet
    ? 'px-8 py-5'
    : isSmallPhone
      ? 'px-4 py-3'
      : 'px-6 py-4';
  const iconContainerSize = isTablet
    ? 'w-12 h-12'
    : isSmallPhone
      ? 'w-8 h-8'
      : 'w-10 h-10';
  const iconSize = isTablet ? 20 : isSmallPhone ? 14 : 18;
  const backButtonSize = isTablet
    ? 'w-10 h-10'
    : isSmallPhone
      ? 'w-8 h-8'
      : 'w-9 h-9';
  const backIconSize = isTablet ? 20 : isSmallPhone ? 16 : 18;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item)}
      className={`border-b border-border ${itemPadding} ${
        item.is_read ? 'bg-background' : 'bg-muted/50'
      }`}
      activeOpacity={0.7}
    >
      <View
        className={`flex-row items-start ${isSmallPhone ? 'gap-2' : 'gap-3'}`}
      >
        <View
          className={`items-center justify-center ${iconContainerSize} ${
            item.is_read ? 'bg-muted' : 'bg-primary'
          }`}
        >
          <Feather
            name={getNotificationIcon(item.type)}
            size={iconSize}
            color={item.is_read ? mutedIconColor : '#FFFFFF'}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text
              className={`font-bold uppercase tracking-tight ${titleSize} ${
                item.is_read ? 'text-muted-foreground' : 'text-foreground'
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.is_read && <View className="w-2 h-2 bg-destructive" />}
          </View>
          <Text
            className={`text-muted-foreground font-body mb-1 ${messageSize}`}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground/60 ${timeSize}`}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className={`bg-background border-b border-border ${headerPadding}`}
        style={{ paddingTop: insets.top + (isSmallPhone ? 10 : 14) }}
      >
        <View
          className={`flex-row items-center justify-between ${isSmallPhone ? 'gap-2' : ''}`}
        >
          <View
            className={`flex-row items-center ${isSmallPhone ? 'gap-2' : 'gap-3'}`}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className={`items-center justify-center bg-muted ${backButtonSize}`}
            >
              <Feather
                name="arrow-left"
                size={backIconSize}
                color={iconColor}
              />
            </TouchableOpacity>
            <View className="flex-1">
              {!isSmallPhone && (
                <Text
                  className={`font-bold uppercase tracking-widest text-muted-foreground mb-0.5 font-body ${labelSize}`}
                >
                  Inbox
                </Text>
              )}
              <Text
                className={`font-black uppercase tracking-tighter text-foreground ${headerSize}`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Notifications
              </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={markAllReadMutation.isPending}
              className={`bg-muted items-center justify-center border border-border ${isSmallPhone ? 'px-2 py-1 h-7' : 'px-3 py-2'}`}
            >
              <Text
                className={`font-bold uppercase tracking-wide text-foreground ${labelSize}`}
              >
                {isSmallPhone ? 'Clear' : 'Mark All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#888"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <NotificationListInlineSkeleton count={8} />
          ) : (
            <EmptyState
              title="No Notifications"
              message="You're all caught up!"
              featherIcon="bell-off"
              variant="info"
            />
          )
        }
        contentContainerStyle={{
          paddingBottom: BOTTOM_NAV_HEIGHT + 20,
          flexGrow: 1,
        }}
      />
    </View>
  );
}

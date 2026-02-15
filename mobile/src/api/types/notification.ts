/**
 * Notification Types
 * For push notification history and management
 */

export type NotificationType = 'low_stock' | 'new_transaction' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  limit: number;
  offset: number;
}

export interface NotificationParams {
  limit?: number;
  offset?: number;
}

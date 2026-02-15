/**
 * Notifications API Endpoints
 */
import apiClient from '../client';
import { NotificationsResponse, NotificationParams } from '../types';

/**
 * Get notifications for current user
 */
export const getNotifications = async (
  params: NotificationParams = {},
): Promise<NotificationsResponse> => {
  const { limit = 20, offset = 0 } = params;
  const response = await apiClient.get('/notifications', {
    params: { limit, offset },
  });
  return response.data.data;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

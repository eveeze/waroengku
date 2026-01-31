import apiClient, { apiCall } from '../client';
import {
  UserInfo,
  UserListParams,
  UpdateUserRequest,
  PaginatedResponse,
} from '../types';

/**
 * Users API Endpoints (Admin Only)
 */

/**
 * Get all users with pagination
 * GET /api/v1/users
 */
export async function getUsers(
  params?: UserListParams
): Promise<PaginatedResponse<UserInfo>> {
  const response = await apiClient.get<PaginatedResponse<UserInfo>>('/users', {
    params,
  });
  return response.data;
}

/**
 * Get single user by ID
 * GET /api/v1/users/:id
 */
export async function getUserById(id: string): Promise<UserInfo> {
  return apiCall<UserInfo>('get', `/users/${id}`);
}

/**
 * Update user
 * PUT /api/v1/users/:id
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<UserInfo> {
  return apiCall<UserInfo>('put', `/users/${id}`, data);
}

/**
 * Delete/deactivate user
 * DELETE /api/v1/users/:id
 */
export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

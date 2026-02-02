import apiClient from '../client';
import { UserInfo, UserListParams, PaginatedResponse } from '../types';
import { RegisterUserFormData } from '@/utils/validation';

/**
 * USERS MANAGEMENT (Admin Only)
 * Sinkron dengan Backend Router: /api/v1/users
 */

/**
 * List Users
 * Backend: GET /api/v1/users (adminOnly)
 */
export async function getUsers(
  params?: UserListParams,
): Promise<PaginatedResponse<UserInfo>> {
  // Backend pake response.SuccessWithMeta, jadi kita return response.data
  const response = await apiClient.get('/users', { params });
  return response.data;
}

/**
 * Create User (Admin Only atau Public Registration tergantung Backend)
 * Backend: POST /api/v1/users
 */
export async function createUser(
  data: RegisterUserFormData,
): Promise<UserInfo> {
  // Sesuai rute lu: mux.HandleFunc("POST "+apiPrefix+"/users", ...)
  const response = await apiClient.post('/users', data);
  return response.data.data;
}

/**
 * Get User By ID
 * Backend: GET /api/v1/users/{id}
 */
export async function getUserById(id: string): Promise<UserInfo> {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
}

/**
 * Update User
 * Backend: PUT /api/v1/users/{id}
 */
export async function updateUser(
  id: string,
  data: any, // Sesuai UpdateUserRequest di backend
): Promise<UserInfo> {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data.data;
}

/**
 * Delete User
 * Backend: DELETE /api/v1/users/{id}
 */
export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

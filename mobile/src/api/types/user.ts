import { UserRole } from './common';

/**
 * User Management Types (Admin)
 */

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Alias for UserInfo
export type User = UserInfo;

// User list query params
export interface UserListParams {
  page?: number;
  per_page?: number;
  role?: UserRole;
  search?: string;
}

// Update user request
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Change password request
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

import {
  UserInfo,
  UserListParams,
  UpdateUserRequest,
  PaginatedResponse,
} from '../types';

/**
 * Users API Endpoints (Admin Only)
 * MOCK IMPLEMENTATION - Backend endpoint does not exist yet.
 */

// Dummy data for mocking
const MOCK_USERS: UserInfo[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@warung.com',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Budi Kasir',
    email: 'budi@warung.com',
    role: 'cashier',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Siti Gudang',
    email: 'siti@warung.com',
    role: 'inventory',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Get all users with pagination
 * GET /api/v1/users (MOCKED)
 */
export async function getUsers(
  params?: UserListParams,
): Promise<PaginatedResponse<UserInfo>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    data: MOCK_USERS,
    meta: {
      page: params?.page || 1,
      per_page: params?.per_page || 10,
      total_items: MOCK_USERS.length,
      total_pages: 1,
    },
  };
}

/**
 * Get single user by ID
 * GET /api/v1/users/:id (MOCKED)
 */
export async function getUserById(id: string): Promise<UserInfo> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
}

/**
 * Update user
 * PUT /api/v1/users/:id (MOCKED)
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest,
): Promise<UserInfo> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // In a real mock we would update the array, but for simple display this is enough
  return {
    ...MOCK_USERS[0],
    id,
    ...data,
  };
}

/**
 * Delete/deactivate user
 * DELETE /api/v1/users/:id (MOCKED)
 */
export async function deleteUser(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Mock success
}

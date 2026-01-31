import apiClient, { apiCall } from '../client';
import {
  Category,
  CategoryListParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
} from '../types';

/**
 * Categories API Endpoints
 */

/**
 * Get all categories
 * GET /api/v1/categories
 */
export async function getCategories(
  params?: CategoryListParams
): Promise<Category[]> {
  const response = await apiClient.get<{ data: Category[] }>('/categories', {
    params,
  });
  return response.data.data;
}

/**
 * Get single category by ID
 * GET /api/v1/categories/{id}
 */
export async function getCategoryById(id: string): Promise<Category> {
  return apiCall<Category>('get', `/categories/${id}`);
}

/**
 * Create new category
 * POST /api/v1/categories
 */
export async function createCategory(
  data: CreateCategoryRequest
): Promise<Category> {
  return apiCall<Category>('post', '/categories', data);
}

/**
 * Update category
 * PUT /api/v1/categories/{id}
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<Category> {
  return apiCall<Category>('put', `/categories/${id}`, data);
}

/**
 * Delete category
 * DELETE /api/v1/categories/{id}
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

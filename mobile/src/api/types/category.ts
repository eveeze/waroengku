/**
 * Category Types
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  product_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category list params
export interface CategoryListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// Create category request
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parent_id?: string;
}

// Update category request
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

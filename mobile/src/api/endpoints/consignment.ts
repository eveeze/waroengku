import apiClient, { apiCall } from '../client';
import {
  Consignor,
  CreateConsignorRequest,
  UpdateConsignorRequest,
} from '../types';

/**
 * Consignment API Endpoints
 * See docs/consignment/README.md
 */

/**
 * List Consignors
 * GET /api/v1/consignors
 */
export async function getConsignors(): Promise<Consignor[]> {
  const response = await apiClient.get<Consignor[]>('/consignors');

  // Handle array response if wrapped or direct
  const result = Array.isArray(response.data)
    ? response.data
    : (response.data as any).data || [];

  // Filter active-only (backend may return soft-deleted items)
  return result.filter((c: any) => c.is_active !== false);
}

/**
 * Get Consignor by ID
 * GET /api/v1/consignors/{id}
 */
export async function getConsignorById(id: string): Promise<Consignor> {
  const response = await apiClient.get<{ data: Consignor }>(
    `/consignors/${id}`,
  );
  return response.data.data;
}

/**
 * Create Consignor
 * POST /api/v1/consignors
 */
export async function createConsignor(
  data: CreateConsignorRequest,
): Promise<Consignor> {
  return apiCall<Consignor>('post', '/consignors', data);
}

/**
 * Update Consignor
 * PUT /api/v1/consignors/{id}
 */
export async function updateConsignor(
  id: string,
  data: UpdateConsignorRequest,
): Promise<Consignor> {
  return apiCall<Consignor>('put', `/consignors/${id}`, data);
}

/**
 * Delete Consignor (Soft Delete)
 * DELETE /api/v1/consignors/{id}
 */
export async function deleteConsignor(id: string): Promise<boolean> {
  await apiCall('delete', `/consignors/${id}`);
  return true;
}

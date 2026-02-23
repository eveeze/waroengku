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
  return Array.isArray(response.data)
    ? response.data
    : (response.data as any).data || [];
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

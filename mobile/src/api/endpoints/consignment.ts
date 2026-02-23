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
  console.log('[DEBUG getConsignors] >>> FETCHING from server...');
  const response = await apiClient.get<Consignor[]>('/consignors', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
  console.log('[DEBUG getConsignors] HTTP Status:', response.status);
  console.log(
    '[DEBUG getConsignors] Cache-Control header from server:',
    response.headers['cache-control'],
  );
  console.log(
    '[DEBUG getConsignors] ETag header from server:',
    response.headers['etag'],
  );
  console.log(
    '[DEBUG getConsignors] Raw response.data type:',
    typeof response.data,
  );
  console.log(
    '[DEBUG getConsignors] Raw response.data isArray:',
    Array.isArray(response.data),
  );
  console.log(
    '[DEBUG getConsignors] Raw response.data:',
    JSON.stringify(response.data).substring(0, 500),
  );

  // Handle array response if wrapped or direct
  const result = Array.isArray(response.data)
    ? response.data
    : (response.data as any).data || [];

  console.log('[DEBUG getConsignors] Final result count:', result.length);
  console.log(
    '[DEBUG getConsignors] Final IDs:',
    result.map((c: any) => c.id),
  );
  console.log(
    '[DEBUG getConsignors] Final names:',
    result.map((c: any) => c.name),
  );
  // WORKAROUND: Backend returns is_active=false items (soft-deleted), filter client-side
  const activeOnly = result.filter((c: any) => c.is_active !== false);
  console.log(
    '[DEBUG getConsignors] After is_active filter:',
    activeOnly.length,
  );
  return activeOnly;
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

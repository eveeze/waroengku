import apiClient from '../client';
import { RefillableContainer, AdjustRefillableRequest } from '../types';

/**
 * Refillables API Endpoints
 * See docs/refillables/README.md
 */

/**
 * Get Refillable Containers
 * GET /api/v1/refillables
 */
export async function getRefillableContainers(): Promise<
  RefillableContainer[]
> {
  const response = await apiClient.get<{ data: RefillableContainer[] }>(
    '/refillables',
  );
  return response.data.data;
}

/**
 * Adjust Refillable Stock
 * POST /api/v1/refillables/adjust
 */
export async function adjustRefillableStock(
  data: AdjustRefillableRequest,
): Promise<void> {
  await apiClient.post('/refillables/adjust', data);
}

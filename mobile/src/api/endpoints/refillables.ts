import apiClient from '../client';
import {
  RefillableContainer,
  AdjustRefillableRequest,
  CreateRefillableContainerRequest,
  RefillableMovement,
} from '../types';

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

/**
 * Create Refillable Container
 * POST /api/v1/refillables
 */
export async function createRefillableContainer(
  data: CreateRefillableContainerRequest,
): Promise<RefillableContainer> {
  const response = await apiClient.post<{ data: RefillableContainer }>(
    '/refillables',
    data,
  );
  return response.data.data;
}

/**
 * Get Refillable Movements (History)
 * GET /api/v1/refillables/{id}/movements
 */
export async function getRefillableMovements(
  id: string,
): Promise<RefillableMovement[]> {
  const response = await apiClient.get<{ data: RefillableMovement[] }>(
    `/refillables/${id}/movements`,
  );
  return response.data.data;
}

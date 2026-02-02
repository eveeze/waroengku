import apiClient from '../client';
import {
  HeldCart,
  HoldCartRequest,
  CreateRefundRequest,
  Refund,
} from '../types';

/**
 * POS API Endpoints
 * See docs/pos/README.md
 */

/**
 * Hold Cart
 * POST /pos/held-carts
 */
export async function holdCart(data: HoldCartRequest): Promise<HeldCart> {
  const response = await apiClient.post('/pos/held-carts', data);
  return response.data.data;
}

/**
 * Get Held Carts
 * GET /pos/held-carts
 */
export async function getHeldCarts(): Promise<HeldCart[]> {
  const response = await apiClient.get('/pos/held-carts');
  return response.data.data;
}

/**
 * Resume Held Cart
 * POST /pos/held-carts/{id}/resume
 */
export async function resumeCart(id: string): Promise<HeldCart> {
  const response = await apiClient.post(`/pos/held-carts/${id}/resume`);
  return response.data.data;
}

/**
 * Discard Held Cart
 * POST /pos/held-carts/{id}/discard
 */
export async function discardCart(id: string): Promise<void> {
  await apiClient.post(`/pos/held-carts/${id}/discard`);
}

/**
 * Create Refund
 * POST /pos/refunds
 */
export async function createRefund(data: CreateRefundRequest): Promise<Refund> {
  const response = await apiClient.post('/pos/refunds', data);
  return response.data.data;
}

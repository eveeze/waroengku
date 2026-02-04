import apiClient, { apiCall } from '../client';
import {
  OpnameSession,
  CreateSessionRequest,
  RecordCountRequest,
  VarianceReport,
  FinalizeSessionRequest,
  ShoppingListItem,
  NearExpiryItem,
  GetOpnameSessionsParams,
  GetNearExpiryParams,
  PaginatedResponse,
} from '../types';

/**
 * Stock Opname API Endpoints
 * See docs/stock_opname/README.md
 */

/**
 * List Sessions
 * GET /api/v1/stock-opname/sessions
 */
export async function getOpnameSessions(
  params?: GetOpnameSessionsParams,
): Promise<PaginatedResponse<OpnameSession>> {
  return apiCall<PaginatedResponse<OpnameSession>>(
    'get',
    '/stock-opname/sessions',
    params,
  );
}

/**
 * Start Session
 * POST /api/v1/stock-opname/sessions
 */
export async function startOpnameSession(
  data: CreateSessionRequest,
): Promise<OpnameSession> {
  return apiCall<OpnameSession>('post', '/stock-opname/sessions', data);
}

/**
 * Get Session Details
 * GET /api/v1/stock-opname/sessions/{id}
 */
export async function getOpnameSession(id: string): Promise<OpnameSession> {
  return apiCall<OpnameSession>('get', `/stock-opname/sessions/${id}`);
}

/**
 * Record Count
 * POST /api/v1/stock-opname/sessions/{id}/items
 */
export async function recordOpnameCount(
  sessionId: string,
  data: RecordCountRequest,
): Promise<void> {
  await apiClient.post(`/stock-opname/sessions/${sessionId}/items`, data);
}

/**
 * Get Variance Report
 * GET /api/v1/stock-opname/sessions/{id}/variance
 */
export async function getVarianceReport(
  sessionId: string,
): Promise<VarianceReport> {
  return apiCall<VarianceReport>(
    'get',
    `/stock-opname/sessions/${sessionId}/variance`,
  );
}

/**
 * Finalize Session
 * POST /api/v1/stock-opname/sessions/{id}/finalize
 */
export async function finalizeOpnameSession(
  sessionId: string,
  data: FinalizeSessionRequest,
): Promise<void> {
  await apiClient.post(`/stock-opname/sessions/${sessionId}/finalize`, data);
}

/**
 * Cancel Session
 * POST /api/v1/stock-opname/sessions/{id}/cancel
 */
export async function cancelOpnameSession(sessionId: string): Promise<void> {
  await apiClient.post(`/stock-opname/sessions/${sessionId}/cancel`);
}

/**
 * Get Shopping List
 * GET /api/v1/stock-opname/shopping-list
 */
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  return apiCall<ShoppingListItem[]>('get', '/stock-opname/shopping-list');
}

/**
 * Get Near Expiry Report
 * GET /api/v1/stock-opname/near-expiry
 */
export async function getNearExpiryReport(
  params?: GetNearExpiryParams,
): Promise<NearExpiryItem[]> {
  return apiCall<NearExpiryItem[]>('get', '/stock-opname/near-expiry', params);
}

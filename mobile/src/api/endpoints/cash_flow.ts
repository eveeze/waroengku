import apiClient, { apiCall } from '../client';
import {
  DrawerSession,
  OpenDrawerRequest,
  CloseDrawerRequest,
  CashFlowCategory,
  RecordCashFlowRequest,
  CashFlowEntry,
  GetCashFlowsParams,
  PaginatedResponse,
} from '../types';

/**
 * Cash Flow API Endpoints
 * See docs/cash_flow/README.md
 */

/**
 * Open Drawer Session
 * POST /api/v1/cashflow/drawer/open
 */
export async function openDrawer(
  data: OpenDrawerRequest,
): Promise<DrawerSession> {
  return apiCall<DrawerSession>('post', '/cashflow/drawer/open', data);
}

/**
 * Close Drawer Session
 * POST /api/v1/cashflow/drawer/close
 */
export async function closeDrawer(
  data: CloseDrawerRequest,
): Promise<DrawerSession> {
  return apiCall<DrawerSession>('post', '/cashflow/drawer/close', data);
}

/**
 * Get Current Session
 * GET /api/v1/cashflow/drawer/current
 */
export async function getCurrentSession(): Promise<DrawerSession | null> {
  try {
    return await apiCall<DrawerSession>('get', '/cashflow/drawer/current');
  } catch {
    return null;
  }
}

/**
 * Get Categories
 * GET /api/v1/cashflow/categories
 */
export async function getCashFlowCategories(): Promise<CashFlowCategory[]> {
  const response = await apiClient.get<CashFlowCategory[]>(
    '/cashflow/categories',
  );
  return Array.isArray(response.data)
    ? response.data
    : (response.data as any).data || [];
}

/**
 * Record Cash Flow
 * POST /api/v1/cashflow
 */
export async function recordCashFlow(
  data: RecordCashFlowRequest,
): Promise<CashFlowEntry> {
  return apiCall<CashFlowEntry>('post', '/cashflow', data);
}

/**
 * Get Cash Flows
 * GET /api/v1/cashflow
 */
export async function getCashFlows(
  params?: GetCashFlowsParams,
): Promise<PaginatedResponse<CashFlowEntry>> {
  const response = await apiClient.get<PaginatedResponse<CashFlowEntry>>(
    '/cashflow',
    { params },
  );
  return response.data;
}

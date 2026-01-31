import { apiCall } from '../client';
import {
  DashboardData,
  DailyReportData,
  DailyReportParams,
  KasbonReportData,
  InventoryReportData,
} from '../types';

/**
 * Reports API Endpoints
 * Based on MOBILE_DEV_GUIDE.md Section 8
 */

/**
 * Get dashboard summary
 * GET /api/v1/reports/dashboard
 */
export async function getDashboard(): Promise<DashboardData> {
  return apiCall<DashboardData>('get', '/reports/dashboard');
}

/**
 * Get daily sales report
 * GET /api/v1/reports/daily?date=YYYY-MM-DD
 */
export async function getDailyReport(
  params?: DailyReportParams,
): Promise<DailyReportData> {
  return apiCall<DailyReportData>('get', '/reports/daily', undefined, {
    ...params,
  });
}

/**
 * Get kasbon report
 * GET /api/v1/reports/kasbon
 */
export async function getKasbonReport(): Promise<KasbonReportData> {
  return apiCall<KasbonReportData>('get', '/reports/kasbon');
}

/**
 * Get inventory report
 * GET /api/v1/reports/inventory
 */
export async function getInventoryReport(): Promise<InventoryReportData> {
  return apiCall<InventoryReportData>('get', '/reports/inventory');
}

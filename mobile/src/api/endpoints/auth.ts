import axios from 'axios';
import { config } from '@/constants/config';
import { tokenStorage } from '@/utils/storage';
import apiClient from '../client';
import {
  LoginRequest,
  LoginResponseData,
  RefreshTokenRequest,
  RefreshTokenResponseData,
  RegisterRequest,
  RegisterResponseData,
  ApiResponse,
} from '../types';

/**
 * Auth API Endpoints
 * Based on MOBILE_DEV_GUIDE.md Section 1
 */

const authClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Login user
 * POST /auth/login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponseData> {
  const response = await authClient.post<ApiResponse<LoginResponseData>>(
    '/auth/login',
    credentials
  );
  
  // Store tokens
  const { access_token, refresh_token } = response.data.data;
  await tokenStorage.setTokens(access_token, refresh_token);
  
  return response.data.data;
}

/**
 * Refresh access token
 * POST /auth/refresh
 */
export async function refreshToken(
  refreshTokenData: RefreshTokenRequest
): Promise<RefreshTokenResponseData> {
  const response = await authClient.post<ApiResponse<RefreshTokenResponseData>>(
    '/auth/refresh',
    refreshTokenData
  );
  
  // Store new tokens
  const { access_token, refresh_token } = response.data.data;
  await tokenStorage.setTokens(access_token, refresh_token);
  
  return response.data.data;
}

/**
 * Register new user (Admin only)
 * POST /auth/register
 * Uses apiClient which automatically includes auth token
 */
export async function registerUser(
  userData: RegisterRequest
): Promise<RegisterResponseData> {
  const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
    '/auth/register',
    userData
  );
  return response.data.data;
}

/**
 * Logout user (clear tokens locally)
 */
export async function logout(): Promise<void> {
  await tokenStorage.clearTokens();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await tokenStorage.getAccessToken();
  return !!token;
}

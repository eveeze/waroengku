import { UserRole } from './common';

/**
 * Authentication Types
 */

// User data returned from login (basic info)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response data
export interface LoginResponseData {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

// Refresh token request
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Refresh token response
export interface RefreshTokenResponseData {
  access_token: string;
  refresh_token: string;
}

// Register user request (Admin only)
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Register user response
export interface RegisterResponseData {
  user: AuthUser;
}

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/api/types';

/**
 * useAuth Hook
 * Convenient hook for authentication operations
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    error,
    login,
    logout,
    clearError,
    isAdmin,
    hasRole,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
    },
    [login]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    error,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,

    // Role checks
    isAdmin: isAdmin(),
    hasRole: (role: UserRole) => hasRole(role),

    // Convenience getters
    userName: user?.name || '',
    userEmail: user?.email || '',
    userRole: user?.role || null,
  };
}

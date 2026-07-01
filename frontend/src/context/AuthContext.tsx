import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { clearStoredToken, getStoredToken } from '@/lib/authStorage';
import { ROUTES } from '@/routes/paths';
import type { User, UserRole } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await api.me();
        if (!cancelled) setUser(currentUser);
      } catch {
        clearStoredToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrateSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setUser(result.user);
    navigate(ROUTES.dashboard, { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    navigate(ROUTES.login, { replace: true });
  }, [navigate]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      role: user?.role ?? null,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { ApiError };

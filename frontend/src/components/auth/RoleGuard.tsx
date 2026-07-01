import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes/paths';
import type { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
}

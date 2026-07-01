import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { UploadPage } from '@/pages/UploadPage';
import { VideoPlayerPage } from '@/pages/VideoPlayerPage';
import { ROUTES } from '@/routes/paths';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="videos/:id" element={<VideoPlayerPage />} />
        <Route
          path="upload"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <UploadPage />
            </RoleGuard>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Route>
    </Routes>
  );
}

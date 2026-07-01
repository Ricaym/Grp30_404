import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { VideoFilterProvider } from '@/context/VideoFilterContext';

export function MainLayout() {
  return (
    <VideoFilterProvider>
      <div className="flex h-full min-h-screen bg-surface-muted">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </VideoFilterProvider>
  );
}

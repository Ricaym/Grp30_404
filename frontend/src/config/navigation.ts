import {
  LayoutDashboard,
  Upload,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import type { UserRole } from '@/types/auth';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.dashboard,
    icon: LayoutDashboard,
    roles: ['admin', 'student'],
    end: true,
  },
  {
    id: 'upload',
    label: 'Upload',
    path: ROUTES.upload,
    icon: Upload,
    roles: ['admin'],
  },
];

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.upload]: 'Upload vidéo',
};

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/videos/')) {
    return 'Lecteur vidéo';
  }
  return PAGE_TITLES[pathname] ?? 'Video Learning Hub';
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export { PlayCircle };

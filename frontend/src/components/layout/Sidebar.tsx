import { NavLink } from 'react-router-dom';
import { GraduationCap, Sparkles } from 'lucide-react';
import { getNavItemsForRole } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types/auth';

export function Sidebar() {
  const { role, user } = useAuth();
  if (!role || !user) return null;
  const navItems = getNavItemsForRole(role);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">Video Learning Hub</p>
          <p className="truncate text-xs text-text-muted">ESTIAM × 42c</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-brand-600' : 'text-text-muted group-hover:text-brand-500',
                  )}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-linear-to-br from-brand-50 to-brand-100/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span className="text-xs font-semibold text-brand-700">Pôle 1 — Lecteur augmenté</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            Annotations, commentaires horodatés, WebSocket temps réel et export JSON.
          </p>
        </div>
        <p className="mt-3 px-1 text-[11px] text-text-muted">
          Rôle actuel : {ROLE_LABELS[role]}
        </p>
      </div>
    </aside>
  );
}

import { LogOut, Search, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTitle } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useVideoFilter } from '@/context/VideoFilterContext';
import { ROLE_LABELS } from '@/types/auth';

export function Header() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);
  const { query, setQuery } = useVideoFilter();
  const isDashboard = pathname === '/dashboard' || pathname === '/';
  const [securityActive, setSecurityActive] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data: { features?: { pole2Security?: boolean } }) => {
        setSecurityActive(Boolean(data.features?.pole2Security));
      })
      .catch(() => setSecurityActive(false));
  }, []);

  if (!user || !role) return null;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/80 px-6 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-text-primary">{pageTitle}</h1>
        <p className="truncate text-xs text-text-muted">
          Plateforme de vidéos pédagogiques — collaboration & IA
        </p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isDashboard ? 'Rechercher un cours...' : 'Rechercher (dashboard)'}
            disabled={!isDashboard}
            className="w-full rounded-xl border border-border bg-surface-muted py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Rechercher une vidéo"
          />
        </div>

        <div
          className={`hidden items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium sm:flex ${
            securityActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-border bg-surface-muted text-text-muted'
          }`}
          title={securityActive ? 'Module de sécurité actif' : 'Module de sécurité inactif'}
        >
          <Shield className="h-4 w-4" />
          <span>Sécurité</span>
        </div>

        <div className="hidden rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 sm:block">
          {ROLE_LABELS[role]}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
            {user.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

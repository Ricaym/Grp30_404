import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, LogOut, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getPageTitle } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/types/auth';

const notificationsState = [
  {
    id: 1,
    title: 'Nouvelle vidéo disponible',
    message: 'Une nouvelle vidéo pédagogique a été ajoutée.',
    read: false,
  },
  {
    id: 2,
    title: 'Collaboration mise à jour',
    message: 'Un membre a commenté une ressource partagée.',
    read: true,
  },
  {
    id: 3,
    title: 'Analyse IA terminée',
    message: 'Le résumé automatique est prêt.',
    read: false,
  },
];

const searchableVideos = [
  'Introduction à la pédagogie',
  'Créer une vidéo interactive',
  'Collaboration entre enseignants',
  'Utiliser l’IA dans un cours',
];

export function Header() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  const [searchQuery, setSearchQuery] = useState('');
  const [isnotificationsStateOpen, setIsnotificationsStateOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return searchableVideos.filter((video) => video.toLowerCase().includes(query));
  }, [searchQuery]);

  const [notificationsStateState, setnotificationsStateState] = useState(notificationsState);

  const hasUnreadnotificationsState = notificationsStateState.some(
    (notification) => !notification.read
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsnotificationsStateOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher une vidéo..."
            className="w-full rounded-xl border border-border bg-surface-muted py-2 pl-10 pr-9 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            aria-label="Rechercher une vidéo"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-primary"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {searchQuery && (
            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <button
                    key={result}
                    type="button"
                    className="block w-full px-4 py-3 text-left text-sm text-text-primary transition hover:bg-surface-muted"
                    onClick={() => setSearchQuery(result)}
                  >
                    {result}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-text-muted">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsnotificationsStateOpen((current) => !current);

              setnotificationsStateState((current) =>
                current.map((notification) => ({
                  ...notification,
                  read: true,
                }))
              );
            }}
            className="relative rounded-xl border border-border p-2.5 text-text-secondary transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            aria-label="notificationsState"
          >
            <Bell className="h-4 w-4" />

            {hasUnreadnotificationsState && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
            )}
          </button>

          {isnotificationsStateOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">notificationsState</p>
                <p className="text-xs text-text-muted">Dernières activités</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notificationsState.length > 0 ? (
                  notificationsState.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                    >
                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      )}

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-text-muted">
                    Aucune notification
                  </div>
                )}
              </div>
            </div>
          )}
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
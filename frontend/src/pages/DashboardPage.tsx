import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Loader2,
  MessageSquare,
  PenLine,
  Sparkles,
  TrendingUp,
  Upload,
  Video,
} from 'lucide-react';
import { VideoCard } from '@/components/ui/VideoCard';
import { useAuth } from '@/context/AuthContext';
import { useVideoLibrary } from '@/context/VideoLibraryContext';
import type { Video as VideoType } from '@/data/mockVideos';
import { ROUTES } from '@/routes/paths';

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const { videos, isLoading, removeVideo } = useVideoLibrary();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isAdmin = hasRole('admin');

  if (!user) return null;

  const stats = [
    {
      label: 'Vidéos disponibles',
      value: videos.length,
      icon: Video,
      color: 'text-brand-600 bg-brand-50',
    },
    {
      label: 'Commentaires',
      value: videos.reduce((sum, v) => sum + v.commentCount, 0),
      icon: MessageSquare,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Annotations',
      value: videos.reduce((sum, v) => sum + v.annotationCount, 0),
      icon: PenLine,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Analyses IA',
      value: videos.filter((v) => v.hasAiAnalysis).length,
      icon: Sparkles,
      color: 'text-fuchsia-600 bg-fuchsia-50',
    },
  ];

  const handleDelete = async (video: VideoType) => {
    if (!video.isUploaded) return;

    const confirmed = window.confirm(`Supprimer la vidéo « ${video.title} » ?`);
    if (!confirmed) return;

    setDeletingId(video.id);
    try {
      await removeVideo(video.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-brand-600">
            Bienvenue, {user.name.split(' ')[0]} 👋
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {isAdmin
              ? 'Gérez et partagez vos contenus pédagogiques'
              : 'Explorez vos formations vidéo'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {isAdmin
              ? 'Uploadez des vidéos, consultez les analyses IA et collaborez avec vos étudiants via annotations et commentaires.'
              : 'Regardez vos cours, laissez des commentaires horodatés et consultez les annotations et résumés IA.'}
          </p>

          {isAdmin && (
            <Link
              to={ROUTES.upload}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-700"
            >
              <Upload className="h-4 w-4" />
              Uploader une vidéo
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-text-muted" />
            </div>
            <p className="mt-4 text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Vidéos récentes</h3>
            <p className="text-sm text-text-secondary">
              {isAdmin ? 'Vos contenus publiés' : 'Formations disponibles'}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <BookOpen className="h-3.5 w-3.5" />
            {videos.length} vidéo{videos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-sm text-text-muted">
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
            Chargement des vidéos...
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
            <p className="text-sm text-text-secondary">Aucune vidéo disponible.</p>
            {isAdmin && (
              <Link
                to={ROUTES.upload}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Upload className="h-4 w-4" />
                Uploader la première vidéo
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className={deletingId === video.id ? 'pointer-events-none opacity-50' : undefined}
              >
                <VideoCard
                  video={video}
                  showDelete={isAdmin}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

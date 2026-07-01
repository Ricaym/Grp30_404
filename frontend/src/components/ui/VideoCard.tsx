import { Link } from 'react-router-dom';
import { Clock, Eye, MessageSquare, PenLine, Sparkles, Trash2 } from 'lucide-react';
import { getThumbnailGradientClass, type Video } from '@/data/mockVideos';
import { cn, formatDuration, formatRelativeDate } from '@/lib/utils';
import { ROUTES } from '@/routes/paths';

interface VideoCardProps {
  video: Video;
  showDelete?: boolean;
  onDelete?: (video: Video) => void;
}

export function VideoCard({ video, showDelete = false, onDelete }: VideoCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5">
      {showDelete && video.isUploaded && onDelete && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete(video);
          }}
          className="absolute right-3 top-3 z-10 rounded-lg bg-black/50 p-2 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
          aria-label={`Supprimer ${video.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <Link to={ROUTES.video(video.id)} className="flex flex-1 flex-col">
        <div
          className={cn(
            'relative flex aspect-video items-center justify-center overflow-hidden bg-linear-to-br',
            getThumbnailGradientClass(video.thumbnailGradient),
          )}
        >
          {video.posterUrl && (
            <img
              src={video.posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-200 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition group-hover:scale-110">
            <div className="ml-1 h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white" />
          </div>
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {video.isUploaded && (
              <span className="rounded-lg bg-brand-600/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                Uploadé
              </span>
            )}
            {video.hasAiAnalysis && (
              <span className="flex w-fit items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-brand-700 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Analyse IA
              </span>
            )}
          </div>
          <span className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
              {video.category}
            </span>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary group-hover:text-brand-700">
              {video.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
              {video.description}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {video.views}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {video.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <PenLine className="h-3.5 w-3.5" />
              {video.annotationCount}
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeDate(video.uploadedAt)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

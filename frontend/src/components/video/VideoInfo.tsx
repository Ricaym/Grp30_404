import { Calendar, Clock, Download, Eye, MessageSquare, PenLine, Tag } from 'lucide-react';
import type { Video } from '@/data/mockVideos';
import { formatDuration, formatRelativeDate } from '@/lib/utils';

interface VideoInfoProps {
  video: Video;
  commentCount: number;
  annotationCount: number;
  showExport?: boolean;
  onExport?: () => void;
}

export function VideoInfo({
  video,
  commentCount,
  annotationCount,
  showExport = false,
  onExport,
}: VideoInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            <Tag className="h-3.5 w-3.5" />
            {video.category}
          </span>
        </div>

        {showExport && onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        )}
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary">{video.title}</h1>

      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{video.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 text-sm text-text-muted">
        <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
          <Clock className="h-4 w-4 text-brand-500" />
          Durée : {formatDuration(video.durationSeconds)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatRelativeDate(video.uploadedAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {video.views} vues
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          {commentCount} commentaire{commentCount !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <PenLine className="h-4 w-4" />
          {annotationCount} annotation{annotationCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { VideoAnnotationLayer } from '@/components/video/VideoAnnotationLayer';
import { VideoInfo } from '@/components/video/VideoInfo';
import { VideoPlayer, type VideoPlayerHandle } from '@/components/video/VideoPlayer';
import { VideoSidePanel } from '@/components/video/VideoSidePanel';
import { useAuth } from '@/context/AuthContext';
import { useVideoLibrary } from '@/context/VideoLibraryContext';
import { useVideoCollaboration } from '@/hooks/useVideoCollaboration';
import { downloadCollaborationJson } from '@/lib/exportCollaboration';
import { ROUTES } from '@/routes/paths';
import type { AddAnnotationInput, AnnotationDrawSession, AnnotationType } from '@/types/collaboration';

export function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { getVideoById, isLoading } = useVideoLibrary();
  const video = id ? getVideoById(id) : undefined;
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const location = useLocation();
  const uploadSuccess = (location.state as { uploadSuccess?: boolean } | null)?.uploadSuccess;
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [drawSession, setDrawSession] = useState<AnnotationDrawSession | null>(null);

  const {
    comments,
    annotations,
    adminId,
    addComment,
    addReply,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    buildExport,
  } = useVideoCollaboration(video?.id ?? '');

  const handleSeek = useCallback((timestamp: number) => {
    playerRef.current?.seekTo(timestamp);
    setCurrentTime(timestamp);
  }, []);

  const handleAddComment = useCallback(
    async (text: string) => {
      if (isAdmin) return;
      const timestamp = playerRef.current?.getCurrentTime() ?? currentTime;
      await addComment(text, timestamp);
    },
    [addComment, currentTime, isAdmin],
  );

  const handleAddReply = useCallback(
    async (commentId: string, text: string) => {
      if (!isAdmin) return;
      await addReply(commentId, text);
    },
    [addReply, isAdmin],
  );

  const handleStartDraw = useCallback(
    (type: AnnotationType, label?: string) => {
      if (!isAdmin) return;
      setDrawSession({ type, label });
    },
    [isAdmin],
  );

  const handleDrawComplete = useCallback(
    async (input: AddAnnotationInput) => {
      const timestamp = playerRef.current?.getCurrentTime() ?? currentTime;
      await addAnnotation(input, timestamp);
      setDrawSession(null);
    },
    [addAnnotation, currentTime],
  );

  const handleCancelDraw = useCallback(() => {
    setDrawSession(null);
  }, []);

  const handleUpdateAnnotation = useCallback(
    async (annotationId: string, text: string) => {
      if (!isAdmin) return;
      await updateAnnotation(annotationId, { text });
    },
    [isAdmin, updateAnnotation],
  );

  const handleRemoveAnnotation = useCallback(
    async (annotationId: string) => {
      if (!isAdmin) return;
      await removeAnnotation(annotationId);
    },
    [isAdmin, removeAnnotation],
  );

  const handleExport = useCallback(async () => {
    if (!isAdmin) return;
    const payload = await buildExport();
    downloadCollaborationJson(payload);
  }, [buildExport, isAdmin]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        Chargement de la vidéo...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">Vidéo introuvable</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Cette vidéo n&apos;existe pas ou a été supprimée.
        </p>
        <Link
          to={ROUTES.dashboard}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        to={ROUTES.dashboard}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      {uploadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Vidéo publiée avec succès. Elle est disponible sur le dashboard.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <VideoPlayer
              ref={playerRef}
              key={video.id}
              src={video.videoUrl}
              mimeType={video.mimeType}
              poster={video.posterUrl}
              title={video.title}
              onTimeUpdate={setCurrentTime}
            />
            <VideoAnnotationLayer
              annotations={annotations}
              currentTime={currentTime}
              drawSession={isAdmin ? drawSession : null}
              onDrawComplete={handleDrawComplete}
              onDrawCancel={handleCancelDraw}
            />
          </div>

          <VideoInfo
            video={video}
            commentCount={comments.length}
            annotationCount={annotations.length}
            showExport={isAdmin}
            onExport={handleExport}
          />
        </div>

        <VideoSidePanel
          video={video}
          comments={comments}
          annotations={annotations}
          currentTime={currentTime}
          isAdmin={isAdmin}
          adminId={adminId}
          drawSession={drawSession}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onStartDraw={handleStartDraw}
          onCancelDraw={handleCancelDraw}
          onUpdateAnnotation={handleUpdateAnnotation}
          onRemoveAnnotation={handleRemoveAnnotation}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
}

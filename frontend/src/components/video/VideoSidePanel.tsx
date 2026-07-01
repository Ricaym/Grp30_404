import { AiResultsPanel } from '@/components/video/AiResultsPanel';
import { AnnotationsPanel } from '@/components/video/AnnotationsPanel';
import { CommentsPanel } from '@/components/video/CommentsPanel';
import type { Video } from '@/data/mockVideos';
import type {
  AnnotationDrawSession,
  AnnotationType,
  VideoAnnotation,
  VideoComment,
} from '@/types/collaboration';

interface VideoSidePanelProps {
  video: Video;
  comments: VideoComment[];
  annotations: VideoAnnotation[];
  currentTime: number;
  isAdmin: boolean;
  adminId: string;
  drawSession: AnnotationDrawSession | null;
  onAddComment: (text: string) => void;
  onAddReply: (commentId: string, text: string) => void;
  onStartDraw: (type: AnnotationType, label?: string) => void;
  onCancelDraw: () => void;
  onUpdateAnnotation: (annotationId: string, text: string) => void;
  onRemoveAnnotation: (annotationId: string) => void;
  onSeek: (timestamp: number) => void;
}

export function VideoSidePanel({
  video,
  comments,
  annotations,
  currentTime,
  isAdmin,
  adminId,
  drawSession,
  onAddComment,
  onAddReply,
  onStartDraw,
  onCancelDraw,
  onUpdateAnnotation,
  onRemoveAnnotation,
  onSeek,
}: VideoSidePanelProps) {
  return (
    <aside className="space-y-4">
      <AiResultsPanel video={video} />

      <AnnotationsPanel
        annotations={annotations}
        currentTime={currentTime}
        isAdmin={isAdmin}
        drawSession={drawSession}
        onStartDraw={onStartDraw}
        onCancelDraw={onCancelDraw}
        onUpdateAnnotation={onUpdateAnnotation}
        onRemoveAnnotation={onRemoveAnnotation}
        onSeek={onSeek}
      />

      <CommentsPanel
        comments={comments}
        currentTime={currentTime}
        isAdmin={isAdmin}
        adminId={adminId}
        onAddComment={onAddComment}
        onAddReply={onAddReply}
        onSeek={onSeek}
      />
    </aside>
  );
}

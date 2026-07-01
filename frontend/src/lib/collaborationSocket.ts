import type { CommentReply, VideoAnnotation, VideoComment } from '@/types/collaboration';
import { getStoredToken } from '@/lib/authStorage';

export type CollaborationSocketEvent =
  | { type: 'connected'; payload: { videoId: string } }
  | { type: 'comment:added'; payload: VideoComment }
  | { type: 'reply:added'; payload: { commentId: string; reply: CommentReply } }
  | { type: 'annotation:added'; payload: VideoAnnotation }
  | { type: 'annotation:updated'; payload: VideoAnnotation }
  | { type: 'annotation:removed'; payload: { id: string } };

function buildWebSocketUrl(videoId: string): string {
  const token = getStoredToken();
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws?token=${encodeURIComponent(token ?? '')}&videoId=${encodeURIComponent(videoId)}`;
}

export function connectCollaborationSocket(
  videoId: string,
  onEvent: (event: CollaborationSocketEvent) => void,
): () => void {
  const socket = new WebSocket(buildWebSocketUrl(videoId));

  socket.onmessage = (message) => {
    try {
      onEvent(JSON.parse(message.data) as CollaborationSocketEvent);
    } catch {
      // ignore malformed messages
    }
  };

  return () => {
    socket.close();
  };
}

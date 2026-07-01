import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { connectCollaborationSocket } from '@/lib/collaborationSocket';
import type {
  AddAnnotationInput,
  CollaborationExport,
  UpdateAnnotationInput,
  VideoAnnotation,
  VideoComment,
} from '@/types/collaboration';

export function useVideoCollaboration(videoId: string) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [adminId, setAdminId] = useState('user-admin-1');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCollaboration() {
      setIsLoading(true);
      try {
        const [nextComments, nextAnnotations, nextAdminId] = await Promise.all([
          api.getComments(videoId),
          api.getAnnotations(videoId),
          api.getAdminId(),
        ]);
        if (!cancelled) {
          setComments(nextComments);
          setAnnotations(nextAnnotations);
          setAdminId(nextAdminId);
        }
      } catch {
        if (!cancelled) {
          setComments([]);
          setAnnotations([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCollaboration();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    const disconnect = connectCollaborationSocket(videoId, (event) => {
      if (event.type === 'comment:added') {
        setComments((prev) => {
          if (prev.some((comment) => comment.id === event.payload.id)) return prev;
          return [...prev, event.payload].sort((a, b) => a.timestamp - b.timestamp);
        });
        return;
      }

      if (event.type === 'reply:added') {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === event.payload.commentId
              ? {
                  ...comment,
                  replies: comment.replies.some((reply) => reply.id === event.payload.reply.id)
                    ? comment.replies
                    : [...comment.replies, event.payload.reply],
                }
              : comment,
          ),
        );
        return;
      }

      if (event.type === 'annotation:added') {
        setAnnotations((prev) => {
          if (prev.some((annotation) => annotation.id === event.payload.id)) return prev;
          return [...prev, event.payload].sort((a, b) => a.timestamp - b.timestamp);
        });
        return;
      }

      if (event.type === 'annotation:updated') {
        setAnnotations((prev) =>
          prev.map((annotation) =>
            annotation.id === event.payload.id ? event.payload : annotation,
          ),
        );
        return;
      }

      if (event.type === 'annotation:removed') {
        setAnnotations((prev) => prev.filter((annotation) => annotation.id !== event.payload.id));
      }
    });

    return disconnect;
  }, [videoId]);

  const addComment = useCallback(
    async (text: string, timestamp: number) => {
      const comment = await api.addComment(videoId, text, timestamp);
      setComments((prev) => {
        if (prev.some((item) => item.id === comment.id)) return prev;
        return [...prev, comment].sort((a, b) => a.timestamp - b.timestamp);
      });
    },
    [videoId],
  );

  const addReply = useCallback(async (commentId: string, text: string) => {
    await api.addReply(commentId, text);
  }, []);

  const addAnnotation = useCallback(
    async (input: AddAnnotationInput, timestamp: number) => {
      const annotation = await api.addAnnotation(videoId, input, timestamp);
      setAnnotations((prev) => {
        if (prev.some((item) => item.id === annotation.id)) return prev;
        return [...prev, annotation].sort((a, b) => a.timestamp - b.timestamp);
      });
    },
    [videoId],
  );

  const updateAnnotation = useCallback(async (annotationId: string, input: UpdateAnnotationInput) => {
    const annotation = await api.updateAnnotation(annotationId, input);
    setAnnotations((prev) =>
      prev.map((item) => (item.id === annotationId ? annotation : item)),
    );
  }, []);

  const removeAnnotation = useCallback(async (annotationId: string) => {
    await api.removeAnnotation(annotationId);
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== annotationId));
  }, []);

  const buildExport = useCallback(async (): Promise<CollaborationExport> => {
    return api.exportCollaboration(videoId);
  }, [videoId]);

  return {
    comments,
    annotations,
    adminId,
    isLoading,
    addComment,
    addReply,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    buildExport,
  };
}

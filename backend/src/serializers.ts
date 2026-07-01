import type { DbAnnotation, DbComment, DbReply, DbVideo } from './db.js';
import { db, getUserById } from './db.js';

export function mapVideo(row: DbVideo) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    durationSeconds: row.duration_seconds,
    thumbnailGradient: row.thumbnail_gradient,
    videoUrl: row.video_url,
    posterUrl: row.poster_url,
    uploadedAt: row.uploaded_at,
    views: row.views,
    commentCount: db.countComments(row.id),
    annotationCount: db.countAnnotations(row.id),
    hasAiAnalysis: Boolean(row.has_ai_analysis),
    isUploaded: Boolean(row.is_uploaded),
    fileName: row.file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
  };
}

function userName(userId: string): { name: string; authorId: string } {
  const user = getUserById(userId);
  return { name: user?.name ?? 'Utilisateur', authorId: userId };
}

export function mapReply(reply: DbReply) {
  const author = userName(reply.user_id);
  return {
    id: reply.id,
    author: author.name,
    authorId: author.authorId,
    text: reply.text,
    createdAt: reply.created_at,
  };
}

export function mapComment(comment: DbComment) {
  const author = userName(comment.user_id);
  const replies = db.listReplies(comment.id);
  return {
    id: comment.id,
    videoId: comment.video_id,
    timestamp: comment.timestamp,
    author: author.name,
    authorId: author.authorId,
    text: comment.text,
    createdAt: comment.created_at,
    replies: replies.map(mapReply),
  };
}

export function mapAnnotation(annotation: DbAnnotation) {
  const author = userName(annotation.user_id);
  return {
    id: annotation.id,
    videoId: annotation.video_id,
    timestamp: annotation.timestamp,
    type: annotation.type,
    author: author.name,
    authorId: author.authorId,
    x: annotation.x,
    y: annotation.y,
    width: annotation.width ?? undefined,
    height: annotation.height ?? undefined,
    radius: annotation.radius ?? undefined,
    x2: annotation.x2 ?? undefined,
    y2: annotation.y2 ?? undefined,
    text: annotation.text ?? undefined,
    createdAt: annotation.created_at,
  };
}

export function getVideoOr404(videoId: string): DbVideo | undefined {
  return db.getVideo(videoId);
}

export type AnnotationType = 'rectangle' | 'circle' | 'text' | 'arrow';

export interface CommentReply {
  id: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  timestamp: number;
  author: string;
  authorId: string;
  text: string;
  createdAt: string;
  replies: CommentReply[];
}

export interface VideoAnnotation {
  id: string;
  videoId: string;
  timestamp: number;
  type: AnnotationType;
  author: string;
  authorId: string;
  /** Position X normalisée (0–1) */
  x: number;
  /** Position Y normalisée (0–1) */
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  /** Point d'arrivée (flèche), normalisé */
  x2?: number;
  y2?: number;
  text?: string;
  createdAt: string;
}

export interface CollaborationExport {
  videoId: string;
  exportedAt: string;
  comments: VideoComment[];
  annotations: VideoAnnotation[];
}

export interface AddAnnotationInput {
  type: AnnotationType;
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
}

export interface UpdateAnnotationInput {
  text?: string;
}

export interface AnnotationDrawSession {
  type: AnnotationType;
  label?: string;
}

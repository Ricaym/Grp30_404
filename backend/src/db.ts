import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

export type UserRole = 'admin' | 'student';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface DbVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_seconds: number;
  thumbnail_gradient: string;
  video_url: string;
  poster_url: string;
  is_uploaded: number;
  file_name: string | null;
  mime_type: string | null;
  uploaded_at: string;
  views: number;
  has_ai_analysis: number;
  uploaded_by: string | null;
}

export interface DbComment {
  id: string;
  video_id: string;
  user_id: string;
  timestamp: number;
  text: string;
  created_at: string;
}

export interface DbReply {
  id: string;
  comment_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface DbAnnotation {
  id: string;
  video_id: string;
  user_id: string;
  timestamp: number;
  type: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  radius: number | null;
  x2: number | null;
  y2: number | null;
  text: string | null;
  created_at: string;
}

export interface DbAiResult {
  video_id: string;
  summary: string;
  keywords_json: string;
  chapters_json: string;
}

export interface DbViewingEvent {
  id: string;
  video_id: string;
  user_id: string;
  event: 'play' | 'pause' | 'seek' | 'stop' | 'complete';
  timestamp: number;
  video_duration: number;
  device: string;
  created_at: string;
}

interface DatabaseSnapshot {
  users: DbUser[];
  videos: DbVideo[];
  comments: DbComment[];
  comment_replies: DbReply[];
  annotations: DbAnnotation[];
  ai_results: DbAiResult[];
  viewing_events: DbViewingEvent[];
}

const defaultSnapshot = (): DatabaseSnapshot => ({
  users: [],
  videos: [],
  comments: [],
  comment_replies: [],
  annotations: [],
  ai_results: [],
  viewing_events: [],
});

let snapshot: DatabaseSnapshot = defaultSnapshot();

function ensureDataDir(): void {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  fs.mkdirSync(config.videosDir, { recursive: true });
  fs.mkdirSync(config.postersDir, { recursive: true });
}

function loadSnapshot(): DatabaseSnapshot {
  ensureDataDir();
  if (!fs.existsSync(config.dbPath)) {
    return defaultSnapshot();
  }

  try {
    const raw = fs.readFileSync(config.dbPath, 'utf-8');
    return { ...defaultSnapshot(), ...JSON.parse(raw) } as DatabaseSnapshot;
  } catch {
    return defaultSnapshot();
  }
}

function persist(): void {
  ensureDataDir();
  fs.writeFileSync(config.dbPath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

export function initStore(): void {
  snapshot = loadSnapshot();
}

export function resetStore(next: DatabaseSnapshot): void {
  snapshot = next;
  persist();
}

export function getSnapshot(): DatabaseSnapshot {
  return snapshot;
}

export function saveSnapshot(): void {
  persist();
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getUserById(id: string): DbUser | undefined {
  return snapshot.users.find((user) => user.id === id);
}

export function getUserByEmail(email: string): DbUser | undefined {
  return snapshot.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function publicUser(user: DbUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export const db = {
  countUsers(): number {
    return snapshot.users.length;
  },

  insertUser(user: DbUser): void {
    snapshot.users.push(user);
    persist();
  },

  listVideos(): DbVideo[] {
    return [...snapshot.videos].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
    );
  },

  getVideo(id: string): DbVideo | undefined {
    return snapshot.videos.find((video) => video.id === id);
  },

  insertVideo(video: DbVideo): void {
    snapshot.videos.push(video);
    persist();
  },

  updateVideoViews(id: string): DbVideo | undefined {
    const video = snapshot.videos.find((item) => item.id === id);
    if (!video) return undefined;
    video.views += 1;
    persist();
    return video;
  },

  deleteVideo(id: string): boolean {
    const index = snapshot.videos.findIndex((video) => video.id === id);
    if (index === -1) return false;
    snapshot.videos.splice(index, 1);
    snapshot.comments = snapshot.comments.filter((comment) => comment.video_id !== id);
    snapshot.annotations = snapshot.annotations.filter((annotation) => annotation.video_id !== id);
    snapshot.ai_results = snapshot.ai_results.filter((ai) => ai.video_id !== id);
    snapshot.viewing_events = snapshot.viewing_events.filter((event) => event.video_id !== id);
    persist();
    return true;
  },

  countComments(videoId: string): number {
    return snapshot.comments.filter((comment) => comment.video_id === videoId).length;
  },

  countAnnotations(videoId: string): number {
    return snapshot.annotations.filter((annotation) => annotation.video_id === videoId).length;
  },

  listComments(videoId: string): DbComment[] {
    return snapshot.comments
      .filter((comment) => comment.video_id === videoId)
      .sort((a, b) => a.timestamp - b.timestamp);
  },

  getComment(id: string): DbComment | undefined {
    return snapshot.comments.find((comment) => comment.id === id);
  },

  insertComment(comment: DbComment): void {
    snapshot.comments.push(comment);
    persist();
  },

  listReplies(commentId: string): DbReply[] {
    return snapshot.comment_replies
      .filter((reply) => reply.comment_id === commentId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  insertReply(reply: DbReply): void {
    snapshot.comment_replies.push(reply);
    persist();
  },

  listAnnotations(videoId: string): DbAnnotation[] {
    return snapshot.annotations
      .filter((annotation) => annotation.video_id === videoId)
      .sort((a, b) => a.timestamp - b.timestamp);
  },

  getAnnotation(id: string): DbAnnotation | undefined {
    return snapshot.annotations.find((annotation) => annotation.id === id);
  },

  insertAnnotation(annotation: DbAnnotation): void {
    snapshot.annotations.push(annotation);
    persist();
  },

  updateAnnotationText(id: string, text: string | null): DbAnnotation | undefined {
    const annotation = snapshot.annotations.find((item) => item.id === id);
    if (!annotation) return undefined;
    annotation.text = text;
    persist();
    return annotation;
  },

  deleteAnnotation(id: string): boolean {
    const index = snapshot.annotations.findIndex((annotation) => annotation.id === id);
    if (index === -1) return false;
    snapshot.annotations.splice(index, 1);
    persist();
    return true;
  },

  getAiResult(videoId: string): DbAiResult | undefined {
    return snapshot.ai_results.find((ai) => ai.video_id === videoId);
  },

  insertAiResult(result: DbAiResult): void {
    snapshot.ai_results.push(result);
    persist();
  },

  upsertAiResult(result: DbAiResult): void {
    const index = snapshot.ai_results.findIndex((ai) => ai.video_id === result.video_id);
    if (index === -1) {
      snapshot.ai_results.push(result);
    } else {
      snapshot.ai_results[index] = result;
    }
    persist();
  },

  setVideoAiAnalysis(videoId: string, hasAnalysis: boolean): DbVideo | undefined {
    const video = snapshot.videos.find((item) => item.id === videoId);
    if (!video) return undefined;
    video.has_ai_analysis = hasAnalysis ? 1 : 0;
    persist();
    return video;
  },

  insertViewingEvent(event: DbViewingEvent): void {
    snapshot.viewing_events.push(event);
    persist();
  },

  listViewingEvents(videoId: string): DbViewingEvent[] {
    return snapshot.viewing_events.filter((event) => event.video_id === videoId);
  },

  clearAll(): void {
    snapshot = defaultSnapshot();
    persist();
  },
};

initStore();

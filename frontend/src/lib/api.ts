import type { User } from '@/types/auth';
import type {
  AddAnnotationInput,
  CollaborationExport,
  UpdateAnnotationInput,
  VideoAnnotation,
  VideoComment,
} from '@/types/collaboration';
import type { Video } from '@/data/mockVideos';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/authStorage';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
    }
    throw new ApiError(data.error ?? 'Erreur réseau.', response.status);
  }

  return data as T;
}

export interface AiResult {
  summary: string;
  keywords: string[];
  chapters: Array<{ time: string; title: string }>;
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const result = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(result.token);
    return result;
  },

  async me(): Promise<User> {
    const result = await request<{ user: User }>('/api/auth/me');
    return result.user;
  },

  async getAdminId(): Promise<string> {
    const result = await request<{ adminId: string }>('/api/auth/admin-id');
    return result.adminId;
  },

  async listVideos(): Promise<Video[]> {
    const result = await request<{ videos: Video[] }>('/api/videos');
    return result.videos;
  },

  async getVideo(id: string): Promise<Video> {
    const result = await request<{ video: Video }>(`/api/videos/${id}`);
    return result.video;
  },

  async uploadVideo(input: {
    title: string;
    description: string;
    category: string;
    durationSeconds: number;
    thumbnailGradient: string;
    file: File;
    poster: Blob;
    mimeType: string;
  }): Promise<Video> {
    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('description', input.description);
    formData.append('category', input.category);
    formData.append('durationSeconds', String(input.durationSeconds));
    formData.append('thumbnailGradient', input.thumbnailGradient);
    formData.append('mimeType', input.mimeType);
    formData.append('video', input.file, input.file.name);
    if (input.poster.size > 0) {
      formData.append('poster', input.poster, 'poster.jpg');
    }

    const result = await request<{ video: Video }>('/api/videos', {
      method: 'POST',
      body: formData,
    });
    return result.video;
  },

  async deleteVideo(id: string): Promise<void> {
    await request<void>(`/api/videos/${id}`, { method: 'DELETE' });
  },

  async getComments(videoId: string): Promise<VideoComment[]> {
    const result = await request<{ comments: VideoComment[] }>(`/api/videos/${videoId}/comments`);
    return result.comments;
  },

  async addComment(videoId: string, text: string, timestamp: number): Promise<VideoComment> {
    const result = await request<{ comment: VideoComment }>(`/api/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, timestamp }),
    });
    return result.comment;
  },

  async addReply(commentId: string, text: string): Promise<void> {
    await request(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async getAnnotations(videoId: string): Promise<VideoAnnotation[]> {
    const result = await request<{ annotations: VideoAnnotation[] }>(
      `/api/videos/${videoId}/annotations`,
    );
    return result.annotations;
  },

  async addAnnotation(
    videoId: string,
    input: AddAnnotationInput,
    timestamp: number,
  ): Promise<VideoAnnotation> {
    const result = await request<{ annotation: VideoAnnotation }>(
      `/api/videos/${videoId}/annotations`,
      {
        method: 'POST',
        body: JSON.stringify({ ...input, timestamp }),
      },
    );
    return result.annotation;
  },

  async updateAnnotation(id: string, input: UpdateAnnotationInput): Promise<VideoAnnotation> {
    const result = await request<{ annotation: VideoAnnotation }>(`/api/annotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return result.annotation;
  },

  async removeAnnotation(id: string): Promise<void> {
    await request<void>(`/api/annotations/${id}`, { method: 'DELETE' });
  },

  async getAiResults(videoId: string): Promise<AiResult | null> {
    const result = await request<{ ai: AiResult | null }>(`/api/videos/${videoId}/ai`);
    return result.ai;
  },

  async exportCollaboration(videoId: string): Promise<CollaborationExport> {
    const result = await request<{ export: CollaborationExport }>(`/api/videos/${videoId}/export`);
    return result.export;
  },
};

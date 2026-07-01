import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { VideoCategory } from '@/config/categories';
import { useAuth } from '@/context/AuthContext';
import type { ThumbnailGradient, Video } from '@/data/mockVideos';
import { api } from '@/lib/api';
import {
  generatePosterFromFile,
  getVideoDurationFromFile,
  inferVideoMimeType,
} from '@/lib/videoUpload';

const UPLOAD_GRADIENTS: ThumbnailGradient[] = [
  'brand',
  'violet',
  'indigo',
  'purple',
  'brand-light',
  'slate',
];

export interface UploadVideoInput {
  title: string;
  description: string;
  category: VideoCategory;
  file: File;
}

interface VideoLibraryContextValue {
  videos: Video[];
  isLoading: boolean;
  isUploading: boolean;
  getVideoById: (id: string) => Video | undefined;
  uploadVideo: (input: UploadVideoInput) => Promise<Video>;
  removeVideo: (id: string) => Promise<boolean>;
  refreshVideos: () => Promise<void>;
}

const VideoLibraryContext = createContext<VideoLibraryContextValue | null>(null);

export function VideoLibraryProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const refreshVideos = useCallback(async () => {
    if (!isAuthenticated) {
      setVideos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const nextVideos = await api.listVideos();
      setVideos(nextVideos);
    } catch {
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  const getVideoById = useCallback(
    (id: string) => videos.find((video) => video.id === id),
    [videos],
  );

  const uploadVideo = useCallback(
    async (input: UploadVideoInput): Promise<Video> => {
      setIsUploading(true);

      try {
        const durationSeconds = await getVideoDurationFromFile(input.file);
        let posterBlob: Blob;
        try {
          posterBlob = await generatePosterFromFile(input.file);
        } catch {
          posterBlob = new Blob([], { type: 'image/jpeg' });
        }

        const uploadedCount = videos.filter((video) => video.isUploaded).length;
        const newVideo = await api.uploadVideo({
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category,
          durationSeconds,
          thumbnailGradient: UPLOAD_GRADIENTS[uploadedCount % UPLOAD_GRADIENTS.length],
          file: input.file,
          poster: posterBlob,
          mimeType: inferVideoMimeType(input.file.name, input.file.type),
        });

        setVideos((prev) => [newVideo, ...prev]);
        return newVideo;
      } finally {
        setIsUploading(false);
      }
    },
    [videos],
  );

  const removeVideo = useCallback(async (id: string): Promise<boolean> => {
    const target = videos.find((video) => video.id === id);
    if (!target?.isUploaded) return false;

    await api.deleteVideo(id);
    setVideos((prev) => prev.filter((video) => video.id !== id));
    return true;
  }, [videos]);

  const value = useMemo(
    () => ({
      videos,
      isLoading,
      isUploading,
      getVideoById,
      uploadVideo,
      removeVideo,
      refreshVideos,
    }),
    [videos, isLoading, isUploading, getVideoById, uploadVideo, removeVideo, refreshVideos],
  );

  return (
    <VideoLibraryContext.Provider value={value}>{children}</VideoLibraryContext.Provider>
  );
}

export function useVideoLibrary(): VideoLibraryContextValue {
  const context = useContext(VideoLibraryContext);
  if (!context) {
    throw new Error('useVideoLibrary must be used within a VideoLibraryProvider');
  }
  return context;
}

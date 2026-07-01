import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { VideoCategory } from '@/config/categories';

interface VideoFilterContextValue {
  query: string;
  category: VideoCategory | 'all';
  setQuery: (query: string) => void;
  setCategory: (category: VideoCategory | 'all') => void;
  clearFilters: () => void;
}

const VideoFilterContext = createContext<VideoFilterContextValue | null>(null);

export function VideoFilterProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<VideoCategory | 'all'>('all');

  const value = useMemo(
    () => ({
      query,
      category,
      setQuery,
      setCategory,
      clearFilters: () => {
        setQuery('');
        setCategory('all');
      },
    }),
    [query, category],
  );

  return <VideoFilterContext.Provider value={value}>{children}</VideoFilterContext.Provider>;
}

export function useVideoFilter() {
  const context = useContext(VideoFilterContext);
  if (!context) {
    throw new Error('useVideoFilter must be used within VideoFilterProvider');
  }
  return context;
}

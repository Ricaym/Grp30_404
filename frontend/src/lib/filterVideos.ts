import type { VideoCategory } from '@/config/categories';
import type { Video } from '@/data/mockVideos';

export function filterVideos(
  videos: Video[],
  query: string,
  category: VideoCategory | 'all',
): Video[] {
  const normalizedQuery = query.trim().toLowerCase();

  return videos.filter((video) => {
    const matchesCategory = category === 'all' || video.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const haystack = `${video.title} ${video.description} ${video.category}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

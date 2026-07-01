export const VIDEO_CATEGORIES = [
  'Développement Web',
  'Backend',
  'Cybersécurité',
  'Intelligence Artificielle',
  'Collaboration',
  'DevOps',
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export const MAX_VIDEO_FILE_SIZE_BYTES = 500 * 1024 * 1024;

export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

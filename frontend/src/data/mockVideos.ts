export type ThumbnailGradient =
  | 'brand'
  | 'violet'
  | 'indigo'
  | 'purple'
  | 'brand-light'
  | 'slate';

export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  durationSeconds: number;
  thumbnailGradient: ThumbnailGradient;
  videoUrl: string;
  posterUrl: string;
  uploadedAt: string;
  views: number;
  commentCount: number;
  annotationCount: number;
  hasAiAnalysis: boolean;
  isUploaded?: boolean;
  fileName?: string;
  mimeType?: string;
}

const SAMPLE_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

export const THUMBNAIL_GRADIENT_CLASSES: Record<ThumbnailGradient, string> = {
  brand: 'from-brand-500 to-brand-700',
  violet: 'from-violet-400 to-purple-700',
  indigo: 'from-indigo-400 to-brand-800',
  purple: 'from-purple-400 to-fuchsia-600',
  'brand-light': 'from-brand-300 to-brand-600',
  slate: 'from-slate-400 to-brand-700',
};

export const SEED_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Introduction à React et TypeScript',
    description:
      'Découvrez les fondamentaux de React avec TypeScript pour des applications robustes. Ce module couvre les composants, les props, le state et les bonnes pratiques de typage.',
    category: 'Développement Web',
    durationSeconds: 596,
    thumbnailGradient: 'brand',
    videoUrl: `${SAMPLE_BASE}/BigBuckBunny.mp4`,
    posterUrl: `${SAMPLE_BASE}/BigBuckBunny.jpg`,
    uploadedAt: '2026-06-28T10:00:00Z',
    views: 342,
    commentCount: 18,
    annotationCount: 7,
    hasAiAnalysis: true,
    mimeType: 'video/mp4',
  },
  {
    id: 'vid-2',
    title: 'Architecture REST & API Design',
    description:
      'Bonnes pratiques pour concevoir des APIs RESTful scalables et maintenables. Ressources, versioning, pagination et gestion des erreurs.',
    category: 'Backend',
    durationSeconds: 634,
    thumbnailGradient: 'violet',
    videoUrl: `${SAMPLE_BASE}/ElephantsDream.mp4`,
    posterUrl: `${SAMPLE_BASE}/ElephantsDream.jpg`,
    uploadedAt: '2026-06-27T14:30:00Z',
    views: 218,
    commentCount: 12,
    annotationCount: 4,
    hasAiAnalysis: true,
  },
  {
    id: 'vid-3',
    title: 'Sécurité des applications web',
    description:
      "JWT, contrôle d'accès, protection contre le scraping et bonnes pratiques OWASP pour sécuriser vos applications.",
    category: 'Cybersécurité',
    durationSeconds: 15,
    thumbnailGradient: 'indigo',
    videoUrl: `${SAMPLE_BASE}/ForBiggerBlazes.mp4`,
    posterUrl: `${SAMPLE_BASE}/ForBiggerBlazes.jpg`,
    uploadedAt: '2026-06-26T09:15:00Z',
    views: 156,
    commentCount: 9,
    annotationCount: 11,
    hasAiAnalysis: false,
  },
  {
    id: 'vid-4',
    title: 'Pipeline IA : Transcription & Résumé',
    description:
      'Comment exploiter Whisper et les LLM pour enrichir automatiquement vos vidéos avec transcription, résumés et chapitres.',
    category: 'Intelligence Artificielle',
    durationSeconds: 15,
    thumbnailGradient: 'purple',
    videoUrl: `${SAMPLE_BASE}/ForBiggerEscapes.mp4`,
    posterUrl: `${SAMPLE_BASE}/ForBiggerEscapes.jpg`,
    uploadedAt: '2026-06-25T16:45:00Z',
    views: 89,
    commentCount: 5,
    annotationCount: 2,
    hasAiAnalysis: true,
  },
  {
    id: 'vid-5',
    title: 'Collaboration temps réel sur vidéo',
    description:
      'Annotations, commentaires horodatés et revue augmentée de contenus pédagogiques en équipe.',
    category: 'Collaboration',
    durationSeconds: 60,
    thumbnailGradient: 'brand-light',
    videoUrl: `${SAMPLE_BASE}/ForBiggerFun.mp4`,
    posterUrl: `${SAMPLE_BASE}/ForBiggerFun.jpg`,
    uploadedAt: '2026-06-24T11:20:00Z',
    views: 267,
    commentCount: 24,
    annotationCount: 15,
    hasAiAnalysis: true,
  },
  {
    id: 'vid-6',
    title: 'Docker & Déploiement Cloud',
    description:
      "Containerisation et déploiement d'applications en environnement de production avec Docker et les pratiques DevOps.",
    category: 'DevOps',
    durationSeconds: 888,
    thumbnailGradient: 'slate',
    videoUrl: `${SAMPLE_BASE}/Sintel.mp4`,
    posterUrl: `${SAMPLE_BASE}/Sintel.jpg`,
    uploadedAt: '2026-06-23T08:00:00Z',
    views: 134,
    commentCount: 7,
    annotationCount: 3,
    hasAiAnalysis: false,
  },
];

/** @deprecated Utiliser useVideoLibrary().videos */
export const MOCK_VIDEOS = SEED_VIDEOS;

export function getVideoById(id: string, videos: Video[] = SEED_VIDEOS): Video | undefined {
  return videos.find((video) => video.id === id);
}

export function getThumbnailGradientClass(gradient: ThumbnailGradient): string {
  return THUMBNAIL_GRADIENT_CLASSES[gradient];
}

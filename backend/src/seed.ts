import bcrypt from 'bcryptjs';
import { createId, db, type DbAnnotation, type DbComment, type DbReply } from './db.js';

const SAMPLE_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

const USERS = [
  {
    id: 'user-admin-1',
    name: 'Marie Dupont',
    email: 'marie.dupont@estiam.fr',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: 'user-student-1',
    name: 'Lucas Martin',
    email: 'lucas.martin@estiam.fr',
    password: 'student123',
    role: 'student' as const,
  },
  {
    id: 'user-student-2',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@estiam.fr',
    password: 'student123',
    role: 'student' as const,
  },
];

const VIDEOS = [
  {
    id: 'vid-1',
    title: 'Introduction à React et TypeScript',
    description:
      'Découvrez les fondamentaux de React avec TypeScript pour des applications robustes.',
    category: 'Développement Web',
    duration_seconds: 596,
    thumbnail_gradient: 'brand',
    video_url: `${SAMPLE_BASE}/BigBuckBunny.mp4`,
    poster_url: `${SAMPLE_BASE}/BigBuckBunny.jpg`,
    uploaded_at: '2026-06-28T10:00:00Z',
    views: 342,
    has_ai_analysis: 1,
    mime_type: 'video/mp4',
  },
  {
    id: 'vid-2',
    title: 'Architecture REST & API Design',
    description: 'Bonnes pratiques pour concevoir des APIs RESTful scalables et maintenables.',
    category: 'Backend',
    duration_seconds: 634,
    thumbnail_gradient: 'violet',
    video_url: `${SAMPLE_BASE}/ElephantsDream.mp4`,
    poster_url: `${SAMPLE_BASE}/ElephantsDream.jpg`,
    uploaded_at: '2026-06-27T14:30:00Z',
    views: 218,
    has_ai_analysis: 1,
  },
  {
    id: 'vid-3',
    title: 'Sécurité des applications web',
    description: "JWT, contrôle d'accès et bonnes pratiques OWASP.",
    category: 'Cybersécurité',
    duration_seconds: 15,
    thumbnail_gradient: 'indigo',
    video_url: `${SAMPLE_BASE}/ForBiggerBlazes.mp4`,
    poster_url: `${SAMPLE_BASE}/ForBiggerBlazes.jpg`,
    uploaded_at: '2026-06-26T09:15:00Z',
    views: 156,
    has_ai_analysis: 0,
  },
  {
    id: 'vid-4',
    title: 'Pipeline IA : Transcription & Résumé',
    description: 'Whisper et LLM pour enrichir vos vidéos pédagogiques.',
    category: 'Intelligence Artificielle',
    duration_seconds: 15,
    thumbnail_gradient: 'purple',
    video_url: `${SAMPLE_BASE}/ForBiggerEscapes.mp4`,
    poster_url: `${SAMPLE_BASE}/ForBiggerEscapes.jpg`,
    uploaded_at: '2026-06-25T16:45:00Z',
    views: 89,
    has_ai_analysis: 1,
  },
  {
    id: 'vid-5',
    title: 'Collaboration temps réel sur vidéo',
    description: 'Annotations, commentaires horodatés et revue augmentée.',
    category: 'Collaboration',
    duration_seconds: 60,
    thumbnail_gradient: 'brand-light',
    video_url: `${SAMPLE_BASE}/ForBiggerFun.mp4`,
    poster_url: `${SAMPLE_BASE}/ForBiggerFun.jpg`,
    uploaded_at: '2026-06-24T11:20:00Z',
    views: 267,
    has_ai_analysis: 1,
  },
  {
    id: 'vid-6',
    title: 'Docker & Déploiement Cloud',
    description: "Containerisation et déploiement d'applications en production.",
    category: 'DevOps',
    duration_seconds: 888,
    thumbnail_gradient: 'slate',
    video_url: `${SAMPLE_BASE}/Sintel.mp4`,
    poster_url: `${SAMPLE_BASE}/Sintel.jpg`,
    uploaded_at: '2026-06-23T08:00:00Z',
    views: 134,
    has_ai_analysis: 0,
  },
];

const AI_RESULTS = [
  {
    video_id: 'vid-1',
    summary:
      'Cette vidéo présente React et TypeScript avec des exemples pratiques sur les composants, hooks et typage.',
    keywords: ['React', 'TypeScript', 'Hooks', 'Composants', 'Props'],
    chapters: [
      { time: '00:00', title: 'Introduction' },
      { time: '03:45', title: 'Concepts clés' },
      { time: '12:20', title: 'Démonstration pratique' },
    ],
  },
  {
    video_id: 'vid-2',
    summary: 'Vue d’ensemble des principes REST, versioning et gestion des erreurs API.',
    keywords: ['REST', 'API', 'HTTP', 'Pagination', 'Versioning'],
    chapters: [
      { time: '00:00', title: 'Principes REST' },
      { time: '05:10', title: 'Design des ressources' },
    ],
  },
  {
    video_id: 'vid-4',
    summary: 'Pipeline IA pour transcription automatique, résumés et chapitres thématiques.',
    keywords: ['Whisper', 'LLM', 'Transcription', 'Résumé', 'Chapitres'],
    chapters: [
      { time: '00:00', title: 'Extraction audio' },
      { time: '00:08', title: 'Génération IA' },
    ],
  },
  {
    video_id: 'vid-5',
    summary: 'Collaboration synchronisée autour du lecteur vidéo avec annotations et commentaires.',
    keywords: ['WebSocket', 'Annotations', 'Commentaires', 'Temps réel'],
    chapters: [
      { time: '00:00', title: 'Revue augmentée' },
      { time: '00:30', title: 'Synchronisation live' },
    ],
  },
];

export function seedDatabase(force = false): void {
  if (db.countUsers() > 0 && !force) {
    return;
  }

  if (force) {
    db.clearAll();
  }

  for (const user of USERS) {
    db.insertUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: bcrypt.hashSync(user.password, 10),
      role: user.role,
    });
  }

  for (const video of VIDEOS) {
    db.insertVideo({
      id: video.id,
      title: video.title,
      description: video.description,
      category: video.category,
      duration_seconds: video.duration_seconds,
      thumbnail_gradient: video.thumbnail_gradient,
      video_url: video.video_url,
      poster_url: video.poster_url,
      is_uploaded: 0,
      file_name: null,
      mime_type: video.mime_type ?? null,
      uploaded_at: video.uploaded_at,
      views: video.views,
      has_ai_analysis: video.has_ai_analysis,
      uploaded_by: null,
    });
  }

  for (const ai of AI_RESULTS) {
    db.insertAiResult({
      video_id: ai.video_id,
      summary: ai.summary,
      keywords_json: JSON.stringify(ai.keywords),
      chapters_json: JSON.stringify(ai.chapters),
    });
  }

  const comments: DbComment[] = [
    {
      id: 'cmt-1',
      video_id: 'vid-1',
      user_id: 'user-student-1',
      timestamp: 134,
      text: 'Excellente explication sur les hooks React !',
      created_at: '2026-06-28T11:00:00Z',
    },
    {
      id: 'cmt-2',
      video_id: 'vid-1',
      user_id: 'user-student-2',
      timestamp: 342,
      text: 'Pourriez-vous détailler useEffect ?',
      created_at: '2026-06-28T12:30:00Z',
    },
    {
      id: 'cmt-4',
      video_id: 'vid-5',
      user_id: 'user-student-1',
      timestamp: 12,
      text: 'La synchro temps réel sera utile pour nos revues.',
      created_at: '2026-06-24T15:00:00Z',
    },
  ];

  for (const comment of comments) db.insertComment(comment);

  const replies: DbReply[] = [
    {
      id: 'reply-1',
      comment_id: 'cmt-2',
      user_id: 'user-admin-1',
      text: 'useEffect sert à synchroniser votre composant avec un système externe. Je détaille les cas dans la section suivante.',
      created_at: '2026-06-28T13:00:00Z',
    },
  ];

  for (const reply of replies) db.insertReply(reply);

  const annotations: DbAnnotation[] = [
    {
      id: 'ann-1',
      video_id: 'vid-1',
      user_id: 'user-admin-1',
      timestamp: 134,
      type: 'rectangle',
      x: 0.12,
      y: 0.18,
      width: 0.35,
      height: 0.22,
      radius: null,
      x2: null,
      y2: null,
      text: 'Hooks',
      created_at: '2026-06-28T11:05:00Z',
    },
    {
      id: 'ann-2',
      video_id: 'vid-1',
      user_id: 'user-admin-1',
      timestamp: 342,
      type: 'circle',
      x: 0.62,
      y: 0.45,
      width: null,
      height: null,
      radius: 0.08,
      x2: null,
      y2: null,
      text: 'useEffect',
      created_at: '2026-06-28T12:35:00Z',
    },
    {
      id: 'ann-3',
      video_id: 'vid-1',
      user_id: 'user-admin-1',
      timestamp: 481,
      type: 'text',
      x: 0.25,
      y: 0.72,
      width: null,
      height: null,
      radius: null,
      x2: null,
      y2: null,
      text: 'Typer les props ✓',
      created_at: '2026-06-28T14:05:00Z',
    },
    {
      id: 'ann-4',
      video_id: 'vid-5',
      user_id: 'user-admin-1',
      timestamp: 12,
      type: 'rectangle',
      x: 0.2,
      y: 0.3,
      width: 0.4,
      height: 0.15,
      radius: null,
      x2: null,
      y2: null,
      text: 'Zone clé',
      created_at: '2026-06-24T15:10:00Z',
    },
  ];

  for (const annotation of annotations) db.insertAnnotation(annotation);
}

seedDatabase();

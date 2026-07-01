import type { VideoAnnotation, VideoComment } from '@/types/collaboration';
import { MOCK_USERS } from '@/types/auth';

const MOCK_COMMENTS: VideoComment[] = [
  {
    id: 'cmt-1',
    videoId: 'vid-1',
    timestamp: 134,
    author: 'Lucas Martin',
    authorId: MOCK_USERS.student.id,
    text: 'Excellente explication sur les hooks React !',
    createdAt: '2026-06-28T11:00:00Z',
    replies: [],
  },
  {
    id: 'cmt-2',
    videoId: 'vid-1',
    timestamp: 342,
    author: 'Sophie Laurent',
    authorId: 'user-student-2',
    text: 'Pourriez-vous détailler useEffect ?',
    createdAt: '2026-06-28T12:30:00Z',
    replies: [
      {
        id: 'reply-1',
        author: 'Marie Dupont',
        authorId: MOCK_USERS.admin.id,
        text: 'useEffect sert à synchroniser votre composant avec un système externe. Je détaille les cas dans la section suivante.',
        createdAt: '2026-06-28T13:00:00Z',
      },
    ],
  },
  {
    id: 'cmt-4',
    videoId: 'vid-5',
    timestamp: 12,
    author: 'Lucas Martin',
    authorId: MOCK_USERS.student.id,
    text: 'La synchro temps réel sera utile pour nos revues.',
    createdAt: '2026-06-24T15:00:00Z',
    replies: [],
  },
];

const MOCK_ANNOTATIONS: VideoAnnotation[] = [
  {
    id: 'ann-1',
    videoId: 'vid-1',
    timestamp: 134,
    type: 'rectangle',
    author: 'Marie Dupont',
    authorId: MOCK_USERS.admin.id,
    x: 0.12,
    y: 0.18,
    width: 0.35,
    height: 0.22,
    text: 'Hooks',
    createdAt: '2026-06-28T11:05:00Z',
  },
  {
    id: 'ann-2',
    videoId: 'vid-1',
    timestamp: 342,
    type: 'circle',
    author: 'Marie Dupont',
    authorId: MOCK_USERS.admin.id,
    x: 0.62,
    y: 0.45,
    radius: 0.08,
    text: 'useEffect',
    createdAt: '2026-06-28T12:35:00Z',
  },
  {
    id: 'ann-3',
    videoId: 'vid-1',
    timestamp: 481,
    type: 'text',
    author: 'Marie Dupont',
    authorId: MOCK_USERS.admin.id,
    x: 0.25,
    y: 0.72,
    text: 'Typer les props ✓',
    createdAt: '2026-06-28T14:05:00Z',
  },
  {
    id: 'ann-4',
    videoId: 'vid-5',
    timestamp: 12,
    type: 'rectangle',
    author: 'Marie Dupont',
    authorId: MOCK_USERS.admin.id,
    x: 0.2,
    y: 0.3,
    width: 0.4,
    height: 0.15,
    text: 'Zone clé',
    createdAt: '2026-06-24T15:10:00Z',
  },
];

export function getInitialComments(videoId: string): VideoComment[] {
  return MOCK_COMMENTS.filter((comment) => comment.videoId === videoId).sort(
    (a, b) => a.timestamp - b.timestamp,
  );
}

export function getInitialAnnotations(videoId: string): VideoAnnotation[] {
  return MOCK_ANNOTATIONS.filter((annotation) => annotation.videoId === videoId).sort(
    (a, b) => a.timestamp - b.timestamp,
  );
}

export function isStudentComment(comment: VideoComment, adminId: string): boolean {
  return comment.authorId !== adminId;
}

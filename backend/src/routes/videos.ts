import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { createId, db, type DbVideo } from '../db.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { getVideoOr404, mapVideo } from '../serializers.js';

function inferMimeType(fileName: string, mimeType?: string): string {
  if (mimeType && mimeType.startsWith('video/')) return mimeType;
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  return 'video/mp4';
}

for (const dir of [config.videosDir, config.postersDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      const dir = file.fieldname === 'poster' ? config.postersDir : config.videosDir;
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.mp4';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});

export const videosRouter = Router();

videosRouter.get('/', requireAuth, (_req, res) => {
  res.json({ videos: db.listVideos().map(mapVideo) });
});

videosRouter.get('/:id', requireAuth, (req, res) => {
  const video = getVideoOr404(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Vidéo introuvable.' });
    return;
  }

  const updated = db.updateVideoViews(video.id)!;
  res.json({ video: mapVideo(updated) });
});

videosRouter.post(
  '/',
  requireAuth,
  requireRole('admin'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
  ]),
  (req: AuthRequest, res) => {
    const files = req.files as {
      video?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    };

    const videoFile = files.video?.[0];
    if (!videoFile) {
      res.status(400).json({ error: 'Fichier vidéo requis.' });
      return;
    }

    const {
      title,
      description,
      category,
      durationSeconds,
      thumbnailGradient = 'brand',
      mimeType: bodyMimeType,
    } = req.body as Record<string, string>;

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      fs.unlinkSync(videoFile.path);
      res.status(400).json({ error: 'Titre, description et catégorie requis.' });
      return;
    }

    const posterFile = files.poster?.[0];
    const id = createId('vid-upload');
    const videoUrl = `/uploads/videos/${videoFile.filename}`;
    const posterUrl = posterFile
      ? `/uploads/posters/${posterFile.filename}`
      : '/uploads/posters/default-poster.svg';

    if (!posterFile) {
      const defaultPosterPath = path.join(config.postersDir, 'default-poster.svg');
      if (!fs.existsSync(defaultPosterPath)) {
        fs.writeFileSync(
          defaultPosterPath,
          `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect fill="#7c3aed" width="100%" height="100%"/><text x="50%" y="50%" fill="white" font-size="24" text-anchor="middle" dominant-baseline="middle">Video</text></svg>`,
        );
      }
    }

    const uploadedAt = new Date().toISOString();
    const record: DbVideo = {
      id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      duration_seconds: Number(durationSeconds) || 0,
      thumbnail_gradient: thumbnailGradient,
      video_url: videoUrl,
      poster_url: posterUrl,
      is_uploaded: 1,
      file_name: videoFile.originalname,
      mime_type: inferMimeType(videoFile.originalname, bodyMimeType || videoFile.mimetype),
      uploaded_at: uploadedAt,
      views: 0,
      has_ai_analysis: 0,
      uploaded_by: req.user!.id,
    };

    db.insertVideo(record);
    res.status(201).json({ video: mapVideo(record) });
  },
);

videosRouter.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const video = getVideoOr404(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Vidéo introuvable.' });
    return;
  }

  if (!video.is_uploaded) {
    res.status(403).json({ error: 'Seules les vidéos uploadées peuvent être supprimées.' });
    return;
  }

  if (video.video_url.startsWith('/uploads/')) {
    const videoPath = path.join(path.dirname(config.uploadsDir), video.video_url.replace(/^\//, ''));
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
  }

  if (video.poster_url.startsWith('/uploads/posters/') && !video.poster_url.includes('default-poster')) {
    const posterPath = path.join(path.dirname(config.uploadsDir), video.poster_url.replace(/^\//, ''));
    if (fs.existsSync(posterPath)) fs.unlinkSync(posterPath);
  }

  db.deleteVideo(video.id);
  res.status(204).send();
});

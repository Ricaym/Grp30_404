import { Router } from 'express';
import { createId, db } from '../db.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { getVideoOr404, mapAnnotation, mapComment, routeParam } from '../serializers.js';
import { runPole3Analysis } from '../services/pole3Analysis.js';
import type { CollaborationHub } from '../websocket.js';

export function createCollaborationRouter(hub: CollaborationHub): Router {
  const router = Router();

  router.get('/videos/:videoId/comments', requireAuth, (req, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    res.json({ comments: db.listComments(video.id).map(mapComment) });
  });

  router.post('/videos/:videoId/comments', requireAuth, requireRole('student'), (req: AuthRequest, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    const { text, timestamp } = req.body as { text?: string; timestamp?: number };
    if (!text?.trim() || typeof timestamp !== 'number') {
      res.status(400).json({ error: 'Texte et timestamp requis.' });
      return;
    }

    const id = createId('cmt');
    const createdAt = new Date().toISOString();
    db.insertComment({
      id,
      video_id: video.id,
      user_id: req.user!.id,
      timestamp,
      text: text.trim(),
      created_at: createdAt,
    });

    const comment = mapComment({
      id,
      video_id: video.id,
      user_id: req.user!.id,
      timestamp,
      text: text.trim(),
      created_at: createdAt,
    });

    hub.broadcast(video.id, { type: 'comment:added', payload: comment });
    res.status(201).json({ comment });
  });

  router.post('/comments/:commentId/replies', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
    const comment = db.getComment(routeParam(req.params.commentId));
    if (!comment) {
      res.status(404).json({ error: 'Commentaire introuvable.' });
      return;
    }

    const { text } = req.body as { text?: string };
    if (!text?.trim()) {
      res.status(400).json({ error: 'Texte requis.' });
      return;
    }

    const id = createId('reply');
    const createdAt = new Date().toISOString();
    db.insertReply({
      id,
      comment_id: comment.id,
      user_id: req.user!.id,
      text: text.trim(),
      created_at: createdAt,
    });

    const reply = {
      id,
      author: req.user!.name,
      authorId: req.user!.id,
      text: text.trim(),
      createdAt,
    };

    hub.broadcast(comment.video_id, {
      type: 'reply:added',
      payload: { commentId: comment.id, reply },
    });

    res.status(201).json({ reply });
  });

  router.get('/videos/:videoId/annotations', requireAuth, (req, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    res.json({ annotations: db.listAnnotations(video.id).map(mapAnnotation) });
  });

  router.post('/videos/:videoId/annotations', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    const body = req.body as {
      type?: string;
      timestamp?: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      radius?: number;
      x2?: number;
      y2?: number;
      text?: string;
    };

    if (body.type == null || typeof body.timestamp !== 'number' || body.x == null || body.y == null) {
      res.status(400).json({ error: 'Données annotation invalides.' });
      return;
    }

    const id = createId('ann');
    const createdAt = new Date().toISOString();
    db.insertAnnotation({
      id,
      video_id: video.id,
      user_id: req.user!.id,
      timestamp: body.timestamp,
      type: body.type,
      x: body.x,
      y: body.y,
      width: body.width ?? null,
      height: body.height ?? null,
      radius: body.radius ?? null,
      x2: body.x2 ?? null,
      y2: body.y2 ?? null,
      text: body.text?.trim() || null,
      created_at: createdAt,
    });

    const annotation = mapAnnotation({
      id,
      video_id: video.id,
      user_id: req.user!.id,
      timestamp: body.timestamp,
      type: body.type,
      x: body.x,
      y: body.y,
      width: body.width ?? null,
      height: body.height ?? null,
      radius: body.radius ?? null,
      x2: body.x2 ?? null,
      y2: body.y2 ?? null,
      text: body.text?.trim() || null,
      created_at: createdAt,
    });

    hub.broadcast(video.id, { type: 'annotation:added', payload: annotation });
    res.status(201).json({ annotation });
  });

  router.patch('/annotations/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
    const row = db.getAnnotation(routeParam(req.params.id));
    if (!row) {
      res.status(404).json({ error: 'Annotation introuvable.' });
      return;
    }

    const { text } = req.body as { text?: string };
    const nextText = text?.trim() || row.text;
    const updated = db.updateAnnotationText(row.id, nextText)!;
    const annotation = mapAnnotation(updated);
    hub.broadcast(row.video_id, { type: 'annotation:updated', payload: annotation });
    res.json({ annotation });
  });

  router.delete('/annotations/:id', requireAuth, requireRole('admin'), (req, res) => {
    const row = db.getAnnotation(routeParam(req.params.id));
    if (!row) {
      res.status(404).json({ error: 'Annotation introuvable.' });
      return;
    }

    db.deleteAnnotation(row.id);
    hub.broadcast(row.video_id, { type: 'annotation:removed', payload: { id: row.id } });
    res.status(204).send();
  });

  router.post('/videos/:videoId/events', requireAuth, (req: AuthRequest, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    const { event, timestamp, videoDuration } = req.body as {
      event?: string;
      timestamp?: number;
      videoDuration?: number;
    };

    const allowed = ['play', 'pause', 'seek', 'stop', 'complete'];
    if (!event || !allowed.includes(event)) {
      res.status(400).json({ error: 'Événement invalide.' });
      return;
    }

    const position = Number(timestamp);
    if (!Number.isFinite(position) || position < 0) {
      res.status(400).json({ error: 'Horodatage invalide.' });
      return;
    }

    const duration = Number(videoDuration) || video.duration_seconds;
    const device = typeof req.headers['x-device'] === 'string' ? req.headers['x-device'] : 'Web';

    db.insertViewingEvent({
      id: createId('view'),
      video_id: video.id,
      user_id: req.user!.id,
      event: event as 'play' | 'pause' | 'seek' | 'stop' | 'complete',
      timestamp: Math.min(position, duration),
      video_duration: duration,
      device,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ ok: true });
  });

  router.post('/videos/:videoId/analyze', requireAuth, requireRole('admin'), (req, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    try {
      runPole3Analysis(video.id);
      const ai = db.getAiResult(video.id)!;
      res.status(201).json({
        ai: {
          summary: ai.summary,
          keywords: JSON.parse(ai.keywords_json) as string[],
          chapters: JSON.parse(ai.chapters_json) as Array<{ time: string; title: string }>,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analyse IA impossible.';
      res.status(400).json({ error: message });
    }
  });

  router.get('/videos/:videoId/ai', requireAuth, (req, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    if (!video.has_ai_analysis) {
      res.json({ ai: null });
      return;
    }

    const ai = db.getAiResult(video.id);
    if (!ai) {
      res.json({ ai: null });
      return;
    }

    res.json({
      ai: {
        summary: ai.summary,
        keywords: JSON.parse(ai.keywords_json) as string[],
        chapters: JSON.parse(ai.chapters_json) as Array<{ time: string; title: string }>,
        source: ai.summary.startsWith('Analyse audience') ? 'analytics' : 'metadata',
      },
    });
  });

  router.get('/videos/:videoId/export', requireAuth, requireRole('admin'), (req, res) => {
    const video = getVideoOr404(req.params.videoId);
    if (!video) {
      res.status(404).json({ error: 'Vidéo introuvable.' });
      return;
    }

    res.json({
      export: {
        videoId: video.id,
        exportedAt: new Date().toISOString(),
        comments: db.listComments(video.id).map(mapComment),
        annotations: db.listAnnotations(video.id).map(mapAnnotation),
      },
    });
  });

  return router;
}

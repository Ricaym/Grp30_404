import { Router } from 'express';
import { config } from '../config.js';
import { db } from '../db.js';
import { requireIntegrationKey } from '../middleware/integrationAuth.js';
import { getVideoOr404 } from '../serializers.js';

export const integrationRouter = Router();

integrationRouter.use(requireIntegrationKey);

integrationRouter.get('/status', (_req, res) => {
  res.json({
    ok: true,
    service: 'video-learning-hub-integration',
    aiServiceConfigured: Boolean(config.aiServiceUrl),
    securityServiceConfigured: Boolean(config.securityServiceUrl),
  });
});

/** Pôle 3 — envoi des résultats IA (transcription, résumé, chapitres) */
integrationRouter.post('/videos/:videoId/ai', (req, res) => {
  const video = getVideoOr404(req.params.videoId);
  if (!video) {
    res.status(404).json({ error: 'Vidéo introuvable.' });
    return;
  }

  const { summary, keywords, chapters } = req.body as {
    summary?: string;
    keywords?: string[];
    chapters?: Array<{ time: string; title: string }>;
  };

  if (!summary?.trim() || !Array.isArray(keywords) || !Array.isArray(chapters)) {
    res.status(400).json({ error: 'summary, keywords et chapters requis.' });
    return;
  }

  db.upsertAiResult({
    video_id: video.id,
    summary: summary.trim(),
    keywords_json: JSON.stringify(keywords),
    chapters_json: JSON.stringify(chapters),
  });
  db.setVideoAiAnalysis(video.id, true);

  res.status(201).json({ ok: true, videoId: video.id });
});

/** Pôle 2 — webhook optionnel (ex. alerte sécurité, score de risque) */
integrationRouter.post('/security/events', (req, res) => {
  const { type, userId, metadata } = req.body as {
    type?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  };

  if (!type?.trim()) {
    res.status(400).json({ error: 'type requis.' });
    return;
  }

  console.info('[security-event]', { type: type.trim(), userId, metadata });
  res.status(202).json({ ok: true, received: type.trim() });
});

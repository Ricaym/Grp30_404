import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, type DbVideo } from '../db.js';

const repoDataDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../data',
);
const LOGS_CSV = path.join(repoDataDir, 'data', 'video_logs.csv');

interface LogRow {
  user_id: string;
  event: string;
  timestamp: number;
  video_duration: number;
  device: string;
  country?: string;
}

function secToTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes} min ${rest} s` : `${minutes} min`;
}

export function mapHubVideoToNumeric(videoId: string): number | null {
  const match = videoId.match(/^vid-(\d+)$/i);
  if (match) return Number(match[1]);
  return null;
}

function parseLogsCsv(filePath: string, numericVideoId: number): LogRow[] {
  if (!fs.existsSync(filePath)) return [];

  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  const rows: LogRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(',');
    if (parts.length < 8 || Number(parts[1]) !== numericVideoId) continue;
    rows.push({
      user_id: parts[0],
      event: parts[2],
      timestamp: Number(parts[3]),
      video_duration: Number(parts[4]),
      device: parts[5],
      country: parts[6],
    });
  }

  return rows;
}

function getAppLogs(videoId: string): LogRow[] {
  return db.listViewingEvents(videoId).map((event) => ({
    user_id: event.user_id,
    event: event.event,
    timestamp: event.timestamp,
    video_duration: event.video_duration,
    device: event.device,
  }));
}

function topValues(values: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function buildAnalysisFromLogs(
  rows: LogRow[],
  duration: number,
  sourceNote: string,
): {
  summary: string;
  keywords: string[];
  chapters: Array<{ time: string; title: string }>;
} {
  const users = new Set(rows.map((row) => row.user_id)).size;
  const finals = rows.filter((row) => row.event === 'complete' || row.event === 'stop');
  const completionPct = finals.length > 0
    ? (finals.filter((row) => row.event === 'complete').length / finals.length) * 100
    : 0;

  const topDevices = topValues(rows.map((row) => row.device), 3);
  const topCountries = topValues(rows.map((row) => row.country ?? '').filter(Boolean), 3);
  const seeks = rows.filter((row) => row.event === 'seek');

  const bucketSeconds = duration <= 120 ? 10 : 60;
  const minSeeksForZone = duration <= 120 ? 1 : 2;
  const boringByBucket = new Map<number, number>();

  for (const seek of seeks) {
    const bucket = Math.floor(seek.timestamp / bucketSeconds);
    boringByBucket.set(bucket, (boringByBucket.get(bucket) ?? 0) + 1);
  }

  const chapters: Array<{ time: string; title: string }> = [
    { time: '00:00', title: 'Introduction' },
  ];

  for (const [bucket, count] of [...boringByBucket.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)) {
    const bucketStart = bucket * bucketSeconds;
    if (bucketStart >= duration) continue;
    if (count >= minSeeksForZone) {
      chapters.push({
        time: secToTime(bucketStart),
        title: `Zone d'ennui détectée (${count} seeks)`,
      });
    }
  }

  const endOffset = duration <= 120 ? 2 : 30;
  chapters.push({
    time: secToTime(Math.max(duration - endOffset, 0)),
    title: 'Fin de vidéo',
  });

  const countryPart = topCountries.length > 0 ? ` Pays principaux : ${topCountries.join(', ')}.` : '';
  const summary =
    `Analyse audience — ${users} spectateur${users > 1 ? 's' : ''}, taux de complétion ${completionPct.toFixed(1)}%. ` +
    `Durée : ${formatDuration(duration)}. ` +
    `Appareils : ${topDevices.join(', ') || 'non renseigné'}.${countryPart} ` +
    `${seeks.length} événement${seeks.length > 1 ? 's' : ''} seek. ` +
    `(${sourceNote})`;

  const keywords = [
    ...new Set([
      ...topDevices,
      ...topCountries,
      'rétention',
      'engagement',
      'analytics',
    ]),
  ].slice(0, 8);

  return { summary, keywords, chapters };
}

function buildMetadataAnalysis(video: DbVideo): {
  summary: string;
  keywords: string[];
  chapters: Array<{ time: string; title: string }>;
} {
  const duration = Math.max(1, video.duration_seconds);
  const titleWords = video.title
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((word) => word.length > 3)
    .slice(0, 4);

  const chapters: Array<{ time: string; title: string }> = [
    { time: '00:00', title: 'Introduction' },
  ];

  if (duration > 20) {
    chapters.push({
      time: secToTime(Math.floor(duration / 3)),
      title: 'Développement',
    });
  }
  if (duration > 45) {
    chapters.push({
      time: secToTime(Math.floor((duration * 2) / 3)),
      title: 'Points clés',
    });
  }

  chapters.push({
    time: secToTime(Math.max(duration - 3, 0)),
    title: 'Conclusion',
  });

  const summary =
    `« ${video.title} » — ${video.category}, ${formatDuration(duration)}. ` +
    `Analyse initiale à partir du contenu publié. ` +
    `Les indicateurs d'engagement (complétion, zones d'ennui) se mettront à jour après les visionnages sur la plateforme.`;

  const keywords = [...new Set([video.category, ...titleWords, 'formation', 'vidéo'])].slice(0, 8);

  return { summary, keywords, chapters };
}

export function buildPole3Analysis(
  videoId: string,
  videoDurationSeconds: number,
): {
  summary: string;
  keywords: string[];
  chapters: Array<{ time: string; title: string }>;
} {
  const duration = Math.max(1, videoDurationSeconds);
  const appRows = getAppLogs(videoId).filter((row) => row.timestamp <= duration);

  if (appRows.length > 0) {
    return buildAnalysisFromLogs(appRows, duration, 'données enregistrées sur la plateforme');
  }

  const numericId = mapHubVideoToNumeric(videoId);
  if (numericId !== null) {
    const csvRows = parseLogsCsv(LOGS_CSV, numericId).filter((row) => row.timestamp <= duration);
    if (csvRows.length > 0) {
      return buildAnalysisFromLogs(csvRows, duration, 'données d\'audience du catalogue');
    }
  }

  const video = db.getVideo(videoId);
  if (!video) {
    throw new Error('Vidéo introuvable.');
  }

  return buildMetadataAnalysis(video);
}

export function runPole3Analysis(videoId: string): void {
  const video = db.getVideo(videoId);
  if (!video) {
    throw new Error('Vidéo introuvable.');
  }

  const payload = buildPole3Analysis(videoId, video.duration_seconds);
  db.upsertAiResult({
    video_id: videoId,
    summary: payload.summary,
    keywords_json: JSON.stringify(payload.keywords),
    chapters_json: JSON.stringify(payload.chapters),
  });
  db.setVideoAiAnalysis(videoId, true);
}

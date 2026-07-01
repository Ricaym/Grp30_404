import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';

const repoDataDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../data',
);
const LOGS_CSV = path.join(repoDataDir, 'data', 'video_logs.csv');

interface LogRow {
  user_id: number;
  video_id: number;
  event: string;
  timestamp: number;
  video_duration: number;
  device: string;
  country: string;
}

function secToTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function mapHubVideoToNumeric(videoId: string): number {
  const match = videoId.match(/^vid-(\d+)$/i);
  if (match) return Number(match[1]);
  return 1;
}

function parseLogsCsv(filePath: string): LogRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error('Logs Pôle 3 introuvables (data/data/video_logs.csv).');
  }

  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  const rows: LogRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(',');
    if (parts.length < 8) continue;
    rows.push({
      user_id: Number(parts[0]),
      video_id: Number(parts[1]),
      event: parts[2],
      timestamp: Number(parts[3]),
      video_duration: Number(parts[4]),
      device: parts[5],
      country: parts[6],
    });
  }

  return rows;
}

function topValues(values: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

export function buildPole3Analysis(videoId: string): {
  summary: string;
  keywords: string[];
  chapters: Array<{ time: string; title: string }>;
} {
  const numericId = mapHubVideoToNumeric(videoId);
  const rows = parseLogsCsv(LOGS_CSV).filter((row) => row.video_id === numericId);

  if (rows.length === 0) {
    throw new Error(`Aucun log Pôle 3 pour la vidéo ${videoId} (id ${numericId}).`);
  }

  const users = new Set(rows.map((row) => row.user_id)).size;
  const duration = rows[0]?.video_duration ?? 0;
  const finals = rows.filter((row) => row.event === 'complete' || row.event === 'stop');
  const completionPct = finals.length > 0
    ? (finals.filter((row) => row.event === 'complete').length / finals.length) * 100
    : 0;

  const topDevices = topValues(rows.map((row) => row.device), 3);
  const topCountries = topValues(rows.map((row) => row.country), 3);
  const seeks = rows.filter((row) => row.event === 'seek');

  const boringByMinute = new Map<number, number>();
  for (const seek of seeks) {
    const minute = Math.floor(seek.timestamp / 60);
    boringByMinute.set(minute, (boringByMinute.get(minute) ?? 0) + 1);
  }

  const chapters: Array<{ time: string; title: string }> = [
    { time: '00:00', title: 'Introduction' },
  ];

  for (const [minute, count] of [...boringByMinute.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)) {
    if (count >= 2) {
      chapters.push({
        time: secToTime(minute * 60),
        title: `Zone d'ennui détectée (${count} seeks)`,
      });
    }
  }

  chapters.push({
    time: secToTime(Math.max(duration - 30, 0)),
    title: 'Fin de vidéo',
  });

  const summary =
    `Analyse audience Pôle 3 — ${users} spectateurs, taux de complétion ${completionPct.toFixed(1)}%. ` +
    `Appareils dominants : ${topDevices.join(', ')}. ` +
    `Pays principaux : ${topCountries.join(', ')}. ` +
    `${seeks.length} événements seek (zones d'ennui potentielles).`;

  const keywords = [...new Set([...topDevices, ...topCountries, 'rétention', 'engagement', 'analytics'])].slice(0, 8);

  return { summary, keywords, chapters };
}

export function runPole3Analysis(videoId: string): void {
  const payload = buildPole3Analysis(videoId);
  db.upsertAiResult({
    video_id: videoId,
    summary: payload.summary,
    keywords_json: JSON.stringify(payload.keywords),
    chapters_json: JSON.stringify(payload.chapters),
  });
  db.setVideoAiAnalysis(videoId, true);
}

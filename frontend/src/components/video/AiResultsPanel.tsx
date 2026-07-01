import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { Video } from '@/data/mockVideos';
import { api, type AiResult } from '@/lib/api';

interface AiResultsPanelProps {
  video: Video;
}

export function AiResultsPanel({ video }: AiResultsPanelProps) {
  const [ai, setAi] = useState<AiResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAi() {
      setIsLoading(true);
      try {
        const result = await api.getAiResults(video.id);
        if (!cancelled) setAi(result);
      } catch {
        if (!cancelled) setAi(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAi();
    return () => {
      cancelled = true;
    };
  }, [video.id]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-surface shadow-sm">
        <header className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-text-primary">Résultats IA</h2>
          </div>
        </header>
        <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement de l&apos;analyse...
        </div>
      </section>
    );
  }

  if (!ai) {
    return (
      <section className="rounded-2xl border border-border bg-surface shadow-sm">
        <header className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-text-primary">Résultats IA</h2>
          </div>
        </header>
        <p className="px-5 py-8 text-center text-sm text-text-muted">
          Aucune analyse IA disponible pour cette vidéo.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-text-primary">Résultats IA</h2>
        </div>
        <p className="mt-1 text-xs text-text-muted">Pipeline Pôle 3 — données persistées côté serveur</p>
      </header>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Résumé</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{ai.summary}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Mots-clés</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ai.keywords.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Chapitres</p>
          <ul className="mt-2 space-y-1.5">
            {ai.chapters.map((chapter) => (
              <li key={chapter.time} className="text-sm text-text-secondary">
                <span className="font-semibold text-brand-600">{chapter.time}</span> — {chapter.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

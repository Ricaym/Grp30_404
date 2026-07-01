import { useCallback, useEffect, useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { Video } from '@/data/mockVideos';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError, type AiResult } from '@/lib/api';

interface AiResultsPanelProps {
  video: Video;
}

export function AiResultsPanel({ video }: AiResultsPanelProps) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [ai, setAi] = useState<AiResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getAiResults(video.id);
      setAi(result);
    } catch {
      setAi(null);
    } finally {
      setIsLoading(false);
    }
  }, [video.id]);

  useEffect(() => {
    void loadAi();
  }, [loadAi]);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await api.analyzeVideo(video.id);
      setAi(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Analyse impossible.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const analyzeButton = isAdmin ? (
    <button
      type="button"
      onClick={() => void handleAnalyze()}
      disabled={isAnalyzing}
      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyse en cours…
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          Lancer l&apos;analyse IA
        </>
      )}
    </button>
  ) : null;

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
          <p className="mt-1 text-xs text-text-muted">
            Résumé, mots-clés et chapitres générés à partir des données d&apos;engagement
          </p>
        </header>
        <div className="space-y-4 px-5 py-8 text-center">
          <p className="text-sm text-text-muted">
            Aucune analyse pour cette vidéo. Lancez l&apos;analyse pour générer un résumé,
            des mots-clés et des chapitres.
          </p>
          {analyzeButton}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold text-text-primary">Résultats IA</h2>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Résumé, mots-clés et chapitres basés sur l&apos;engagement des spectateurs
            </p>
          </div>
          {analyzeButton}
        </div>
      </header>

      <div className="space-y-4 p-5">
        {error && <p className="text-sm text-red-600">{error}</p>}

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
              <li key={`${chapter.time}-${chapter.title}`} className="text-sm text-text-secondary">
                <span className="font-semibold text-brand-600">{chapter.time}</span> — {chapter.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

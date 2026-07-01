import { useState } from 'react';
import { ArrowRight, Circle, Clock, PenLine, Pencil, Square, Trash2, Type, X } from 'lucide-react';
import { cn, formatTimestamp } from '@/lib/utils';
import type { AnnotationDrawSession, AnnotationType, VideoAnnotation } from '@/types/collaboration';

interface AnnotationsPanelProps {
  annotations: VideoAnnotation[];
  currentTime: number;
  isAdmin: boolean;
  drawSession: AnnotationDrawSession | null;
  onStartDraw: (type: AnnotationType, label?: string) => void;
  onCancelDraw: () => void;
  onUpdateAnnotation: (annotationId: string, text: string) => void;
  onRemoveAnnotation: (annotationId: string) => void;
  onSeek: (timestamp: number) => void;
}

const ANNOTATION_TYPES: {
  type: AnnotationType;
  label: string;
  icon: typeof Square;
}[] = [
  { type: 'rectangle', label: 'Rectangle', icon: Square },
  { type: 'circle', label: 'Cercle', icon: Circle },
  { type: 'arrow', label: 'Flèche', icon: ArrowRight },
  { type: 'text', label: 'Texte', icon: Type },
];

const TYPE_LABELS: Record<AnnotationType, string> = {
  rectangle: 'Rectangle',
  circle: 'Cercle',
  arrow: 'Flèche',
  text: 'Texte',
};

export function AnnotationsPanel({
  annotations,
  currentTime,
  isAdmin,
  drawSession,
  onStartDraw,
  onCancelDraw,
  onUpdateAnnotation,
  onRemoveAnnotation,
  onSeek,
}: AnnotationsPanelProps) {
  const [selectedType, setSelectedType] = useState<AnnotationType>('rectangle');
  const [label, setLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startDraw = () => {
    if (selectedType === 'text' && !label.trim()) return;
    onStartDraw(selectedType, label.trim() || undefined);
  };

  const startEdit = (annotation: VideoAnnotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.text ?? '');
  };

  const saveEdit = (annotationId: string) => {
    onUpdateAnnotation(annotationId, editText);
    setEditingId(null);
    setEditText('');
  };

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-text-primary">Annotations</h2>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {isAdmin
            ? `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''} — dessinez sur la vidéo`
            : `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''} du formateur`}
        </p>
      </header>

      {isAdmin ? (
        <div className="space-y-3 border-b border-border p-4">
          {drawSession ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-300 bg-brand-50 px-3 py-2.5">
              <p className="text-xs font-medium text-brand-700">
                Mode dessin : {TYPE_LABELS[drawSession.type]} actif
              </p>
              <button
                type="button"
                onClick={onCancelDraw}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                <X className="h-3 w-3" />
                Annuler
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-muted">
                Timestamp actuel :{' '}
                <span className="font-semibold text-brand-600">{formatTimestamp(currentTime)}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ANNOTATION_TYPES.map(({ type, label: typeLabel, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition',
                      selectedType === type
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-border text-text-secondary hover:border-brand-200 hover:bg-surface-muted',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {typeLabel}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder={
                  selectedType === 'text'
                    ? "Texte de l'annotation (requis)"
                    : 'Libellé (optionnel)'
                }
                className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />

              <button
                type="button"
                onClick={startDraw}
                disabled={selectedType === 'text' && !label.trim()}
                className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Dessiner sur la vidéo
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="border-b border-border px-5 py-3 text-xs text-text-muted">
          Consultation seule — seul le formateur peut créer ou modifier des annotations.
        </p>
      )}

      <div className="max-h-56 space-y-2 overflow-y-auto p-4">
        {annotations.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">
            {isAdmin
              ? 'Aucune annotation. Choisissez un outil et dessinez sur la vidéo.'
              : 'Aucune annotation du formateur pour cette vidéo.'}
          </p>
        ) : (
          annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="rounded-xl border border-border bg-surface-muted p-3"
            >
              <button
                type="button"
                onClick={() => onSeek(annotation.timestamp)}
                className="w-full text-left transition hover:opacity-80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(annotation.timestamp)}
                  </span>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700">
                    {TYPE_LABELS[annotation.type]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">{annotation.author}</p>
              </button>

              {editingId === annotation.id ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(annotation.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-border px-3 py-1 text-xs text-text-secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                annotation.text && (
                  <p className="mt-1 text-sm text-text-secondary">{annotation.text}</p>
                )
              )}

              {isAdmin && editingId !== annotation.id && (
                <div className="mt-2 flex gap-2 border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={() => startEdit(annotation)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveAnnotation(annotation.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

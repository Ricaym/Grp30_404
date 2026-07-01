import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  drawAnnotation,
  previewToAnnotationInput,
  toNormalizedPoint,
  type DrawPreview,
} from '@/lib/annotationDraw';
import { ANNOTATION_DISPLAY_WINDOW } from '@/lib/utils';
import type { AddAnnotationInput, AnnotationDrawSession, VideoAnnotation } from '@/types/collaboration';

interface VideoAnnotationLayerProps {
  annotations: VideoAnnotation[];
  currentTime: number;
  drawSession: AnnotationDrawSession | null;
  onDrawComplete: (input: AddAnnotationInput) => void;
  onDrawCancel: () => void;
}

export function VideoAnnotationLayer({
  annotations,
  currentTime,
  drawSession,
  onDrawComplete,
  onDrawCancel,
}: VideoAnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<DrawPreview | null>(null);
  const isDrawing = useRef(false);

  const visibleAnnotations = annotations.filter(
    (annotation) =>
      currentTime >= annotation.timestamp &&
      currentTime <= annotation.timestamp + ANNOTATION_DISPLAY_WINDOW,
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (const annotation of visibleAnnotations) {
      drawAnnotation(ctx, width, height, annotation);
    }

    if (preview) {
      drawAnnotation(ctx, width, height, preview, { preview: true });
    }
  }, [preview, visibleAnnotations]);

  useEffect(() => {
    redraw();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(redraw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  useEffect(() => {
    if (!drawSession) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreview(null);
        onDrawCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawSession, onDrawCancel]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawSession || !containerRef.current) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawing.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const start = toNormalizedPoint(event.clientX, event.clientY, rect);

    if (drawSession.type === 'text') {
      const input = previewToAnnotationInput(
        { type: 'text', start, end: start, text: drawSession.label },
        drawSession.label,
      );
      if (input) onDrawComplete(input);
      isDrawing.current = false;
      return;
    }

    setPreview({ type: drawSession.type, start, end: start, text: drawSession.label });
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !drawSession || !containerRef.current) return;
    if (drawSession.type === 'text') return;

    const rect = containerRef.current.getBoundingClientRect();
    const end = toNormalizedPoint(event.clientX, event.clientY, rect);
    setPreview((prev) => (prev ? { ...prev, end } : null));
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !drawSession) return;

    isDrawing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drawSession.type === 'text') return;

    setPreview((current) => {
      if (current) {
        const input = previewToAnnotationInput(current, drawSession.label);
        if (input) onDrawComplete(input);
      }
      return null;
    });
  };

  const isInteractive = Boolean(drawSession);
  const cursor =
    drawSession?.type === 'text'
      ? 'crosshair'
      : drawSession
        ? 'crosshair'
        : 'default';

  return (
    <>
      <div
        ref={containerRef}
        className={`absolute inset-0 z-10 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ cursor: isInteractive ? cursor : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {drawSession && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
          <div className="rounded-xl bg-brand-600/95 px-4 py-2 text-center text-xs font-medium text-white shadow-lg backdrop-blur-sm">
            {drawSession.type === 'text'
              ? 'Cliquez sur la vidéo pour placer le texte'
              : drawSession.type === 'arrow'
                ? 'Glissez pour dessiner une flèche'
                : 'Glissez pour dessiner — Échap pour annuler'}
          </div>
        </div>
      )}
    </>
  );
}

import type { AnnotationType, VideoAnnotation } from '@/types/collaboration';

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface DrawPreview {
  type: AnnotationType;
  start: NormalizedPoint;
  end: NormalizedPoint;
  text?: string;
}

export function toNormalizedPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): NormalizedPoint {
  return {
    x: clamp((clientX - rect.left) / rect.width, 0, 1),
    y: clamp((clientY - rect.top) / rect.height, 0, 1),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  annotation: VideoAnnotation | DrawPreview,
  options?: { preview?: boolean },
): void {
  const stroke = options?.preview ? '#a78bfa' : '#c4b5fd';
  const fill = options?.preview ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.15)';

  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  ctx.lineWidth = options?.preview ? 2.5 : 2;

  if ('timestamp' in annotation) {
    drawShape(ctx, width, height, annotation.type, {
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height,
      radius: annotation.radius,
      x2: annotation.x2,
      y2: annotation.y2,
      text: annotation.text,
    });
    if (annotation.text && annotation.type !== 'text') {
      drawLabel(ctx, width, height, annotation.x, annotation.y - 0.02, annotation.text);
    }
    return;
  }

  const shape = previewToShape(annotation);
  drawShape(ctx, width, height, annotation.type, shape);
  if (annotation.text && annotation.type === 'text') {
    drawTextBadge(ctx, width, height, shape.x, shape.y, annotation.text);
  }
}

function previewToShape(preview: DrawPreview) {
  const { type, start, end, text } = preview;

  if (type === 'rectangle') {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    return {
      x,
      y,
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
      text,
    };
  }

  if (type === 'circle') {
    const dx = (end.x - start.x) * 1;
    const dy = (end.y - start.y) * 1;
    const radius = Math.sqrt(dx * dx + dy * dy);
    return { x: start.x, y: start.y, radius, text };
  }

  if (type === 'arrow') {
    return { x: start.x, y: start.y, x2: end.x, y2: end.y, text };
  }

  return { x: start.x, y: start.y, text: text ?? 'Texte' };
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: AnnotationType,
  shape: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    x2?: number;
    y2?: number;
    text?: string;
  },
): void {
  if (type === 'rectangle' && shape.width && shape.height) {
    const x = shape.x * width;
    const y = shape.y * height;
    const w = shape.width * width;
    const h = shape.height * height;
    if (w < 4 || h < 4) return;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    return;
  }

  if (type === 'circle' && shape.radius) {
    const cx = shape.x * width;
    const cy = shape.y * height;
    const r = shape.radius * Math.min(width, height);
    if (r < 4) return;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (type === 'arrow' && shape.x2 !== undefined && shape.y2 !== undefined) {
    const x1 = shape.x * width;
    const y1 = shape.y * height;
    const x2 = shape.x2 * width;
    const y2 = shape.y2 * height;
    drawArrow(ctx, x1, y1, x2, y2);
    return;
  }

  if (type === 'text' && shape.text) {
    drawTextBadge(ctx, width, height, shape.x, shape.y, shape.text);
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const headLength = 14;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

function drawTextBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nx: number,
  ny: number,
  label: string,
): void {
  const x = nx * width;
  const y = ny * height;
  ctx.font = '600 14px Inter, sans-serif';
  const metrics = ctx.measureText(label);
  const padX = 8;
  const boxW = metrics.width + padX * 2;
  const boxH = 22;

  ctx.fillStyle = 'rgba(124, 58, 237, 0.88)';
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 6);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, boxW, boxH);
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, x + padX, y + 16);
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nx: number,
  ny: number,
  label: string,
): void {
  ctx.font = '500 11px Inter, sans-serif';
  ctx.fillStyle = '#ede9fe';
  ctx.fillText(label, nx * width, ny * height);
}

export function previewToAnnotationInput(
  preview: DrawPreview,
  text?: string,
): {
  type: AnnotationType;
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
} | null {
  const shape = previewToShape(preview);

  if (preview.type === 'rectangle') {
    if (!shape.width || !shape.height || shape.width < 0.01 || shape.height < 0.01) return null;
    return {
      type: 'rectangle',
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      text: text?.trim() || undefined,
    };
  }

  if (preview.type === 'circle') {
    if (!shape.radius || shape.radius < 0.01) return null;
    return {
      type: 'circle',
      x: shape.x,
      y: shape.y,
      radius: shape.radius,
      text: text?.trim() || undefined,
    };
  }

  if (preview.type === 'arrow') {
    if (shape.x2 === undefined || shape.y2 === undefined) return null;
    const dist = Math.hypot(shape.x2 - shape.x, shape.y2 - shape.y);
    if (dist < 0.02) return null;
    return {
      type: 'arrow',
      x: shape.x,
      y: shape.y,
      x2: shape.x2,
      y2: shape.y2,
      text: text?.trim() || undefined,
    };
  }

  if (preview.type === 'text') {
    const label = text?.trim() || preview.text?.trim();
    if (!label) return null;
    return { type: 'text', x: shape.x, y: shape.y, text: label };
  }

  return null;
}

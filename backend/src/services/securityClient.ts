import { config } from '../config.js';

export interface SecurityEventPayload {
  type: string;
  ip: string;
  username: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, unknown>;
}

function securityEventUrl(): string | null {
  const base = config.securityServiceUrl.replace(/\/$/, '');
  if (!base) return null;
  return `${base}/security/event`;
}

export function isSecurityEnabled(): boolean {
  return Boolean(config.securityServiceUrl.replace(/\/$/, ''));
}

/** Envoie un événement au backend SentinelX (Pôle 2). Ne bloque pas le flux principal. */
export function notifySecurityEvent(payload: SecurityEventPayload): void {
  const url = securityEventUrl();
  if (!url) return;

  const body = {
    event: payload.type,
    type: payload.type,
    ip: payload.ip,
    username: payload.username,
    severity: payload.severity,
    metadata: payload.metadata ?? {},
  };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((error: unknown) => {
    console.warn('[security-client] SentinelX indisponible:', error);
  });
}

export function clientIp(req: { ip?: string; headers: Record<string, unknown> }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

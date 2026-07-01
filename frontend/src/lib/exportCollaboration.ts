import type { CollaborationExport } from '@/types/collaboration';

export function downloadCollaborationJson(payload: CollaborationExport): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.videoId}-collaboration.json`;
  link.click();
  URL.revokeObjectURL(url);
}

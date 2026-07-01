import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_FILE_SIZE_BYTES,
} from '@/config/categories';

export interface VideoFileValidation {
  valid: boolean;
  error?: string;
}

export function validateVideoFile(file: File): VideoFileValidation {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['mp4', 'webm', 'mov'];
  const hasAllowedType = ACCEPTED_VIDEO_TYPES.includes(
    file.type as (typeof ACCEPTED_VIDEO_TYPES)[number],
  );
  const hasAllowedExtension = extension ? allowedExtensions.includes(extension) : false;

  if (!hasAllowedType && !hasAllowedExtension) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez MP4, WebM ou MOV.',
    };
  }

  if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Fichier trop volumineux (max 500 Mo).',
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function inferVideoMimeType(fileName: string, mimeType?: string): string {
  if (mimeType && mimeType.startsWith('video/')) return mimeType;
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'webm') return 'video/webm';
  if (ext === 'mov') return 'video/quicktime';
  return 'video/mp4';
}

export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.floor(video.duration) || 0);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };

    video.src = objectUrl;
  });
}

export function generatePosterFromFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 3);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas indisponible');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) resolve(blob);
            else reject(new Error('Impossible de générer la miniature.'));
          },
          'image/jpeg',
          0.82,
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Impossible de générer la miniature.'));
    };

    video.src = objectUrl;
  });
}

export function createVideoPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeVideoPreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

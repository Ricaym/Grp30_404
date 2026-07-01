import type { ThumbnailGradient } from '@/data/mockVideos';

export interface StoredUploadedVideoMeta {
  id: string;
  title: string;
  description: string;
  category: string;
  durationSeconds: number;
  thumbnailGradient: ThumbnailGradient;
  uploadedAt: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
}

interface StoredUploadedRecord {
  meta: StoredUploadedVideoMeta;
  videoBlob: Blob;
  posterBlob: Blob;
}

const DB_NAME = 'video-learning-hub';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded-videos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'meta.id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB error'));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = action(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB transaction error'));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction error'));
      }),
  );
}

export async function saveUploadedVideo(record: StoredUploadedRecord): Promise<void> {
  await runTransaction('readwrite', (store) => store.put(record));
}

export async function loadAllUploadedVideos(): Promise<StoredUploadedRecord[]> {
  return runTransaction<StoredUploadedRecord[]>('readonly', (store) => store.getAll());
}

export async function deleteUploadedVideo(id: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(id));
}

export type { StoredUploadedRecord };

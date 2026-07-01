import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  FileVideo,
  Loader2,
  Tag,
  Type,
  X,
} from 'lucide-react';
import { VIDEO_CATEGORIES, type VideoCategory } from '@/config/categories';
import { useVideoLibrary } from '@/context/VideoLibraryContext';
import { ApiError } from '@/lib/api';
import {
  createVideoPreviewUrl,
  formatFileSize,
  revokeVideoPreviewUrl,
  validateVideoFile,
} from '@/lib/videoUpload';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/paths';

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  file?: string;
  submit?: string;
}

export function UploadPage() {
  const navigate = useNavigate();
  const { uploadVideo, isUploading } = useVideoLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    return () => {
      if (previewUrl) revokeVideoPreviewUrl(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;

    const validation = validateVideoFile(selected);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, file: validation.error }));
      return;
    }

    if (previewUrl) revokeVideoPreviewUrl(previewUrl);
    setFile(selected);
    setPreviewUrl(createVideoPreviewUrl(selected));
    setErrors((prev) => ({ ...prev, file: undefined, submit: undefined }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0] ?? null);
  };

  const clearFile = () => {
    if (previewUrl) revokeVideoPreviewUrl(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = (): FormErrors => {
    const next: FormErrors = {};

    if (title.trim().length < 3) {
      next.title = 'Le titre doit contenir au moins 3 caractères.';
    }
    if (description.trim().length < 10) {
      next.description = 'La description doit contenir au moins 10 caractères.';
    }
    if (!category) {
      next.category = 'Sélectionnez une catégorie.';
    }
    if (!file) {
      next.file = 'Sélectionnez un fichier vidéo.';
    }

    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!file || !category) return;

    try {
      const video = await uploadVideo({
        title: title.trim(),
        description: description.trim(),
        category,
        file,
      });

      navigate(ROUTES.video(video.id), {
        replace: true,
        state: { uploadSuccess: true },
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Échec de l'upload. Vérifiez que le serveur est bien démarré.";
      setErrors({ submit: message });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to={ROUTES.dashboard}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text-primary">Uploader une vidéo</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Ajoutez un contenu pédagogique. Les fichiers sont enregistrés sur le serveur et
            disponibles pour tous les utilisateurs connectés.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleInputChange}
        />

        {!previewUrl ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition',
              isDragging
                ? 'border-brand-400 bg-brand-50'
                : 'border-border bg-surface-muted hover:border-brand-300 hover:bg-brand-50/30',
              errors.file && 'border-red-300 bg-red-50/30',
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <CloudUpload className="h-8 w-8 text-brand-600" />
            </div>
            <p className="mt-4 text-sm font-semibold text-text-primary">
              Glissez-déposez votre vidéo ici
            </p>
            <p className="mt-1 text-xs text-text-muted">MP4, WebM ou MOV — max 500 Mo</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
            >
              Parcourir les fichiers
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-black">
            <div className="relative aspect-video">
              <video src={previewUrl} controls className="h-full w-full" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 text-white transition hover:bg-black/80"
                aria-label="Retirer le fichier"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {file && (
              <div className="flex items-center gap-2 border-t border-white/10 bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                <FileVideo className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="ml-auto shrink-0 text-text-muted">{formatFileSize(file.size)}</span>
              </div>
            )}
          </div>
        )}

        {errors.file && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.file}
          </p>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary"
            >
              <Type className="h-4 w-4 text-text-muted" />
              Titre de la vidéo
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Ex. Introduction à React et TypeScript"
              className={cn(
                'w-full rounded-xl border bg-surface-muted px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-100',
                errors.title ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-brand-400',
              )}
            />
            {errors.title && <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Décrivez le contenu et les objectifs pédagogiques..."
              className={cn(
                'w-full resize-none rounded-xl border bg-surface-muted px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-100',
                errors.description
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-border focus:border-brand-400',
              )}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary"
            >
              <Tag className="h-4 w-4 text-text-muted" />
              Catégorie
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as VideoCategory);
                setErrors((prev) => ({ ...prev, category: undefined }));
              }}
              className={cn(
                'w-full rounded-xl border bg-surface-muted px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-100',
                errors.category ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-brand-400',
              )}
            >
              <option value="" disabled>
                Sélectionner une catégorie
              </option>
              {VIDEO_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-xs text-red-600">{errors.category}</p>}
          </div>

          {errors.submit && (
            <p className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errors.submit}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link
              to={ROUTES.dashboard}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-muted"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Publier la vidéo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

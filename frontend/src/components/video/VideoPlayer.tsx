import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import '@/components/video/videojs-theme.css';

export interface VideoPlayerHandle {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

export interface VideoPlayerProps {
  src: string;
  mimeType?: string;
  poster?: string;
  title: string;
  onTimeUpdate?: (currentTime: number) => void;
}

function resolveSourceType(src: string, mimeType?: string): string {
  if (mimeType && mimeType.startsWith('video/')) return mimeType;
  if (src.includes('.webm')) return 'video/webm';
  return 'video/mp4';
}

function isLocalVideoSource(src: string): boolean {
  return (
    src.startsWith('blob:') ||
    src.startsWith('data:') ||
    src.startsWith('/uploads/') ||
    src.includes('/uploads/videos/')
  );
}

/** Lecteur HTML5 natif — fiable pour les vidéos uploadées (blob URL) */
const NativeVideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function NativeVideoPlayer({ src, mimeType, poster, title, onTimeUpdate }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      },
    }));

    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
        <div className="video-learning-player relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            poster={poster}
            controls
            playsInline
            preload="auto"
            className="h-full w-full object-contain"
            aria-label={title}
            onTimeUpdate={(event) => onTimeUpdate?.(event.currentTarget.currentTime)}
            onError={() => {
              console.error('Erreur lecture vidéo locale:', mimeType, src);
            }}
          >
            <source src={src} type={resolveSourceType(src, mimeType)} />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      </div>
    );
  },
);

/** Video.js — pour les vidéos distantes (mock seed) */
const VideoJsPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoJsPlayer({ src, mimeType, poster, title, onTimeUpdate }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Player | null>(null);
    const onTimeUpdateRef = useRef(onTimeUpdate);

    useEffect(() => {
      onTimeUpdateRef.current = onTimeUpdate;
    }, [onTimeUpdate]);

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.currentTime() ?? videoRef.current?.currentTime ?? 0,
      seekTo: (seconds: number) => {
        if (playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.currentTime(seconds);
        } else if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      },
    }));

    useEffect(() => {
      const element = videoRef.current;
      if (!element || playerRef.current) return;

      const player = videojs(element, {
        controls: true,
        fill: true,
        preload: 'auto',
        techOrder: ['html5'],
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: { pictureInPictureToggle: false },
        poster,
        sources: [{ src, type: resolveSourceType(src, mimeType) }],
      });

      player.on('timeupdate', () => {
        onTimeUpdateRef.current?.(player.currentTime() ?? 0);
      });

      playerRef.current = player;

      return () => {
        if (playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.dispose();
        }
        playerRef.current = null;
      };
    }, [src, mimeType, poster, title]);

    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
        <div className="video-learning-player relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-theme-vlh h-full w-full"
            playsInline
            aria-label={title}
          />
        </div>
      </div>
    );
  },
);

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(props, ref) {
    if (isLocalVideoSource(props.src)) {
      return <NativeVideoPlayer ref={ref} {...props} />;
    }
    return <VideoJsPlayer ref={ref} {...props} />;
  },
);

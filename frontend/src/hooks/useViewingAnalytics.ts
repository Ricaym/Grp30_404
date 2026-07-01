import { useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export type ViewingEventType = 'play' | 'pause' | 'seek' | 'stop' | 'complete';

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'Mobile';
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

export function useViewingAnalytics(videoId: string, durationSeconds: number) {
  const isPlayingRef = useRef(false);
  const device = useRef(detectDevice());

  const sendEvent = useCallback(
    (event: ViewingEventType, timestamp: number) => {
      void api
        .recordViewingEvent(videoId, {
          event,
          timestamp,
          videoDuration: durationSeconds,
          device: device.current,
        })
        .catch(() => {
          // Ne pas bloquer la lecture si l'enregistrement échoue.
        });
    },
    [durationSeconds, videoId],
  );

  const handlePlay = useCallback(
    (currentTime: number) => {
      isPlayingRef.current = true;
      sendEvent('play', currentTime);
    },
    [sendEvent],
  );

  const handlePause = useCallback(
    (currentTime: number) => {
      isPlayingRef.current = false;
      sendEvent('pause', currentTime);
    },
    [sendEvent],
  );

  const handleSeeked = useCallback(
    (currentTime: number) => {
      sendEvent('seek', currentTime);
    },
    [sendEvent],
  );

  const handleEnded = useCallback(
    (currentTime: number) => {
      isPlayingRef.current = false;
      sendEvent('complete', currentTime);
    },
    [sendEvent],
  );

  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        sendEvent('stop', durationSeconds);
      }
    };
  }, [durationSeconds, sendEvent]);

  return {
    handlePlay,
    handlePause,
    handleSeeked,
    handleEnded,
  };
}

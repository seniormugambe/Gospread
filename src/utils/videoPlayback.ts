import { VideoStream } from '../data/gospelData';

export type PlaybackKind = 'youtube' | 'direct' | 'none';

export interface ResolvedPlayback {
  kind: PlaybackKind;
  youtubeId?: string;
  directUrl?: string;
}

/** Extract a YouTube video ID from URLs or a bare 11-character ID. */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1).split('/')[0] || null;
    }

    const v = url.searchParams.get('v');
    if (v) return v;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const liveIdx = pathParts.indexOf('live');
    if (liveIdx !== -1) return pathParts[liveIdx + 1] || null;
    const embedIdx = pathParts.indexOf('embed');
    if (embedIdx !== -1) return pathParts[embedIdx + 1] || null;
    const shortsIdx = pathParts.indexOf('shorts');
    if (shortsIdx !== -1) return pathParts[shortsIdx + 1] || null;
  } catch {
    // Not a URL
  }

  return null;
}

const DIRECT_VIDEO_PATTERN =
  /\.(mp4|webm|ogg|m4v|mov)(\?|$)/i;

/** True when the string looks like a direct progressive or HLS stream URL. */
export function isDirectVideoUrl(url: string): boolean {
  if (!url.startsWith('http')) return false;
  if (DIRECT_VIDEO_PATTERN.test(url)) return true;
  if (/\.m3u8(\?|$)/i.test(url)) return true;
  // Known demo / CDN hosts used in seed data
  if (/mixkit\.co|gtv-videos-bucket|commondatastorage\.googleapis\.com/i.test(url)) {
    return true;
  }
  return false;
}

/** Resolve how a VideoStream should be played in the browser. */
export function resolvePlaybackSource(video: Pick<VideoStream, 'id' | 'videoUrl' | 'streamUrl'>): ResolvedPlayback {
  const candidates = [video.streamUrl, video.videoUrl].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const youtubeId = extractYouTubeId(candidate);
    if (youtubeId) return { kind: 'youtube', youtubeId };

    if (isDirectVideoUrl(candidate)) {
      return { kind: 'direct', directUrl: candidate };
    }
  }

  return { kind: 'none' };
}

export function parsePlaybackSpeed(speedLabel: string): number {
  const parsed = parseFloat(speedLabel.replace(/x$/i, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.min(2, Math.max(0.25, parsed));
}

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

/** Load the YouTube IFrame Player API once per page. */
export function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });

  return youtubeApiPromise;
}

export type { YouTubePlayer };

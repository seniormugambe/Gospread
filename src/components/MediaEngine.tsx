import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { create as createIvsPlayer, isPlayerSupported, PlayerEventType, PlayerState } from 'amazon-ivs-player';
import ivsWasmWorkerUrl from 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js?url';
import ivsWasmBinaryUrl from 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm?url';
import {
  describeYouTubeError,
  loadYouTubeIframeApi,
  ResolvedPlayback,
  YouTubePlayer,
} from '../utils/videoPlayback';

export type PlayerStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';

export interface MediaEngineHandle {
  seekTo: (seconds: number) => void;
  seekBy: (deltaSeconds: number) => void;
}

interface MediaEngineProps {
  playback: ResolvedPlayback;
  isPlaying: boolean;
  isMuted: boolean;
  playbackRate: number;
  poster?: string;
  hidden?: boolean;
  onStatusChange: (status: PlayerStatus) => void;
  onPlayingChange: (playing: boolean) => void;
  onTimeUpdate: (currentSec: number, durationSec: number) => void;
  onError: (message: string) => void;
}

const LOAD_TIMEOUT_MS = 20000;

const MEDIA_ERROR_MESSAGES: Record<number, string> = {
  1: 'Playback was cancelled.',
  2: 'A network error interrupted the video.',
  3: 'The video file is corrupted or uses an unsupported format.',
  4: 'This video source is unavailable or not supported by your browser.',
};

const MediaEngine = forwardRef<MediaEngineHandle, MediaEngineProps>(function MediaEngine(
  { playback, isPlaying, isMuted, playbackRate, poster, hidden, onStatusChange, onPlayingChange, onTimeUpdate, onError },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const ivsPlayerRef = useRef<ReturnType<typeof createIvsPlayer> | null>(null);
  const statusRef = useRef<PlayerStatus>('loading');
  const [ytReady, setYtReady] = useState(false);

  const callbacksRef = useRef({ onStatusChange, onPlayingChange, onTimeUpdate, onError });
  const stateRef = useRef({ isPlaying, isMuted, playbackRate });
  callbacksRef.current = { onStatusChange, onPlayingChange, onTimeUpdate, onError };
  stateRef.current = { isPlaying, isMuted, playbackRate };

  const isHls = playback.kind === 'direct' && /\.m3u8(\?|$)/i.test(playback.directUrl ?? '');
  const useIvs = isHls && isPlayerSupported;
  const sourceKey = `${playback.kind}:${playback.youtubeId ?? playback.directUrl ?? ''}`;

  const emitStatus = (status: PlayerStatus) => {
    statusRef.current = status;
    callbacksRef.current.onStatusChange(status);
  };
  const emitError = (message: string) => {
    emitStatus('error');
    callbacksRef.current.onError(message);
  };

  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      const target = Math.max(0, seconds);
      if (useIvs) ivsPlayerRef.current?.seekTo(target);
      else if (playback.kind === 'direct' && videoRef.current) videoRef.current.currentTime = target;
      else if (playback.kind === 'youtube') ytPlayerRef.current?.seekTo(target, true);
    },
    seekBy: (delta) => {
      if (useIvs && ivsPlayerRef.current) {
        ivsPlayerRef.current.seekTo(Math.max(0, ivsPlayerRef.current.getPosition() + delta));
      } else if (playback.kind === 'direct' && videoRef.current) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + delta);
      } else if (playback.kind === 'youtube' && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(Math.max(0, ytPlayerRef.current.getCurrentTime() + delta), true);
      }
    },
  }));

  // A source that never becomes ready should surface an error instead of spinning forever.
  useEffect(() => {
    if (playback.kind === 'none') return;
    statusRef.current = 'loading';
    const timer = window.setTimeout(() => {
      if (statusRef.current === 'loading') emitError('The video is taking too long to load.');
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [sourceKey]);

  // Native <video> playback (progressive files and Safari HLS)
  useEffect(() => {
    const el = videoRef.current;
    if (!el || playback.kind !== 'direct' || useIvs || !playback.directUrl) return;

    const tryPlay = () => {
      if (!stateRef.current.isPlaying) return;
      el.play().catch((err: DOMException) => {
        if (err.name === 'NotAllowedError') {
          callbacksRef.current.onPlayingChange(false);
          emitStatus('paused');
        } else if (err.name !== 'AbortError') {
          emitError('This video could not be played.');
        }
      });
    };

    const listeners: Array<[string, () => void]> = [
      ['loadedmetadata', () => emitStatus('ready')],
      ['canplay', () => {
        if (statusRef.current === 'loading' || statusRef.current === 'buffering') emitStatus('ready');
        tryPlay();
      }],
      ['waiting', () => emitStatus('buffering')],
      ['playing', () => {
        emitStatus('playing');
        callbacksRef.current.onPlayingChange(true);
      }],
      ['pause', () => {
        if (el.ended) return;
        emitStatus('paused');
        callbacksRef.current.onPlayingChange(false);
      }],
      ['ended', () => emitStatus('ended')],
      ['timeupdate', () => callbacksRef.current.onTimeUpdate(el.currentTime, Number.isFinite(el.duration) ? el.duration : 0)],
      ['error', () => emitError(MEDIA_ERROR_MESSAGES[el.error?.code ?? 4] ?? MEDIA_ERROR_MESSAGES[4])],
    ];
    listeners.forEach(([type, handler]) => el.addEventListener(type, handler));

    el.src = playback.directUrl;
    el.muted = stateRef.current.isMuted;
    el.playbackRate = stateRef.current.playbackRate;
    el.load();

    return () => {
      listeners.forEach(([type, handler]) => el.removeEventListener(type, handler));
      el.pause();
      el.removeAttribute('src');
      el.load();
    };
  }, [sourceKey, useIvs]);

  // HLS playback through Amazon IVS
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !useIvs || !playback.directUrl) return;

    const player = createIvsPlayer({ wasmWorker: ivsWasmWorkerUrl, wasmBinary: ivsWasmBinaryUrl });
    ivsPlayerRef.current = player;
    player.attachHTMLVideoElement(el);
    player.setMuted(stateRef.current.isMuted);
    player.setPlaybackRate(stateRef.current.playbackRate);

    const onReady = () => {
      emitStatus('ready');
      if (stateRef.current.isPlaying) player.play();
    };
    const onPlaying = () => {
      emitStatus('playing');
      callbacksRef.current.onPlayingChange(true);
    };
    const onBuffering = () => emitStatus('buffering');
    const onIdle = () => emitStatus('paused');
    const onEnded = () => emitStatus('ended');
    const onTime = (current: number) => callbacksRef.current.onTimeUpdate(current, player.getDuration());
    const onPlayerError = (err: { message?: string }) => emitError(err?.message || 'The live stream could not be loaded.');

    player.addEventListener(PlayerState.READY, onReady);
    player.addEventListener(PlayerState.PLAYING, onPlaying);
    player.addEventListener(PlayerState.BUFFERING, onBuffering);
    player.addEventListener(PlayerState.IDLE, onIdle);
    player.addEventListener(PlayerState.ENDED, onEnded);
    player.addEventListener(PlayerEventType.TIME_UPDATE, onTime);
    player.addEventListener(PlayerEventType.ERROR, onPlayerError);
    player.load(playback.directUrl);

    return () => {
      player.removeEventListener(PlayerState.READY, onReady);
      player.removeEventListener(PlayerState.PLAYING, onPlaying);
      player.removeEventListener(PlayerState.BUFFERING, onBuffering);
      player.removeEventListener(PlayerState.IDLE, onIdle);
      player.removeEventListener(PlayerState.ENDED, onEnded);
      player.removeEventListener(PlayerEventType.TIME_UPDATE, onTime);
      player.removeEventListener(PlayerEventType.ERROR, onPlayerError);
      player.pause();
      player.delete();
      if (ivsPlayerRef.current === player) ivsPlayerRef.current = null;
    };
  }, [sourceKey, useIvs]);

  // YouTube IFrame player. The API replaces its host node, so each run owns a fresh child element.
  useEffect(() => {
    const wrapper = ytHostRef.current;
    if (!wrapper || playback.kind !== 'youtube' || !playback.youtubeId) return;

    let cancelled = false;
    setYtReady(false);

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled) return;
        const host = document.createElement('div');
        wrapper.appendChild(host);

        ytPlayerRef.current = new window.YT!.Player(host, {
          videoId: playback.youtubeId,
          playerVars: {
            autoplay: stateRef.current.isPlaying ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              ytPlayerRef.current = event.target;
              if (stateRef.current.isMuted) event.target.mute();
              event.target.setPlaybackRate(stateRef.current.playbackRate);
              setYtReady(true);
              emitStatus('ready');
            },
            onStateChange: (event) => {
              if (cancelled) return;
              switch (event.data) {
                case 1:
                  emitStatus('playing');
                  callbacksRef.current.onPlayingChange(true);
                  break;
                case 2:
                  emitStatus('paused');
                  callbacksRef.current.onPlayingChange(false);
                  break;
                case 3:
                  emitStatus('buffering');
                  break;
                case 0:
                  emitStatus('ended');
                  break;
              }
            },
            onError: (event) => {
              if (!cancelled) emitError(describeYouTubeError(event.data));
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) emitError('The YouTube player could not be loaded. Check your connection or ad blocker.');
      });

    const poll = window.setInterval(() => {
      const player = ytPlayerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const current = player.getCurrentTime();
      if (Number.isFinite(current)) callbacksRef.current.onTimeUpdate(current, player.getDuration() || 0);
    }, 500);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      wrapper.replaceChildren();
      setYtReady(false);
    };
  }, [sourceKey]);

  // Apply play / pause requests from the app
  useEffect(() => {
    if (playback.kind === 'direct' && !useIvs) {
      const el = videoRef.current;
      if (!el || statusRef.current === 'loading') return;
      if (isPlaying && el.paused) {
        el.play().catch((err: DOMException) => {
          if (err.name === 'NotAllowedError') callbacksRef.current.onPlayingChange(false);
        });
      } else if (!isPlaying && !el.paused) {
        el.pause();
      }
    } else if (useIvs) {
      if (isPlaying) ivsPlayerRef.current?.play();
      else ivsPlayerRef.current?.pause();
    } else if (playback.kind === 'youtube' && ytReady) {
      if (isPlaying) ytPlayerRef.current?.playVideo();
      else ytPlayerRef.current?.pauseVideo();
    }
  }, [isPlaying, useIvs, playback.kind, ytReady]);

  useEffect(() => {
    if (playback.kind === 'direct' && !useIvs) {
      if (videoRef.current) videoRef.current.muted = isMuted;
    } else if (useIvs) {
      ivsPlayerRef.current?.setMuted(isMuted);
    } else if (playback.kind === 'youtube' && ytReady) {
      if (isMuted) ytPlayerRef.current?.mute();
      else ytPlayerRef.current?.unMute();
    }
  }, [isMuted, useIvs, playback.kind, ytReady]);

  useEffect(() => {
    if (playback.kind === 'direct' && !useIvs) {
      if (videoRef.current) videoRef.current.playbackRate = playbackRate;
    } else if (useIvs) {
      ivsPlayerRef.current?.setPlaybackRate(playbackRate);
    } else if (playback.kind === 'youtube' && ytReady) {
      ytPlayerRef.current?.setPlaybackRate(playbackRate);
    }
  }, [playbackRate, useIvs, playback.kind, ytReady]);

  const visibility = hidden ? 'opacity-0 pointer-events-none' : '';

  if (playback.kind === 'direct') {
    return (
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className={`absolute inset-0 h-full w-full bg-black object-contain ${visibility}`}
      />
    );
  }

  if (playback.kind === 'youtube') {
    return (
      <div
        ref={ytHostRef}
        className={`absolute inset-0 h-full w-full bg-black pointer-events-none [&_iframe]:h-full [&_iframe]:w-full ${visibility}`}
      />
    );
  }

  return null;
});

export default MediaEngine;

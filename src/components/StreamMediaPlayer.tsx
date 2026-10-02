import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { create as createIvsPlayer, isPlayerSupported, PlayerEventType, PlayerState } from 'amazon-ivs-player';
import ivsWasmWorkerUrl from 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js?url';
import ivsWasmBinaryUrl from 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm?url';
import {
  loadYouTubeIframeApi,
  parsePlaybackSpeed,
  ResolvedPlayback,
  YouTubePlayer,
} from '../utils/videoPlayback';

export interface StreamMediaPlayerHandle {
  seek: (percent: number, durationSec: number) => void;
}

interface StreamMediaPlayerProps {
  playback: ResolvedPlayback;
  videoId: string;
  isPlaying: boolean;
  isMuted: boolean;
  playbackSpeed: string;
  playbackMode: 'video' | 'audio';
  poster?: string;
  className?: string;
  onReady?: () => void;
  onTimeUpdate?: (currentSec: number, durationSec: number) => void;
  onEnded?: () => void;
}

const StreamMediaPlayer = forwardRef<StreamMediaPlayerHandle, StreamMediaPlayerProps>(
  function StreamMediaPlayer(
    {
      playback,
      videoId,
      isPlaying,
      isMuted,
      playbackSpeed,
      playbackMode,
      poster,
      className = 'absolute inset-0 h-full w-full',
      onReady,
      onTimeUpdate,
      onEnded,
    },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const ytContainerRef = useRef<HTMLDivElement>(null);
    const ytPlayerRef = useRef<YouTubePlayer | null>(null);
    const ivsPlayerRef = useRef<ReturnType<typeof createIvsPlayer> | null>(null);
    const [ytReady, setYtReady] = useState(false);
    const callbacksRef = useRef({ onReady, onTimeUpdate, onEnded });
    const playbackStateRef = useRef({ isPlaying, isMuted });
    const isIvsHlsPlayback = playback.kind === 'direct' && Boolean(playback.directUrl?.match(/\.m3u8(?:\?|$)/i));
    const useIvsPlayer = isIvsHlsPlayback && isPlayerSupported;

    useEffect(() => {
      callbacksRef.current = { onReady, onTimeUpdate, onEnded };
    }, [onReady, onTimeUpdate, onEnded]);

    useEffect(() => {
      playbackStateRef.current = { isPlaying, isMuted };
    }, [isPlaying, isMuted]);

    useImperativeHandle(ref, () => ({
      seek: (percent: number, durationSec: number) => {
        if (durationSec <= 0) return;
        const targetSec = (percent / 100) * durationSec;

        if (playback.kind === 'direct' && !useIvsPlayer && videoRef.current) {
          videoRef.current.currentTime = targetSec;
          return;
        }

        if (playback.kind === 'youtube' && ytPlayerRef.current) {
          ytPlayerRef.current.seekTo(targetSec, true);
        }

        if (useIvsPlayer) {
          ivsPlayerRef.current?.seekTo(targetSec);
        }
      },
    }));

    useEffect(() => {
      const videoElement = videoRef.current;
      if (!videoElement || !useIvsPlayer || !playback.directUrl) return;

      const player = createIvsPlayer({ wasmWorker: ivsWasmWorkerUrl, wasmBinary: ivsWasmBinaryUrl });
      ivsPlayerRef.current = player;
      player.attachHTMLVideoElement(videoElement);
      player.setMuted(playbackStateRef.current.isMuted);

      const onReady = () => {
        callbacksRef.current.onReady?.();
        if (playbackStateRef.current.isPlaying) player.play();
      };
      const onTimeUpdate = (currentSec: number) => {
        callbacksRef.current.onTimeUpdate?.(currentSec, player.getDuration());
      };

      player.addEventListener(PlayerState.READY, onReady);
      player.addEventListener(PlayerEventType.TIME_UPDATE, onTimeUpdate);
      player.load(playback.directUrl);

      return () => {
        player.removeEventListener(PlayerState.READY, onReady);
        player.removeEventListener(PlayerEventType.TIME_UPDATE, onTimeUpdate);
        player.pause();
        player.delete();
        if (ivsPlayerRef.current === player) ivsPlayerRef.current = null;
      };
    }, [useIvsPlayer, playback.directUrl, videoId]);

    useEffect(() => {
      const el = videoRef.current;
      if (!el || playback.kind !== 'direct' || useIvsPlayer || !playback.directUrl) return;

      el.src = playback.directUrl;
      el.load();

      const handleLoaded = () => {
        callbacksRef.current.onReady?.();
        if (isPlaying) void el.play().catch(() => undefined);
      };
      const handleTimeUpdate = () => {
        callbacksRef.current.onTimeUpdate?.(el.currentTime, el.duration || 0);
      };
      const handleEnded = () => callbacksRef.current.onEnded?.();

      el.addEventListener('loadedmetadata', handleLoaded);
      el.addEventListener('timeupdate', handleTimeUpdate);
      el.addEventListener('ended', handleEnded);

      return () => {
        el.removeEventListener('loadedmetadata', handleLoaded);
        el.removeEventListener('timeupdate', handleTimeUpdate);
        el.removeEventListener('ended', handleEnded);
        el.removeAttribute('src');
        el.load();
      };
    }, [playback.kind, useIvsPlayer, playback.directUrl, videoId]);

    useEffect(() => {
      if (playback.kind !== 'youtube' || !playback.youtubeId) return;

      let cancelled = false;
      setYtReady(false);

      void loadYouTubeIframeApi().then(() => {
        if (cancelled || !ytContainerRef.current) return;

        ytPlayerRef.current?.destroy();
        ytPlayerRef.current = new window.YT!.Player(ytContainerRef.current, {
          videoId: playback.youtubeId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              ytPlayerRef.current = event.target;
              setYtReady(true);
              callbacksRef.current.onReady?.();
              if (isPlaying) event.target.playVideo();
              if (isMuted) event.target.mute();
              event.target.setPlaybackRate(parsePlaybackSpeed(playbackSpeed));
            },
          },
        });
      });

      const poll = window.setInterval(() => {
        const player = ytPlayerRef.current;
        if (!player) return;
        try {
          const current = player.getCurrentTime();
          const duration = player.getDuration();
          if (Number.isFinite(current)) {
            callbacksRef.current.onTimeUpdate?.(current, duration || 0);
          }
        } catch {
          // Player not ready yet
        }
      }, 500);

      return () => {
        cancelled = true;
        window.clearInterval(poll);
        ytPlayerRef.current?.destroy();
        ytPlayerRef.current = null;
        setYtReady(false);
      };
    }, [playback.kind, playback.youtubeId, videoId]);

    useEffect(() => {
      if (playback.kind === 'direct' && !useIvsPlayer) {
        const el = videoRef.current;
        if (!el) return;
        if (isPlaying) void el.play().catch(() => undefined);
        else el.pause();
        return;
      }

      if (playback.kind === 'youtube' && ytReady && ytPlayerRef.current) {
        if (isPlaying) ytPlayerRef.current.playVideo();
        else ytPlayerRef.current.pauseVideo();
      }
      if (useIvsPlayer && ivsPlayerRef.current) {
        if (isPlaying) ivsPlayerRef.current.play();
        else ivsPlayerRef.current.pause();
      }
    }, [isPlaying, useIvsPlayer, playback.kind, ytReady]);

    useEffect(() => {
      if (playback.kind === 'direct' && !useIvsPlayer) {
        const el = videoRef.current;
        if (el) el.muted = isMuted;
        return;
      }

      if (playback.kind === 'youtube' && ytReady && ytPlayerRef.current) {
        if (isMuted) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      }
      if (useIvsPlayer) ivsPlayerRef.current?.setMuted(isMuted);
    }, [isMuted, useIvsPlayer, playback.kind, ytReady]);

    useEffect(() => {
      const rate = parsePlaybackSpeed(playbackSpeed);
      if (playback.kind === 'direct' && !useIvsPlayer) {
        const el = videoRef.current;
        if (el) el.playbackRate = rate;
        return;
      }

      if (playback.kind === 'youtube' && ytReady && ytPlayerRef.current) {
        ytPlayerRef.current.setPlaybackRate(rate);
      }
    }, [useIvsPlayer, playbackSpeed, playback.kind, ytReady]);

    const hiddenForAudio = playbackMode === 'audio';

    if (playback.kind === 'direct') {
      return (
        <video
          ref={videoRef}
          poster={poster}
          playsInline
          className={`${className} object-cover ${hiddenForAudio ? 'opacity-0 pointer-events-none' : ''}`}
        />
      );
    }

    if (playback.kind === 'youtube') {
      return (
        <div
          ref={ytContainerRef}
          className={`${className} ${hiddenForAudio ? 'opacity-0 pointer-events-none' : ''}`}
        />
      );
    }

    return null;
  }
);

export default StreamMediaPlayer;

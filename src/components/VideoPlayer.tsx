import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  DollarSign,
  Download,
  ExternalLink,
  Gauge,
  Headphones,
  Loader2,
  Maximize2,
  Minimize2,
  PictureInPicture,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Share2,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { VideoStream } from '../data/gospelData';
import { GivingTarget } from './GivingModal';
import MediaEngine, { MediaEngineHandle, PlayerStatus } from './MediaEngine';
import { formatMediaTime, resolvePlaybackSource } from '../utils/videoPlayback';

interface VideoPlayerProps {
  video: VideoStream;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGivingModal: (target: GivingTarget) => void;
  onOpenFullscreen?: () => void;
  onTogglePip?: () => void;
  onDownloadVideo?: (video: VideoStream) => void;
  onPlaybackStarted?: (video: VideoStream) => void;
  onPlaybackProgress?: (video: VideoStream, positionSeconds: number, completed: boolean) => void;
  onPlaybackEnded?: (video: VideoStream) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const CONTROLS_HIDE_MS = 3000;
const SEEK_STEP_SEC = 10;

export default function VideoPlayer({
  video,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  onOpenGivingModal,
  onOpenFullscreen,
  onTogglePip,
  onDownloadVideo,
  onPlaybackStarted,
  onPlaybackProgress,
  onPlaybackEnded,
}: VideoPlayerProps) {
  const playback = useMemo(
    () => resolvePlaybackSource(video),
    [video.id, video.videoUrl, video.streamUrl]
  );
  const hasSource = playback.kind !== 'none';

  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MediaEngineHandle>(null);
  const hideTimerRef = useRef<number>();
  const currentSecRef = useRef(0);
  const durationSecRef = useRef(0);
  const playbackStartedRef = useRef(false);
  const lastProgressSnapshotRef = useRef<{ position: number; completed: boolean } | null>(null);

  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [controlsActive, setControlsActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  const isLiveStream = video.isLive || (hasSource && status !== 'loading' && durationSec === 0);
  const hasError = status === 'error';
  const isBusy = hasSource && !hasError && (status === 'loading' || status === 'buffering');

  useEffect(() => {
    setStatus('loading');
    setErrorMessage('');
    setCurrentSec(0);
    setDurationSec(0);
    setAudioOnly(false);
    setSpeedMenuOpen(false);
    currentSecRef.current = 0;
    durationSecRef.current = 0;
    playbackStartedRef.current = false;
    lastProgressSnapshotRef.current = null;
  }, [video.id, playback.kind, playback.youtubeId, playback.directUrl, retryKey]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  const revealControls = useCallback(() => {
    setControlsActive(true);
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setControlsActive(false), CONTROLS_HIDE_MS);
  }, []);

  const handleTimeUpdate = useCallback((current: number, duration: number) => {
    currentSecRef.current = current;
    durationSecRef.current = duration;
    setCurrentSec(current);
    setDurationSec(duration);
  }, []);

  // Keep app-level play state truthful when the media itself starts, stops, or is blocked.
  const handlePlayingChange = useCallback(
    (playing: boolean) => {
      if (playing !== isPlaying) onTogglePlay();
    },
    [isPlaying, onTogglePlay]
  );

  useEffect(() => {
    if (status !== 'playing' || playbackStartedRef.current || !hasSource || hasError) return;
    playbackStartedRef.current = true;
    onPlaybackStarted?.(video);
  }, [hasError, hasSource, onPlaybackStarted, status, video]);

  const reportWatchProgress = useCallback(
    (forceCompleted = false) => {
      if (!onPlaybackProgress || !hasSource || hasError) return;

      const position = Math.max(0, Math.floor(currentSecRef.current));
      const duration = Math.max(0, Math.floor(durationSecRef.current));
      const completed = forceCompleted || (duration > 0 && position >= Math.max(0, duration - 1));

      if (position <= 0 && !completed) return;

      const snapshot = { position, completed };
      const lastSnapshot = lastProgressSnapshotRef.current;
      if (lastSnapshot && lastSnapshot.position === snapshot.position && lastSnapshot.completed === snapshot.completed) {
        return;
      }

      lastProgressSnapshotRef.current = snapshot;
      onPlaybackProgress(video, position, completed);
    },
    [hasError, hasSource, onPlaybackProgress, video]
  );

  useEffect(() => {
    if (status !== 'playing' || !hasSource || hasError) return;

    const interval = window.setInterval(() => {
      reportWatchProgress(false);
    }, 15000);

    return () => {
      window.clearInterval(interval);
      reportWatchProgress(false);
    };
  }, [hasError, hasSource, reportWatchProgress, status]);

  useEffect(() => {
    if (status === 'ended') {
      reportWatchProgress(true);
      onPlaybackEnded?.(video);
    }
  }, [status]);

  const handleEngineError = useCallback(
    (message: string) => {
      setErrorMessage(message);
      if (isPlaying) onTogglePlay();
    },
    [isPlaying, onTogglePlay]
  );

  const seekBy = (delta: number) => {
    engineRef.current?.seekBy(delta);
    revealControls();
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenEnabled) {
      onOpenFullscreen?.();
      return;
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      onOpenFullscreen?.();
    }
  };

  const shareUrl = playback.kind === 'youtube'
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(playback.youtubeId ?? '')}`
    : video.videoUrl || window.location.href;

  const handleShare = async () => {
    const data = {
      title: video.title,
      text: `Watch "${video.title}" by ${video.speakerOrArtist} on Gospread`,
      url: shareUrl,
    };
    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 2200);
    } catch {
      // Share sheet dismissed or clipboard unavailable
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) {
      if (e.key !== 'f' && e.key !== 'm') return;
    }
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        if (hasSource && !hasError) onTogglePlay();
        break;
      case 'ArrowLeft':
      case 'j':
        e.preventDefault();
        seekBy(e.key === 'j' ? -SEEK_STEP_SEC : -5);
        break;
      case 'ArrowRight':
      case 'l':
        e.preventDefault();
        seekBy(e.key === 'l' ? SEEK_STEP_SEC : 5);
        break;
      case 'm':
        onToggleMute();
        break;
      case 'f':
        void toggleFullscreen();
        break;
      default:
        return;
    }
    revealControls();
  };

  const controlsVisible = controlsActive || !isPlaying || speedMenuOpen || hasError || !hasSource;
  const progressPct = durationSec > 0 ? Math.min(100, (currentSec / durationSec) * 100) : 0;
  const showCenterPlay = hasSource && !hasError && !isPlaying && status !== 'loading';
  const externalUrl = playback.kind === 'youtube' ? shareUrl : playback.directUrl;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`Video player: ${video.title}`}
      onKeyDown={handleKeyDown}
      onMouseMove={revealControls}
      onMouseLeave={() => isPlaying && setControlsActive(false)}
      onFocus={revealControls}
      className={`relative w-full overflow-hidden bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        isFullscreen ? 'h-full' : 'aspect-video rounded-2xl border border-slate-800 shadow-2xl'
      } ${isPlaying && !controlsVisible ? 'cursor-none' : ''}`}
    >
      {video.thumbnail && (status === 'loading' || audioOnly || !hasSource) && (
        <img
          src={video.thumbnail}
          alt=""
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full object-cover ${hasSource ? 'opacity-40 blur-sm' : 'opacity-30'}`}
        />
      )}

      {hasSource && !hasError && (
        <MediaEngine
          key={`${video.id}-${retryKey}`}
          ref={engineRef}
          playback={playback}
          isPlaying={isPlaying}
          isMuted={isMuted}
          playbackRate={speed}
          poster={video.thumbnail}
          hidden={audioOnly}
          onStatusChange={setStatus}
          onPlayingChange={handlePlayingChange}
          onTimeUpdate={handleTimeUpdate}
          onError={handleEngineError}
        />
      )}

      {/* Click surface: toggles playback and sits above the iframe */}
      {hasSource && !hasError && (
        <button
          type="button"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          onClick={() => {
            onTogglePlay();
            revealControls();
          }}
          onDoubleClick={() => void toggleFullscreen()}
          className="absolute inset-0 z-10 cursor-[inherit] focus:outline-none"
        />
      )}

      {audioOnly && hasSource && !hasError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt=""
              className={`h-28 w-28 rounded-full object-cover ring-4 ring-amber-400/40 sm:h-36 sm:w-36 ${
                isPlaying ? 'animate-[spin_24s_linear_infinite]' : ''
              }`}
            />
          )}
          <div>
            <p className="line-clamp-1 text-sm font-bold sm:text-base">{video.title}</p>
            <p className="text-xs text-slate-300">{video.speakerOrArtist}</p>
          </div>
        </div>
      )}

      {isBusy && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400" aria-label="Loading" />
        </div>
      )}

      {showCenterPlay && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-2xl">
            <Play className="ml-1 h-8 w-8 fill-slate-950" />
          </span>
        </div>
      )}

      {!hasSource && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/80 px-6 text-center">
          {video.isLive ? <Radio className="h-10 w-10 text-red-500" /> : <AlertTriangle className="h-10 w-10 text-amber-400" />}
          <div>
            <h2 className="text-base font-bold">
              {video.isLive ? 'This live stream is not broadcasting' : 'No playable source'}
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-400">
              {video.isLive
                ? 'The channel has not connected a video source yet. Check back when the service starts.'
                : 'This video has no supported link, so it cannot be played here.'}
            </p>
          </div>
        </div>
      )}

      {hasError && (
        <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <div>
            <h2 className="text-base font-bold">We couldn't play this video</h2>
            <p className="mt-1 max-w-md text-xs text-slate-300">{errorMessage || 'Something went wrong while loading the video.'}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-slate-600 px-4 py-1.5 text-xs font-bold text-slate-100 transition hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {playback.kind === 'youtube' ? 'Watch on YouTube' : 'Open source'}
              </a>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between"
          >
            <div className="pointer-events-auto flex items-start justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isLiveStream && hasSource && (
                    <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                    </span>
                  )}
                  <h2 className="line-clamp-1 text-sm font-bold">{video.title}</h2>
                </div>
                <p className="line-clamp-1 text-xs text-slate-300">{video.churchOrMinistry}</p>
              </div>

              {hasSource && !hasError && (
                <div className="flex shrink-0 rounded-full border border-slate-700 bg-black/60 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    aria-pressed={!audioOnly}
                    onClick={() => setAudioOnly(false)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${!audioOnly ? 'bg-red-600' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Tv className="h-3 w-3" /> Watch
                  </button>
                  <button
                    type="button"
                    aria-pressed={audioOnly}
                    onClick={() => setAudioOnly(true)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${audioOnly ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Headphones className="h-3 w-3" /> Listen
                  </button>
                </div>
              )}
            </div>

            <div className="pointer-events-auto space-y-1.5 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2.5 pt-8 sm:px-4">
              {hasSource && !hasError && !isLiveStream && durationSec > 0 && (
                <input
                  type="range"
                  min={0}
                  max={durationSec}
                  step={0.1}
                  value={Math.min(currentSec, durationSec)}
                  aria-label="Seek"
                  aria-valuetext={`${formatMediaTime(currentSec)} of ${formatMediaTime(durationSec)}`}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setCurrentSec(next);
                    engineRef.current?.seekTo(next);
                  }}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full accent-amber-500"
                  style={{
                    background: `linear-gradient(to right, #f59e0b ${progressPct}%, rgba(148,163,184,0.35) ${progressPct}%)`,
                  }}
                />
              )}

              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1 sm:gap-2">
                  <IconButton
                    label={isPlaying ? 'Pause' : 'Play'}
                    onClick={onTogglePlay}
                    disabled={!hasSource || hasError}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </IconButton>
                  {!isLiveStream && hasSource && (
                    <>
                      <IconButton label="Back 10 seconds" onClick={() => seekBy(-SEEK_STEP_SEC)} disabled={hasError}>
                        <RotateCcw className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Forward 10 seconds" onClick={() => seekBy(SEEK_STEP_SEC)} disabled={hasError}>
                        <RotateCw className="h-4 w-4" />
                      </IconButton>
                    </>
                  )}
                  <IconButton label={isMuted ? 'Unmute' : 'Mute'} onClick={onToggleMute} disabled={!hasSource}>
                    {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                  </IconButton>
                  <span className="font-mono text-[11px] text-slate-300">
                    {!hasSource || hasError
                      ? '--:--'
                      : isLiveStream
                        ? 'LIVE'
                        : `${formatMediaTime(currentSec)} / ${formatMediaTime(durationSec)}`}
                  </span>

                  {hasSource && !isLiveStream && (
                    <div className="relative">
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={speedMenuOpen}
                        onClick={() => setSpeedMenuOpen((open) => !open)}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold transition ${
                          speed !== 1 ? 'border-amber-400 bg-amber-500 text-slate-950' : 'border-slate-700 bg-slate-900/90 hover:bg-slate-800'
                        }`}
                      >
                        <Gauge className="h-3 w-3" /> {speed}x
                      </button>
                      {speedMenuOpen && (
                        <div role="menu" className="absolute bottom-full left-0 z-40 mb-2 w-24 rounded-xl border border-slate-700 bg-slate-950/95 p-1 shadow-2xl">
                          {SPEEDS.map((value) => (
                            <button
                              key={value}
                              type="button"
                              role="menuitemradio"
                              aria-checked={speed === value}
                              onClick={() => {
                                setSpeed(value);
                                setSpeedMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2 py-1 font-mono text-[11px] transition ${
                                speed === value ? 'bg-amber-500 font-bold text-slate-950' : 'hover:bg-slate-800'
                              }`}
                            >
                              <span>{value === 1 ? 'Normal' : `${value}x`}</span>
                              {speed === value && <Check className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenGivingModal({
                        id: `video-${video.id}`,
                        name: video.churchOrMinistry,
                        avatar: video.channelAvatar,
                        type: 'church',
                        categoryTitle: `Sow Seed for ${video.speakerOrArtist}`,
                      })
                    }
                    className="hidden items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-slate-950 transition hover:bg-emerald-400 sm:flex"
                  >
                    <DollarSign className="h-3 w-3" /> Sow Seed
                  </button>
                  <IconButton label={shareState === 'copied' ? 'Link copied' : 'Share'} onClick={handleShare}>
                    {shareState === 'copied' ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                  </IconButton>
                  {onDownloadVideo && (
                    <IconButton label="Download for offline" onClick={() => onDownloadVideo(video)}>
                      <Download className="h-4 w-4" />
                    </IconButton>
                  )}
                  {onTogglePip && (
                    <IconButton label="Mini player" onClick={onTogglePip}>
                      <PictureInPicture className="h-4 w-4" />
                    </IconButton>
                  )}
                  <IconButton label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => void toggleFullscreen()}>
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </IconButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg p-1.5 transition hover:bg-white/10 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

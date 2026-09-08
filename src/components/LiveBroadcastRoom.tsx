import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  ExternalLink,
  Radio,
  Square,
  Wifi,
  WifiOff,
  Youtube,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { UserSession } from './AuthModal';
import { extractYouTubeId } from '../utils/videoPlayback';

interface LiveBroadcastRoomProps {
  currentUser?: UserSession;
  title: string;
  description: string;
  speaker: string;
  category: string;
  scripture: string;
  mode: 'quick' | 'studio';
  onEnd: (data: {
    title: string;
    description: string;
    speaker: string;
    scripture: string;
    category: string;
    durationMinutes: number;
    durationFormatted: string;
    totalWorshippers: number;
    peakWorshippers: number;
    prayersCount: number;
    thumbnail: string;
    videoUrl: string;
  }) => void;
  onBack: () => void;
}

export default function LiveBroadcastRoom({
  currentUser,
  title,
  description,
  speaker,
  category,
  scripture,
  mode,
  onEnd,
  onBack,
}: LiveBroadcastRoomProps) {
  const [youtubeInput, setYoutubeInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [inputError, setInputError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copied, setCopied] = useState<'rtmp' | 'key' | null>(null);

  // Timer only runs once we have a video ID loaded
  useEffect(() => {
    if (!isConnected) return;
    const timer = window.setInterval(() => setElapsedSeconds(v => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isConnected]);

  const handleLoadVideo = () => {
    setInputError('');
    const id = extractYouTubeId(youtubeInput);
    if (!id) {
      setInputError(
        'Paste a valid YouTube Live URL (e.g. https://youtube.com/watch?v=...) or an 11-character video ID.'
      );
      return;
    }
    setVideoId(id);
    setIsConnected(true);
    setElapsedSeconds(0);
  };

  const handleDisconnect = () => {
    setVideoId(null);
    setIsConnected(false);
    setElapsedSeconds(0);
    setYoutubeInput('');
  };

  const handleEndBroadcast = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    onEnd({
      title: title || 'Live Broadcast Recording',
      description,
      speaker,
      scripture,
      category: category || 'Live Worship',
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      durationFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      totalWorshippers: 0,
      peakWorshippers: 0,
      prayersCount: 0,
      thumbnail: videoId
        ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        : '',
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '',
    });
  };

  const copyToClipboard = (text: string, key: 'rtmp' | 'key') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // YouTube RTMPS ingest info (for OBS/encoder setup)
  const ytRtmpUrl = 'rtmp://a.rtmp.youtube.com/live2';
  const ytRtmpTip =
    'Stream Key comes from YouTube Studio → Go Live → Stream tab. Keep it private.';

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-3 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* ── HEADER BAR ── */}
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-[#141416] p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <Youtube className="h-6 w-6 text-red-500" />
            <div>
              <h1 className="text-lg font-black">YOUTUBE LIVE BROADCAST</h1>
              <p className="text-xs text-slate-400">
                {title || 'Untitled broadcast'} · {speaker || 'Host'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                isConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {isConnected ? 'Monitoring live stream' : 'Awaiting YouTube Live URL'}
            </span>

            {isConnected && (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-mono">
                <Clock className="h-3.5 w-3.5 text-red-400" />
                {formatTime(elapsedSeconds)}
              </span>
            )}

            {isConnected && (
              <button
                onClick={handleEndBroadcast}
                className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-black hover:bg-red-500"
              >
                <Square className="h-3.5 w-3.5 fill-white" />
                End &amp; Save VOD
              </button>
            )}

            <button
              onClick={isConnected ? handleDisconnect : onBack}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              {isConnected ? 'Disconnect' : 'Back to setup'}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ── LEFT: VIDEO EMBED ── */}
          <section className="space-y-4">
            {/* Video embed or setup prompt */}
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
              {videoId ? (
                <iframe
                  key={videoId}
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={title || 'Live Broadcast'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600/20 text-red-400">
                    <Youtube className="h-10 w-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Connect your YouTube Live stream</h2>
                    <p className="mt-1 max-w-md text-sm text-slate-400">
                      Go live on YouTube Studio, then paste the live stream URL or video ID below to
                      monitor it here.
                    </p>
                  </div>
                </div>
              )}

              {videoId && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase shadow-lg">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                  Live Monitor
                </div>
              )}
            </div>

            {/* URL Input + Connect */}
            {!isConnected && (
              <div className="rounded-3xl border border-slate-800 bg-[#141416] p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  Paste your YouTube Live URL
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={e => setYoutubeInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLoadVideo()}
                    placeholder="https://youtube.com/watch?v=... or video ID"
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-red-500 placeholder:text-slate-500"
                  />
                  <button
                    onClick={handleLoadVideo}
                    className="rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-500 transition"
                  >
                    Monitor
                  </button>
                </div>
                {inputError && (
                  <p className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {inputError}
                  </p>
                )}
                <p className="text-[11px] text-slate-500">
                  Start your broadcast in YouTube Studio first, then paste the URL here to display it.
                </p>
              </div>
            )}

            {/* Open in YouTube button while connected */}
            {isConnected && videoId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-[#141416] px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                <ExternalLink className="w-4 h-4 text-red-400" />
                Open in YouTube Studio
              </a>
            )}
          </section>

          {/* ── RIGHT: SETUP GUIDE & BROADCAST DETAILS ── */}
          <aside className="space-y-4">
            {/* Broadcast details */}
            <div className="rounded-3xl border border-slate-800 bg-[#141416] p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Broadcast details
              </p>
              <h2 className="text-lg font-black text-white">{title || 'Untitled broadcast'}</h2>
              <p className="text-xs text-slate-400">
                {category || 'Live Worship'} · {scripture || 'No scripture anchor'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                {description || 'No description provided.'}
              </p>
            </div>

            {/* OBS / encoder setup guide */}
            <div className="rounded-3xl border border-slate-800 bg-[#141416] p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400" />
                Streaming from OBS / vMix / Encoder
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Use these settings in your encoder to send your feed to YouTube Live. Get your
                personal Stream Key from{' '}
                <a
                  href="https://studio.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 underline hover:text-red-300"
                >
                  YouTube Studio → Go Live
                </a>
                .
              </p>

              {/* RTMP URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Stream URL (RTMP)
                </label>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2">
                  <span className="flex-1 font-mono text-xs text-slate-200 truncate">
                    {ytRtmpUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(ytRtmpUrl, 'rtmp')}
                    className="shrink-0 text-slate-400 hover:text-white transition"
                    title="Copy RTMP URL"
                  >
                    {copied === 'rtmp' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Stream key note */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Stream Key
                </label>
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-200 leading-relaxed">
                  {ytRtmpTip}
                </div>
              </div>

              {/* Step checklist */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p className="text-[10px] font-black uppercase text-slate-400">Broadcast checklist</p>
                {[
                  'Open YouTube Studio and click Go Live',
                  'Choose Stream in the top navigation',
                  'Copy the Stream Key and paste into OBS',
                  'Set OBS server to the RTMP URL above',
                  'Start streaming in OBS',
                  'Paste your YouTube Live URL above to monitor',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-[9px] font-black text-red-400">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh reminder when connected */}
            {isConnected && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
                <RefreshCw className="w-4 h-4 shrink-0 animate-spin-slow" />
                <span>
                  The YouTube embed shows your live feed. Viewer count and chat are managed in
                  YouTube Studio.
                </span>
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

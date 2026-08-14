import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Sliders,
  Clock,
  BookOpen,
  ListVideo,
  ListFilter,
  DollarSign,
  Share2,
  Sparkles,
  Bookmark,
  Check,
  Copy,
  Radio,
  Activity,
  Heart,
  Repeat,
  Shuffle,
  Music,
  Download,
  Info,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioTrack, AudioChapter } from '../data/gospelData';
import { GivingTarget } from './GivingModal';

interface AudioPodcastPlayerProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  audioQueue: AudioTrack[];
  onSelectTrackFromQueue: (track: AudioTrack) => void;
  onOpenGivingModal: (target: GivingTarget) => void;
}

export default function AudioPodcastPlayer({
  currentTrack,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  audioQueue,
  onSelectTrackFromQueue,
  onOpenGivingModal
}: AudioPodcastPlayerProps) {
  // Player UI Expansion State
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'notes' | 'equalizer' | 'timer' | 'queue'>('chapters');

  // Audio Playback Settings State
  const [playbackSpeed, setPlaybackSpeed] = useState<'0.8x' | '1.0x' | '1.25x' | '1.5x' | '2.0x'>('1.0x');
  const [audioEqPreset, setAudioEqPreset] = useState('Anointed Voice Clarity');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Sound Engine Controls
  const [volume, setVolume] = useState<number>(0.85);
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Time & Progress State (Simulated interactive seeker)
  const [currentTimeSec, setCurrentTimeSec] = useState(145);
  const totalDurationSec = currentTrack.isLiveRadio ? 0 : 2295; // ~38:15

  // Saved / Copied State
  const [copiedText, setCopiedText] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Web Audio Ambient Synthesizer Ref for actual audible sound feedback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Audio Engine Synthesizer Effect (Generates peaceful ambient prayer chords when playing)
  useEffect(() => {
    if (isPlaying && !isMuted) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        if (audioCtxRef.current && !osc1Ref.current) {
          const ctx = audioCtxRef.current;
          const gain = ctx.createGain();
          gain.gain.value = (isMuted ? 0 : volume) * 0.05; // Gentle background prayer pad
          gain.connect(ctx.destination);
          gainNodeRef.current = gain;

          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          osc1.type = 'sine';
          osc2.type = 'triangle';

          // Warm A-major / D-major worship pad frequencies (A3 & C#4)
          osc1.frequency.setValueAtTime(220, ctx.currentTime);
          osc2.frequency.setValueAtTime(277.18, ctx.currentTime);

          osc1.connect(gain);
          osc2.connect(gain);

          osc1.start();
          osc2.start();

          osc1Ref.current = osc1;
          osc2Ref.current = osc2;
        } else if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = (isMuted ? 0 : volume) * 0.05;
        }
      } catch (e) {
        // Fallback for strict browser autoplay policies
      }
    } else {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = 0;
      }
    }

    return () => {
      if (osc1Ref.current) {
        try { osc1Ref.current.stop(); } catch (e) {}
        osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        try { osc2Ref.current.stop(); } catch (e) {}
        osc2Ref.current = null;
      }
    };
  }, [isPlaying, isMuted, volume]);

  // Handle Playhead Progress Auto-Advance
  useEffect(() => {
    if (!isPlaying || currentTrack.isLiveRadio) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => {
        if (prev >= totalDurationSec) {
          if (isLooping) return 0;
          onTogglePlay(); // Pause at end if not looping
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.isLiveRadio, totalDurationSec, isLooping]);

  // Sleep Timer Countdown Effect
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerRemaining(null);
      return;
    }
    setSleepTimerRemaining(sleepTimerMinutes * 60);
    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          if (isPlaying) onTogglePlay(); // Pause audio when timer expires
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Format Seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSkipTime = (deltaSeconds: number) => {
    setCurrentTimeSec((prev) => Math.max(0, Math.min(totalDurationSec, prev + deltaSeconds)));
  };

  const handleChapterSeek = (chapter: AudioChapter) => {
    setCurrentTimeSec(chapter.seconds);
  };

  const handleCopyNotes = () => {
    if (!currentTrack.sermonOutline) return;
    const text = `Sermon Outline: ${currentTrack.title} (${currentTrack.artistOrPreacher})\n\n` + currentTrack.sermonOutline.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadMp3 = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 2500);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const progressPercent = currentTrack.isLiveRadio ? 100 : Math.min(100, (currentTimeSec / (totalDurationSec || 1)) * 100);

  return (
    <>
      {/* 🔴 1. PERSISTENT BOTTOM MINI AUDIO PLAYER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d10]/95 backdrop-blur-xl border-t border-slate-800/80 px-3 sm:px-6 py-2.5 flex flex-col justify-center shadow-2xl">
        
        {/* Interactive Top Border Scrubber Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/80 cursor-pointer group">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 relative transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Track Thumbnail & Title */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 w-1/3 min-w-[150px] cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover border border-amber-500/30 group-hover:scale-105 transition shadow-lg"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center gap-0.5 p-1">
                  <span className="w-0.5 bg-amber-400 h-3 rounded-full animate-bounce" />
                  <span className="w-0.5 bg-amber-300 h-4 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-0.5 bg-amber-400 h-2 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
                  {currentTrack.title}
                </h4>
                {currentTrack.isLiveRadio && (
                  <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[8px] font-black uppercase shrink-0 animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-amber-400/90 truncate font-medium">
                {currentTrack.artistOrPreacher} • {currentTrack.category}
              </p>
            </div>
          </div>

          {/* Center Main Audio Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-1/3">
            <button
              onClick={() => handleSkipTime(-15)}
              className="p-1.5 text-slate-400 hover:text-white transition hidden sm:inline-block"
              title="Rewind 15 Seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg transform hover:scale-105 ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkipTime(15)}
              className="p-1.5 text-slate-400 hover:text-white transition hidden sm:inline-block"
              title="Fast Forward 15 Seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Right Actions & Expand Button */}
          <div className="flex items-center justify-end gap-2 w-1/3">
            {/* Sow Seed button */}
            <button
              onClick={() => onOpenGivingModal({
                id: `audio-${currentTrack.id}`,
                name: currentTrack.artistOrPreacher,
                avatar: currentTrack.channelAvatar,
                type: 'church',
                categoryTitle: `Support ${currentTrack.artistOrPreacher}`
              })}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] transition shadow-md"
            >
              <DollarSign className="w-3 h-3" />
              <span>Sow Seed</span>
            </button>

            {/* Like/Bookmark Heart */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-1.5 rounded-full transition ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-white'}`}
              title={isLiked ? 'Saved to Favorites' : 'Save to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
            </button>

            {/* Volume Control with Popover */}
            <div className="relative">
              <button
                onClick={onToggleMute}
                onMouseEnter={() => setShowVolumePopover(true)}
                className="p-1.5 text-slate-400 hover:text-white transition"
                title="Volume Settings"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-500" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-amber-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {showVolumePopover && (
                <div
                  onMouseLeave={() => setShowVolumePopover(false)}
                  className="absolute bottom-9 right-0 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex items-center gap-2 z-50 w-36 animate-fadeIn"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) onToggleMute();
                    }}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-amber-300 w-8">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700/80 transition flex items-center gap-1 text-xs font-bold shadow-md"
              title="Open Full Audio Studio Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[10px]">Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🔴 2. EXPANDED FULL-SCREEN AUDIO STUDIO PLAYER MODAL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#08090c] text-white flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Blurred Background Art */}
            <div className="absolute inset-0 pointer-events-none opacity-20 filter blur-3xl">
              <img
                src={currentTrack.coverUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/85" />
            </div>

            {/* Studio Header */}
            <div className="relative z-10 p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-wide">
                    Gospread Audio Studio
                  </h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    High-Fidelity Anointed Stream Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDownloadMp3}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">
                    {downloadProgress !== null ? `${downloadProgress}%` : 'Save MP3'}
                  </span>
                </button>

                <button
                  onClick={() => onOpenGivingModal({
                    id: `audio-${currentTrack.id}`,
                    name: currentTrack.artistOrPreacher,
                    avatar: currentTrack.channelAvatar,
                    type: 'church',
                    categoryTitle: `Sow Seed for ${currentTrack.artistOrPreacher}`
                  })}
                  className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 transition shadow-lg shadow-amber-500/20"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Sow Seed</span>
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-700"
                  title="Minimize Studio Player"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Studio Body Grid */}
            <div className="relative z-10 flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Artwork & Main Player Controls (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-5 text-center">
                {/* Large Album Art with Animated Frequency Visualizer */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40 group">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Pill Overlay */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 shadow-md">
                    {currentTrack.category}
                  </div>

                  {/* Animated Equalizer Waveform Overlay */}
                  {isPlaying && (
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center gap-1 h-20">
                      {[12, 28, 16, 32, 20, 38, 24, 18, 30, 14, 26, 34, 15].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1.5 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-base sm:text-lg font-black font-serif text-white leading-snug">
                    {currentTrack.title}
                  </h2>
                  <p className="text-xs text-amber-300 font-medium">
                    {currentTrack.artistOrPreacher} • {currentTrack.albumOrSeries}
                  </p>
                  {currentTrack.publishedDate && (
                    <p className="text-[10px] text-slate-400">
                      Released {currentTrack.publishedDate} • {currentTrack.downloadsCount || '24.5K Streams'}
                    </p>
                  )}
                </div>

                {/* Progress Bar & Chapter Markers on Timeline */}
                <div className="w-full max-w-md space-y-2 relative">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={totalDurationSec || 100}
                      value={currentTimeSec}
                      onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg z-10"
                    />

                    {/* Chapter Marker Dots on Seek Line */}
                    {currentTrack.chapters && totalDurationSec > 0 && currentTrack.chapters.map((chap, idx) => {
                      const posPct = (chap.seconds / totalDurationSec) * 100;
                      return (
                        <div
                          key={idx}
                          style={{ left: `${posPct}%` }}
                          onClick={() => handleChapterSeek(chap)}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border border-slate-900 z-20 cursor-pointer hover:scale-150 transition-transform"
                          title={`Chapter: ${chap.title} (${chap.time})`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatTime(currentTimeSec)}</span>
                    <span className="text-amber-400 font-bold">
                      {currentTrack.isLiveRadio ? 'LIVE BROADCAST' : formatTime(totalDurationSec)}
                    </span>
                  </div>
                </div>

                {/* Transport Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsShuffled(!isShuffled)}
                    className={`p-2.5 rounded-full border transition ${
                      isShuffled ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'
                    }`}
                    title="Toggle Shuffle Mode"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSkipTime(-15)}
                    className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
                    title="Skip Back 15s"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className={`p-5 rounded-full shadow-2xl transition transform hover:scale-105 ${
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                        : 'bg-red-600 text-white shadow-red-600/30'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-slate-950" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                  </button>

                  <button
                    onClick={() => handleSkipTime(15)}
                    className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
                    title="Skip Forward 15s"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-2.5 rounded-full border transition ${
                      isLooping ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'
                    }`}
                    title="Toggle Loop Repeat"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed & Sleep Timer Quick Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  {/* Playback Speed Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-full border border-slate-800">
                    {(['0.8x', '1.0x', '1.25x', '1.5x', '2.0x'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                          playbackSpeed === s ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Sleep Timer Indicator */}
                  {sleepTimerRemaining !== null && (
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{Math.floor(sleepTimerRemaining / 60)}m {sleepTimerRemaining % 60}s</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Tabbed Advanced Panel (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-5 flex flex-col h-[480px] overflow-hidden shadow-2xl backdrop-blur-xl">
                
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-800 pb-3 gap-2 overflow-x-auto shrink-0">
                  {[
                    { id: 'chapters', label: 'Chapters', icon: ListVideo, count: currentTrack.chapters?.length },
                    { id: 'notes', label: 'Sermon Notes', icon: BookOpen },
                    { id: 'equalizer', label: 'Audio EQ', icon: Sliders },
                    { id: 'timer', label: 'Sleep Timer', icon: Clock },
                    { id: 'queue', label: 'Up Next', icon: ListFilter, count: audioQueue.length },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[9px] font-mono">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Panels */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  
                  {/* TAB 1: CHAPTERS */}
                  {activeTab === 'chapters' && (
                    <div className="space-y-2">
                      {currentTrack.chapters && currentTrack.chapters.length > 0 ? (
                        currentTrack.chapters.map((chap, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleChapterSeek(chap)}
                            className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                                {chap.time}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                                  {chap.title}
                                </h4>
                                {chap.scriptureRef && (
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    Ref: {chap.scriptureRef}
                                  </p>
                                )}
                              </div>
                            </div>

                            <Play className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                          <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                          <p className="font-bold text-slate-300">Live Continuous Broadcast</p>
                          <p className="text-[10px]">Continuous streaming without chapter markers.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SERMON NOTES */}
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span>Outline & Key Takeaways</span>
                        </h4>

                        <button
                          onClick={handleCopyNotes}
                          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition border border-slate-700"
                        >
                          {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedText ? 'Copied' : 'Copy Outline'}</span>
                        </button>
                      </div>

                      {currentTrack.sermonOutline ? (
                        <div className="space-y-2">
                          {currentTrack.sermonOutline.map((point, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                              {point}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {currentTrack.lyricsOrNotes || 'Listen to this spirit-filled message and follow along in scripture.'}
                        </p>
                      )}

                      {currentTrack.scriptureVerses && (
                        <div className="pt-2 space-y-2">
                          <span className="text-[10px] font-bold uppercase text-amber-400 block">Featured Scripture Verses</span>
                          {currentTrack.scriptureVerses.map((verse, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                              <span className="font-bold text-amber-300 font-mono text-[11px] block">{verse.reference}</span>
                              <p className="text-slate-200 italic font-serif">"{verse.text}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: AUDIO EQUALIZER & VOICE ENHANCERS */}
                  {activeTab === 'equalizer' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span>AI Worship Sound Presets</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Anointed Voice Clarity',
                          'Choir & Bass Boost',
                          'Midnight Prayer (Low Noise)',
                          '3D Sanctuary Reverb'
                        ].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setAudioEqPreset(preset)}
                            className={`p-3 rounded-2xl border text-xs font-bold text-left transition flex items-center justify-between ${
                              audioEqPreset === preset
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{preset}</span>
                            {audioEqPreset === preset && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Vocal Isolator
                          </span>
                          <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Dynamically enhances preacher vocal frequencies and smooths background noise for clear driving or study listening.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SLEEP TIMER */}
                  {activeTab === 'timer' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Bedtime Sleep Timer</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[15, 30, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => setSleepTimerMinutes(mins)}
                            className={`p-4 rounded-2xl border text-xs font-bold transition text-center ${
                              sleepTimerMinutes === mins
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {mins} Minutes
                          </button>
                        ))}
                      </div>

                      {sleepTimerMinutes && (
                        <button
                          onClick={() => setSleepTimerMinutes(null)}
                          className="w-full py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold transition"
                        >
                          Cancel Sleep Timer
                        </button>
                      )}
                    </div>
                  )}

                  {/* TAB 5: UP NEXT QUEUE */}
                  {activeTab === 'queue' && (
                    <div className="space-y-2">
                      {audioQueue.map((track, idx) => (
                        <div
                          key={track.id}
                          onClick={() => onSelectTrackFromQueue(track)}
                          className={`p-3 rounded-2xl border text-xs transition cursor-pointer flex items-center justify-between ${
                            track.id === currentTrack.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="font-mono text-[10px] text-slate-500 w-4">#{idx + 1}</span>
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-9 h-9 rounded-xl object-cover shrink-0"
                            />
                            <div className="truncate">
                              <h5 className="font-bold text-white truncate">{track.title}</h5>
                              <p className="text-[10px] text-slate-400 truncate">{track.artistOrPreacher}</p>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

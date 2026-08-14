import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Camera,
  Sliders,
  Languages,
  Activity,
  Layers,
  Sparkles,
  DollarSign,
  Heart,
  Check,
  ChevronDown,
  Radio,
  Wifi,
  ShieldCheck,
  Info,
  Tv,
  Subtitles,
  PictureInPicture,
  MessageSquare,
  BookOpen,
  Share2,
  Gauge,
  Sun,
  Palette,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream } from '../data/gospelData';
import { GivingTarget } from './GivingModal';

interface VideoStreamFrameProps {
  video: VideoStream;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGivingModal: (target: GivingTarget) => void;
  onOpenFullscreen: () => void;
  onOpenChannelProfile: (channelName: string) => void;
  onTogglePip?: () => void;
  onDownloadVideo?: (video: VideoStream) => void;
}

export default function VideoStreamFrame({
  video,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  onOpenGivingModal,
  onOpenFullscreen,
  onOpenChannelProfile,
  onTogglePip,
  onDownloadVideo
}: VideoStreamFrameProps) {
  // Advanced Settings State
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'quality' | 'audio' | 'captions' | 'overlay' | 'telemetry'>('quality');

  // Video Options State
  const [selectedQuality, setSelectedQuality] = useState('1080p60 (HD)');
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | 'Fit' | 'Zoom'>('16:9');

  // Multi-Camera Angle State
  const [activeCamAngle, setActiveCamAngle] = useState<'cam1' | 'cam2' | 'cam3' | 'cam4'>('cam1');
  const [showCamSelector, setShowCamSelector] = useState(false);

  // Audio Enhancers State
  const [audioMix, setAudioMix] = useState('Main Sanctuary Mix');
  const [audioEq, setAudioEq] = useState('Anointed Choir & Bass Boost');
  const [nightMode, setNightMode] = useState(false);

  // Subtitles / CC State
  const [captionLanguage, setCaptionLanguage] = useState<'Off' | 'English' | 'Spanish' | 'French' | 'Swahili'>('English');

  // Overlay Features
  const [showLowerThirdScripture, setShowLowerThirdScripture] = useState(true);
  const [showFloatingAmens, setShowFloatingAmens] = useState(true);
  const [showQuickGivingQr, setShowQuickGivingQr] = useState(false);

  // Stats for Nerds / Telemetry Bar
  const [showTelemetryBar, setShowTelemetryBar] = useState(false);

  // Ambient Mode State & Dynamic Color Extraction
  const [isAmbientMode, setIsAmbientMode] = useState(true);
  const [ambientGlowLevel, setAmbientGlowLevel] = useState<'vibrant' | 'subtle' | 'soft'>('vibrant');
  const [ambientColors, setAmbientColors] = useState<{ primary: string; secondary: string; accent: string }>({
    primary: 'rgba(245, 158, 11, 0.75)',
    secondary: 'rgba(180, 83, 9, 0.65)',
    accent: 'rgba(251, 191, 36, 0.45)',
  });

  // Determine active frame image URL
  const activeFrameSrc =
    activeCamAngle === 'cam2'
      ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
      : activeCamAngle === 'cam3'
      ? 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80'
      : activeCamAngle === 'cam4'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80'
      : video.thumbnail;

  // Extract / Compute Dominant Colors from Frame Image for Ambient Glow
  useEffect(() => {
    let isCancelled = false;

    // Fallback preset palettes matching gospel sanctuary moods
    const getFallbackColors = () => {
      if (activeCamAngle === 'cam2') {
        // Worship Band & Choir: Deep Sapphire & Royal Purple Glow
        return {
          primary: 'rgba(147, 51, 234, 0.75)',
          secondary: 'rgba(59, 130, 246, 0.65)',
          accent: 'rgba(236, 72, 153, 0.45)',
        };
      } else if (activeCamAngle === 'cam3') {
        // Sanctuary Atmosphere: Warm Golden Sanctuary & Rose Glory
        return {
          primary: 'rgba(225, 29, 72, 0.7)',
          secondary: 'rgba(245, 158, 11, 0.65)',
          accent: 'rgba(168, 85, 247, 0.4)',
        };
      } else if (activeCamAngle === 'cam4') {
        // Sign Language Feed: Serene Azure & Heavenly Emerald
        return {
          primary: 'rgba(14, 165, 233, 0.7)',
          secondary: 'rgba(16, 185, 129, 0.6)',
          accent: 'rgba(245, 158, 11, 0.4)',
        };
      } else {
        // Main Pulpit / Default: Radiant Anointed Gold & Warm Amber
        return {
          primary: 'rgba(245, 158, 11, 0.75)',
          secondary: 'rgba(180, 83, 9, 0.65)',
          accent: 'rgba(251, 191, 36, 0.45)',
        };
      }
    };

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = activeFrameSrc;

    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setAmbientColors(getFallbackColors());
          return;
        }

        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;

        let r1 = 0, g1 = 0, b1 = 0;
        let r2 = 0, g2 = 0, b2 = 0;
        let count1 = 0, count2 = 0;

        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          if (pixelIndex < 128) {
            r1 += data[i];
            g1 += data[i + 1];
            b1 += data[i + 2];
            count1++;
          } else {
            r2 += data[i];
            g2 += data[i + 1];
            b2 += data[i + 2];
            count2++;
          }
        }

        const avgR1 = Math.round(r1 / count1);
        const avgG1 = Math.round(g1 / count1);
        const avgB1 = Math.round(b1 / count1);

        const avgR2 = Math.round(r2 / count2);
        const avgG2 = Math.round(g2 / count2);
        const avgB2 = Math.round(b2 / count2);

        setAmbientColors({
          primary: `rgba(${avgR1}, ${avgG1}, ${avgB1}, 0.75)`,
          secondary: `rgba(${avgR2}, ${avgG2}, ${avgB2}, 0.65)`,
          accent: `rgba(${Math.min(255, avgR1 + 40)}, ${Math.min(255, avgG1 + 30)}, ${Math.min(255, avgB1 + 20)}, 0.4)`,
        });
      } catch (err) {
        setAmbientColors(getFallbackColors());
      }
    };

    img.onerror = () => {
      if (!isCancelled) {
        setAmbientColors(getFallbackColors());
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [activeFrameSrc, activeCamAngle, video.id]);

  // Share State & Handler
  const [showSharedToast, setShowSharedToast] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: `Watch "${video.title}" by ${video.speakerOrArtist} on Gospread!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyShareFallback();
        }
      }
    } else {
      copyShareFallback();
    }
  };

  const copyShareFallback = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowSharedToast(true);
    setTimeout(() => setShowSharedToast(false), 2500);
  };

  // Floating Amen Reaction Effect
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; text: string }[]>([]);

  const triggerFloatingAmen = (label = '🙌 AMEN!') => {
    const newId = Date.now() + Math.random();
    const xPos = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingHearts((prev) => [...prev, { id: newId, x: xPos, text: label }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((item) => item.id !== newId));
    }, 2000);
  };

  const camAngles = [
    { id: 'cam1', name: 'Main Pulpit & Altar', icon: Camera, desc: 'Lead Pastor & Scripture Focus' },
    { id: 'cam2', name: 'Worship Band & Choir', icon: Tv, desc: 'Praise Ensemble & Orchestra' },
    { id: 'cam3', name: 'Congregation Sanctuary', icon: Layers, desc: 'Wide Audience & Atmosphere' },
    { id: 'cam4', name: 'Sign Language Feed', icon: Languages, desc: 'Accessibility Interpreter' },
  ];

  return (
    <div className="relative w-full">
      {/* Dynamic Ambient Mode Background Glowing Gradient */}
      <AnimatePresence>
        {isAmbientMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: ambientGlowLevel === 'vibrant' ? 0.85 : ambientGlowLevel === 'subtle' ? 0.55 : 0.35,
              scale: isPlaying ? 1.04 : 1.01,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute -inset-3 sm:-inset-6 rounded-[2.5rem] pointer-events-none z-0 overflow-hidden blur-2xl sm:blur-3xl transition-all duration-1000 ease-out"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${ambientColors.primary} 0%, ${ambientColors.secondary} 45%, ${ambientColors.accent} 75%, transparent 100%)`,
            }}
          >
            {/* Animated Pulse Orbs for Live Traffic Flow */}
            <div
              className="absolute -top-10 -left-10 w-2/3 h-2/3 rounded-full mix-blend-screen opacity-70 animate-pulse transition-all duration-1000"
              style={{ background: ambientColors.primary }}
            />
            <div
              className="absolute -bottom-10 -right-10 w-2/3 h-2/3 rounded-full mix-blend-screen opacity-60 animate-pulse transition-all duration-1000 delay-700"
              style={{ background: ambientColors.secondary }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Video Frame Container */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-slate-800/90 shadow-2xl group select-none z-10">
      {/* Active Camera Video Preview */}
      <img
        src={
          activeCamAngle === 'cam2'
            ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
            : activeCamAngle === 'cam3'
            ? 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80'
            : activeCamAngle === 'cam4'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80'
            : video.thumbnail
        }
        alt={video.title}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-300 ${
          aspectRatio === 'Zoom' ? 'scale-110' : ''
        }`}
      />

      {/* Floating Amen Reaction Effects */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {floatingHearts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: '80%', scale: 0.8 }}
            animate={{ opacity: 0, y: '10%', scale: 1.4 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{ left: `${item.x}%` }}
            className="absolute px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1 border border-amber-300"
          >
            <span>{item.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Share Toast Notification Banner */}
      <AnimatePresence>
        {showSharedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300"
          >
            <Check className="w-4 h-4 text-slate-950" />
            <span>Video link & details copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* On-Screen Lower-Third Scripture Banner Overlay */}
      {showLowerThirdScripture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-4 right-16 sm:right-auto sm:max-w-md z-20 p-3 rounded-2xl bg-slate-950/85 border border-amber-500/40 text-white backdrop-blur-md shadow-2xl space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Live Scripture Banner
            </span>
            <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
              John 14:27
            </span>
          </div>
          <p className="text-xs font-serif italic text-slate-100 leading-snug">
            "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled."
          </p>
        </motion.div>
      )}

      {/* On-Screen Live CC Subtitles Overlay */}
      {captionLanguage !== 'Off' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-xl text-center px-4 py-1.5 rounded-xl bg-black/85 text-amber-200 border border-slate-700 font-sans font-medium text-xs sm:text-sm backdrop-blur-sm shadow-xl">
          {captionLanguage === 'English' && "[Pastor] 'Welcome everyone to today's glorious worship session...'"}
          {captionLanguage === 'Spanish' && "[Pastor] 'Bienvenidos a todos a la gloriosa sesión de alabanza de hoy...'"}
          {captionLanguage === 'French' && "[Pastor] 'Bienvenue à tous à la glorieuse session d'adoration d'aujourd'hui...'"}
          {captionLanguage === 'Swahili' && "[Mchungaji] 'Karibuni wote kwenye kipindi cha leo cha kuabudu...'"}
        </div>
      )}

      {/* Stream Telemetry Bar (Stats for Nerds) Overlay */}
      {showTelemetryBar && (
        <div className="absolute top-12 left-4 z-20 p-3 rounded-2xl bg-black/90 border border-amber-500/40 font-mono text-[10px] text-amber-300 space-y-1 backdrop-blur-md shadow-2xl max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-white font-bold">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Stream Telemetry
            </span>
            <span className="text-emerald-400">HEALTHY</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300">
            <span>Resolution: <strong className="text-white">{selectedQuality}</strong></span>
            <span>Bitrate: <strong className="text-white">6,420 kbps</strong></span>
            <span>FPS: <strong className="text-white">60 fps</strong></span>
            <span>Codec: <strong className="text-white">AV1 / AAC</strong></span>
            <span>Latency: <strong className="text-emerald-400">0.38s Ultra-Low</strong></span>
            <span>CDN Node: <strong className="text-white">Gospread-Edge-EU</strong></span>
          </div>
        </div>
      )}

      {/* Multi-Camera Angle Selector Popover */}
      <AnimatePresence>
        {showCamSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-14 right-4 z-30 p-3 rounded-2xl bg-slate-950/95 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl w-64 space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Camera className="w-4 h-4" />
                <span>Multi-Camera View Angles</span>
              </div>
              <button
                onClick={() => setShowCamSelector(false)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-1.5">
              {camAngles.map((cam) => {
                const Icon = cam.icon;
                const isActive = activeCamAngle === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setActiveCamAngle(cam.id as any);
                      setShowCamSelector(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left border text-xs transition flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold">{cam.name}</div>
                        <div className="text-[9px] text-slate-400">{cam.desc}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Settings Modal Overlay */}
      <AnimatePresence>
        {showSettingsMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-4 z-40 bg-slate-950/95 border border-amber-500/40 rounded-2xl p-4 text-white backdrop-blur-xl flex flex-col justify-between shadow-2xl overflow-y-auto"
          >
            <div>
              {/* Settings Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Broadcast Player Advanced Options</h3>
                    <p className="text-[10px] text-slate-400">Customize stream quality, audio mix, overlays & telemetry</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsMenu(false)}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                >
                  Apply & Done
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 pt-2 gap-2 overflow-x-auto">
                {[
                  { id: 'quality', label: 'Quality & Speed', icon: Settings },
                  { id: 'audio', label: 'Worship Audio Mix', icon: Sliders },
                  { id: 'captions', label: 'Subtitles / CC', icon: Languages },
                  { id: 'overlay', label: 'Screen Overlays', icon: Layers },
                  { id: 'telemetry', label: 'Stream Telemetry', icon: Activity },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="py-4 space-y-4">
                {settingsTab === 'quality' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">Video Quality / Bitrate</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['1080p60 (HD)', '720p60 (HD)', '480p (Balanced)', 'Data Saver (360p)'].map((q) => (
                          <button
                            key={q}
                            onClick={() => setSelectedQuality(q)}
                            className={`p-2 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between ${
                              selectedQuality === q
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{q}</span>
                            {selectedQuality === q && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">Playback Speed</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setPlaybackSpeed(s)}
                            className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                              playbackSpeed === s
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {s} {s === '1.0x' && '(Normal)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'audio' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Worship Audio Track Channel</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['Main Sanctuary Mix', 'Anointed Choir Focus', 'Pastoral Voice Boost'].map((mix) => (
                          <button
                            key={mix}
                            onClick={() => setAudioMix(mix)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                              audioMix === mix
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{mix}</span>
                            {audioMix === mix && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Equalizer Preset</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Balanced', 'Anointed Choir & Bass Boost', 'Sermon Voice Clarity', 'Acoustic Peace'].map((eq) => (
                          <button
                            key={eq}
                            onClick={() => setAudioEq(eq)}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition text-center ${
                              audioEq === eq
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {eq}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'captions' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">AI Live Rhema Subtitles / Language</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {['Off', 'English', 'Spanish', 'French', 'Swahili'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setCaptionLanguage(lang as any)}
                          className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                            captionLanguage === lang
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === 'overlay' && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-300 block">Interactive Overlays & Atmosphere</label>
                    
                    {/* Ambient Mode Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sun className={`w-4 h-4 ${isAmbientMode ? 'text-amber-400' : 'text-slate-500'}`} />
                          <div>
                            <span className="text-xs font-bold text-white block">Dynamic Frame Ambient Glow</span>
                            <span className="text-[10px] text-slate-400 block">Samples dominant colors from live broadcast to illuminate backdrop</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsAmbientMode(!isAmbientMode)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                            isAmbientMode
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isAmbientMode ? 'ACTIVE' : 'OFF'}
                        </button>
                      </div>

                      {/* Ambient Glow Intensity Selector & Active Dominant Palette Indicators */}
                      {isAmbientMode && (
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                            <span>Glow Intensity:</span>
                            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                              {(['vibrant', 'subtle', 'soft'] as const).map((level) => (
                                <button
                                  key={level}
                                  onClick={() => setAmbientGlowLevel(level)}
                                  className={`px-2 py-0.5 rounded capitalize ${
                                    ambientGlowLevel === level
                                      ? 'bg-amber-500 text-slate-950 font-black'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dominant Color Swatches Sampled from Current Frame */}
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                            <Palette className="w-3 h-3 text-amber-400" />
                            <span>Sampled:</span>
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: ambientColors.primary }}
                              title="Primary Dominant Color"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: ambientColors.secondary }}
                              title="Secondary Dominant Color"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: ambientColors.accent }}
                              title="Glow Accent Color"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowLowerThirdScripture(!showLowerThirdScripture)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          showLowerThirdScripture ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span>On-screen Scripture Lower-Third</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase">{showLowerThirdScripture ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowFloatingAmens(!showFloatingAmens)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          showFloatingAmens ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-amber-400" />
                          <span>Floating Live Amen Reactions</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase">{showFloatingAmens ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'telemetry' && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Toggle Real-time Broadcast Diagnostics</span>
                      <button
                        onClick={() => setShowTelemetryBar(!showTelemetryBar)}
                        className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                          showTelemetryBar ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showTelemetryBar ? 'Telemetry Visible' : 'Hidden'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Displays technical network metrics including frame drops, bitrate spikes, CDN distribution edge node, and latency buffer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Video Player Control Bar */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 p-4 flex flex-col justify-between z-10 pointer-events-none group-hover:opacity-100 transition duration-300">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2">
            {video.isLive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-widest uppercase flex items-center gap-1.5 animate-pulse shadow-lg shadow-red-600/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                OD Broadcaster
              </span>
            )}

            <button
              onClick={() => setShowCamSelector(!showCamSelector)}
              className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1"
            >
              <Camera className="w-3 h-3 text-amber-400" />
              <span>Cam: {activeCamAngle.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Glow Toggle Button */}
            <button
              onClick={() => setIsAmbientMode(!isAmbientMode)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 border shadow-md ${
                isAmbientMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700/80 hover:text-white'
              }`}
              title="Toggle Dynamic Ambient Background Glow"
            >
              <Sun className={`w-3 h-3 ${isAmbientMode ? 'text-amber-400 animate-spin-slow' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Ambient Glow</span>
            </button>

            <button
              onClick={() => triggerFloatingAmen('🙌 AMEN!')}
              className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black transition flex items-center gap-1 shadow-lg shadow-amber-500/20"
            >
              <Heart className="w-3 h-3 fill-slate-950" />
              <span>Send Amen</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.15, rotate: 6 }}
              whileTap={{ scale: 0.88 }}
              animate={{
                boxShadow: [
                  '0px 0px 0px rgba(245, 158, 11, 0)',
                  '0px 0px 12px rgba(245, 158, 11, 0.45)',
                  '0px 0px 0px rgba(245, 158, 11, 0)'
                ]
              }}
              transition={{
                boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                scale: { type: 'spring', stiffness: 400, damping: 17 }
              }}
              onClick={handleShare}
              className="p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 hover:text-amber-300 transition flex items-center justify-center relative group shadow-md"
              title="Share Sermon Video"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </motion.button>

            {onDownloadVideo && (
              <button
                onClick={() => onDownloadVideo(video)}
                className="p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 hover:text-amber-300 transition flex items-center justify-center relative group shadow-md"
                title="Download Sermon Video for Offline Watching"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}

            <button
              onClick={() => setShowSettingsMenu(true)}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/30 transition"
              title="Open Advanced Video Options"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Big Play Button (When Paused) */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="self-center w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition pointer-events-auto shadow-amber-500/30"
          >
            <Play className="w-8 h-8 fill-slate-950 ml-1" />
          </button>
        )}

        {/* Bottom Control Bar */}
        <div className="space-y-2 pointer-events-auto">
          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden cursor-pointer">
            <div className="bg-amber-500 h-full w-3/5" />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={onTogglePlay} className="hover:text-amber-400 transition" title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={onToggleMute} className="hover:text-amber-400 transition" title={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-[11px] font-mono text-slate-300">
                {video.isLive ? '01:24:10 / LIVE' : video.duration}
              </span>

              {/* Playback Speed Control Pill & Popover Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 border ${
                    playbackSpeed !== '1.0x'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Adjust Sermon Playback Speed (0.5x to 2.0x)"
                >
                  <Gauge className="w-3 h-3 text-amber-400" />
                  <span>{playbackSpeed}</span>
                </button>

                <AnimatePresence>
                  {showSpeedMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2.5 left-0 z-40 p-1.5 rounded-xl bg-slate-950/95 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl flex flex-col gap-1 w-28"
                    >
                      <div className="text-[9px] font-black text-amber-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                        <span>Speed</span>
                        <Gauge className="w-2.5 h-2.5" />
                      </div>
                      {['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => {
                            setPlaybackSpeed(speed);
                            setShowSpeedMenu(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-between ${
                            playbackSpeed === speed
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{speed}</span>
                          {speed === '1.0x' && <span className="text-[8px] opacity-75">(Normal)</span>}
                          {playbackSpeed === speed && <Check className="w-3 h-3 text-slate-950" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenGivingModal({
                  id: `video-${video.id}`,
                  name: video.churchOrMinistry,
                  avatar: video.channelAvatar,
                  type: 'church',
                  categoryTitle: `Sow Seed for ${video.speakerOrArtist}`
                })}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition shadow-md"
              >
                <DollarSign className="w-3 h-3" />
                <span>Sow Seed</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition shadow-md"
                title="Share Video Link & Details"
              >
                <Share2 className="w-3 h-3 text-amber-400" />
                <span>{showSharedToast ? 'Copied!' : 'Share'}</span>
              </button>

              {onTogglePip && (
                <button
                  onClick={onTogglePip}
                  className="hover:text-amber-400 transition p-1 rounded-lg hover:bg-slate-800/80"
                  title="Picture in Picture Mode"
                >
                  <PictureInPicture className="w-4 h-4 text-pink-400" />
                </button>
              )}

              <button onClick={onOpenFullscreen} className="hover:text-amber-400 transition" title="Fullscreen">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

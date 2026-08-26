import React from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  PictureInPicture
} from 'lucide-react';
import { motion } from 'motion/react';
import { VideoStream } from '../data/gospelData';

interface PictureInPictureWindowProps {
  video: VideoStream;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onExpand: () => void;
  onClose: () => void;
  activeTab: string;
}

export default function PictureInPictureWindow({
  video,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  onExpand,
  onClose,
  activeTab
}: PictureInPictureWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 w-[280px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-pink-400/60 bg-slate-950/95 backdrop-blur-xl text-white select-none group"
    >
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <PictureInPicture className="w-3.5 h-3.5 text-pink-400 shrink-0 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-pink-300 truncate">
            Picture-in-Picture • {activeTab.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onExpand}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 transition"
            title="Expand to Full Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition"
            title="Close Picture-in-Picture Stream"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Video Display Frame */}
      <div className="relative aspect-video bg-black overflow-hidden group/video">
        <img
          src={video.thumbnail}
          alt={video.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />

        {/* Live Badge Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {video.isLive ? (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-red-600/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE PIP
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 font-mono text-[9px] border border-amber-500/30">
              STREAM PIP
            </span>
          )}
        </div>

        {/* Center Hover Control or Playing Equalizer */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={onTogglePlay}
            className="p-3 rounded-full bg-amber-500 text-slate-950 font-bold hover:scale-110 transition shadow-lg shadow-amber-500/40"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
          </button>
          <button
            onClick={onToggleMute}
            className="p-3 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 transition border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>

        {/* Audio Equalizer Animated Wave when playing */}
        {isPlaying && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5 h-4 bg-black/60 px-1.5 py-1 rounded-md backdrop-blur-sm">
            <span className="w-0.5 bg-pink-400 rounded-full animate-pulse h-full" />
            <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-3" />
            <span className="w-0.5 bg-sky-400 rounded-full animate-pulse h-full" />
          </div>
        )}
      </div>

      {/* Bottom Stream Details & Fast Action Bar */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
            {video.title}
          </h4>
          <p className="text-[10px] text-pink-300 truncate font-medium">
            {video.speakerOrArtist} • {video.churchOrMinistry}
          </p>
        </div>

        <button
          onClick={onExpand}
          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] shrink-0 shadow-md transition"
        >
          Expand
        </button>
      </div>
    </motion.div>
  );
}

import React, { useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  RadioTower, 
  CalendarDays, 
  Link2, 
  Sparkles, 
  Plus, 
  Video, 
  ChevronRight,
  Flame,
  Globe2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudioAction } from './CreatePage';

interface CreateModalDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: StudioAction, importSource?: 'device' | 'url' | 'youtube') => void;
}

export default function CreateModalDropdown({
  isOpen,
  onClose,
  onSelectAction
}: CreateModalDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#161618] border-2 border-slate-700/80 rounded-3xl p-3 shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
      >
        <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Kingdom Creator Studio
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Create + Broadcast</span>
        </div>

        <div className="space-y-1.5">
          {/* 1. Upload Video */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('upload', 'device');
              onClose();
            }}
            className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/80 transition flex items-start gap-3.5 group cursor-pointer border border-transparent hover:border-slate-700"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition">
                  Upload Video
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Upload a sermon, worship anthem, testimony, or teaching from your device.
              </p>
            </div>
          </button>

          {/* 2. Go Live */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('live');
              onClose();
            }}
            className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/80 transition flex items-start gap-3.5 group cursor-pointer border border-transparent hover:border-red-500/30"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition">
              <RadioTower className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-red-400 transition flex items-center gap-1.5">
                  <span>Go Live</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[9px] text-white font-bold">RTMP</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Broadcast your service or event live with OBS, vMix, and Live Control Room.
              </p>
            </div>
          </button>

          {/* 3. Schedule Broadcast */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('schedule');
              onClose();
            }}
            className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/80 transition flex items-start gap-3.5 group cursor-pointer border border-transparent hover:border-slate-700"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-blue-300 transition">
                  Schedule Broadcast
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Prepare an upcoming Sunday service or conference countdown.
              </p>
            </div>
          </button>

          {/* 4. Import Video (YouTube / External) */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('upload', 'youtube');
              onClose();
            }}
            className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/80 transition flex items-start gap-3.5 group cursor-pointer border border-transparent hover:border-slate-700"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-purple-300 transition">
                  Import from YouTube / URL
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Quickly import existing archive videos and playlists from YouTube.
              </p>
            </div>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

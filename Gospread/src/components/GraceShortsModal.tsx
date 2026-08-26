import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  DollarSign,
  Volume2,
  VolumeX,
  Play,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GRACE_SHORTS, GraceShort } from '../data/gospelData';
import { GivingTarget } from './GivingModal';

interface GraceShortsModalProps {
  onClose: () => void;
  onOpenGivingModal: (target: GivingTarget) => void;
}

export default function GraceShortsModal({
  onClose,
  onOpenGivingModal
}: GraceShortsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [amensCountMap, setAmensCountMap] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);

  const currentShort = GRACE_SHORTS[currentIndex];
  const isLiked = likedMap[currentShort.id] || false;
  const amens = amensCountMap[currentShort.id] || currentShort.amensCount;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GRACE_SHORTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? GRACE_SHORTS.length - 1 : prev - 1));
  };

  const handleToggleAmen = () => {
    setLikedMap((prev) => ({ ...prev, [currentShort.id]: !isLiked }));
    setAmensCountMap((prev) => ({
      ...prev,
      [currentShort.id]: (prev[currentShort.id] || currentShort.amensCount) + (isLiked ? -1 : 1)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm h-[88vh] max-h-[700px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col justify-between"
      >
        {/* Short Media Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentShort.videoUrl}
            alt={currentShort.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />
        </div>

        {/* Top Header Overlay */}
        <div className="relative z-10 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Grace Shorts
            </span>
            <span className="text-xs font-mono text-slate-300">
              {currentIndex + 1} / {GRACE_SHORTS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950/80 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Interaction Sidebar Controls */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
          {/* Amen Reaction Button */}
          <button
            onClick={handleToggleAmen}
            className="flex flex-col items-center gap-1"
          >
            <div className={`p-3 rounded-full transition shadow-lg ${
              isLiked ? 'bg-amber-500 text-slate-950 scale-110' : 'bg-slate-950/60 text-white hover:bg-slate-950'
            }`}>
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-slate-950' : ''}`} />
            </div>
            <span className="text-[10px] font-bold">{amens.toLocaleString()}</span>
          </button>

          {/* Seed Sower Button */}
          <button
            onClick={() => onOpenGivingModal({
              id: `short-${currentShort.id}`,
              name: currentShort.church,
              avatar: currentShort.avatar,
              type: 'church',
              categoryTitle: `Sow Seed for ${currentShort.speaker}`
            })}
            className="flex flex-col items-center gap-1"
            title="Sow Seed for this Creator Clip"
          >
            <div className="p-3 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-300">Sow Seed</span>
          </button>

          {/* Scroll Up / Down Controls */}
          <div className="flex flex-col gap-1 pt-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-slate-950/60 text-slate-300 hover:bg-slate-950 transition"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-slate-950/60 text-slate-300 hover:bg-slate-950 transition"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Content Info */}
        <div className="relative z-10 p-5 space-y-2 text-white pr-16">
          <div className="flex items-center gap-2">
            <img
              src={currentShort.avatar}
              alt={currentShort.speaker}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500"
            />
            <div>
              <h4 className="text-xs font-bold text-white">{currentShort.speaker}</h4>
              <p className="text-[10px] text-slate-300">{currentShort.church}</p>
            </div>
          </div>

          <h3 className="text-sm font-black font-serif text-amber-200 leading-snug">
            {currentShort.title}
          </h3>

          <div className="flex items-center gap-1.5 flex-wrap">
            {currentShort.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-mono text-amber-400/90 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Share2,
  Bookmark,
  Volume2,
  Check,
  Copy,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DAILY_RHEMA_PROMISES, RhemaPromise } from '../data/gospelData';

interface DailyPromiseModalProps {
  onClose: () => void;
  onSaveVerse?: (verseText: string) => void;
}

export default function DailyPromiseModal({
  onClose,
  onSaveVerse
}: DailyPromiseModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const hasPromises = DAILY_RHEMA_PROMISES.length > 0;
  const currentPromise = hasPromises ? DAILY_RHEMA_PROMISES[currentIndex] : null;

  const handleNext = () => {
    if (!hasPromises) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % DAILY_RHEMA_PROMISES.length);
  };

  const handleCopy = () => {
    if (!currentPromise) return;
    const textToCopy = `"` + currentPromise.scripture + `" - ` + currentPromise.verse + `\n\nDeclaration: "` + currentPromise.declaration + `"\nVia Gospread App`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAudio = () => {
    if (!currentPromise) return;
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-[#0e0e11] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl relative text-white flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif">Daily Rhema Word & Promise</h3>
              <p className="text-[10px] text-slate-400">
                {hasPromises ? `Card ${currentIndex + 1} of ${DAILY_RHEMA_PROMISES.length}` : 'No Daily Promises Active'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rhema Word Card Container */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[320px]">
          {currentPromise ? (
            <motion.div
              key={currentPromise.id}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full p-6 rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 space-y-4 shadow-xl relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span>📖</span>
                  <span>{currentPromise.badgeTag}</span>
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {currentPromise.verse}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-black font-serif text-white leading-snug">
                  "{currentPromise.scripture}"
                </h2>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                    Prophetic Declaration
                  </span>
                  <p className="text-xs text-slate-200 italic font-medium">
                    "{currentPromise.declaration}"
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {currentPromise.reflection}
              </p>
            </motion.div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-slate-300">No Rhema Promises Available</h4>
              <p className="text-xs text-slate-500 max-w-xs">Daily scripture promises and declarations will appear when updated from the sanctuary feed.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between gap-2">
          {currentPromise ? (
            <>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-bold flex items-center gap-1"
                  title="Copy scripture and declaration"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-2.5 rounded-xl transition text-xs font-bold flex items-center gap-1.5 ${
                    isPlayingAudio ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Listen to spoken declaration audio"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-[10px] hidden sm:inline">{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
                </button>
              </div>

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <span>Draw Next Rhema Word</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

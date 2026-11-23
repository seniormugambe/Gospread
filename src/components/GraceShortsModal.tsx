import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  MessageSquare,
  Eye,
  TrendingUp,
  Check,
  Flame,
  Repeat2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GraceShort, VideoStream } from '../data/gospelData';
import { GivingTarget } from './GivingModal';
import { shareWithInvite } from '../lib/invites';
import { videoPath } from '../lib/routes';

interface GraceShortsModalProps {
  onClose: () => void;
  onOpenGivingModal: (target: GivingTarget) => void;
  initialShortId?: string;
  /** Live shorts from the Django backend (from /shorts/) */
  shorts?: VideoStream[];
  onSelectVideo?: (video: VideoStream) => void;
}

/** Normalise a VideoStream into the shape GraceShortsModal expects internally */
function videoStreamToGraceShort(v: VideoStream): GraceShort {
  return {
    id: v.id,
    title: v.title,
    speaker: v.speakerOrArtist,
    church: v.churchOrMinistry,
    avatar: v.channelAvatar,
    likes: v.likesCount,
    amensCount: Number(v.likesCount) || 0,
    views: v.viewersCount ?? 0,
    commentCount: v.commentCount ?? 0,
    category: v.category,
    videoUrl: v.videoUrl || v.thumbnail,
    thumbnail: v.thumbnail,
    duration: v.duration || '0:45',
    tags: v.tags ?? [v.category],
    cropPosition: v.cropPosition,
  };
}

/** Returns the view-count threshold above which a short is "trending" (top ~25%). */
function trendingThreshold(shorts: GraceShort[]): number {
  if (shorts.length === 0) return Infinity;
  const counts = shorts.map((s) => s.views).sort((a, b) => b - a);
  const topQuarter = Math.max(1, Math.ceil(counts.length * 0.25));
  return counts[topQuarter - 1];
}

/** Format a large view count compactly. */
function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

type SortMode = 'newest' | 'trending' | 'popular';

const SORT_LABELS: Record<SortMode, string> = {
  newest: 'New',
  trending: 'Trending',
  popular: 'Most viewed',
};

export default function GraceShortsModal({
  onClose,
  onOpenGivingModal,
  initialShortId,
  shorts = [],
  onSelectVideo,
}: GraceShortsModalProps) {
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Collect all unique tags across shorts
  const allTags = Array.from(
    new Set(shorts.flatMap((s) => s.tags ?? []).filter(Boolean))
  ).slice(0, 10);
  const allCategories = Array.from(
    new Set(shorts.map((s) => s.category).filter(Boolean))
  );

  // Sort + filter
  const sortedShorts: GraceShort[] = (() => {
    let list = shorts.map(videoStreamToGraceShort);
    if (activeCategory) list = list.filter((s) => s.category === activeCategory);
    if (activeTag) list = list.filter((s) => s.tags.includes(activeTag));
    if (sortMode === 'trending') list = [...list].sort((a, b) => b.views - a.views);
    else if (sortMode === 'popular') list = [...list].sort((a, b) => Number(b.likes) - Number(a.likes));
    return list;
  })();

  const videoStreamById = new Map(shorts.map((v) => [v.id, v]));
  const threshold = trendingThreshold(sortedShorts);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialShortId) {
      const idx = sortedShorts.findIndex((s) => s.id === initialShortId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [amensCountMap, setAmensCountMap] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(true);

  // When sort/filter changes, snap back to 0 (or to the initial short if present)
  useEffect(() => {
    setCurrentIndex(0);
  }, [sortMode, activeCategory, activeTag]);

  const hasShorts = sortedShorts.length > 0;
  const currentShort = hasShorts ? sortedShorts[currentIndex] : null;
  const isLiked = currentShort ? (likedMap[currentShort.id] ?? false) : false;
  const amens = currentShort ? (amensCountMap[currentShort.id] ?? currentShort.amensCount) : 0;
  const isTrending = currentShort ? currentShort.views >= threshold && threshold > 0 : false;

  const goTo = useCallback((index: number) => {
    if (!hasShorts) return;
    setCurrentIndex(((index % sortedShorts.length) + sortedShorts.length) % sortedShorts.length);
  }, [hasShorts, sortedShorts.length]);

  const handleNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const handlePrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  useEffect(() => {
    if (!autoAdvance || !currentShort || currentShort.videoUrl !== currentShort.thumbnail) return;
    const match = currentShort.duration.match(/(?:(\d+):)?(\d+)/);
    const seconds = match
      ? (match[1] ? Number(match[1]) * 60 : 0) + Number(match[2])
      : 45;
    const timer = window.setTimeout(handleNext, Math.max(5, seconds || 45) * 1000);
    return () => window.clearTimeout(timer);
  }, [autoAdvance, currentShort, handleNext]);

  const handleToggleAmen = () => {
    if (!currentShort) return;
    setLikedMap((prev) => ({ ...prev, [currentShort.id]: !isLiked }));
    setAmensCountMap((prev) => ({
      ...prev,
      [currentShort.id]: (prev[currentShort.id] ?? currentShort.amensCount) + (isLiked ? -1 : 1),
    }));
  };

  const handleShare = async () => {
    if (!currentShort) return;
    const result = await shareWithInvite({
      title: currentShort.title,
      text: `Watch "${currentShort.title}" by ${currentShort.speaker} on Gospread.`,
      path: videoPath(currentShort.id, currentShort.title),
    });
    if (result === 'copied') {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-0 backdrop-blur-lg sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onTouchStart={(event) => {
          touchStartY.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const startY = touchStartY.current;
          touchStartY.current = null;
          if (startY === null) return;
          const deltaY = event.changedTouches[0].clientY - startY;
          if (Math.abs(deltaY) < 48) return;
          if (deltaY < 0) handleNext();
          else handlePrev();
        }}
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-900 shadow-2xl sm:h-[88vh] sm:max-h-[700px] sm:max-w-sm sm:rounded-3xl sm:border sm:border-slate-800"
      >
        {/* Short Media Background */}
        {currentShort ? (
          <div className="absolute inset-0 z-0">
            {currentShort.videoUrl && currentShort.videoUrl !== currentShort.thumbnail ? (
              <video
                key={currentShort.id}
                ref={videoRef}
                src={currentShort.videoUrl}
                poster={currentShort.thumbnail}
                className="w-full h-full object-cover"
                style={{ objectPosition: currentShort.cropPosition || '50% 50%' }}
                autoPlay
                loop={false}
                playsInline
                muted={isMuted}
                controls={false}
                onEnded={() => {
                  if (autoAdvance) handleNext();
                }}
                onClick={(e) => {
                  const el = e.currentTarget;
                  if (el.paused) void el.play(); else el.pause();
                }}
              />
            ) : (
              <img src={currentShort.thumbnail} alt={currentShort.title} className="w-full h-full object-cover opacity-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <Sparkles className="w-12 h-12 text-slate-600 animate-pulse" />
            <h3 className="text-base font-bold text-white">No Gospel Nuggets Available</h3>
            <p className="text-xs text-slate-400">Gospel Nuggets will appear when uploaded or published by ministry channels.</p>
          </div>
        )}

        {/* Top Header */}
        <div className="relative z-10 p-4 space-y-2.5">
          {/* Row 1 — Brand + counter + controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gospel Nuggets
              </span>
              {hasShorts && (
                <span className="text-xs font-mono text-slate-300">
                  {currentIndex + 1}/{sortedShorts.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {hasShorts && (
                <>
                  <button
                    onClick={() => setAutoAdvance((enabled) => !enabled)}
                    className={`p-2 rounded-full transition ${
                      autoAdvance
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-950/80'
                    }`}
                    aria-label={autoAdvance ? 'Disable auto-advance' : 'Enable auto-advance'}
                    title={autoAdvance ? 'Auto-advance on' : 'Auto-advance off'}
                  >
                    <Repeat2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950/80 transition"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950/80 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2 — Sort tabs */}
          {hasShorts && (
            <div className="flex items-center gap-1.5">
              {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition ${
                    sortMode === mode
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {mode === 'trending' && <Flame className="w-3 h-3" />}
                  {mode === 'popular' && <Eye className="w-3 h-3" />}
                  {SORT_LABELS[mode]}
                </button>
              ))}
            </div>
          )}

          {/* Row 3 — Category filter */}
          {allCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black transition ${
                  activeCategory === null
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                All categories
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black transition ${
                    activeCategory === category
                      ? 'bg-amber-500/90 text-slate-950'
                      : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Row 4 — Tag filter chips */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTag(null)}
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black transition ${
                  activeTag === null
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black transition ${
                    activeTag === tag
                      ? 'bg-amber-500/90 text-slate-950'
                      : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Interaction Sidebar */}
        {currentShort && (
          <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
            {/* Amen */}
            <button onClick={handleToggleAmen} className="flex flex-col items-center gap-1">
              <div className={`p-3 rounded-full transition shadow-lg ${
                isLiked ? 'bg-amber-500 text-slate-950 scale-110' : 'bg-slate-950/60 text-white hover:bg-slate-950'
              }`}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-slate-950' : ''}`} />
              </div>
              <span className="text-[10px] font-bold">{fmtViews(amens)}</span>
            </button>

            {/* View count */}
            <div className="flex flex-col items-center gap-1">
              <div className="p-3 rounded-full bg-slate-950/60">
                <Eye className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-slate-300">
                {fmtViews(currentShort.views)}
              </span>
            </div>

            {/* Comment count */}
            <div className="flex flex-col items-center gap-1" title={`${currentShort.commentCount} comments`}>
              <div className="p-3 rounded-full bg-slate-950/60">
                <MessageSquare className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-slate-300">
                {fmtViews(currentShort.commentCount)}
              </span>
            </div>

            {/* Share */}
            <button onClick={handleShare} className="flex flex-col items-center gap-1">
              <div className="p-3 rounded-full bg-slate-950/60 hover:bg-slate-950 transition shadow-lg">
                {linkCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5 text-white" />}
              </div>
              <span className="text-[10px] font-bold text-slate-300">{linkCopied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Sow Seed */}
            <button
              onClick={() => onOpenGivingModal({
                id: `short-${currentShort.id}`,
                name: currentShort.church,
                avatar: currentShort.avatar,
                type: 'church',
                categoryTitle: `Sow Seed for ${currentShort.speaker}`,
              })}
              className="flex flex-col items-center gap-1"
              title="Sow Seed for this Creator Clip"
            >
              <div className="p-3 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-amber-300">Sow Seed</span>
            </button>

            {/* Scroll controls */}
            <div className="flex flex-col gap-1 pt-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-slate-950/60 text-slate-300 hover:bg-slate-950 transition"
                aria-label="Previous"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-slate-950/60 text-slate-300 hover:bg-slate-950 transition"
                aria-label="Next"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Content Info */}
        {currentShort && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 space-y-2 pr-16">
            {/* Trending badge */}
            {isTrending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/90 text-white text-[10px] font-black">
                <TrendingUp className="w-3 h-3" /> Trending
              </span>
            )}

            <div className="flex items-center gap-2">
              <img
                src={currentShort.avatar}
                alt={currentShort.speaker}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentShort.speaker}</h4>
                <p className="text-[10px] text-slate-300 truncate">{currentShort.church}</p>
              </div>
            </div>

            <h3 className="text-sm font-black font-serif text-amber-200 leading-snug line-clamp-2">
              {currentShort.title}
            </h3>

            {/* Tags row */}
            {currentShort.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentShort.tags.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`text-[10px] font-mono font-medium transition ${
                      activeTag === tag ? 'text-amber-400' : 'text-amber-400/70 hover:text-amber-400'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Duration progress dots */}
            {sortedShorts.length > 1 && (
              <div className="flex items-center gap-1 pt-1">
                {sortedShorts.slice(0, Math.min(sortedShorts.length, 10)).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-4 h-1.5 bg-amber-400'
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to nugget ${i + 1}`}
                  />
                ))}
                {sortedShorts.length > 10 && (
                  <span className="text-[9px] text-slate-400 ml-1">+{sortedShorts.length - 10}</span>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

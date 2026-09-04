import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Play, 
  Bookmark, 
  Share2, 
  Clock, 
  Tv, 
  Check, 
  Sparkles,
  ArrowRight,
  Filter,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream } from '../data/gospelData';

export interface WatchHistoryItem {
  video: VideoStream;
  watchedAt: number;
}

interface WatchHistoryViewProps {
  watchHistory: WatchHistoryItem[];
  onSelectVideo: (video: VideoStream) => void;
  onRemoveItem: (videoId: string) => void;
  onClearHistory: () => void;
  onToggleSave: (videoId: string) => void;
  savedIds: string[];
  onNavigateHome: () => void;
  onDownloadVideo?: (video: VideoStream) => void;
}

export const WatchHistoryView: React.FC<WatchHistoryViewProps> = ({
  watchHistory,
  onSelectVideo,
  onRemoveItem,
  onClearHistory,
  onToggleSave,
  savedIds,
  onNavigateHome,
  onDownloadVideo,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter history by search term
  const filteredHistory = watchHistory.filter((item) => {
    if (!item || !item.video) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      Boolean(item.video.title && item.video.title.toLowerCase().includes(q)) ||
      Boolean(item.video.speakerOrArtist && item.video.speakerOrArtist.toLowerCase().includes(q)) ||
      Boolean(item.video.churchOrMinistry && item.video.churchOrMinistry.toLowerCase().includes(q))
    );
  });

  // Helper to format watch date/time
  const formatWatchTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group items by time categories
  const groupItemsByTime = (items: WatchHistoryItem[]) => {
    const now = Date.now();
    const today: WatchHistoryItem[] = [];
    const yesterday: WatchHistoryItem[] = [];
    const earlierThisWeek: WatchHistoryItem[] = [];
    const older: WatchHistoryItem[] = [];

    items.forEach((item) => {
      const diffMs = now - item.watchedAt;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays < 1) {
        today.push(item);
      } else if (diffDays < 2) {
        yesterday.push(item);
      } else if (diffDays < 7) {
        earlierThisWeek.push(item);
      } else {
        older.push(item);
      }
    });

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Earlier This Week', items: earlierThisWeek },
      { label: 'Older History', items: older },
    ].filter((group) => group.items.length > 0);
  };

  const groupedHistory = groupItemsByTime(filteredHistory);

  const handleShare = async (video: VideoStream) => {
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
          copyLink(video.id);
        }
      }
    } else {
      copyLink(video.id);
    }
  };

  const copyLink = (videoId: string) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedId(videoId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#18181b] to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <History className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Watch History</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                {watchHistory.length} {watchHistory.length === 1 ? 'Video' : 'Videos'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Easily review and resume your recent gospel video streams, worship broadcasts, and sermons.
            </p>
          </div>
        </div>

        {/* Controls: Search in history + Clear history */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 w-full md:w-auto">
          {/* History Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 rounded-full pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear All History Button */}
          {watchHistory.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-full bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              title="Clear entire watch history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#18181c] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Clear Watch History?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will clear all {watchHistory.length} recorded videos from your playback history. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main History Content List */}
      {watchHistory.length === 0 ? (
        /* Empty History State */
        <div className="py-16 px-4 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Your Watch History is Empty</h3>
            <p className="text-xs text-slate-400">
              Streams and sermons you watch will be saved here so you can easily pick up where you left off.
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
          >
            <Tv className="w-4 h-4" />
            <span>Explore Live Worship Streams</span>
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        /* No Search Filter Match State */
        <div className="py-12 text-center space-y-3">
          <p className="text-xs text-slate-400">No videos in your watch history match "{searchFilter}"</p>
          <button
            onClick={() => setSearchFilter('')}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-full transition"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Grouped Watch History List */
        <div className="space-y-8">
          {groupedHistory.map((group) => (
            <div key={group.label} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{group.label}</span>
                <span className="text-[10px] text-slate-600 font-normal">({group.items.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item, itemIdx) => {
                  if (!item || !item.video) return null;
                  const video = item.video;
                  const isSaved = savedIds.includes(video.id);

                  return (
                    <motion.div
                      key={`${video.id || itemIdx}-${item.watchedAt || itemIdx}`}
                      whileHover={{ y: -3, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.6), 0 5px 15px -5px rgba(245, 158, 11, 0.15)" }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="p-3 rounded-2xl bg-[#141416] border border-slate-800/90 hover:border-amber-500/50 transition flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Thumbnail Container */}
                        <div
                          onClick={() => onSelectVideo(video)}
                          className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 cursor-pointer mb-3"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition shadow-lg">
                              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                            </div>
                          </div>

                          {/* Live or Duration Badge */}
                          <div className="absolute bottom-2 right-2">
                            {video.isLive ? (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] rounded uppercase tracking-wider animate-pulse">
                                LIVE
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-black/80 text-white font-mono text-[9px] rounded font-bold">
                                {video.duration || '24:00'}
                              </span>
                            )}
                          </div>

                          {/* Relative Watched Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[10px] font-medium text-amber-300 flex items-center gap-1 shadow-md">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{formatWatchTime(item.watchedAt)}</span>
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1">
                          <h4
                            onClick={() => onSelectVideo(video)}
                            className="text-xs font-bold text-white line-clamp-2 hover:text-amber-400 transition cursor-pointer"
                          >
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {video.speakerOrArtist} • {video.churchOrMinistry}
                          </p>
                          {video.bibleVerse && (
                            <p className="text-[10px] text-amber-300/80 italic truncate pt-0.5">
                              📖 {video.bibleVerse}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectVideo(video)}
                          className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-amber-400" />
                          <span>Watch</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Save / Bookmark Button */}
                          <button
                            onClick={() => onToggleSave(video.id)}
                            className={`p-1.5 rounded-full transition ${
                              isSaved
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title={isSaved ? 'Saved to Library' : 'Save to Library'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => handleShare(video)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Share Video"
                          >
                            {copiedId === video.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Download Button */}
                          {onDownloadVideo && (
                            <button
                              onClick={() => onDownloadVideo(video)}
                              className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                              title="Download Video for Offline Watching"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Remove item from history */}
                          <button
                            onClick={() => onRemoveItem(video.id)}
                            className="p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Remove from history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

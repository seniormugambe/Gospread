import React from 'react';
import { motion } from 'motion/react';
import { Play, CheckCircle2, Headphones, Tv } from 'lucide-react';
import { VideoStream } from '../data/gospelData';
import { decodeHtml } from '../lib/utils';

interface StreamingVideoCardProps {
  video: VideoStream;
  onSelect: (video: VideoStream) => void;
  onPlayAudio?: (video: VideoStream) => void;
  onOpenChannel?: (channelName: string) => void;
  className?: string;
  showCategoryBadge?: boolean;
}

export const StreamingVideoCard: React.FC<StreamingVideoCardProps> = ({
  video,
  onSelect,
  onPlayAudio,
  onOpenChannel,
  className = '',
  showCategoryBadge = false,
}) => {
  if (!video) return null;

  const isLive = video.isLive;
  const viewersText = isLive
    ? video.viewsText || (video.viewersCount
      ? video.viewersCount >= 1000
        ? `${(video.viewersCount / 1000).toFixed(1)}K watching`
        : `${video.viewersCount} watching`
      : 'Live now')
    : video.viewsText || '142K views';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onSelect(video)}
      className={`group cursor-pointer flex flex-col space-y-2.5 select-none ${className}`}
    >
      {/* 1. Dominant 16:9 Video Thumbnail with Watch & Listen Overlay */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md">
        <img
          src={video.thumbnail}
          alt={video.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Hover Ambient Overlay with Dual Watch & Listen Options */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(video);
            }}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xl transform scale-95 hover:scale-105 transition"
            title="Watch Full Video"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Watch</span>
          </button>

          {onPlayAudio && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio(video);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-xl transform scale-95 hover:scale-105 transition"
              title="Listen in Background Audio Mode"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span>Listen</span>
            </button>
          )}
        </div>

        {/* Live Indicator or Duration Pill */}
        {isLive ? (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>
        ) : (
          video.duration && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 text-white text-[11px] font-mono tracking-tight shadow-md">
              {video.duration}
            </span>
          )
        )}

        {/* Optional Series or Topic Tag (Top Left) */}
        {video.seriesName && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-amber-300 text-[10px] font-bold tracking-tight">
            {video.seriesName}
          </span>
        )}
      </div>

      {/* 2. Streamlined Video Metadata */}
      <div className="flex items-start space-x-3 px-0.5">
        {/* Channel Avatar */}
        {video.channelAvatar && (
          <img
            src={video.channelAvatar}
            alt={video.churchOrMinistry}
            onClick={(e) => {
              if (onOpenChannel) {
                e.stopPropagation();
                onOpenChannel(video.churchOrMinistry);
              }
            }}
            className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-700/80 hover:ring-2 hover:ring-amber-400 transition cursor-pointer"
            title={video.churchOrMinistry}
          />
        )}

        {/* Title, Ministry & Stats */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Live Badge for Live Videos above or beside title */}
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                LIVE
              </span>
              {showCategoryBadge && video.category && (
                <span className="text-[10px] text-slate-400">• {video.category}</span>
              )}
            </div>
          )}

          {/* Video Title */}
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
            {decodeHtml(video.title)}
          </h3>

          {/* Ministry / Speaker with Verified Checkmark */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate">
              <span
                onClick={(e) => {
                  if (onOpenChannel) {
                    e.stopPropagation();
                    onOpenChannel(video.churchOrMinistry);
                  }
                }}
                className="font-medium hover:text-amber-400 truncate cursor-pointer transition-colors"
              >
                {video.churchOrMinistry}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
            </div>

            {/* Quick Listen pill button */}
            {onPlayAudio && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio(video);
                }}
                className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 shrink-0 transition"
                title="Listen in Background Audio Mode"
              >
                <Headphones className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Listen</span>
              </button>
            )}
          </div>

          {/* Views or Viewers Count */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {isLive ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-black tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
                <span className="text-amber-300 font-semibold">{viewersText}</span>
              </div>
            ) : (
              <>
                <span>{viewersText}</span>
                {video.date && (
                  <>
                    <span>•</span>
                    <span>{video.date}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreamingVideoCard;

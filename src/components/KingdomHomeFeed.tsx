import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Radio,
  Tv,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Building2,
  BookOpen,
  Heart,
  DollarSign,
  Flame,
  Globe,
  Sparkles,
  ArrowRight,
  Share2,
  Calendar,
  Volume2,
  Headphones,
  Compass,
  TrendingUp,
  Award,
  ChevronRight,
  Users,
  HeartHandshake
} from 'lucide-react';
import { VideoStream, AudioTrack, LIVE_VIDEO_STREAMS, AUDIO_TRACKS } from '../data/gospelData';
import { decodeHtml } from '../lib/utils';
import { GivingTarget } from './GivingModal';
import { DISCOVER_MINISTRIES } from './DiscoverMinistriesHub';
import WatchFirstBelongLaterCard from './WatchFirstBelongLaterCard';
import { UserSession } from './AuthModal';

interface KingdomHomeFeedProps {
  videoStreams: VideoStream[];
  audioQueue: AudioTrack[];
  currentAudio: AudioTrack | null;
  isAudioPlaying: boolean;
  onSelectVideo: (video: VideoStream) => void;
  onPlayAudioTrack: (track: AudioTrack) => void;
  subscribedChannels: string[];
  onToggleFollow: (channelName: string) => void;
  onOpenChannelModal: (channelName: string) => void;
  onOpenGivingModal: (target?: GivingTarget) => void;
  onOpenDailyPromise: () => void;
  onOpenDailyStreak: () => void;
  onOpenPrayerModal: () => void;
  onNavigateTab: (tab: 'platform' | 'discover' | 'community' | 'profile' | 'create') => void;
  followerCounts: Record<string, number>;
  streakDays?: number;
  praiseXp?: number;
  userSession?: UserSession;
  watchHistoryCount?: number;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
}

export default function KingdomHomeFeed({
  videoStreams = [],
  audioQueue = [],
  currentAudio,
  isAudioPlaying,
  onSelectVideo,
  onPlayAudioTrack,
  subscribedChannels = [],
  onToggleFollow,
  onOpenChannelModal,
  onOpenGivingModal,
  onOpenDailyPromise,
  onOpenDailyStreak,
  onOpenPrayerModal,
  onNavigateTab,
  followerCounts = {},
  streakDays = 5,
  praiseXp = 1250,
  userSession = {
    id: 'guest',
    username: 'guest_worshipper',
    fullName: 'Guest Worshipper',
    isLoggedIn: false
  } as UserSession,
  watchHistoryCount = 0,
  onOpenAuthPage = () => {}
}: KingdomHomeFeedProps) {
  const [selectedWatchCategory, setSelectedWatchCategory] = useState<string>('All');
  const [activeTabJourney, setActiveTabJourney] = useState<'now' | 'watch' | 'follow' | 'grow'>('now');

  // Safe fallbacks to guarantee streams are never undefined
  const safeVideos = (videoStreams && videoStreams.length > 0) ? videoStreams : LIVE_VIDEO_STREAMS;
  const safeAudio = (audioQueue && audioQueue.length > 0) ? audioQueue : AUDIO_TRACKS;

  const liveRadioTrack = safeAudio.find((a) => a?.isLiveRadio || a?.category === '24/7 Gospel Radio') || safeAudio[0] || AUDIO_TRACKS[0];

  // Filter video list based on category for "What should I watch?"
  const watchCategories = [
    { id: 'All', label: 'All Curated' },
    { id: 'Sermon', label: 'Apostolic Sermons' },
    { id: 'Live Worship', label: 'Worship Sanctuaries' },
    { id: 'Choir Special', label: 'Choir Anthems' },
    { id: 'Gospel Music', label: 'Psalmist Concerts' }
  ];

  const curatedVideos = selectedWatchCategory === 'All'
    ? safeVideos
    : safeVideos.filter((v) => v?.category === selectedWatchCategory);

  return (
    <div className="space-y-8 sm:space-y-10 pb-12 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* ========================================================================= */}
      {/* 🔴 1. WHAT'S HAPPENING NOW? (REAL-TIME LIVE SANCTUARIES & GLOBAL PULSE)     */}
      {/* ========================================================================= */}
      <section id="section-now" className="space-y-4 scroll-mt-20">
        
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-serif tracking-tight">
              What&apos;s happening NOW?
            </h2>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">
              • Live broadcasts &amp; 24/7 radio
            </span>
          </div>

          {/* Real-time Global Counter Indicator */}
          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-red-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black text-amber-300 font-mono">
              38,420 Believers
            </span>
            <span className="text-[10px] text-slate-400 hidden md:inline">
              worshipping now
            </span>
          </div>
        </div>

        {/* 📻 SECONDARY REAL-TIME FEEDS: 24/7 GLOBAL GOSPEL RADIO & PRAYER ALTAR TICKER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 24/7 Gospel Radio Live Feed */}
          {liveRadioTrack && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-red-500/30 flex items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  onClick={() => onPlayAudioTrack(liveRadioTrack)}
                  className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 ring-2 ring-red-500/40 cursor-pointer group shadow-lg"
                >
                  <img src={liveRadioTrack.coverUrl} alt={liveRadioTrack.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded uppercase">
                      24/7 Live Radio
                    </span>
                    <span className="text-[10px] text-red-300 font-mono">18,240 Listeners</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">{liveRadioTrack.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{liveRadioTrack.artistOrPreacher}</p>
                </div>
              </div>

              <button
                onClick={() => onPlayAudioTrack(liveRadioTrack)}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-600/20"
              >
                {currentAudio?.id === liveRadioTrack.id && isAudioPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Listen Live</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 🕊️ Real-Time Prayer Altar Agreement Feed */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-red-400 fill-red-400/30 animate-pulse" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold text-[9px] rounded uppercase">
                    Prayer Altar Active
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">14 Amens this min</span>
                </div>
                <p className="text-xs font-semibold text-white truncate mt-1">
                  &quot;Standing for complete healing in family & financial open heavens&quot;
                </p>
                <p className="text-[10px] text-slate-400">Sister Joy (Atlanta Campus) • 2 min ago</p>
              </div>
            </div>

            <button
              onClick={onOpenPrayerModal}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition shrink-0"
            >
              Join Prayer
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📺 2. WHAT SHOULD I WATCH? (CURATED REVELATIONS & ANCHORED SERMONS)       */}
      {/* ========================================================================= */}
      <section id="section-watch" className="space-y-6 scroll-mt-20">
        
        {/* Section Header & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              CURATED FOR YOUR SPIRIT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif mt-1">
              What should I watch?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Anointed teachings, covenant revelations, and apostolic sermon series for your growth.
            </p>
          </div>

          {/* Watch Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {watchCategories.map((cat) => {
              const isSelected = selectedWatchCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedWatchCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🌟 FEATURED SPOTLIGHT SERMON */}
        {(() => {
          const featuredSermon = safeVideos.find(v => !v?.isLive) || safeVideos[1] || safeVideos[0];
          if (!featuredSermon) return null;
          return (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div 
                onClick={() => onSelectVideo(featuredSermon)}
                className="md:col-span-5 relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group shadow-xl"
              >
                <img src={featuredSermon.thumbnail} alt={featuredSermon.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white font-mono text-[10px] rounded">
                  {featuredSermon.duration || 'Full Sermon'}
                </span>
                {featuredSermon.seriesName && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg shadow-md uppercase">
                    {featuredSermon.seriesName}
                  </span>
                )}
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    Recommended Message Today
                  </span>
                  <span className="text-xs text-slate-400">{featuredSermon.viewsText || (featuredSermon.viewersCount ? `${featuredSermon.viewersCount} watching` : '142K views')}</span>
                </div>

                <h3 
                  onClick={() => onSelectVideo(featuredSermon)}
                  className="text-lg sm:text-2xl font-black text-white font-serif leading-snug cursor-pointer hover:text-amber-300 transition"
                >
                  {decodeHtml(featuredSermon.title)}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {decodeHtml(featuredSermon.description)}
                </p>

                {featuredSermon.bibleVerse && (
                  <p className="text-xs text-amber-300/90 font-serif italic">
                    📖 {featuredSermon.bibleVerse}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onSelectVideo(featuredSermon)}
                    className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Sermon</span>
                  </button>

                  <button
                    onClick={() => onOpenChannelModal(featuredSermon.churchOrMinistry)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                  >
                    View Ministry Series
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {curatedVideos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onSelectVideo(video)}
              className="p-3 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition cursor-pointer group space-y-3 shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
                {video.isLive ? (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                    LIVE
                  </span>
                ) : (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                    {video.duration}
                  </span>
                )}
                {video.seriesName && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-amber-300 text-[9px] font-bold">
                    {video.seriesName}
                  </span>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300 transition leading-snug">
                  {decodeHtml(video.title)}
                </h4>
                
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChannelModal(video.churchOrMinistry);
                    }}
                    className="hover:text-amber-400 truncate max-w-[65%]"
                  >
                    {decodeHtml(video.churchOrMinistry)}
                  </span>
                  <span>{video.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏛️ 3. WHO SHOULD I FOLLOW? (ANOINTED MINISTRIES, CHURCHES & PSALMISTS)   */}
      {/* ========================================================================= */}
      <section id="section-follow" className="space-y-6 scroll-mt-20">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest">
              ANOINTED VOICES & SANCTUARIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif mt-1">
              Who should I follow?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Connect with apostolic ministries, global worship psalmists, and Bible expositors.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('discover')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto transition"
          >
            <span>Explore All 24+ Ministries</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {DISCOVER_MINISTRIES.map((ministry) => {
            const isFollowed = subscribedChannels.includes(ministry.name);
            return (
              <motion.div
                key={ministry.id}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Avatar & Follow Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={ministry.avatar} 
                        alt={ministry.name} 
                        onClick={() => onOpenChannelModal(ministry.name)}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 cursor-pointer hover:ring-amber-400 transition shrink-0"
                      />
                      <div>
                        <h4 
                          onClick={() => onOpenChannelModal(ministry.name)}
                          className="text-sm font-bold text-white hover:text-amber-300 cursor-pointer flex items-center gap-1 leading-snug"
                        >
                          {ministry.name}
                          {ministry.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400 shrink-0" />}
                        </h4>
                        <p className="text-[11px] text-amber-300/90 font-medium">{ministry.followersFormatted} Followers</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleFollow(ministry.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                        isFollowed
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20'
                      }`}
                    >
                      {isFollowed ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {ministry.description}
                  </p>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{ministry.locationOrOrigin}</span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenChannelModal(ministry.name)}
                    className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Digital Sanctuary Home</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🌱 4. HOW CAN I GROW? (DAILY RHEMA, DISCIPLESHIP, PRAYER & GIVING)       */}
      {/* ========================================================================= */}
      <section id="section-grow" className="space-y-6 scroll-mt-20">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
              SPIRITUAL DISCIPLESHIP & MOMENTUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif mt-1">
              How can I grow?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Cultivate daily intimacy with Christ through the Word, audio meditation, intercession, and kingdom stewardship.
            </p>
          </div>

          <div 
            onClick={onOpenDailyStreak}
            className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 cursor-pointer hover:bg-amber-500/20 transition self-start sm:self-auto"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-xs font-bold text-amber-300 font-mono">{streakDays} Day Faith Streak</span>
            <span className="text-[10px] text-slate-400">• {praiseXp} Praise XP</span>
          </div>
        </div>

        {/* 4 Interactive Growth Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pillar 1: Daily Rhema Promise */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Daily Rhema Promise</h3>
              <p className="text-xs text-amber-200/90 font-serif italic">
                &quot;Fear not, for I am with you; be not dismayed, for I am your God.&quot;
              </p>
              <p className="text-[10px] text-slate-400 font-bold">— Isaiah 41:10</p>
            </div>

            <button
              onClick={onOpenDailyPromise}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-md"
            >
              Read Today&apos;s Word
            </button>
          </div>

          {/* Pillar 2: 24/7 Audio & Podcasts */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-red-500/40 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Audio Podcasts & Radio</h3>
              <p className="text-xs text-slate-300">
                Immerse your spirit in daily devotionals, continuous gospel radio, and audio sermons on the go.
              </p>
            </div>

            <button
              onClick={() => {
                if (liveRadioTrack) onPlayAudioTrack(liveRadioTrack);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
            >
              Listen to Audio Feed
            </button>
          </div>

          {/* Pillar 3: 24/7 Prayer Altar & Community */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Prayer Wall & Fellowship</h3>
              <p className="text-xs text-slate-300">
                Post your prayer burden or praise report, and join global saints praying in real-time agreement.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('community')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs transition border border-slate-700"
            >
              Enter Fellowship Wall
            </button>
          </div>

          {/* Pillar 4: Kingdom Stewardship / Sowing */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Kingdom Stewardship</h3>
              <p className="text-xs text-slate-300">
                Sow tithes, cathedral expansion seeds, and world mission offerings directly to verified ministries.
              </p>
            </div>

            <button
              onClick={() => onOpenGivingModal()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
            >
              Give / Sow Seed
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}

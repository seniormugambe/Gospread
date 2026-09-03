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
  Music,
  Headphones,
  ChevronRight,
  Sparkles,
  Volume2,
  Clapperboard,
  Podcast,
  Users
} from 'lucide-react';
import { VideoStream, AudioTrack, LIVE_VIDEO_STREAMS, AUDIO_TRACKS, GRACE_SHORTS } from '../data/gospelData';
import { decodeHtml } from '../lib/utils';
import { GivingTarget } from './GivingModal';
import { DISCOVER_MINISTRIES } from './DiscoverMinistriesHub';
import StreamingVideoCard from './StreamingVideoCard';
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
  onOpenGivingModal?: (target?: GivingTarget) => void;
  onOpenDailyPromise?: () => void;
  onOpenDailyStreak?: () => void;
  onOpenPrayerModal?: () => void;
  onNavigateTab: (tab: 'platform' | 'discover' | 'community' | 'profile' | 'create') => void;
  followerCounts: Record<string, number>;
  userSession?: UserSession;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
  onOpenShorts?: () => void;
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
  onNavigateTab,
  followerCounts = {},
  userSession,
  onOpenAuthPage = () => {},
  onOpenShorts = () => {},
}: KingdomHomeFeedProps) {
  // Simplified Filters: All | Live | Sermons | Worship | Podcasts | Ministries
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Live' | 'Sermons' | 'Worship' | 'Shorts' | 'Podcasts' | 'Ministries'>('All');

  const safeVideos = (videoStreams && videoStreams.length > 0) ? videoStreams : LIVE_VIDEO_STREAMS;
  const safeAudio = (audioQueue && audioQueue.length > 0) ? audioQueue : AUDIO_TRACKS;

  // Categorized video streams
  const liveStreams = safeVideos.filter((v) => v.isLive);
  const sermonVideos = safeVideos.filter((v) => !v.isLive && v.category === 'Sermon');
  const worshipVideos = safeVideos.filter((v) => !v.isLive && (v.category === 'Live Worship' || v.category === 'Choir Special' || v.category === 'Gospel Music'));
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Spotlight Live Stream for the Hero Banner
  const heroLiveStream = liveStreams[0] || safeVideos[0];
  const heroViewers = heroLiveStream?.viewersCount 
    ? `${(heroLiveStream.viewersCount / 1000).toFixed(1)}K watching`
    : '2.4K watching';

  const liveRadioTrack = safeAudio.find((a) => a?.isLiveRadio || a?.category === '24/7 Gospel Radio') || safeAudio[0];

  const filterTabs: Array<{ id: 'All' | 'Live' | 'Sermons' | 'Worship' | 'Shorts' | 'Podcasts' | 'Ministries'; label: string; icon: React.ElementType }> = [
    { id: 'Live', label: 'Live', icon: Radio },
    { id: 'Sermons', label: 'Sermons', icon: BookOpen },
    { id: 'Worship', label: 'Worship', icon: Music },
    { id: 'Shorts', label: 'Shorts', icon: Clapperboard },
    { id: 'Podcasts', label: 'Podcasts', icon: Podcast },
    { id: 'Ministries', label: 'Ministries', icon: Users },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="pt-4 sm:pt-8 space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">{dayName} on Gospread</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">{greeting}{userSession?.fullName ? `, ${userSession.fullName.split(' ')[0]}` : ''}.</h1>
          <p className="mt-2 text-sm text-slate-400">What would you like to watch, hear, or carry with you today?</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black shrink-0 transition ${selectedFilter === tab.id ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-400/20' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🧭 SIMPLIFIED CATEGORY FILTERS: All | Live | Sermons | Worship | Podcasts | Ministries */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none border-b border-slate-800/60">
        <button
          onClick={() => setSelectedFilter('All')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 select-none ${selectedFilter === 'All' ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'}`}
        >
          For You
        </button>
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {tab.id === 'Live' && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ⚡ FOR YOU: SHORTS KEEP THE PLATFORM ALIVE BETWEEN BROADCASTS             */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Shorts') && GRACE_SHORTS.length > 0 && (
        <section id="section-shorts" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-slate-950"><Sparkles className="w-4 h-4" /></span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">For You</h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">A little faith for the space between moments.</p>
            </div>
            <button onClick={onOpenShorts} className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0">
              Open Shorts <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {GRACE_SHORTS.slice(0, 4).map((short, index) => (
              <motion.button
                key={short.id}
                type="button"
                onClick={onOpenShorts}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="group text-left relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-lg"
              >
                <img src={short.thumbnail} alt={short.title} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 right-3 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-mono font-bold text-white">{short.duration}</span>
                <span className="absolute top-3 left-3 rounded-md bg-orange-500 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-950">Short</span>
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-[10px] font-bold text-amber-300 truncate">{short.speaker}</p>
                  <h3 className="mt-1 text-sm font-black leading-snug text-white line-clamp-3">{short.title}</h3>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🔴 HERO: LIVE NOW (CONTENT-FIRST WIDESCREEN SPOTLIGHT)                    */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Live') && heroLiveStream && (
        <section className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl group">
          {/* Ambient Background & Thumbnail */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] md:aspect-[21/8] w-full max-h-[460px] overflow-hidden">
            <img
              src={heroLiveStream.thumbnail}
              alt={heroLiveStream.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Top Live Badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE NOW
              </span>
              {heroLiveStream.seriesName && (
                <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-xs font-semibold">
                  {heroLiveStream.seriesName}
                </span>
              )}
            </div>

            {/* Center / Bottom Content Overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <div 
                  onClick={() => onOpenChannelModal(heroLiveStream.churchOrMinistry)}
                  className="flex items-center gap-2 cursor-pointer group/min hover:text-amber-400 transition"
                >
                  <img
                    src={heroLiveStream.channelAvatar}
                    alt={heroLiveStream.churchOrMinistry}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/60"
                  />
                  <span className="text-sm font-bold text-amber-300 group-hover/min:text-amber-200 flex items-center gap-1">
                    {heroLiveStream.churchOrMinistry}
                    <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  </span>
                </div>

                <h1 
                  onClick={() => onSelectVideo(heroLiveStream)}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight leading-snug cursor-pointer hover:text-amber-200 transition"
                >
                  {decodeHtml(heroLiveStream.title)}
                </h1>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Ministry
                  </span>
                  <span>•</span>
                  <span className="text-amber-300 font-mono font-bold">{heroViewers}</span>
                </div>
              </div>

              {/* Watch Live Primary Action */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onSelectVideo(heroLiveStream)}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition flex items-center gap-2 shadow-xl shadow-red-600/30 hover:scale-[1.02] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH LIVE</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🔴 1. LIVE SECTION                                                        */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Live') && (
        <section id="section-live" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>🔴 Live Broadcasts</span>
                <span className="text-xs font-normal text-slate-400">
                  ({liveStreams.length} active)
                </span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {liveStreams.map((video) => (
              <StreamingVideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onOpenChannel={onOpenChannelModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📖 2. SERMONS SECTION                                                     */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Sermons') && (
        <section id="section-sermons" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Sermons &amp; Teachings
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Apostolic exposition &amp; revelation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {sermonVideos.map((video) => (
              <StreamingVideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onOpenChannel={onOpenChannelModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🎵 3. WORSHIP SECTION                                                     */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Worship') && (
        <section id="section-worship" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎵</span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Anointed Worship &amp; Praise
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Praise nights, choirs &amp; acoustic sanctuaries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {worshipVideos.map((video) => (
              <StreamingVideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onOpenChannel={onOpenChannelModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📻 4. PODCASTS & AUDIO FEEDS                                              */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Podcasts') && liveRadioTrack && (
        <section id="section-podcasts" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-red-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Podcasts &amp; 24/7 Gospel Radio
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Continuous audio stream</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Radio Banner */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 shadow-xl">
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

            {/* Audio Sermons & Devotionals Quick List */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[9px] rounded uppercase">
                    Daily Audio Manna
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">Faith for Supernatural Increase</h4>
                  <p className="text-[11px] text-slate-400 truncate">Senior Pastor David Williams • 28 min</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const podcastTrack = safeAudio.find(a => a.category === 'Audio Sermon') || liveRadioTrack;
                  onPlayAudioTrack(podcastTrack);
                }}
                className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Episode</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* ⛪ 5. MINISTRIES SECTION                                                   */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Ministries') && (
        <section id="section-ministries" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⛪</span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Ministries &amp; Sanctuaries
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('discover')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition"
            >
              <span>Explore All Ministries</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DISCOVER_MINISTRIES.slice(0, 4).map((ministry) => {
              const isFollowed = subscribedChannels.includes(ministry.name);
              const count = followerCounts[ministry.name] || 12000;
              const followersFormatted = count > 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

              return (
                <div
                  key={ministry.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 p-4 flex flex-col justify-between space-y-3 transition-colors shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ministry.avatar}
                      alt={ministry.name}
                      onClick={() => onOpenChannelModal(ministry.name)}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800 cursor-pointer hover:ring-amber-400 transition shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => onOpenChannelModal(ministry.name)}
                        className="text-sm font-bold text-white hover:text-amber-300 truncate cursor-pointer flex items-center gap-1"
                      >
                        {ministry.name}
                        {ministry.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">{followersFormatted} followers</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {ministry.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => onOpenChannelModal(ministry.name)}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition text-center"
                    >
                      Sanctuary
                    </button>
                    <button
                      onClick={() => onToggleFollow(ministry.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isFollowed
                          ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                      }`}
                    >
                      {isFollowed ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

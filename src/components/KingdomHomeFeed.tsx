import React, { useState, useEffect } from 'react';
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
  Users,
  Zap,
  Bell,
  BellRing,
  Calendar,
  Clock,
  Heart,
  History,
  RotateCcw
} from 'lucide-react';
import { VideoStream, AudioTrack, LIVE_VIDEO_STREAMS, GRACE_SHORTS, AUDIO_TRACKS } from '../data/gospelData';
import { decodeHtml } from '../lib/utils';
import { GivingTarget } from './GivingModal';
import { DISCOVER_MINISTRIES } from './DiscoverMinistriesHub';
import StreamingVideoCard from './StreamingVideoCard';
import { UserSession } from './AuthModal';
import { WatchHistoryItem } from './WatchHistoryView';
import { ActiveAudioSpace } from './AudioSpaceStudio';

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
  onNavigateTab: (tab: 'platform' | 'discover' | 'community' | 'profile' | 'create' | 'history') => void;
  followerCounts: Record<string, number>;
  userSession?: UserSession;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
  onOpenShorts?: (shortId?: string) => void;
  shorts?: VideoStream[];
  watchHistory?: WatchHistoryItem[];
  onRemoveWatchHistory?: (videoId: string) => void;
  activeAudioSpace?: ActiveAudioSpace | null;
  onJoinAudioSpace?: () => void;
}

// Curated scheduled upcoming broadcasts from partner sanctuaries
const UPCOMING_CHURCH_SERVICES = [
  {
    id: 'up-1',
    churchName: 'Grace City Cathedral',
    churchAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    title: 'Mid-Week Communion & Prophetic Impartation',
    speaker: 'Senior Pastor David Williams',
    scheduledTime: 'Tonight • 7:30 PM EST',
    tag: 'Holy Communion',
    countdown: 'In 3h 15m',
    attendees: 1840,
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'up-2',
    churchName: 'Elevation Praise Center',
    churchAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    title: 'Night of Supernatural Worship & Intercession',
    speaker: 'Pastor Steven Furtick',
    scheduledTime: 'Friday • 8:00 PM EST',
    tag: 'Worship Encounter',
    countdown: 'In 2 days',
    attendees: 2410,
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'up-3',
    churchName: 'Kingdom Chapel',
    churchAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    title: 'Prophetic Encounter & Supernatural Anointing Service',
    speaker: 'Bishop Emmanuel K.',
    scheduledTime: 'Sunday • 9:00 AM EST',
    tag: 'Flagship Service',
    countdown: 'This Sunday',
    attendees: 1120,
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'up-4',
    churchName: 'New Life Church',
    churchAvatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=300&q=80',
    title: 'Deliverance & Miracle Revival Altar',
    speaker: 'Pastor Michael Evans',
    scheduledTime: 'Sunday • 11:15 AM EST',
    tag: 'Miracle Service',
    countdown: 'This Sunday',
    attendees: 1530,
    thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80'
  }
];

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
  onOpenShorts = (_shortId?: string) => {},
  shorts = [],
  watchHistory = [],
  onRemoveWatchHistory = () => {},
  activeAudioSpace,
  onJoinAudioSpace = () => {},
}: KingdomHomeFeedProps) {
  // Mode: Guest vs Returning Logged-in Viewer
  const isActuallyLoggedIn = Boolean(
    userSession?.isLoggedIn || (userSession?.id && userSession.id !== 'usr-guest')
  );

  const [viewingMode, setViewingMode] = useState<'guest' | 'returning'>(() => {
    return isActuallyLoggedIn ? 'returning' : 'guest';
  });

  // Sync viewing mode if user signs in or out
  useEffect(() => {
    if (isActuallyLoggedIn) {
      setViewingMode('returning');
    }
  }, [isActuallyLoggedIn]);

  // Simplified Category Filters: All | Live | Sermons | Worship | Shorts | Podcasts | Ministries
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Live' | 'Sermons' | 'Worship' | 'Shorts' | 'Podcasts' | 'Ministries'>('All');

  // Reminders for upcoming church services
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [showAllNetworkLive, setShowAllNetworkLive] = useState(false);

  const toggleReminder = (serviceId: string) => {
    setReminders((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const safeVideos = videoStreams && videoStreams.length > 0 ? videoStreams : LIVE_VIDEO_STREAMS;
  const safeAudio = audioQueue && audioQueue.length > 0 ? audioQueue : AUDIO_TRACKS;

  // Categorized video streams
  const liveStreams = safeVideos.filter((v) => Boolean(v && v.isLive));
  const fallbackSermons = LIVE_VIDEO_STREAMS.filter((v) => !v.isLive && v.category === 'Sermon');
  const sermonVideos = safeVideos.filter((v) => v && !v.isLive && v.category === 'Sermon');
  const effectiveSermons = sermonVideos.length > 0 ? sermonVideos : fallbackSermons;

  const fallbackWorship = LIVE_VIDEO_STREAMS.filter(
    (v) => !v.isLive && (v.category === 'Live Worship' || v.category === 'Choir Special' || v.category === 'Gospel Music')
  );
  const worshipVideos = safeVideos.filter(
    (v) => v && !v.isLive && (v.category === 'Live Worship' || v.category === 'Choir Special' || v.category === 'Gospel Music')
  );
  const effectiveWorship = worshipVideos.length > 0 ? worshipVideos : fallbackWorship;

  // Returning user's followed churches live streams
  const effectiveSubscribed =
    subscribedChannels && subscribedChannels.length > 0
      ? subscribedChannels
      : ['Grace City Cathedral', 'Elevation Praise Center', 'New Life Church'];

  const yourChurchesLive = liveStreams.filter((v) =>
    v && effectiveSubscribed.some(
      (ch) =>
        (v.churchOrMinistry && v.churchOrMinistry.toLowerCase().includes(ch.toLowerCase())) ||
        (v.speakerOrArtist && v.speakerOrArtist.toLowerCase().includes(ch.toLowerCase()))
    )
  );

  // Continue Watching items with resume progress bars
  const continueWatchingItems =
    watchHistory && watchHistory.length > 0
      ? watchHistory
          .filter((h) => h && (h.video?.title || (h as any)?.title))
          .slice(0, 4)
          .map((h, i) => {
            const vid: VideoStream = h.video || (h as any);
            return {
              video: vid,
              progressPercent: [68, 42, 85, 25][i % 4],
              remainingText: ['18 min left', '34 min left', '8 min left', '45 min left'][i % 4]
            };
          })
      : [
          {
            video: effectiveSermons[0] || LIVE_VIDEO_STREAMS[1] || LIVE_VIDEO_STREAMS[0],
            progressPercent: 68,
            remainingText: '18 min left'
          },
          {
            video: effectiveSermons[1] || LIVE_VIDEO_STREAMS[2] || LIVE_VIDEO_STREAMS[0],
            progressPercent: 42,
            remainingText: '34 min left'
          },
          {
            video: effectiveWorship[0] || LIVE_VIDEO_STREAMS[3] || LIVE_VIDEO_STREAMS[0],
            progressPercent: 85,
            remainingText: '6 min left'
          },
          {
            video: effectiveSermons[2] || LIVE_VIDEO_STREAMS[4] || LIVE_VIDEO_STREAMS[0],
            progressPercent: 25,
            remainingText: '40 min left'
          }
        ];

  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const liveRadioTrack: AudioTrack =
    safeAudio.find((a) => a?.isLiveRadio || a?.category === '24/7 Gospel Radio') ||
    safeAudio[0] ||
    AUDIO_TRACKS.find((a) => a?.isLiveRadio) ||
    AUDIO_TRACKS[0];

  const filterTabs: Array<{
    id: 'All' | 'Live' | 'Sermons' | 'Worship' | 'Shorts' | 'Podcasts' | 'Ministries';
    label: string;
    icon: React.ElementType;
  }> = [
    { id: 'Live', label: 'Live', icon: Radio },
    { id: 'Shorts', label: 'Shorts', icon: Zap },
    { id: 'Sermons', label: 'Sermons', icon: BookOpen },
    { id: 'Worship', label: 'Worship', icon: Music },
    { id: 'Podcasts', label: 'Podcasts', icon: Podcast },
    { id: 'Ministries', label: 'Ministries', icon: Users },
  ];

  // ===========================================================================
  // SECTION RENDERERS
  // ===========================================================================

  // 1. LIVE NOW (GUEST)
  const renderGuestLiveSection = () => (
    <section id="section-live" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🔴 LIVE NOW</span>
            {liveStreams.length > 0 && (
              <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                {liveStreams.length} active
              </span>
            )}
          </h2>
        </div>
        {liveStreams.length > 0 && (
          <span className="text-xs text-slate-400 hidden sm:inline">Join interactive prayer &amp; communion</span>
        )}
      </div>

      {liveStreams.length > 0 ? (
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
      ) : (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-5 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <p className="text-sm font-bold text-white">No broadcasts right now.</p>
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Partner sanctuaries broadcast during scheduled Sunday services and mid-week prayer altars.
          </p>
        </div>
      )}
    </section>
  );

  // 1. YOUR CHURCHES LIVE (RETURNING VIEWER)
  const renderYourChurchesLiveSection = () => (
    <section id="section-your-churches-live" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>🔴 Your Churches Live</span>
              {yourChurchesLive.length > 0 ? (
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  {yourChurchesLive.length} sanctuary on air
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  Scheduled hours
                </span>
              )}
            </h2>
          </div>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Live broadcasts from sanctuaries you follow
        </span>
      </div>

      {yourChurchesLive.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {yourChurchesLive.map((video) => (
              <div key={video.id} className="relative">
                <span className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                  ⭐ Your Sanctuary
                </span>
                <StreamingVideoCard
                  video={video}
                  onSelect={onSelectVideo}
                  onOpenChannel={onOpenChannelModal}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <p className="text-sm font-bold text-white">
              None of your followed churches are broadcasting right now.
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Your followed home churches ({effectiveSubscribed.slice(0, 3).join(', ')}) stream during scheduled times. Check their upcoming services below or explore active network livestreams.
          </p>

          {liveStreams.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAllNetworkLive(!showAllNetworkLive)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 transition"
              >
                {showAllNetworkLive
                  ? 'Hide Global Broadcasts'
                  : `Explore Other Live Sanctuaries (${liveStreams.length} active)`}
              </button>
            </div>
          )}

          {showAllNetworkLive && liveStreams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 text-left">
              {liveStreams.map((video) => (
                <StreamingVideoCard
                  key={video.id}
                  video={video}
                  onSelect={onSelectVideo}
                  onOpenChannel={onOpenChannelModal}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );

  // 2. UPCOMING FROM YOUR CHURCHES (RETURNING VIEWER)
  const renderUpcomingSection = () => (
    <section id="section-upcoming" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>📅 Upcoming From Your Churches</span>
              <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Scheduled Services
              </span>
            </h2>
          </div>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Communion altars, prayer vigils &amp; Sunday flagship broadcasts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {UPCOMING_CHURCH_SERVICES.map((service) => {
          const isReminded = Boolean(reminders[service.id]);
          return (
            <div
              key={service.id}
              className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 overflow-hidden shadow-lg flex flex-col justify-between transition-all"
            >
              {/* Thumbnail Header */}
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={service.thumbnail}
                  alt={service.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Tags */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                    {service.tag}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-amber-300">
                    {service.countdown}
                  </span>
                </div>

                {/* Bottom Church Avatar Overlay */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-2">
                  <img
                    src={service.churchAvatar}
                    alt={service.churchName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400 shrink-0"
                  />
                  <span className="text-xs font-bold text-white truncate drop-shadow">
                    {service.churchName}
                  </span>
                </div>
              </div>

              {/* Service Meta Details */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.scheduledTime}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-200 transition">
                    {service.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{service.speaker}</p>
                </div>

                {/* Set Reminder Button */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => toggleReminder(service.id)}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isReminded
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isReminded ? (
                      <>
                        <BellRing className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Reminder Set</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span>Remind Me ({service.attendees})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  // 3. CONTINUE WATCHING (RETURNING VIEWER)
  const renderContinueWatchingSection = () => (
    <section id="section-continue-watching" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <RotateCcw className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>❤️ Continue Watching</span>
              <span className="text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                Resume Studies
              </span>
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('history')}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
        >
          <span>View Watch History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {continueWatchingItems.map((item, idx) => {
          if (!item || !item.video) return null;
          return (
            <div
              key={item.video.id || idx}
              onClick={() => onSelectVideo(item.video)}
              className="group cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 overflow-hidden shadow-lg transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={item.video.thumbnail || ''}
                  alt={item.video.title || 'Video'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/30 to-transparent" />

                {/* Hover Resume Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </div>
                </div>

                {/* Duration Pill */}
                <div className="absolute bottom-2.5 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] font-bold text-white">
                  {item.video.duration || '48:15'}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-r-full"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-400 truncate max-w-[140px]">
                    {item.video.churchOrMinistry || ''}
                  </span>
                  <span className="font-semibold text-amber-300/90">{item.remainingText}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-200 transition">
                  {decodeHtml(item.video.title || '')}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">{item.video.speakerOrArtist || ''}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  // 4. SHORTS (SHARED CONTINUITY LAYER)
  const renderShortsSection = () => (
    <section id="section-shorts" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-4 h-4 fill-amber-400" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>⚡ GOSPREAD SHORTS</span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                60s Rhema
              </span>
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenShorts()}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Watch All Shorts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        {GRACE_SHORTS.slice(0, 8).map((short) => (
          <div
            key={short.id}
            onClick={() => onOpenShorts(short.id)}
            className="group cursor-pointer relative aspect-[9/14] sm:aspect-[9/15] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 hover:border-amber-400/60 shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between p-3"
          >
            {/* Background Poster */}
            <img
              src={short.thumbnail}
              alt={short.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60 group-hover:via-slate-950/30 transition-colors" />

            {/* Top Bar: Tag & Duration */}
            <div className="relative z-10 flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                <Zap className="w-2.5 h-2.5 fill-slate-950" />
                Short
              </span>
              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white shadow">
                {short.duration}
              </span>
            </div>

            {/* Hover Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-400/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="relative z-10 space-y-1.5 pt-4">
              <div className="flex items-center gap-1.5">
                <img
                  src={short.avatar}
                  alt={short.speaker}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400/60 shrink-0"
                />
                <p className="text-[11px] font-bold text-amber-300 truncate">{short.speaker}</p>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-200 transition-colors">
                {short.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5 font-medium">
                <span className="text-slate-400 truncate max-w-[110px]">{short.church}</span>
                <span className="text-amber-300/90 font-semibold">{short.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // 5. SERMONS (SHARED)
  const renderSermonsSection = () => (
    <section id="section-sermons" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Sermons &amp; Teachings
          </h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Apostolic exposition &amp; revelation
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {effectiveSermons.map((video) => (
          <StreamingVideoCard
            key={video.id}
            video={video}
            onSelect={onSelectVideo}
            onOpenChannel={onOpenChannelModal}
          />
        ))}
      </div>
    </section>
  );

  // 6. WORSHIP (SHARED)
  const renderWorshipSection = () => (
    <section id="section-worship" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎵</span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Anointed Worship &amp; Praise
          </h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Praise nights, choirs &amp; acoustic sanctuaries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {effectiveWorship.map((video) => (
          <StreamingVideoCard
            key={video.id}
            video={video}
            onSelect={onSelectVideo}
            onOpenChannel={onOpenChannelModal}
          />
        ))}
      </div>
    </section>
  );

  // 7. PODCASTS & AUDIO FEEDS
  const renderPodcastsSection = () => (
    <section id="section-podcasts" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎙</span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Podcasts &amp; 24/7 Gospel Radio
          </h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Nonstop praise broadcasts &amp; daily devotions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 24/7 Live Radio Card */}
        {liveRadioTrack ? (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/20 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
                <Radio className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-ping" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded uppercase">
                    24/7 Live Radio
                  </span>
                  <span className="text-[10px] text-red-300 font-mono">18,240 Listeners</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                  {liveRadioTrack.title || '24/7 Gospel Radio'}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">{liveRadioTrack.artistOrPreacher || 'Grace City Broadcasting Network'}</p>
              </div>
            </div>

            <button
              type="button"
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
        ) : null}

        {/* Audio Devotionals Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[9px] rounded uppercase">
                Daily Audio Manna
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                Faith for Supernatural Increase
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                Senior Pastor David Williams • 28 min
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const podcastTrack =
                safeAudio.find((a) => a?.category === 'Audio Sermon' || a?.category === 'Podcast') ||
                AUDIO_TRACKS.find((a) => a?.category === 'Podcast') ||
                liveRadioTrack;
              if (podcastTrack) {
                onPlayAudioTrack(podcastTrack);
              }
            }}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Episode</span>
          </button>
        </div>
      </div>
    </section>
  );

  // 8. MINISTRIES SECTION
  const renderMinistriesSection = (title: string, subtitle: string) => (
    <section id="section-ministries" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛪</span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('discover')}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition"
        >
          <span>Explore All Sanctuaries</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DISCOVER_MINISTRIES.slice(0, 4).map((ministry) => {
          const isFollowed = subscribedChannels.includes(ministry.name);
          const count = followerCounts[ministry.name] || 12000;
          const followersFormatted =
            count > 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

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
                  <p className="text-[11px] text-slate-400">{followersFormatted} worshippers</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {ministry.description}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onOpenChannelModal(ministry.name)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition text-center"
                >
                  Sanctuary
                </button>
                <button
                  type="button"
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
                      <span>Following</span>
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
  );

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {activeAudioSpace && (
        <button onClick={onJoinAudioSpace} className="mt-4 w-full rounded-3xl border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-950/80 via-slate-900 to-slate-900 p-5 text-left shadow-xl shadow-fuchsia-950/20 transition hover:border-fuchsia-300/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300"><span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" /> Happening now · Audio Space</div><h2 className="truncate text-lg font-black text-white">{activeAudioSpace.title}</h2><p className="mt-1 truncate text-xs text-slate-400">{activeAudioSpace.topic || 'Live voice conversation'} · Hosted by {activeAudioSpace.hostName}</p></div>
            <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-fuchsia-500 px-5 py-2.5 text-xs font-black text-white">Join conversation</span>
          </div>
        </button>
      )}
      {/* ========================================================================= */}
      {/* HEADER & VIEW SWITCHER (GUEST VS RETURNING VIEWER)                        */}
      {/* ========================================================================= */}
      <section className="pt-4 sm:pt-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400">
              {dayName} on Gospread
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {greeting}
              {viewingMode === 'returning' && userSession?.fullName
                ? `, ${userSession.fullName.split(' ')[0]}`
                : ', Believer'}
              .
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">
              {viewingMode === 'returning'
                ? 'Here is what God is doing across your home churches today.'
                : 'Discover apostolic preaching, live broadcasts, and spirit-filled praise from sanctuaries worldwide.'}
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedFilter('All')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black shrink-0 transition ${
              selectedFilter === 'All'
                ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Home Overview
          </button>
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black shrink-0 transition ${
                  isActive
                    ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.id === 'Live' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🎙️ ACTIVE AUDIO SPACES                                                    */}
      {/* ========================================================================= */}
      {(selectedFilter === 'All' || selectedFilter === 'Live') && (
        <section className="rounded-3xl border border-fuchsia-500/20 bg-slate-950/55 px-4 py-5 sm:px-6 shadow-xl shadow-fuchsia-950/10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-fuchsia-400" />
                <h2 className="text-base font-black text-white sm:text-lg">Audio Spaces</h2>
                {activeAudioSpace && <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-fuchsia-300">Live now</span>}
              </div>
              <p className="mt-1 text-xs text-slate-400">Live voice conversations from ministries and believers</p>
            </div>
            <Headphones className="h-5 w-5 shrink-0 text-fuchsia-300" />
          </div>

          {activeAudioSpace ? (
            <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={onJoinAudioSpace} className="group flex min-w-[116px] flex-col items-center gap-2 text-center">
                <span className="relative rounded-full bg-gradient-to-br from-fuchsia-400 via-rose-500 to-amber-400 p-[3px] shadow-lg shadow-fuchsia-500/25 transition group-hover:scale-105">
                  <span className="absolute -right-1 top-2 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-xl font-black text-fuchsia-200 ring-4 ring-fuchsia-400/15">
                    {(activeAudioSpace.hostName || 'A').slice(0, 1).toUpperCase()}
                  </span>
                </span>
                <span className="max-w-[116px] truncate text-xs font-black text-white group-hover:text-fuchsia-300">{activeAudioSpace.hostName}</span>
                <span className="max-w-[116px] truncate text-[10px] text-slate-400">{activeAudioSpace.title}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-800 px-4 py-4 text-xs text-slate-500">
              <Headphones className="h-5 w-5 text-slate-600" />
              <span>No Audio Spaces are live right now. Start a conversation from Creator Studio.</span>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SCENARIO A: FOR A GUEST                                                */}
      {/* Order:                                                                    */}
      {/* 1. 🔴 Live Now                                                            */}
      {/* 2. ⚡ Shorts                                                             */}
      {/* 3. 📖 Sermons & Teachings                                                 */}
      {/* 4. 🎵 Worship & Praise                                                    */}
      {/* 5. 🎙 Podcasts                                                            */}
      {/* 6. ⛪ Ministries                                                          */}
      {/* ========================================================================= */}
      {viewingMode === 'guest' && selectedFilter === 'All' && (
        <>
          {/* 1. 🔴 Live Now */}
          {renderGuestLiveSection()}

          {/* 2. ⚡ Shorts */}
          {renderShortsSection()}

          {/* 3. 📖 Sermons & Teachings */}
          {renderSermonsSection()}

          {/* 4. 🎵 Worship & Praise */}
          {renderWorshipSection()}

          {/* 5. 🎙 Podcasts */}
          {renderPodcastsSection()}

          {/* 6. ⛪ Ministries */}
          {renderMinistriesSection(
            'Ministries & Sanctuaries',
            'Explore apostolic ministries broadcasting across the Kingdom'
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SCENARIO B: FOR A RETURNING LOGGED-IN VIEWER                           */}
      {/* Order:                                                                    */}
      {/* 1. 🔴 Your Churches Live                                                  */}
      {/* 2. 📅 Upcoming From Your Churches                                         */}
      {/* 3. ❤️ Continue Watching                                                   */}
      {/* 4. ⚡ Shorts                                                             */}
      {/* 5. 📖 Sermons                                                            */}
      {/* 6. 🎵 Worship                                                            */}
      {/* 7. ⛪ Discover Ministries                                                 */}
      {/* ========================================================================= */}
      {viewingMode === 'returning' && selectedFilter === 'All' && (
        <>
          {/* 1. 🔴 Your Churches Live */}
          {renderYourChurchesLiveSection()}

          {/* 2. 📅 Upcoming From Your Churches */}
          {renderUpcomingSection()}

          {/* 3. ❤️ Continue Watching */}
          {renderContinueWatchingSection()}

          {/* 4. ⚡ Shorts */}
          {renderShortsSection()}

          {/* 5. 📖 Sermons */}
          {renderSermonsSection()}

          {/* 6. 🎵 Worship */}
          {renderWorshipSection()}

          {/* 7. ⛪ Discover Ministries */}
          {renderMinistriesSection(
            'Discover Ministries',
            'Expand your kingdom community and connect with new sanctuaries'
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* SINGLE CATEGORY FILTER VIEWS (WHEN USER CLICKS FILTER TABS)              */}
      {/* ========================================================================= */}
      {selectedFilter === 'Live' &&
        (viewingMode === 'returning'
          ? renderYourChurchesLiveSection()
          : renderGuestLiveSection())}
      {selectedFilter === 'Shorts' && renderShortsSection()}
      {selectedFilter === 'Sermons' && renderSermonsSection()}
      {selectedFilter === 'Worship' && renderWorshipSection()}
      {selectedFilter === 'Podcasts' && renderPodcastsSection()}
      {selectedFilter === 'Ministries' &&
        renderMinistriesSection(
          viewingMode === 'returning' ? 'Discover Ministries' : 'Ministries & Sanctuaries',
          'Explore ministries across the Kingdom'
        )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Music, 
  Mic2, 
  Search, 
  UserCheck, 
  UserPlus, 
  Bell, 
  BellRing, 
  BellOff, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Headphones, 
  MapPin, 
  Radio, 
  Tv, 
  DollarSign, 
  Share2, 
  Globe, 
  Flame, 
  Heart, 
  ChevronRight, 
  Filter, 
  Award,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, AudioTrack } from '../data/gospelData';
import { GivingTarget } from './GivingModal';
import SpiritualMomentumRankings from './SpiritualMomentumRankings';
import { djangoApi, DirectoryEntryApi } from '../services/djangoApi';

export type MinistryCategory = 'all' | 'churches' | 'artistes' | 'creators';

export interface MinistryItem {
  id: string;
  name: string;
  category: 'churches' | 'artistes' | 'creators';
  avatar: string;
  bannerImage: string;
  followersCount: number;
  followersFormatted: string;
  locationOrOrigin: string;
  leadPersonOrGenre: string;
  description: string;
  isVerified: boolean;
  isLiveNow?: boolean;
  liveViewersCount?: number;
  featuredMediaTitle?: string;
  featuredMediaType?: 'video' | 'audio';
  featuredMediaId?: string;
  tags: string[];
  serviceTimesOrReleaseFreq?: string;
  socialHandle?: string;
}

const formatFollowers = (count: number) =>
  count >= 1_000_000 ? `${(count / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
    : count >= 1_000 ? `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`
    : String(count);

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1600&q=80';

const initialsAvatar = (name: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#1e293b"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="52" font-weight="700" fill="#fbbf24">${(name.trim()[0] || '?').toUpperCase().replace(/[<>&]/g, '')}</text></svg>`
  )}`;

const mapDirectoryEntry = (entry: DirectoryEntryApi): MinistryItem => ({
  id: entry.id,
  name: entry.name,
  category: entry.category,
  avatar: entry.avatar || initialsAvatar(entry.name),
  bannerImage: entry.banner_image || DEFAULT_BANNER,
  followersCount: entry.followers_count,
  followersFormatted: formatFollowers(entry.followers_count),
  locationOrOrigin: entry.location,
  leadPersonOrGenre: entry.lead,
  description: entry.description,
  isVerified: entry.verified,
  tags: entry.tags,
  socialHandle: entry.handle,
});

interface DiscoverMinistriesHubProps {
  subscribedChannels: string[];
  joinedChurches?: string[];
  churchMemberCounts?: Record<string, number>;
  onToggleJoinChurch?: (churchName: string) => void;
  onToggleFollow: (channelName: string) => void;
  bellSettings: Record<string, 'all' | 'personalized' | 'none'>;
  onChangeBellSetting: (channelName: string, setting: 'all' | 'personalized' | 'none') => void;
  onSelectChannelModal: (channelName: string) => void;
  onOpenMinistry: (ministryId: string) => void;
  onOpenGivingModal: (target: GivingTarget) => void;
  onSelectVideo: (video: VideoStream) => void;
  onPlayAudioTrack: (track: AudioTrack) => void;
  allVideos: VideoStream[];
  allAudio: AudioTrack[];
  streakDays?: number;
  praiseXp?: number;
}

export default function DiscoverMinistriesHub({
  subscribedChannels,
  joinedChurches = [],
  churchMemberCounts = {},
  onToggleJoinChurch,
  onToggleFollow,
  bellSettings,
  onChangeBellSetting,
  onSelectChannelModal,
  onOpenMinistry,
  onOpenGivingModal,
  onSelectVideo,
  onPlayAudioTrack,
  allVideos,
  allAudio,
  streakDays = 7,
  praiseXp = 1450
}: DiscoverMinistriesHubProps) {
  const [activeCategory, setActiveCategory] = useState<MinistryCategory>('all');
  const [activeHubView, setActiveHubView] = useState<'directory' | 'rankings'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [onlyLiveNow, setOnlyLiveNow] = useState<boolean>(false);
  const [showBellMenuFor, setShowBellMenuFor] = useState<string | null>(null);
  const [directory, setDirectory] = useState<MinistryItem[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);

  useEffect(() => {
    let isMounted = true;
    djangoApi.getDirectory().then(entries => {
      if (isMounted) setDirectory(entries.map(mapDirectoryEntry));
    }).finally(() => {
      if (isMounted) setIsLoadingDirectory(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Category Counts
  const totalCount = directory.length;
  const churchesCount = directory.filter(m => m.category === 'churches').length;
  const artistesCount = directory.filter(m => m.category === 'artistes').length;
  const creatorsCount = directory.filter(m => m.category === 'creators').length;

  // Filtered List
  const filteredMinistries = directory.filter((m) => {
    // 1. Category filter
    if (activeCategory !== 'all' && m.category !== activeCategory) {
      return false;
    }
    // 2. Live filter
    if (onlyLiveNow && !m.isLiveNow) {
      return false;
    }
    // 3. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchLead = m.leadPersonOrGenre.toLowerCase().includes(q);
      const matchLoc = m.locationOrOrigin.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchTags = m.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchLead && !matchLoc && !matchDesc && !matchTags) {
        return false;
      }
    }
    // 4. Region filter
    if (filterRegion !== 'all') {
      if (filterRegion === 'usa' && !m.locationOrOrigin.includes('US') && !m.locationOrOrigin.includes('GA') && !m.locationOrOrigin.includes('TX') && !m.locationOrOrigin.includes('IL') && !m.locationOrOrigin.includes('FL') && !m.locationOrOrigin.includes('TN')) {
        return false;
      }
      if (filterRegion === 'africa' && !m.locationOrOrigin.includes('Nigeria') && !m.locationOrOrigin.includes('Lagos') && !m.locationOrOrigin.includes('Kenya')) {
        return false;
      }
      if (filterRegion === 'global' && !m.locationOrOrigin.includes('Global') && !m.locationOrOrigin.includes('International') && !m.locationOrOrigin.includes('Worldwide')) {
        return false;
      }
    }
    return true;
  });

  const openEntry = (ministry: MinistryItem) => {
    if (ministry.category === 'churches') onOpenMinistry(ministry.id);
    else onSelectChannelModal(ministry.name);
  };

  const handleMediaPlay = (ministry: MinistryItem) => {
    if (ministry.featuredMediaId) {
      if (ministry.featuredMediaType === 'video') {
        const foundVid = allVideos.find(v => v.id === ministry.featuredMediaId);
        if (foundVid) {
          onSelectVideo(foundVid);
          return;
        }
      } else if (ministry.featuredMediaType === 'audio') {
        const foundAud = allAudio.find(a => a.id === ministry.featuredMediaId);
        if (foundAud) {
          onPlayAudioTrack(foundAud);
          return;
        }
      }
    }
    // Fallback: open modal
    onSelectChannelModal(ministry.name);
  };

  const getCategoryBadge = (cat: 'churches' | 'artistes' | 'creators') => {
    switch (cat) {
      case 'churches':
        return {
          label: 'Church',
          icon: Building2,
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          gradient: 'from-indigo-600 to-purple-600'
        };
      case 'artistes':
        return {
          label: 'Gospel Artiste',
          icon: Music,
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          gradient: 'from-rose-600 to-pink-600'
        };
      case 'creators':
        return {
          label: 'Christian Creator',
          icon: Mic2,
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gradient: 'from-amber-500 to-orange-600'
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8 select-none">
      
      {/* 🌟 DISCOVER HEADER HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0a0a0c] border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Kingdom Ministry Directory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif leading-tight">
            Discover New <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-amber-200">Ministries, Artistes & Creators</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Explore, follow, and connect with spirit-filled global Churches, Gospel Music Artistes, and Christian Content Creators. Receive live worship alerts and sow seeds directly into their kingdom mission.
          </p>

          {/* Featured 3-Category Quick Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs text-indigo-300 font-bold">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Churches & Cathedrals</span>
              <span className="ml-1 bg-indigo-500/30 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">{churchesCount}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-rose-500/40 text-xs text-rose-300 font-bold">
              <Music className="w-4 h-4 text-rose-400" />
              <span>Gospel Artistes & Choirs</span>
              <span className="ml-1 bg-rose-500/30 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">{artistesCount}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-xs text-amber-300 font-bold">
              <Mic2 className="w-4 h-4 text-amber-400" />
              <span>Podcasters & Creators</span>
              <span className="ml-1 bg-amber-500/30 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">{creatorsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 HUB VIEW MODE SWITCHER (DIRECTORY vs RANKINGS) */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 max-w-lg mx-auto shadow-xl">
        <button
          onClick={() => setActiveHubView('directory')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            activeHubView === 'directory'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏛️ Ministry Directory</span>
        </button>

        <button
          onClick={() => setActiveHubView('rankings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            activeHubView === 'rankings'
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <Award className="w-4 h-4 text-amber-950 animate-bounce" />
          <span>👑 Global Rankings (Badge Holders)</span>
        </button>
      </div>

      {activeHubView === 'rankings' ? (
        <SpiritualMomentumRankings
          onSelectChannelModal={onSelectChannelModal}
          joinedChurches={joinedChurches}
          onToggleJoinChurch={onToggleJoinChurch}
          streakDays={streakDays}
          praiseXp={praiseXp}
        />
      ) : (
        <div className="space-y-8">
          {/* 🎯 CATEGORY SELECTOR TABS & SEARCH BAR */}
          <div className="space-y-4">
        
        {/* Main Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Categories</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeCategory === 'all' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {totalCount}
              </span>
            </button>

            {/* ⛪ 1. CHURCHES CATEGORY TAB */}
            <button
              onClick={() => setActiveCategory('churches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === 'churches'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-300" />
              <span>⛪ Churches</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeCategory === 'churches' ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-800 text-slate-400'}`}>
                {churchesCount}
              </span>
            </button>

            {/* 🎵 2. ARTISTES CATEGORY TAB */}
            <button
              onClick={() => setActiveCategory('artistes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === 'artistes'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4 text-rose-300" />
              <span>🎵 Artistes</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeCategory === 'artistes' ? 'bg-rose-950 text-rose-200' : 'bg-slate-800 text-slate-400'}`}>
                {artistesCount}
              </span>
            </button>

            {/* 🎙️ 3. CREATORS CATEGORY TAB */}
            <button
              onClick={() => setActiveCategory('creators')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === 'creators'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Mic2 className="w-4 h-4 text-amber-950" />
              <span>🎙️ Creators</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeCategory === 'creators' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {creatorsCount}
              </span>
            </button>
          </div>

          {/* Quick Filter Toggle: Live Now */}
          <button
            onClick={() => setOnlyLiveNow(!onlyLiveNow)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              onlyLiveNow
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyLiveNow ? 'bg-white animate-ping' : 'bg-red-500'}`} />
            <span>Live Streaming Now</span>
          </button>
        </div>

        {/* Search Input Bar & Region Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ministry name, pastor, artiste, podcast topic, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-amber-400" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 font-medium cursor-pointer"
            >
              <option value="all">🌍 All Regions</option>
              <option value="usa">🇺🇸 United States</option>
              <option value="africa">🌍 Africa & Lagos</option>
              <option value="global">🌐 International & Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 CATEGORY SUMMARY INDICATOR BAR */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-amber-400">{filteredMinistries.length}</span> {activeCategory === 'all' ? 'ministries' : activeCategory}
          {searchQuery && <span> matching "<strong className="text-white">{searchQuery}</strong>"</span>}
        </div>

        <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
          Tap any card to view full channel, schedules, or play latest media
        </div>
      </div>

      {/* 🎴 MINISTRIES GRID */}
      {filteredMinistries.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-3xl bg-slate-900/50 border border-slate-800/80 p-8">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white">{isLoadingDirectory ? 'Loading directory…' : directory.length === 0 ? 'No Members Yet' : 'No Ministries Found'}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {directory.length === 0 && !isLoadingDirectory
              ? 'Churches, artistes and creators will appear here as they join Gospread.'
              : 'Try adjusting your search keywords or switching category filters to view more kingdom ministries.'}
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setFilterRegion('all');
              setOnlyLiveNow(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold transition hover:bg-amber-400"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMinistries.map((ministry) => {
              const categoryInfo = getCategoryBadge(ministry.category);
              const CategoryIcon = categoryInfo.icon;
              const isFollowed = subscribedChannels.some(
                c => c.toLowerCase() === ministry.name.toLowerCase()
              );
              const currentBell = bellSettings[ministry.name] || 'all';

              return (
                <motion.div
                  key={ministry.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition duration-300 overflow-hidden shadow-xl flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                      <img
                        src={ministry.bannerImage}
                        alt={ministry.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                        {/* Category Pill */}
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-md backdrop-blur-md ${categoryInfo.bg}`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span>{categoryInfo.label}</span>
                        </div>

                        {/* Live Indicator or Verified Badge */}
                        {ministry.isLiveNow ? (
                          <div className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-red-600/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>LIVE</span>
                          </div>
                        ) : ministry.isVerified ? (
                          <div className="px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 fill-amber-400 text-slate-950" />
                            <span>Verified</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Channel Info Header */}
                    <div className="px-4 pt-0 pb-3 relative">
                      <div className="flex items-end justify-between -mt-10 mb-3 z-10 relative">
                        {/* Avatar */}
                        <div
                          onClick={() => openEntry(ministry)}
                          className="relative cursor-pointer group/avatar"
                        >
                          <img
                            src={ministry.avatar}
                            alt={ministry.name}
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-900 shadow-xl group-hover/avatar:scale-105 transition duration-200"
                          />
                          {ministry.isLiveNow && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 border-2 border-slate-900 animate-ping" />
                          )}
                        </div>

                        {/* Join Church & Follow / Subscription Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                          {/* ✝️ Join Church Button */}
                          <button
                            onClick={() => onToggleJoinChurch && onToggleJoinChurch(ministry.name)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md ${
                              joinedChurches.includes(ministry.name)
                                ? 'bg-emerald-600 text-white border border-emerald-400/40'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                            }`}
                            title={joinedChurches.includes(ministry.name) ? "You are an official member" : "Join this church family"}
                          >
                            {joinedChurches.includes(ministry.name) ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-700" />
                                <span>Joined</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3.5 h-3.5" />
                                <span>✝️ Join</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onToggleFollow(ministry.name)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md ${
                              isFollowed
                                ? 'bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {isFollowed ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>

                          {/* Bell Preference Dropdown */}
                          {isFollowed && (
                            <div className="relative">
                              <button
                                onClick={() => setShowBellMenuFor(showBellMenuFor === ministry.name ? null : ministry.name)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                                title="Notification Preferences"
                              >
                                {currentBell === 'all' ? (
                                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                                ) : currentBell === 'personalized' ? (
                                  <Bell className="w-3.5 h-3.5 text-slate-300" />
                                ) : (
                                  <BellOff className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </button>

                              {showBellMenuFor === ministry.name && (
                                <div className="absolute right-0 top-full mt-1.5 z-30 w-36 p-1 rounded-xl bg-slate-950 border border-amber-500/40 shadow-2xl space-y-0.5 text-[10px]">
                                  <button
                                    onClick={() => {
                                      onChangeBellSetting(ministry.name, 'all');
                                      setShowBellMenuFor(null);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 font-bold ${
                                      currentBell === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <BellRing className="w-3 h-3" /> All Live Alerts
                                  </button>
                                  <button
                                    onClick={() => {
                                      onChangeBellSetting(ministry.name, 'personalized');
                                      setShowBellMenuFor(null);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 font-bold ${
                                      currentBell === 'personalized' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <Bell className="w-3 h-3" /> Highlights
                                  </button>
                                  <button
                                    onClick={() => {
                                      onChangeBellSetting(ministry.name, 'none');
                                      setShowBellMenuFor(null);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded flex items-center gap-1.5 font-bold ${
                                      currentBell === 'none' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <BellOff className="w-3 h-3" /> Muted
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title & Leader */}
                      <div>
                        <div
                          onClick={() => openEntry(ministry)}
                          className="flex items-center gap-1.5 cursor-pointer group/title"
                        >
                          <h3 className="font-bold text-base text-white group-hover/title:text-amber-300 transition font-serif line-clamp-1">
                            {ministry.name}
                          </h3>
                        </div>

                        <p className="text-xs text-amber-400 font-semibold line-clamp-1 mt-0.5">
                          {ministry.leadPersonOrGenre}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{ministry.locationOrOrigin}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-300 font-bold">
                            {ministry.followersFormatted} Followers
                          </span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-amber-400" />
                            <span>{(churchMemberCounts[ministry.name] || 1248).toLocaleString()} Members</span>
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                        {ministry.description}
                      </p>

                      {/* Featured Media Snippet (if available) */}
                      {ministry.featuredMediaTitle && (
                        <div
                          onClick={() => handleMediaPlay(ministry)}
                          className="mt-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition flex items-center gap-2.5 group/media"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 group-hover/media:scale-110 transition shadow-md">
                            {ministry.featuredMediaType === 'video' ? (
                              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                            ) : (
                              <Headphones className="w-4 h-4" />
                            )}
                          </div>

                          <div className="overflow-hidden flex-1">
                            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">
                              Featured {ministry.featuredMediaType === 'video' ? 'Broadcast' : 'Audio Single'}
                            </span>
                            <p className="text-[11px] font-bold text-slate-200 truncate group-hover/media:text-amber-300 transition">
                              {ministry.featuredMediaTitle}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {ministry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-400 font-medium border border-slate-800/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => openEntry(ministry)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 group/link"
                    >
                      <span>Explore Channel</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition" />
                    </button>

                    <button
                      onClick={() =>
                        onOpenGivingModal({
                          id: ministry.id,
                          name: ministry.name,
                          avatar: ministry.avatar,
                          type: 'church',
                          categoryTitle: ministry.category === 'churches' ? 'Church & Campus Ministry' : ministry.category === 'artistes' ? 'Gospel Artiste Support' : 'Christian Creator Ministry'
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition flex items-center gap-1"
                      title={`Support ${ministry.name}`}
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>Sow Seed</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

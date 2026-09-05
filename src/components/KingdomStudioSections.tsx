import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Film,
  Video,
  Calendar,
  Compass,
  MessageSquare,
  DollarSign,
  Settings,
  Plus,
  RadioTower,
  Play,
  Eye,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Share2,
  Copy,
  Users,
  Sparkles,
  TrendingUp,
  Download,
  Filter,
  Search,
  Check,
  ShieldCheck,
  Building2,
  Globe,
  Radio,
  Sliders,
  Send,
  Pin,
  Lock,
  Globe2,
  ArrowRight,
  Zap,
  Activity,
  Bell,
  RefreshCw,
  Key,
  ChevronDown,
  CheckCheck,
  Landmark
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserSession } from './AuthModal';
import { ChurchLocation, SocialLink } from '../data/gospelData';
import { RecordedStreamData } from './LiveRecordingVODModal';
import { djangoApi } from '../services/djangoApi';

interface KingdomStudioSectionsProps {
  currentUser?: UserSession;
  ministryName: string;
  ownerName: string;
  avatarUrl: string;
  studioNavTab: 'overview' | 'dashboard' | 'content' | 'live_hub' | 'schedule_hub' | 'analytics' | 'community' | 'giving' | 'settings';
  contentSubTab: 'videos' | 'shorts' | 'drafts' | 'scheduled';
  setContentSubTab: (tab: 'videos' | 'shorts' | 'drafts' | 'scheduled') => void;
  liveSubTab: 'go_live' | 'streams' | 'recordings';
  setLiveSubTab: (tab: 'go_live' | 'streams' | 'recordings') => void;
  communitySubTab: 'comments' | 'prayers' | 'chat';
  setCommunitySubTab: (tab: 'comments' | 'prayers' | 'chat') => void;
  payoutAccounts: Array<{ id: string; label: string; type: string; currency: string; bankOrProvider: string; isPrimary: boolean }>;
  churchCampuses: ChurchLocation[];
  socialRows: SocialLink[];
  prayerRequests: Array<{ id: string; name: string; request: string; time: string; status: 'Prayed' | 'Pending'; prayedCount: number }>;
  onPrayForRequest: (id: string) => void;
  onAddPrayerRequest: (request: string) => void;
  onTriggerUpload: () => void;
  onTriggerGoLive: () => void;
  onEnterLiveControlRoom: () => void;
  onTriggerSchedule: () => void;
  onInspectRecordingVOD: (recording: RecordedStreamData) => void;
  theme?: 'light' | 'dark';
}

export default function KingdomStudioSections({
  currentUser,
  ministryName,
  ownerName,
  avatarUrl,
  studioNavTab,
  contentSubTab,
  setContentSubTab,
  liveSubTab,
  setLiveSubTab,
  communitySubTab,
  setCommunitySubTab,
  payoutAccounts,
  churchCampuses,
  socialRows,
  prayerRequests,
  onPrayForRequest,
  onAddPrayerRequest,
  onTriggerUpload,
  onTriggerGoLive,
  onEnterLiveControlRoom,
  onTriggerSchedule,
  onInspectRecordingVOD,
  theme = 'dark'
}: KingdomStudioSectionsProps) {
  const isLight = theme === 'light';

  const [sampleVideos, setSampleVideos] = useState<any[]>([]);
  const [sampleShorts, setSampleShorts] = useState<any[]>([]);
  const [sampleDrafts] = useState<any[]>([]);
  const [sampleScheduled, setSampleScheduled] = useState<any[]>([]);
  const [sampleLiveRecordings] = useState<RecordedStreamData[]>([]);
  const [sampleComments, setSampleComments] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const loadStudioContent = async () => {
      const [videos, shorts, streams, posts] = await Promise.all([
        djangoApi.getVideos(undefined, false),
        djangoApi.getShorts(),
        djangoApi.getVideos(),
        djangoApi.getCommunityPosts()
      ]);
      if (!active) return;

      setSampleVideos(videos.map(video => ({
        ...video,
        visibility: 'Public',
        views: video.viewsText || '0',
        likes: video.likesCount || '0',
        comments: '0',
        scripture: video.bibleVerse || '',
      })));
      setSampleShorts(shorts.map(short => ({
        ...short,
        views: short.viewsText || '0',
        likes: short.likesCount || '0',
        shares: '0',
      })));
      setSampleScheduled(streams.filter(stream => stream.isLive === false && stream.date !== 'Recent').map(stream => ({
        ...stream,
        preacher: stream.speakerOrArtist,
        status: 'Scheduled',
      })));
      setSampleComments(posts.flatMap(post => post.comments.map(comment => ({
        id: String(comment.id),
        user: comment.author_name,
        avatar: comment.author_avatar,
        videoTitle: post.title,
        comment: comment.content,
        time: new Date(comment.created_at).toLocaleDateString(),
        likes: comment.amens_count,
        replied: false,
        replyText: '',
      }))));
    };
    loadStudioContent().catch(() => {
      if (active) {
        setSampleVideos([]);
        setSampleShorts([]);
        setSampleScheduled([]);
        setSampleComments([]);
      }
    });
    return () => { active = false; };
  }, []);

  /*
   * Content is loaded from Django above. These arrays intentionally start empty
   * so an unavailable backend cannot present fabricated ministry activity.
   */
  /*
  const legacySampleVideos = [
    {
      id: 'v-1',
      title: 'Walking in Supernatural Revelation & Divine Grace',
      thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
      duration: '1:12:45',
      date: 'Aug 30, 2026',
      visibility: 'Public',
      views: '12,480',
      likes: '1,240',
      comments: '318',
      scripture: 'Ephesians 1:17'
    },
    {
      id: 'v-2',
      title: 'Midweek Power Encounter — The Anointing that Breaks Every Yoke',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      duration: '54:20',
      date: 'Aug 26, 2026',
      visibility: 'Public',
      views: '8,920',
      likes: '890',
      comments: '142',
      scripture: 'Isaiah 10:27'
    },
    {
      id: 'v-3',
      title: 'Worship Night: Unending Praise & Prophetic Sound',
      thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
      duration: '1:34:10',
      date: 'Aug 23, 2026',
      visibility: 'Public',
      views: '19,650',
      likes: '2,410',
      comments: '405',
      scripture: 'Psalm 150:6'
    }
  ];

  const sampleShorts = [
    {
      id: 'sh-1',
      title: 'God did not bring you this far to abandon you! 🙌',
      thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
      views: '45.2K',
      likes: '4.8K',
      shares: '1.2K',
      duration: '0:48'
    },
    {
      id: 'sh-2',
      title: 'The moment the Holy Spirit took over Sunday Service 🔥',
      thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=400&q=80',
      views: '89.1K',
      likes: '9.4K',
      shares: '3.1K',
      duration: '0:59'
    },
    {
      id: 'sh-3',
      title: 'Declare this scripture before you sleep tonight! 📖',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
      views: '32.6K',
      likes: '3.1K',
      shares: '940',
      duration: '0:35'
    }
  ];

  const sampleDrafts = [
    {
      id: 'dr-1',
      title: 'Sunday Youth Service Master Cut (Transcoding complete)',
      size: '2.1 GB',
      lastEdited: '2 hours ago',
      progress: 100,
      status: 'Ready to Publish'
    },
    {
      id: 'dr-2',
      title: 'Altar Call Testimonies Part 2',
      size: '840 MB',
      lastEdited: 'Yesterday',
      progress: 65,
      status: 'Draft Saved'
    }
  ];

  const sampleScheduled = [
    {
      id: 'sc-1',
      title: 'First Sunday Anointing Service — Covenant of Preservation',
      date: 'Sept 6, 2026 • 9:00 AM EAT',
      preacher: ownerName,
      thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
      status: 'Premiere Scheduled'
    }
  ];

  // Sample Live Streams and Recorded VODs
  const legacySampleLiveRecordings: RecordedStreamData[] = [
    {
      title: 'Sunday Celebration Service — Walking by Faith & Not by Sight',
      description: 'Full unedited Sunday congregation broadcast with worship team, prophetic message, and altar call.',
      speaker: ownerName,
      scripture: 'Hebrews 11:1',
      category: 'Sunday Service',
      durationMinutes: 74,
      durationFormatted: '1h 14m',
      totalWorshippers: 1840,
      peakWorshippers: 412,
      prayersCount: 48,
      thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      title: 'Overnight Prayer Mountain — Breaking Limitations',
      description: 'Live intercession stream with believers praying across 34 nations.',
      speaker: 'Pastor Grace Lawson',
      scripture: 'Jeremiah 33:3',
      category: 'Prayer Altar',
      durationMinutes: 128,
      durationFormatted: '2h 08m',
      totalWorshippers: 3420,
      peakWorshippers: 890,
      prayersCount: 142,
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }
  ];

  */

  // Comments state
  const [commentReplyInput, setCommentReplyInput] = useState<{ [id: string]: string }>({});
  const [commentFilter, setCommentFilter] = useState<'all' | 'unreplied' | 'prayers'>('all');
  /* const legacySampleComments = [
    {
      id: 'cm-1',
      user: 'Sister Deborah A.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      videoTitle: 'Walking in Supernatural Revelation',
      comment: 'Pastor, this message on Isaiah 40 lifted my spirit today. God bless Grace City abundantly!',
      time: '3 hours ago',
      likes: 18,
      replied: false,
      replyText: ''
    },
    {
      id: 'cm-2',
      user: 'Brother Samuel Okello',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      videoTitle: 'Midweek Power Encounter',
      comment: 'Please stand in agreement with me for my mother recovering in hospital in Nairobi.',
      time: '5 hours ago',
      likes: 34,
      replied: true,
      replyText: 'We are lifting her before the altar of God right now Brother Samuel! By His stripes she is healed.'
    }
  ]; */

  const [copiedKey, setCopiedKey] = useState(false);
  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // 🎛️ Interactive Filters & UX State
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [contentCategoryFilter, setContentCategoryFilter] = useState<'all' | 'sermon' | 'worship' | 'podcast'>('all');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '28d' | '90d' | 'all'>('28d');
  const [activeEncoderTab, setActiveEncoderTab] = useState<'obs' | 'streamlabs' | 'vmix' | 'hardware'>('obs');
  const [revealStreamKey, setRevealStreamKey] = useState(false);
  const [givingFilter, setGivingFilter] = useState<'all' | 'tithes' | 'missions' | 'building'>('all');
  const [newPrayerInput, setNewPrayerInput] = useState('');
  const [isAddingPrayer, setIsAddingPrayer] = useState(false);

  // Filtered Content
  const filteredVideos = sampleVideos.filter(v => {
    const matchesSearch = !contentSearchQuery || 
      v.title.toLowerCase().includes(contentSearchQuery.toLowerCase()) || 
      (v.scripture && v.scripture.toLowerCase().includes(contentSearchQuery.toLowerCase()));
    const matchesCat = contentCategoryFilter === 'all' || 
      (contentCategoryFilter === 'worship' && v.title.toLowerCase().includes('worship')) ||
      (contentCategoryFilter === 'podcast' && v.title.toLowerCase().includes('podcast')) ||
      (contentCategoryFilter === 'sermon' && !v.title.toLowerCase().includes('worship') && !v.title.toLowerCase().includes('podcast'));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════════
          1. 📊 DASHBOARD VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Total Congregation Views</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{sampleVideos.reduce((total, video) => total + Number(video.viewsText?.replace(/[^0-9]/g, '') || 0), 0).toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live data</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Broadcast Watch Hours</span>
                <Compass className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">0 hrs</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.2% vs last week</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Saints & Partners</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{sampleComments.length}</p>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                <Plus className="w-3.5 h-3.5" />
                <span>820 new this week</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Seed Gifts & Giving</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">$0</p>
              <span className="text-[10px] text-slate-400">No donation summary loaded</span>
            </div>
          </div>

          {/* Real-time Broadcast Ingest Status & Quick Actions */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/25 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Cloud Broadcast Transcoder & RTMP Ingest</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    ONLINE 1080p60
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Direct HLS packaging, real-time live chat moderation, and worldwide congregation prayer altar active.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={onTriggerUpload}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Upload Video</span>
              </button>
              <button
                onClick={onEnterLiveControlRoom}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition cursor-pointer"
              >
                <RadioTower className="w-3.5 h-3.5" />
                <span>Live Control Room</span>
              </button>
              <button
                onClick={onTriggerSchedule}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Service</span>
              </button>
            </div>
          </div>

          {/* DUAL DASHBOARD GRID: LATEST VIDEO PERFORMANCE + AUDIENCE GEOGRAPHIC REACH */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Latest Video Performance Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#161616] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Latest Sermon Performance</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  First 3 days
                </span>
              </div>

              {sampleVideos[0] ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="relative shrink-0 w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-950">
                    {sampleVideos[0].thumbnail && <img src={sampleVideos[0].thumbnail} alt={sampleVideos[0].title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
                    {sampleVideos[0].duration && <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">{sampleVideos[0].duration}</span>}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2">{sampleVideos[0].title}</h4>
                    <p className="text-[11px] text-slate-400">Published {sampleVideos[0].date} • {sampleVideos[0].scripture || sampleVideos[0].category}</p>
                    <div className="pt-1 border-t border-slate-800 text-xs"><span className="text-[10px] text-slate-400">Views</span><p className="font-bold text-white">{sampleVideos[0].views}</p></div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">No published content available.</div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Transcoding: 4K UHD, 1080p, 720p HLS</span>
                <button
                  onClick={() => {
                    setContentSubTab('videos');
                    // navigate to content
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>View All {sampleVideos.length} Videos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audience Geographic Reach */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#161616] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-sky-400" />
                  <span>Global Congregation Reach</span>
                </h3>
                <span className="text-xs text-slate-400">Live data</span>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { country: 'Uganda', percent: 42, color: 'bg-amber-500' },
                  { country: 'Kenya', percent: 28, color: 'bg-emerald-500' },
                  { country: 'United States', percent: 14, color: 'bg-blue-500' },
                  { country: 'United Kingdom', percent: 10, color: 'bg-purple-500' },
                  { country: 'Other Nations', percent: 6, color: 'bg-slate-600' }
                ].map(item => (
                  <div key={item.country} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.country}</span>
                      <span className="font-mono font-bold text-white">{item.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Data aggregated across mobile app installs, live web streams, and smart TV sessions.
              </p>
            </div>

          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          2. 🎬 CONTENT MANAGEMENT VIEW (Videos, Shorts, Drafts, Scheduled)
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'content' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          
          {/* Top Controls: Sub-Tabs & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'videos', label: `Videos (${sampleVideos.length})`, icon: Film },
                { id: 'shorts', label: `Shorts (${sampleShorts.length})`, icon: Video },
                { id: 'drafts', label: `Drafts (${sampleDrafts.length})`, icon: Clock },
                { id: 'scheduled', label: `Scheduled (${sampleScheduled.length})`, icon: Calendar }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = contentSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setContentSubTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onTriggerUpload}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Upload Video</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161616] p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sermon title, scripture, or tag..."
                value={contentSearchQuery}
                onChange={(e) => setContentSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {contentSearchQuery && (
                <button
                  onClick={() => setContentSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'sermon', label: 'Sermons' },
                { id: 'worship', label: 'Worship' },
                { id: 'podcast', label: 'Podcasts' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setContentCategoryFilter(cat.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    contentCategoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 2.1: VIDEOS */}
          {contentSubTab === 'videos' && (
            <div className="space-y-3">
              {filteredVideos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-[#161616] rounded-2xl border border-slate-800">
                  <Film className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-white">No videos found matching "{contentSearchQuery}"</p>
                  <p className="text-xs mt-1">Try clearing your search query or uploading a new sermon.</p>
                </div>
              ) : (
                filteredVideos.map(vid => (
                  <div key={vid.id} className="p-4 rounded-2xl bg-[#161616] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0 w-28 h-18 rounded-xl overflow-hidden bg-slate-950">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white">
                          {vid.duration}
                        </span>
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-black uppercase">
                          4K UHD
                        </span>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{vid.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                          <span className="text-amber-400 font-semibold">{vid.scripture}</span>
                          <span>•</span>
                          <span>{vid.date}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {vid.visibility}
                          </span>
                          <span className="text-[10px] text-slate-300 font-mono font-bold">{vid.views} views</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] text-emerald-400 font-bold">{vid.likes} likes</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] text-amber-400 font-bold">{vid.comments} Amens</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button 
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Analytics</span>
                      </button>
                      <button 
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                        title="Edit Sermon Details"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2.2: SHORTS */}
          {contentSubTab === 'shorts' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sampleShorts.map(short => (
                <div key={short.id} className="p-3.5 rounded-2xl bg-[#161616] border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition">
                  <div className="relative aspect-[9/16] max-h-68 rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={short.thumbnail}
                      alt={short.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {short.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                      Short
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2">{short.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{short.views} views • {short.likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2.3: DRAFTS */}
          {contentSubTab === 'drafts' && (
            <div className="space-y-3">
              {sampleDrafts.map(draft => (
                <div key={draft.id} className="p-4 rounded-2xl bg-[#161616] border border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white">{draft.title}</h4>
                    <p className="text-[11px] text-slate-400">{draft.size} • Last edited {draft.lastEdited}</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {draft.status}
                    </span>
                  </div>
                  <button
                    onClick={onTriggerUpload}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resume Upload</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2.4: SCHEDULED */}
          {contentSubTab === 'scheduled' && (
            <div className="space-y-3">
              {sampleScheduled.map(sch => (
                <div key={sch.id} className="p-4 rounded-2xl bg-[#161616] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={sch.thumbnail}
                      alt={sch.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{sch.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sch.date}</p>
                      <span className="text-[10px] text-blue-400 font-bold">{sch.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={onTriggerSchedule}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Edit Premiere
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          3. 🔴 LIVE HUB (Go Live, Live Streams, Live Recordings)
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'live_hub' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'go_live', label: 'Go Live Setup', icon: RadioTower },
              { id: 'streams', label: 'Live Streams History', icon: Video },
              { id: 'recordings', label: `Live Recordings (${sampleLiveRecordings.length})`, icon: Play }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = liveSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLiveSubTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 3.1: GO LIVE SETUP */}
          {liveSubTab === 'go_live' && (
            <div className="bg-[#161616] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h3 className="text-base font-black text-white">Live Broadcasting Ingest & Control</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Broadcast Sunday service, healing crusade, or prayer altar using OBS Studio, vMix, or hardware encoders.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    onClick={onTriggerGoLive}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    Encoder Wizard
                  </button>
                  <button
                    onClick={onEnterLiveControlRoom}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/25 transition cursor-pointer"
                  >
                    <RadioTower className="w-4 h-4" />
                    <span>Launch Live Control Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* RTMP Credentials Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Primary Server URL */}
                <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      Primary RTMP Server
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">Awaiting signal</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
                    <span className="truncate">rtmps://live.gospread.com/live</span>
                    <button
                      onClick={() => handleCopyKey('rtmps://live.gospread.com/live')}
                      className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Stream Key (Keep Private)
                    </span>
                    <button
                      onClick={() => setRevealStreamKey(!revealStreamKey)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>{revealStreamKey ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
                    <span className="truncate">{revealStreamKey ? 'live_gc_9921_sacred_altar_key' : '••••••••••••••••••••••••'}</span>
                    <button
                      onClick={() => handleCopyKey('live_gc_9921_sacred_altar_key')}
                      className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Encoder Quick Guide Tabs */}
              <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Supported Production Software:</span>
                  <div className="flex items-center gap-1 text-xs">
                    {['obs', 'streamlabs', 'vmix', 'hardware'].map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveEncoderTab(t as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${
                          activeEncoderTab === t
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  {activeEncoderTab === 'obs' && 'In OBS Studio: Settings → Stream → Service: Custom → Paste Server URL & Stream Key → Output: CBR 6,000 kbps, Keyframe: 2s.'}
                  {activeEncoderTab === 'streamlabs' && 'In Streamlabs Desktop: Settings → Stream → Custom Ingest → Paste credentials. Audio: 48kHz Stereo.'}
                  {activeEncoderTab === 'vmix' && 'In vMix: Stream Settings → Destination: Custom RTMP → URL and Stream Key → Quality: 1080p 60fps.'}
                  {activeEncoderTab === 'hardware' && 'In ATEM Mini / LiveShell / Yolobox: Paste RTMP URL and Stream Key into the Streaming XML / web interface.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 3.2: LIVE STREAMS HISTORY */}
          {liveSubTab === 'streams' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#161616] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white">Sunday Worship Service (Completed)</h4>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Recorded</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Aug 30, 2026 • Peak 412 concurrent worshippers • 74 mins duration</p>
                </div>
                <button
                  onClick={() => onInspectRecordingVOD(sampleLiveRecordings[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Publish as VOD
                </button>
              </div>
            </div>
          )}

          {/* TAB 3.3: LIVE RECORDINGS (VODs) */}
          {liveSubTab === 'recordings' && (
            <div className="space-y-3">
              {sampleLiveRecordings.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#161616] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0 w-28 h-18 rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={rec.thumbnail}
                        alt={rec.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white">
                        {rec.durationFormatted}
                      </span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400">{rec.durationFormatted} • {rec.totalWorshippers} views • {rec.prayersCount} prayers</p>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">{rec.scripture}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => onInspectRecordingVOD(rec)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Publish as VOD</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          4. 📅 SCHEDULE BROADCAST VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'schedule_hub' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Upcoming Church Broadcasts & Service Schedule</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Schedule live services or prerecorded video premieres with automatic congregation notification bells.
              </p>
            </div>
            <button
              onClick={onTriggerSchedule}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Schedule New Service</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-3xl bg-[#161616] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase">
                    Armed Premiere
                  </span>
                  <span className="text-xs text-slate-400 font-mono">In 2 days, 14 hours</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white">First Sunday Anointing Service — Covenant of Preservation</h4>
                <p className="text-xs text-slate-300">Sunday, September 6, 2026 • 9:00 AM EAT</p>
                <div className="flex items-center gap-2 text-[11px] text-blue-300 font-medium pt-1">
                  <span>Main Cathedral Sanctuary</span>
                  <span>•</span>
                  <span>Ministering: Senior Pastor {ownerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={onTriggerSchedule}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Edit Schedule
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          5. 📈 ANALYTICS VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Time Range Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Ministry Analytics & Spiritual Impact</span>
            </h3>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: '7d', label: '7D' },
                { id: '28d', label: '28D' },
                { id: '90d', label: '90D' },
                { id: 'all', label: 'All-Time' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setAnalyticsTimeRange(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    analyticsTimeRange === t.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold">Congregation Retention Rate</span>
              <p className="text-2xl font-black text-white">0%</p>
              <span className="text-[10px] text-slate-400 font-bold">No analytics loaded</span>
            </div>
            <div className="p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold">Average Live Duration</span>
              <p className="text-2xl font-black text-white">0 mins</p>
              <span className="text-[10px] text-amber-400 font-bold">High engagement on altar calls</span>
            </div>
            <div className="p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-1.5 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold">Peak Concurrent Saints</span>
              <p className="text-2xl font-black text-white">0</p>
              <span className="text-[10px] text-slate-400 font-bold">No live audience data</span>
            </div>
          </div>

          {/* Spiritual Altar Impact Summary */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#161616] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Spiritual Altar Impact Summary</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Altar Calls Answered</span>
                <p className="text-xl font-black text-emerald-400 mt-1">0</p>
              </div>
              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Prayers Lifted</span>
                <p className="text-xl font-black text-amber-400 mt-1">0</p>
              </div>
              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Verses Highlighted</span>
                <p className="text-xl font-black text-blue-400 mt-1">0</p>
              </div>
              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Amen Reactions</span>
                <p className="text-xl font-black text-rose-400 mt-1">0</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          6. 💬 COMMUNITY VIEW (Comments, Prayer Requests, Live Chat)
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'community' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'comments', label: `Comments (${sampleComments.length})`, icon: MessageSquare },
              { id: 'prayers', label: `Prayer Requests (${prayerRequests.length})`, icon: Heart },
              { id: 'chat', label: 'Live Chat Moderation', icon: Radio }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = communitySubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCommunitySubTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 6.1: COMMENTS */}
          {communitySubTab === 'comments' && (
            <div className="space-y-3">
              {sampleComments.map(cm => (
                <div key={cm.id} className="p-4 rounded-2xl bg-[#161616] border border-slate-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={cm.avatar} alt={cm.user} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700" />
                      <div>
                        <span className="text-xs font-bold text-white">{cm.user}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">• {cm.time}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-medium">{cm.videoTitle}</span>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed">{cm.comment}</p>
                  
                  {cm.replied && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300">
                      <strong>Pastor {ownerName} replied:</strong> {cm.replyText}
                    </div>
                  )}

                  {!cm.replied && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <input
                        type="text"
                        placeholder="Reply to this saint as Pastor..."
                        value={commentReplyInput[cm.id] || ''}
                        onChange={(e) => setCommentReplyInput(prev => ({ ...prev, [cm.id]: e.target.value }))}
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => {
                          const replyText = commentReplyInput[cm.id];
                          if (!replyText) return;
                          setSampleComments(prev => prev.map(c => c.id === cm.id ? { ...c, replied: true, replyText } : c));
                          setCommentReplyInput(prev => ({ ...prev, [cm.id]: '' }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 6.2: PRAYER REQUESTS */}
          {communitySubTab === 'prayers' && (
            <div className="space-y-4">
              
              {/* Add Prayer Input */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Post Prayer Need to Sanctuary Altar</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Prayers synced with congregation</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter prayer point (e.g. Divine healing, job breakthrough, salvation of family)..."
                    value={newPrayerInput}
                    onChange={(e) => setNewPrayerInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => {
                      if (!newPrayerInput.trim()) return;
                      onAddPrayerRequest(newPrayerInput.trim());
                      setNewPrayerInput('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    Submit
                  </button>
                </div>
              </div>

              {/* Prayer List */}
              <div className="space-y-3">
                {prayerRequests.map(prayer => (
                  <div key={prayer.id} className="p-4 rounded-2xl bg-[#161616] border border-slate-800 flex items-start justify-between gap-4 shadow-sm">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{prayer.name}</span>
                        <span className="text-[10px] text-slate-500">• {prayer.time}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          prayer.status === 'Prayed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {prayer.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{prayer.request}</p>
                    </div>
                    <button
                      onClick={() => onPrayForRequest(prayer.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                        prayer.status === 'Prayed'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{prayer.status === 'Prayed' ? 'Prayed' : 'Amen'} ({prayer.prayedCount})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6.3: LIVE CHAT MODERATION */}
          {communitySubTab === 'chat' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#161616] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500" />
                <span>Live Chat Moderation & Protection Filters</span>
              </h3>
              <p className="text-xs text-slate-400">
                Gospread automatically hides profanity, spam links, and hostile comments during church broadcasts.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  ✓ Kingdom Altar AI Moderation Active
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  Slow mode: 3 seconds
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  Scripture Emoji Reaction Enabled
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          7. 💰 GIVING VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'giving' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Tithes, Offerings & Seed Payout Gateway</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage mobile money and international bank accounts for ministry donations with 0% platform fee.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
              0% Platform Fee on Tithes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {payoutAccounts.map(acc => (
              <div key={acc.id} className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{acc.label}</span>
                    {acc.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">PRIMARY</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{acc.type} • {acc.currency} • {acc.bankOrProvider}</p>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-bold">Connected</span>
              </div>
            ))}
          </div>

          {/* Recent Partner Seed Ledger */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#161616] border border-slate-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>Recent Congregation Tithes & Giving Transactions</span>
            </h4>
            
            <div className="space-y-2.5">
              {[
                { id: 'tx-1', giver: 'Partner Grace M.', fund: 'Tithe & First Fruit', amount: '$250.00', time: 'Today, 2:14 PM', status: 'Settled' },
                { id: 'tx-2', giver: 'Anonymous Saint', fund: 'World Missions Outreach', amount: '$100.00', time: 'Yesterday, 8:45 PM', status: 'Settled' },
                { id: 'tx-3', giver: 'Brother Emmanuel K.', fund: 'Church Media & Broadcast', amount: '$50.00', time: 'Aug 29, 2026', status: 'Settled' }
              ].map(tx => (
                <div key={tx.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{tx.giver}</span>
                    <span className="text-slate-500 ml-2">• {tx.fund}</span>
                    <p className="text-[10px] text-slate-400">{tx.time}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400">{tx.amount}</span>
                    <span className="block text-[10px] text-emerald-500/80 font-semibold">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          8. ⚙️ MINISTRY SETTINGS VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#161616] border border-slate-800 space-y-5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Ministry Identity & Sanctuary Directory</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ministry Legal Name</label>
                <input
                  type="text"
                  readOnly
                  value={ministryName}
                  className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Senior Pastor / Lead Minister</label>
                <input
                  type="text"
                  readOnly
                  value={ownerName}
                  className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-bold mb-1">Recognized Sanctuaries & Global Campuses</label>
              <div className="space-y-2">
                {churchCampuses.map(camp => (
                  <div key={camp.id} className="p-3 bg-[#0f0f0f] rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{camp.campusName}</span>
                    <span className="text-slate-400">{camp.city}, {camp.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}

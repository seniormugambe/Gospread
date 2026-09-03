import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserSession } from './AuthModal';
import { ChurchLocation, SocialLink } from '../data/gospelData';
import { RecordedStreamData } from './LiveRecordingVODModal';

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
  onInspectRecordingVOD
}: KingdomStudioSectionsProps) {

  // Sample Kingdom Content Library Data
  const sampleVideos = [
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
  const sampleLiveRecordings: RecordedStreamData[] = [
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

  // Comments state
  const [commentReplyInput, setCommentReplyInput] = useState<{ [id: string]: string }>({});
  const [commentFilter, setCommentFilter] = useState<'all' | 'unreplied' | 'prayers'>('all');
  const [sampleComments, setSampleComments] = useState([
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
  ]);

  const [copiedKey, setCopiedKey] = useState(false);
  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════════
          1. 📊 DASHBOARD VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Total Views</span>
              <p className="text-xl sm:text-2xl font-black text-white">248,500</p>
              <span className="text-[10px] text-emerald-400 font-bold">+24.5% this month</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Watch Hours</span>
              <p className="text-xl sm:text-2xl font-black text-white">14,280 hrs</p>
              <span className="text-[10px] text-emerald-400 font-bold">+18.2% vs last week</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Subscribers / Partners</span>
              <p className="text-xl sm:text-2xl font-black text-white">18,450</p>
              <span className="text-[10px] text-amber-400 font-bold">+820 new this week</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Seed Gifts & Giving</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">$4,820</p>
              <span className="text-[10px] text-slate-400">UGX 18.2M total</span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Quick Creator Studio Actions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reach the worldwide body of Christ with single-click publishing tools.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={onTriggerUpload}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Upload Video</span>
              </button>
              <button
                onClick={onEnterLiveControlRoom}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition cursor-pointer"
              >
                <RadioTower className="w-3.5 h-3.5" />
                <span>Live Control Room</span>
              </button>
              <button
                onClick={onTriggerSchedule}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Service</span>
              </button>
            </div>
          </div>

          {/* Latest Video Performance Card */}
          <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Latest Video Performance
              </h3>
              <span className="text-[11px] font-bold text-slate-400">First 3 days</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={sampleVideos[0].thumbnail}
                alt={sampleVideos[0].title}
                referrerPolicy="no-referrer"
                className="w-full sm:w-44 h-28 rounded-2xl object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-bold text-white">{sampleVideos[0].title}</h4>
                <p className="text-xs text-slate-400">
                  Published {sampleVideos[0].date} • {sampleVideos[0].duration} • {sampleVideos[0].scripture}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Views</span>
                    <p className="font-bold text-white">{sampleVideos[0].views}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Likes</span>
                    <p className="font-bold text-emerald-400">{sampleVideos[0].likes}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Comments</span>
                    <p className="font-bold text-amber-400">{sampleVideos[0].comments}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          2. 🎬 CONTENT MANAGEMENT VIEW (Videos, Shorts, Drafts, Scheduled)
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'content' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Sub-Tabs: Videos, Shorts, Drafts, Scheduled */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

          {/* TAB 2.1: VIDEOS */}
          {contentSubTab === 'videos' && (
            <div className="space-y-3">
              {sampleVideos.map(vid => (
                <div key={vid.id} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{vid.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{vid.scripture} • {vid.duration} • {vid.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {vid.visibility}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{vid.views} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2.2: SHORTS */}
          {contentSubTab === 'shorts' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sampleShorts.map(short => (
                <div key={short.id} className="p-3 rounded-2xl bg-[#181818] border border-slate-800 space-y-3">
                  <div className="relative aspect-[9/16] max-h-64 rounded-xl overflow-hidden">
                    <img
                      src={short.thumbnail}
                      alt={short.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {short.duration}
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
                <div key={draft.id} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{draft.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{draft.size} • Last edited {draft.lastEdited}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {draft.status}
                    </span>
                  </div>
                  <button
                    onClick={onTriggerUpload}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                  >
                    Resume Upload
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2.4: SCHEDULED */}
          {contentSubTab === 'scheduled' && (
            <div className="space-y-3">
              {sampleScheduled.map(sch => (
                <div key={sch.id} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
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
              { id: 'go_live', label: 'Go Live / Control Room', icon: RadioTower },
              { id: 'streams', label: 'Live Streams', icon: Video },
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

          {/* TAB 3.1: GO LIVE ACTION */}
          {liveSubTab === 'go_live' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h3 className="text-base font-black text-white">Live Broadcasting Studio</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Broadcast using OBS, vMix, Wirecast, ATEM Mini or launch the interactive Live Control Room.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={onTriggerGoLive}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    Encoder Setup
                  </button>
                  <button
                    onClick={onEnterLiveControlRoom}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/25 transition cursor-pointer"
                  >
                    <RadioTower className="w-4 h-4" />
                    <span>Enter Live Control Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* RTMP Credentials Box */}
              <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300">Gospread Ingest RTMP</span>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
                  <span className="truncate">rtmps://live.gospread.com/live</span>
                  <button
                    onClick={() => handleCopyKey('rtmps://live.gospread.com/live')}
                    className="p-1 hover:text-white transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3.2: LIVE STREAMS */}
          {liveSubTab === 'streams' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white">Sunday Worship Service (Completed)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Aug 30, 2026 • Peak 412 concurrent worshippers • 74 mins</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold">Recorded as VOD</span>
              </div>
            </div>
          )}

          {/* TAB 3.3: LIVE RECORDINGS (VODs) */}
          {liveSubTab === 'recordings' && (
            <div className="space-y-3">
              {sampleLiveRecordings.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rec.durationFormatted} • {rec.totalWorshippers} views • {rec.prayersCount} prayers</p>
                      <span className="text-[10px] text-amber-300 font-mono">{rec.scripture}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Upcoming Church Broadcasts & Service Schedule
            </h3>
            <button
              onClick={onTriggerSchedule}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Service</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">First Sunday Anointing Service — Covenant of Preservation</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Sunday, September 6, 2026 • 9:00 AM EAT</p>
                <span className="text-[10px] text-blue-300 font-bold">Main Cathedral Sanctuary • Speaker: {ownerName}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                Premiere Armed
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          5. 📈 ANALYTICS VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold">Congregation Retention Rate</span>
              <p className="text-xl font-black text-white">68.4%</p>
              <span className="text-[10px] text-emerald-400">+5.2% vs church average</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold">Average Live Duration</span>
              <p className="text-xl font-black text-white">42 mins</p>
              <span className="text-[10px] text-amber-400">High engagement on altar calls</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold">Top Viewing Nations</span>
              <p className="text-base font-black text-white">Uganda, Kenya, US, UK</p>
              <span className="text-[10px] text-slate-400">34 total countries reached</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Spiritual Altar Impact Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Altar Calls Answered</span>
                <p className="text-lg font-black text-emerald-400">184</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Prayers Prayed</span>
                <p className="text-lg font-black text-amber-400">412</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Bible Verses Highlighted</span>
                <p className="text-lg font-black text-blue-400">1,240</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Amen Reactions</span>
                <p className="text-lg font-black text-red-400">14.8K</p>
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
                <div key={cm.id} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={cm.avatar} alt={cm.user} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-bold text-white">{cm.user}</span>
                      <span className="text-[10px] text-slate-500">• {cm.time}</span>
                    </div>
                    <span className="text-[10px] text-amber-400">{cm.videoTitle}</span>
                  </div>
                  <p className="text-xs text-slate-300">{cm.comment}</p>
                  {cm.replied && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300">
                      <strong>Pastor Lawson replied:</strong> {cm.replyText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 6.2: PRAYER REQUESTS */}
          {communitySubTab === 'prayers' && (
            <div className="space-y-3">
              {prayerRequests.map(prayer => (
                <div key={prayer.id} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{prayer.name}</span>
                      <span className="text-[10px] text-slate-500">• {prayer.time}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        prayer.status === 'Prayed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {prayer.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{prayer.request}</p>
                  </div>
                  <button
                    onClick={() => onPrayForRequest(prayer.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                      prayer.status === 'Prayed'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{prayer.status === 'Prayed' ? 'Prayed' : 'Pray Now'} ({prayer.prayedCount})</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6.3: LIVE CHAT MODERATION */}
          {communitySubTab === 'chat' && (
            <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500" />
                Live Chat Moderation & Protection Filters
              </h3>
              <p className="text-xs text-slate-400">
                Gospread automatically hides profanity, spam links, and hostile comments during church broadcasts.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  ✓ Kingdom Altar AI Moderation Active
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  Slow mode: 3 seconds
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Tithes, Offerings & Seed Payout Gateway
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage mobile money and international bank accounts for ministry donations.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              0% Platform Fee on Tithes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {payoutAccounts.map(acc => (
              <div key={acc.id} className="p-4 rounded-2xl bg-[#181818] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{acc.label}</span>
                    {acc.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">PRIMARY</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{acc.type} • {acc.currency} • {acc.bankOrProvider}</p>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-bold">Connected</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          8. ⚙️ MINISTRY SETTINGS VIEW
         ══════════════════════════════════════════════════════════ */}
      {studioNavTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              Ministry Identity & Broadcast Keys
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ministry Name</label>
                <input
                  type="text"
                  readOnly
                  value={ministryName}
                  className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Senior Pastor / Lead Artiste</label>
                <input
                  type="text"
                  readOnly
                  value={ownerName}
                  className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Sanctuaries & Campuses</label>
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
          </div>
        </motion.div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Church,
  Flame,
  Sparkles,
  DollarSign,
  Heart,
  Bookmark,
  Calendar,
  Check,
  Edit2,
  Share2,
  Bell,
  Sliders,
  ShieldCheck,
  Award,
  Play,
  Trash2,
  Copy,
  Download,
  ExternalLink,
  ChevronRight,
  Tv,
  Radio,
  Music,
  CheckCircle2,
  Globe,
  Settings,
  Lock,
  Plus,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, AudioTrack } from '../services/djangoApi';
import { djangoApi } from '../services/djangoApi';
import { GivingTarget } from './GivingModal';
import { UserSession } from './AuthModal';

interface UserProfilePageProps {
  streakDays: number;
  praiseXp: number;
  totalGivingAmount: number;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onPlayVideo: (video: VideoStream) => void;
  onPlayAudio: (track: AudioTrack) => void;
  subscribedChannels: string[];
  joinedChurches?: string[];
  churchMemberCounts?: Record<string, number>;
  onSelectChannelModal?: (channelName: string) => void;
  onToggleJoinChurch?: (channelName: string) => void;
  onToggleSubscribe: (channel: string) => void;
  onOpenGivingModal: (target?: GivingTarget) => void;
  onOpenPrayerModal: () => void;
  onOpenSettingsModal?: () => void;
  onOpenCommunity?: () => void;
  onOpenDiscover?: () => void;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
  currentUser?: UserSession;
}

export default function UserProfilePage({
  streakDays,
  praiseXp,
  totalGivingAmount,
  savedIds,
  onToggleSave,
  onPlayVideo,
  onPlayAudio,
  subscribedChannels,
  joinedChurches = [],
  churchMemberCounts = {},
  onSelectChannelModal,
  onToggleJoinChurch,
  onToggleSubscribe,
  onOpenGivingModal,
  onOpenPrayerModal,
  onOpenSettingsModal,
  onOpenCommunity,
  onOpenDiscover,
  onOpenAuthPage,
  currentUser
}: UserProfilePageProps) {
  // Active tab state
  const [activeProfileTab, setActiveProfileTab] = useState<'bookmarks' | 'giving' | 'prayers' | 'subscriptions' | 'settings'>('bookmarks');

  // Editable Profile Information State
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(() => {
    try {
      const custom = localStorage.getItem('gospread_custom_name');
      if (custom) return custom;
    } catch {}
    return currentUser?.fullName || (currentUser?.isLoggedIn ? currentUser.username : '');
  });

  const [userHandle, setUserHandle] = useState(() => {
    try {
      const custom = localStorage.getItem('gospread_custom_handle');
      if (custom) return custom;
    } catch {}
    return currentUser?.username ? `@${currentUser.username}` : '';
  });

  const [userBio, setUserBio] = useState(() => {
    try {
      const custom = localStorage.getItem('gospread_custom_bio');
      if (custom) return custom;
    } catch {}
    return currentUser?.bio || '';
  });

  const [homeChurch, setHomeChurch] = useState(() => {
    try {
      const custom = localStorage.getItem('gospread_custom_church');
      if (custom) return custom;
    } catch {}
    return currentUser?.churchName || (joinedChurches.length > 0 ? joinedChurches[0] : '');
  });

  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync with currentUser changes
  useEffect(() => {
    if (currentUser?.fullName) setUserName(currentUser.fullName);
    if (currentUser?.username) setUserHandle(`@${currentUser.username}`);
    if (currentUser?.email) setUserEmail(currentUser.email);
    if (currentUser?.churchName) setHomeChurch(currentUser.churchName);
  }, [currentUser]);

  // Giving History Log
  const [givingLogs, setGivingLogs] = useState<Array<{
    id: string;
    target: string;
    date: string;
    amount: number;
    category: string;
    status: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('gospread_giving_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Personal Prayer Requests Log
  const [myPrayers, setMyPrayers] = useState<Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    praiseReport: string | null;
  }>>(() => {
    try {
      const saved = localStorage.getItem('gospread_user_prayers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings Toggles
  const [notifServiceAlerts, setNotifServiceAlerts] = useState(() => {
    try {
      const val = localStorage.getItem('gospread_pref_service_alerts');
      return val !== null ? val === 'true' : true;
    } catch { return true; }
  });

  const [notifDailyRhema, setNotifDailyRhema] = useState(() => {
    try {
      const val = localStorage.getItem('gospread_pref_daily_rhema');
      return val !== null ? val === 'true' : true;
    } catch { return true; }
  });

  const [audioHdQuality, setAudioHdQuality] = useState(() => {
    try {
      const val = localStorage.getItem('gospread_pref_audio_hd');
      return val !== null ? val === 'true' : true;
    } catch { return true; }
  });

  const [publicProfile, setPublicProfile] = useState(() => {
    try {
      const val = localStorage.getItem('gospread_pref_public_profile');
      return val !== null ? val === 'true' : true;
    } catch { return true; }
  });

  // Saved media is account data, not bundled content.
  const [savedVideos, setSavedVideos] = useState<VideoStream[]>([]);
  const [savedAudios, setSavedAudios] = useState<AudioTrack[]>([]);

  useEffect(() => {
    let active = true;
    if (!currentUser?.isLoggedIn) {
      setSavedVideos([]);
      setSavedAudios([]);
      return;
    }

    djangoApi.getSavedSermons().then(saved => {
      if (!active) return;
      const sermons = saved
        .map(item => item.sermon_detail)
        .filter(Boolean);
      setSavedVideos(sermons.filter((sermon: any) => sermon.kind !== 'audio').map((sermon: any) => ({
        id: String(sermon.id),
        title: sermon.title,
        speakerOrArtist: sermon.speaker,
        churchOrMinistry: sermon.church_name || '',
        channelAvatar: sermon.thumbnail_url || '',
        subscribersCount: '',
        likesCount: String(sermon.view_count || 0),
        category: sermon.category || 'Sermon',
        isLive: false,
        viewsText: `${sermon.view_count || 0} views`,
        duration: sermon.duration_seconds ? `${Math.floor(sermon.duration_seconds / 60)}:${String(sermon.duration_seconds % 60).padStart(2, '0')}` : undefined,
        thumbnail: sermon.thumbnail_url || '',
        description: sermon.description || '',
        date: sermon.published_at ? new Date(sermon.published_at).toLocaleDateString() : '',
        videoUrl: sermon.media_url,
      })));
      setSavedAudios(sermons.filter((sermon: any) => sermon.kind === 'audio').map((sermon: any) => ({
        id: String(sermon.id),
        title: sermon.title,
        artistOrPreacher: sermon.speaker,
        albumOrSeries: sermon.church_name || '',
        channelAvatar: sermon.thumbnail_url || '',
        category: 'Audio Sermon',
        coverUrl: sermon.thumbnail_url || '',
        duration: sermon.duration_seconds ? `${Math.floor(sermon.duration_seconds / 60)}:${String(sermon.duration_seconds % 60).padStart(2, '0')}` : '',
        audioUrl: sermon.media_url,
      })));
    }).catch(() => {
      if (active) {
        setSavedVideos([]);
        setSavedAudios([]);
      }
    });

    return () => { active = false; };
  }, [currentUser?.isLoggedIn]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('gospread_custom_name', userName);
      localStorage.setItem('gospread_custom_handle', userHandle);
      localStorage.setItem('gospread_custom_bio', userBio);
      localStorage.setItem('gospread_custom_church', homeChurch);
    } catch {}
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const togglePrayerStatus = (id: string) => {
    setMyPrayers((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'Answered' ? 'Active Prayer' : 'Answered',
              praiseReport: p.status === 'Active Prayer' ? 'Testimony: The Lord has answered this request!' : p.praiseReport
            }
          : p
      );
      try {
        localStorage.setItem('gospread_user_prayers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* 🔴 1. HERO PROFILE BANNER & USER HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Top Cover Background Banner */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-900/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />

          {/* Banner Quick Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10 flex-wrap justify-end">
            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                className="px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-white font-bold text-xs border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 transition shadow-sm"
                title="Account Settings"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>Account Settings</span>
              </button>
            )}

            {onOpenAuthPage && (
              <button
                onClick={() => onOpenAuthPage('signin')}
                className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5 transition"
                title="Open Login and Sign Up Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentUser?.isLoggedIn ? 'Account Status' : 'Account & Login'}</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white font-bold text-xs border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile Card link copied to clipboard!');
              }}
              className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info Avatar Row */}
        <div className="px-6 sm:px-8 pb-6 relative z-10 -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={userName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#121215] shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border-4 border-[#121215] shadow-2xl flex items-center justify-center text-white font-serif font-black text-3xl">
                  {userName ? userName.charAt(0).toUpperCase() : <User className="w-10 h-10 text-amber-200" />}
                </div>
              )}
              {currentUser?.isLoggedIn && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#121215]" title="Verified Active" />
              )}
            </div>

            {/* Name, Handle & Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide">{userName || 'Guest Believer'}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                  currentUser?.isLoggedIn 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {currentUser?.isLoggedIn ? (currentUser.role ? `${currentUser.role.toUpperCase()} MEMBER` : 'VERIFIED MEMBER') : 'GUEST'}
                </span>
              </div>

              {userHandle && (
                <p className="text-xs text-amber-400 font-mono font-bold">{userHandle}</p>
              )}
              
              {homeChurch && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300">
                  <Church className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{homeChurch}</span>
                </div>
              )}

              {userBio ? (
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed pt-1">
                  &ldquo;{userBio}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic pt-1">
                  No bio added yet. Click &ldquo;Edit Profile&rdquo; to add your bio.
                </p>
              )}
            </div>
          </div>

          {/* Sowing & Prayer Actions */}
          <div className="flex items-center justify-center gap-3 shrink-0 flex-wrap">
            {onOpenCommunity && (
              <button
                onClick={onOpenCommunity}
                className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Fellowship Feed</span>
              </button>
            )}

            <button
              onClick={() => onOpenGivingModal()}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-xl shadow-amber-500/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>Sow Kingdom Seed</span>
            </button>

            <button
              onClick={onOpenPrayerModal}
              className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>Post Prayer</span>
            </button>

            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-amber-500/40 flex items-center gap-2 transition shadow-md hover:border-amber-400 group"
                title="Account Settings"
              >
                <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                <span>Account Settings</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-700">
                  PREFS
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🟢 EDIT PROFILE MODAL FORM */}
      {isEditing && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Profile Details
            </h3>
            <span className="text-[10px] text-slate-400">Update your profile settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Handle / Username</label>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Home Church / Ministry</label>
              <input
                type="text"
                value={homeChurch}
                onChange={(e) => setHomeChurch(e.target.value)}
                placeholder="Your home church or ministry"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Bio / Faith Statement</label>
              <textarea
                value={userBio}
                onChange={(e) => setUserBio(e.target.value)}
                placeholder="Write a brief statement about your faith or ministry interest..."
                rows={2}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              Save Profile
            </button>
          </div>
        </motion.form>
      )}

      {showSavedToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes successfully updated!</span>
        </div>
      )}

      {/* 🟢 2. AUTHENTIC ACCOUNT ACTIVITY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Bookmarks */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Saved Media</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">{savedIds.length}</p>
          <p className="text-[10px] text-slate-400 font-medium">Sermons & Worship Tracks</p>
        </div>

        {/* Metric 2: Giving Sowed */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Seeds Sowed</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">${totalGivingAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-medium">{givingLogs.length} Recorded Seed{givingLogs.length === 1 ? '' : 's'}</p>
        </div>

        {/* Metric 3: Followed Ministries */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Followed Channels</span>
            <Tv className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">{subscribedChannels.length}</p>
          <p className="text-[10px] text-slate-400 font-medium">Broadcast Ministries</p>
        </div>

        {/* Metric 4: Joined Churches */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Joined Churches</span>
            <Church className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">{joinedChurches.length}</p>
          <p className="text-[10px] text-slate-400 font-medium">Church Fellowships</p>
        </div>
      </div>

      {/* ⛪ JOINED CHURCH FELLOWSHIP SECTION */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Church className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Joined Home Church Fellowship</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  {joinedChurches.length} Joined
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Online registered church memberships and fellowship connections
              </p>
            </div>
          </div>

          {joinedChurches.length > 0 && onSelectChannelModal && (
            <button
              onClick={() => onSelectChannelModal(joinedChurches[0])}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shrink-0"
            >
              <span>View Church Portfolio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* List of Joined Churches Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {joinedChurches.length > 0 ? (
            joinedChurches.map((churchName) => {
              return (
                <div
                  key={churchName}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      <Church className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
                        {churchName}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        ✓ Member
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onSelectChannelModal && (
                      <button
                        onClick={() => onSelectChannelModal(churchName)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                      >
                        Portfolio
                      </button>
                    )}
                    {onToggleJoinChurch && (
                      <button
                        onClick={() => onToggleJoinChurch(churchName)}
                        className="px-2 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[10px] border border-red-800/40"
                        title="Leave Church"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 p-5 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <p>You have not joined any church family yet.</p>
              {onOpenDiscover && (
                <button
                  onClick={onOpenDiscover}
                  className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/40 transition inline-flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discover Ministries Hub</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔴 3. MAIN TABBED NAVIGATION CONTENT */}
      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 pb-2 gap-2 overflow-x-auto">
          {[
            { id: 'bookmarks', label: 'Saved & Bookmarks', icon: Bookmark, count: savedIds.length },
            { id: 'giving', label: 'Giving & Seeds Log', icon: DollarSign, count: givingLogs.length },
            { id: 'prayers', label: 'My Prayers & Notes', icon: Heart, count: myPrayers.length },
            { id: 'subscriptions', label: 'Followed Channels', icon: Tv, count: subscribedChannels.length },
            { id: 'settings', label: 'Account Settings & Preferences', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeProfileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SAVED MEDIA & BOOKMARKS */}
        {activeProfileTab === 'bookmarks' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Saved Sermons & Audio Worship
            </h3>

            {savedVideos.length === 0 && savedAudios.length === 0 ? (
              <div className="p-8 text-center bg-[#181818] rounded-3xl border border-slate-800 text-slate-500 text-xs space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No saved media yet.</p>
                <p className="text-[10px]">Click the bookmark icon on any live stream or audio sermon to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Saved Videos */}
                {savedVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-3.5 rounded-2xl bg-[#181818] border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                          {video.title}
                        </h4>
                        <p className="text-[10px] text-amber-400">{video.speakerOrArtist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPlayVideo(video)}
                        className="p-2 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                        title="Watch Now"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                      </button>

                      <button
                        onClick={() => onToggleSave(video.id)}
                        className="p-2 rounded-full bg-slate-900 text-red-400 hover:bg-red-500/20 transition"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Saved Audio Tracks */}
                {savedAudios.map((track) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-3.5 rounded-2xl bg-[#181818] border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                        alt={track.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-amber-400">{track.artistOrPreacher}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPlayAudio(track)}
                        className="p-2 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                        title="Listen Audio"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                      </button>

                      <button
                        onClick={() => onToggleSave(track.id)}
                        className="p-2 rounded-full bg-slate-900 text-red-400 hover:bg-red-500/20 transition"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GIVING & SEEDS LOG */}
        {activeProfileTab === 'giving' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Giving & Seed History
              </h3>

              <button
                onClick={() => onOpenGivingModal()}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Offering</span>
              </button>
            </div>

            {givingLogs.length === 0 ? (
              <div className="p-8 text-center bg-[#181818] rounded-3xl border border-slate-800 text-slate-500 text-xs space-y-2">
                <DollarSign className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No giving history recorded yet.</p>
                <p className="text-[10px]">Your receipts and giving records will appear here after sowing a seed.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {givingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-[#181818] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">{log.target}</h4>
                        <p className="text-[10px] text-slate-400">{log.category} • {log.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-slate-800 pt-2 sm:pt-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-400 font-serif">${log.amount}</p>
                        <span className="text-[9px] text-emerald-300 font-mono">Receipt #{log.id}</span>
                      </div>

                      <button
                        onClick={() => alert(`Receipt #${log.id} copied to clipboard!`)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1"
                        title="Copy Receipt"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY PRAYERS & NOTES */}
        {activeProfileTab === 'prayers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                My Prayer Requests & Testimonies
              </h3>

              <button
                onClick={onOpenPrayerModal}
                className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Prayer</span>
              </button>
            </div>

            {myPrayers.length === 0 ? (
              <div className="p-8 text-center bg-[#181818] rounded-3xl border border-slate-800 text-slate-500 text-xs space-y-2">
                <Heart className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No prayer requests submitted yet.</p>
                <p className="text-[10px]">Click &ldquo;Submit Prayer&rdquo; to record personal prayer petitions and track answered testimonies.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPrayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{prayer.date}</span>
                      <button
                        onClick={() => togglePrayerStatus(prayer.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          prayer.status === 'Answered'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {prayer.status} (Click to toggle)
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white">{prayer.title}</h4>

                    {prayer.praiseReport && (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 font-serif italic">
                        🙌 {prayer.praiseReport}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUBSCRIBED CHANNELS */}
        {activeProfileTab === 'subscriptions' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Followed Ministry Channels ({subscribedChannels.length})
            </h3>

            {subscribedChannels.length === 0 ? (
              <div className="p-8 text-center bg-[#181818] rounded-3xl border border-slate-800 text-slate-500 text-xs space-y-2">
                <Tv className="w-8 h-8 text-slate-600 mx-auto" />
                <p>You have not followed any ministry channels yet.</p>
                <p className="text-[10px]">Follow churches or ministries across the platform to receive live broadcast updates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subscribedChannels.map((channelName) => (
                  <div
                    key={channelName}
                    className="p-3.5 rounded-2xl bg-[#181818] border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {channelName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white truncate">{channelName}</span>
                    </div>

                    <button
                      onClick={() => onToggleSubscribe(channelName)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SETTINGS & PREFERENCES */}
        {activeProfileTab === 'settings' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Account Preferences & Notifications
              </h3>
              {onOpenSettingsModal && (
                <button
                  type="button"
                  onClick={onOpenSettingsModal}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Open Full Settings Hub</span>
                </button>
              )}
            </div>

            <div className="space-y-3 bg-[#181818] p-5 rounded-3xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Live Worship Service Notifications</h4>
                  <p className="text-[10px] text-slate-400">Receive alerts when followed churches go live.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifServiceAlerts}
                  onChange={(e) => {
                    setNotifServiceAlerts(e.target.checked);
                    try { localStorage.setItem('gospread_pref_service_alerts', e.target.checked.toString()); } catch {}
                  }}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Daily Devotion Notifications</h4>
                  <p className="text-[10px] text-slate-400">Receive daily scripture promise alerts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifDailyRhema}
                  onChange={(e) => {
                    setNotifDailyRhema(e.target.checked);
                    try { localStorage.setItem('gospread_pref_daily_rhema', e.target.checked.toString()); } catch {}
                  }}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">HD Audio Streaming Mode</h4>
                  <p className="text-[10px] text-slate-400">Enable high-fidelity gospel audio playback.</p>
                </div>
                <input
                  type="checkbox"
                  checked={audioHdQuality}
                  onChange={(e) => {
                    setAudioHdQuality(e.target.checked);
                    try { localStorage.setItem('gospread_pref_audio_hd', e.target.checked.toString()); } catch {}
                  }}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Public Profile Visibility</h4>
                  <p className="text-[10px] text-slate-400">Allow community members to view your prayer testimonies.</p>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => {
                    setPublicProfile(e.target.checked);
                    try { localStorage.setItem('gospread_pref_public_profile', e.target.checked.toString()); } catch {}
                  }}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
